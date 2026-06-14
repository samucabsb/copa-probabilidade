import { ELO_RATINGS }          from '../data/eloRatings.js';
import { env }                    from '../config/env.js';
import { matchRepository }        from '../repositories/matchRepository.js';
import { modelRepository }        from '../repositories/modelRepository.js';
import { clamp, toPercent }       from '../utils/math.js';
import { normalize }              from '../utils/normalize.js';
import { buildPoissonMatrix, outcomeProbabilities, blendOutcomes } from '../utils/probability.js';
import { eloService }             from './eloService.js';
import { monteCarloService }      from './monteCarloService.js';
import { calibrationService }     from './calibrationService.js';
import { squadStrengthService }   from './squadStrengthService.js';
import { contextService }         from './contextService.js';

// ─── Parâmetros padrão ───────────────────────────────────────────────────────
const DEFAULT_PARAMS = {
  attackWeight:      0.58,
  defenseWeight:     0.42,
  rho:              -0.09,
  venueBonus:        55,
  dixonWeight:       0.36,
  poissonWeight:     0.20,
  eloWeight:         0.24,
  formWeight:        0.08,
  monteCarloWeight:  0.12,
};

function getParams() {
  return { ...DEFAULT_PARAMS, ...(modelRepository.getParams() || {}) };
}

// ─── Peso por tipo de competição ─────────────────────────────────────────────
function competitionWeight(comp = '') {
  const c = comp.toLowerCase();
  if (c.includes('world cup'))      return 1.35;
  if (c.includes('qual'))           return 1.22;
  if (c.includes('copa') || c.includes('euro') || c.includes('africa') || c.includes('asian') || c.includes('concacaf')) return 1.15;
  if (c.includes('nations'))        return 1.05;
  if (c.includes('friendly'))       return 0.65;
  return 1.0;
}

// ─── Detecta qual lado o time atuou em um evento ─────────────────────────────
function detectSide(event, team) {
  const names = [team.name, team.displayName, ...team.aliases].map(normalize);
  const h = normalize(event.strHomeTeam || event.homeTeam || '');
  const a = normalize(event.strAwayTeam || event.awayTeam || '');
  if (names.includes(h) || names.some(n => h.includes(n) || n.includes(h))) return 'home';
  if (names.includes(a) || names.some(n => a.includes(n) || n.includes(a))) return 'away';
  return null;
}

// ─── Converte partida do DB para formato de evento ───────────────────────────
function dbMatchToEvent(m) {
  return {
    dateEvent:    m.date,
    strLeague:    m.competition,
    strHomeTeam:  m.homeTeam,
    strAwayTeam:  m.awayTeam,
    intHomeScore: m.homeScore,
    intAwayScore: m.awayScore,
    xgHome:       m.xgHome,
    xgAway:       m.xgAway,
  };
}

// ─── Processa lista de eventos para um time ───────────────────────────────────
function parseEvents(events, team) {
  return events
    .map((e, i) => {
      const side = detectSide(e, team);
      const hs   = Number(e.intHomeScore ?? e.homeScore);
      const as   = Number(e.intAwayScore ?? e.awayScore);
      if (!side || !Number.isFinite(hs) || !Number.isFinite(as)) return null;

      const gf = side === 'home' ? hs : as;
      const ga = side === 'home' ? as : hs;
      const xh = Number(e.xgHome);
      const xa = Number(e.xgAway);
      const hasXg = Number.isFinite(xh) && Number.isFinite(xa);

      return {
        opponent:   side === 'home' ? (e.strAwayTeam ?? e.awayTeam) : (e.strHomeTeam ?? e.homeTeam),
        goalsFor:   gf,
        goalsAgainst: ga,
        xgFor:      hasXg ? (side === 'home' ? xh : xa) : null,
        xgAgainst:  hasXg ? (side === 'home' ? xa : xh) : null,
        result:     gf > ga ? 'W' : gf === ga ? 'D' : 'L',
        // Peso decrescente por recência + peso por tipo de competição
        weight: (1 / Math.sqrt(i + 1)) * competitionWeight(e.strLeague || e.competition || ''),
        date:       e.dateEvent ?? e.date,
        competition: e.strLeague ?? e.competition ?? 'Partida',
        homeTeam:   e.strHomeTeam ?? e.homeTeam,
        awayTeam:   e.strAwayTeam ?? e.awayTeam,
        homeScore:  hs,
        awayScore:  as,
      };
    })
    .filter(Boolean)
    .slice(0, 24); // últimas 24 partidas válidas
}

// ─── Busca um time por nome normalizado ──────────────────────────────────────
function findTeam(name, teams) {
  const n = normalize(name || '');
  return teams.find(t =>
    normalize(t.name) === n ||
    normalize(t.displayName) === n ||
    t.aliases.some(a => normalize(a) === n)
  );
}

// ─── Resumo estatístico de um time ───────────────────────────────────────────
function summarize(team, events, teams, dynamicRatings) {
  const matches = parseEvents(events, team);
  let atk = 0, def = 0, w = 0;
  let xAtk = 0, xDef = 0, xW = 0;

  for (const g of matches) {
    const opp     = findTeam(g.opponent, teams);
    const oppElo  = (opp ? (dynamicRatings[opp.name] || ELO_RATINGS[opp.name]) : null) || 1800;
    const oppFactor = clamp(oppElo / 1800, 0.75, 1.25);

    atk += g.goalsFor   * oppFactor * g.weight;
    def += g.goalsAgainst / oppFactor * g.weight;
    w   += g.weight;

    if (g.xgFor !== null) {
      xAtk += g.xgFor      * oppFactor * g.weight;
      xDef += g.xgAgainst / oppFactor * g.weight;
      xW   += g.weight;
    }
  }

  const avgAtk = w ? atk / w : 1.25;
  const avgDef = w ? def / w : 1.25;

  // Blende gols reais com xG quando disponível (xG é melhor preditor)
  const adjustedAttack          = xW ? avgAtk * 0.68 + (xAtk / xW) * 0.32 : avgAtk;
  const adjustedDefenseConceded = xW ? avgDef * 0.68 + (xDef / xW) * 0.32 : avgDef;

  const wins   = matches.filter(m => m.result === 'W').length;
  const draws  = matches.filter(m => m.result === 'D').length;
  const losses = matches.filter(m => m.result === 'L').length;

  // Taxa de pontos recentes (últimos 5 jogos têm mais peso)
  const last5 = matches.slice(0, 5);
  const recentPoints = last5.reduce((acc, m) => acc + (m.result === 'W' ? 3 : m.result === 'D' ? 1 : 0), 0);
  const formScore    = last5.length ? recentPoints / (last5.length * 3) : 0.5;

  return {
    team,
    matches,
    matchCount: matches.length,
    adjustedAttack:          Math.max(0.12, adjustedAttack),
    adjustedDefenseConceded: Math.max(0.12, adjustedDefenseConceded),
    form:        { wins, draws, losses, formScore, last5 },
    dataQuality: matches.length >= 10 ? 'boa' : matches.length >= 5 ? 'média' : 'baixa',
    xgAvailable: xW > 0,
  };
}

// ─── Probabilidades pelo Elo ──────────────────────────────────────────────────
function eloOutcomes(homeTeam, awayTeam, venue, ratings) {
  const hElo = ratings[homeTeam.name] || ELO_RATINGS[homeTeam.name] || 1800;
  const aElo = ratings[awayTeam.name] || ELO_RATINGS[awayTeam.name] || 1800;
  const winProb = eloService.winProbability(hElo, aElo, venue);
  // Probabilidade de empate inversamente proporcional à diferença de força
  const draw = clamp(0.27 - Math.abs(winProb - 0.5) * 0.18, 0.16, 0.32);
  return {
    homeWin: winProb * (1 - draw),
    draw,
    awayWin: (1 - winProb) * (1 - draw),
  };
}

// ─── Probabilidades pela forma recente (CORRIGIDO: normalizado) ───────────────
function formOutcomes(hStats, aStats) {
  const hScore = hStats.form.formScore;   // 0–1 (taxa de pontos recentes)
  const aScore = aStats.form.formScore;
  const diff   = (hScore - aScore) * 0.30;

  const homeWin = clamp(0.36 + diff, 0.12, 0.70);
  const awayWin = clamp(0.36 - diff, 0.12, 0.70);
  const draw    = 0.28;
  const total   = homeWin + draw + awayWin;

  return { homeWin: homeWin / total, draw: draw / total, awayWin: awayWin / total };
}

// ─── Cálculo de confiança ─────────────────────────────────────────────────────
function calcConfidence(hStats, aStats, localMatchCount) {
  const dataPoints   = clamp((hStats.matchCount + aStats.matchCount) / 30, 0, 1);
  const qualityBonus = (hStats.dataQuality === 'boa' ? 0.20 : hStats.dataQuality === 'média' ? 0.10 : 0)
                     + (aStats.dataQuality === 'boa' ? 0.20 : aStats.dataQuality === 'média' ? 0.10 : 0);
  const historyBonus = clamp(localMatchCount / 100, 0, 1) * 0.15;
  const xgBonus      = (hStats.xgAvailable && aStats.xgAvailable) ? 0.06 : 0;

  return Math.round(clamp(38 + dataPoints * 32 + qualityBonus * 18 + historyBonus * 10 + xgBonus * 6, 20, 94));
}

// ─── CÁLCULO PRINCIPAL ────────────────────────────────────────────────────────
export const predictionModelService = {
  calculate({ homeTeam, awayTeam, homeEvents, awayEvents, venue, teams, warnings }) {
    const params = getParams();

    // Carrega partidas históricas locais por time
    const allLocal = matchRepository.listAll();
    const histH = allLocal
      .filter(m => m.homeTeam === homeTeam.name || m.awayTeam === homeTeam.name)
      .map(dbMatchToEvent);
    const histA = allLocal
      .filter(m => m.homeTeam === awayTeam.name || m.awayTeam === awayTeam.name)
      .map(dbMatchToEvent);

    // Combina eventos da API com histórico local (API primeiro = mais recentes)
    const ratings  = eloService.buildDynamicRatings(allLocal);
    const hStats   = summarize(homeTeam, [...homeEvents, ...histH], teams, ratings);
    const aStats   = summarize(awayTeam, [...awayEvents, ...histA], teams, ratings);

    // Squad strength derivado do ELO dinâmico
    const sqH = squadStrengthService.factorForTeam(homeTeam.name, ratings);
    const sqA = squadStrengthService.factorForTeam(awayTeam.name, ratings);

    // Ajuste de contexto (altitude etc.)
    const context = contextService.contextAdjustment({ homeTeam, awayTeam, venue });

    // Fator ELO para gols esperados
    const hElo   = ratings[homeTeam.name] || ELO_RATINGS[homeTeam.name] || 1800;
    const aElo   = ratings[awayTeam.name] || ELO_RATINGS[awayTeam.name] || 1800;
    const bonus  = venue === 'home' ? params.venueBonus : venue === 'away' ? -params.venueBonus : 0;
    const ef     = clamp(Math.pow(10, (hElo - aElo + bonus) / 900), 0.72, 1.35);

    // Lambdas (gols esperados) com todos os ajustes
    const lambdaH = clamp(
      (hStats.adjustedAttack * params.attackWeight + aStats.adjustedDefenseConceded * params.defenseWeight)
      * ef * sqH.factor * context.homeFactor,
      0.12, 4.8
    );
    const lambdaA = clamp(
      (aStats.adjustedAttack * params.attackWeight + hStats.adjustedDefenseConceded * params.defenseWeight)
      / ef * sqA.factor * context.awayFactor,
      0.12, 4.8
    );

    // Matrizes de placar
    const dixonMatrix  = buildPoissonMatrix(lambdaH, lambdaA, 7, params.rho);
    const poissonMatrix = buildPoissonMatrix(lambdaH, lambdaA);

    // Probabilidades por modelo
    const dOut = outcomeProbabilities(dixonMatrix);
    const pOut = outcomeProbabilities(poissonMatrix);
    const eOut = eloOutcomes(homeTeam, awayTeam, venue, ratings);
    const fOut = formOutcomes(hStats, aStats);

    // Monte Carlo com seed aleatório (bug corrigido)
    const mc = monteCarloService.simulate({
      lambdaHome:  lambdaH,
      lambdaAway:  lambdaA,
      simulations: env.monteCarloSimulations,
    });

    // Ensemble ponderado + calibração
    const rawOutcome = blendOutcomes([
      { outcome: dOut,         weight: params.dixonWeight },
      { outcome: pOut,         weight: params.poissonWeight },
      { outcome: eOut,         weight: params.eloWeight },
      { outcome: fOut,         weight: params.formWeight },
      { outcome: mc.outcomes,  weight: params.monteCarloWeight },
    ]);
    const out = calibrationService.calibrateOutcome(rawOutcome);

    const best  = dixonMatrix[0];
    const bestP = poissonMatrix[0];
    const localMatchCount = allLocal.length;

    // Resumo de forma para o frontend
    const formatForm = (stats) => ({
      last5:  stats.form.last5.map(m => m.result),
      wins:   stats.form.wins,
      draws:  stats.form.draws,
      losses: stats.form.losses,
      formScore: Number((stats.form.formScore * 100).toFixed(0)),
    });

    return {
      version: '1.0.3',
      model:   'Ensemble v3 — Dixon-Coles · Poisson · Elo dinâmico · Forma · Monte Carlo · Contexto',
      source:  'TheSportsDB + base histórica embutida (90+ partidas)',
      venue,
      homeTeam,
      awayTeam,
      elo: {
        home: hElo,
        away: aElo,
      },
      expectedGoals: {
        home: Number(lambdaH.toFixed(2)),
        away: Number(lambdaA.toFixed(2)),
      },
      predictedScore: {
        home:        best.home,
        away:        best.away,
        probability: toPercent(best.probability),
      },
      comparison: {
        purePoisson: { home: bestP.home, away: bestP.away, probability: toPercent(bestP.probability) },
        advanced:    { home: best.home,  away: best.away,  probability: toPercent(best.probability) },
      },
      outcomes: {
        homeWin: toPercent(out.homeWin),
        draw:    toPercent(out.draw),
        awayWin: toPercent(out.awayWin),
      },
      confidence: calcConfidence(hStats, aStats, localMatchCount),
      topScores: dixonMatrix.slice(0, 10).map(s => ({
        home:        s.home,
        away:        s.away,
        probability: toPercent(s.probability),
      })),
      form: {
        home: formatForm(hStats),
        away: formatForm(aStats),
      },
      diagnostics: {
        home:             hStats,
        away:             aStats,
        warnings:         warnings.filter(Boolean),
        localBaseMatches: localMatchCount,
        context:          context,
        monteCarlo:       mc,
        squadStrength:    { home: sqH, away: sqA },
        notes: [
          'Ensemble com 5 modelos: Dixon-Coles, Poisson puro, Elo dinâmico, forma recente e Monte Carlo.',
          'Base histórica embutida: 90+ partidas (Copa do Mundo 2022, Euro 2024, Copa América 2024).',
          context.altitudeEffect
            ? `Ajuste de altitude aplicado: ${context.notes.join('; ')}`
            : 'Sem ajuste de altitude (campo neutro ou sem vantagem altimétrica).',
          'Squad strength derivado do ELO dinâmico — sem CSV necessário.',
        ],
      },
    };
  },
};
