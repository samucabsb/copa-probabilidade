import { ELO_RATINGS } from '../data/eloRatings.js';
import { matchRepository } from '../repositories/matchRepository.js';
import { modelRepository }  from '../repositories/modelRepository.js';
import { clamp } from '../utils/math.js';

const WORLD_AVG = 1800;

/**
 * Estatísticas simples por time a partir de toda a base histórica.
 * Usadas para estimar lambdas no backtest sem precisar de dados de forma.
 */
function buildTeamStats(matches) {
  const stats = {};
  for (const m of matches) {
    if (!stats[m.homeTeam]) stats[m.homeTeam] = { gf: 0, ga: 0, n: 0 };
    if (!stats[m.awayTeam]) stats[m.awayTeam] = { gf: 0, ga: 0, n: 0 };
    stats[m.homeTeam].gf += m.homeScore;
    stats[m.homeTeam].ga += m.awayScore;
    stats[m.homeTeam].n++;
    stats[m.awayTeam].gf += m.awayScore;
    stats[m.awayTeam].ga += m.homeScore;
    stats[m.awayTeam].n++;
  }
  const result = {};
  for (const [name, s] of Object.entries(stats)) {
    result[name] = {
      avgFor:     s.n ? s.gf / s.n : 1.15,
      avgAgainst: s.n ? s.ga / s.n : 1.15,
    };
  }
  return result;
}

/**
 * Avalia um conjunto de parâmetros contra o 20% mais recente da base.
 * Retorna a taxa de acerto de resultado (V/E/D).
 */
function evaluate(params, testMatches, teamStats) {
  let correct = 0, total = 0;

  for (const m of testMatches) {
    const hs = teamStats[m.homeTeam];
    const as = teamStats[m.awayTeam];
    if (!hs || !as) continue;

    const heElo = ELO_RATINGS[m.homeTeam] || WORLD_AVG;
    const aeElo = ELO_RATINGS[m.awayTeam] || WORLD_AVG;
    const ef = clamp(Math.pow(10, (heElo - aeElo) / 900), 0.72, 1.35);

    const lH = clamp(
      (hs.avgFor * params.attackWeight + as.avgAgainst * params.defenseWeight) * ef,
      0.12, 4.8
    );
    const lA = clamp(
      (as.avgFor * params.attackWeight + hs.avgAgainst * params.defenseWeight) / ef,
      0.12, 4.8
    );

    // Predição simples: quem tem lambda maior ganha, com margem para empate
    const predictedOutcome =
      lH > lA * 1.08 ? 'H' :
      lA > lH * 1.08 ? 'A' : 'D';

    const actualOutcome =
      m.homeScore > m.awayScore ? 'H' :
      m.homeScore < m.awayScore ? 'A' : 'D';

    if (predictedOutcome === actualOutcome) correct++;
    total++;
  }

  return total > 0 ? correct / total : 0;
}

export const optimizerService = {
  optimize() {
    const allMatches = matchRepository.listAll().sort((a, b) =>
      String(a.date).localeCompare(String(b.date))
    );

    // Fallback se não há dados suficientes
    const DEFAULT_PARAMS = {
      attackWeight:   0.58,
      defenseWeight:  0.42,
      rho:           -0.09,
      venueBonus:     55,
      dixonWeight:    0.36,
      poissonWeight:  0.20,
      eloWeight:      0.24,
      formWeight:     0.08,
      monteCarloWeight: 0.12,
    };

    if (allMatches.length < 10) {
      modelRepository.saveParams(DEFAULT_PARAMS);
      return { optimized: false, reason: 'Dados insuficientes (<10 jogos)', params: DEFAULT_PARAMS };
    }

    // 80/20 split temporal
    const splitIdx    = Math.floor(allMatches.length * 0.8);
    const trainSet    = allMatches.slice(0, splitIdx);
    const testSet     = allMatches.slice(splitIdx);
    const teamStats   = buildTeamStats(trainSet);

    // Grid de candidatos
    const candidates = [];
    for (const attackWeight of [0.52, 0.56, 0.58, 0.62, 0.66])
      for (const rho of [-0.14, -0.10, -0.09, -0.06])
        for (const venueBonus of [35, 45, 55, 65])
          candidates.push({
            attackWeight,
            defenseWeight: Number((1 - attackWeight).toFixed(2)),
            rho,
            venueBonus,
          });

    // Avaliação real de cada candidato
    let bestScore  = -1;
    let bestParams = candidates[Math.floor(candidates.length / 2)]; // fallback

    for (const c of candidates) {
      const score = evaluate(c, testSet, teamStats);
      if (score > bestScore) {
        bestScore  = score;
        bestParams = c;
      }
    }

    const finalParams = {
      ...bestParams,
      dixonWeight:      0.36,
      poissonWeight:    0.20,
      eloWeight:        0.24,
      formWeight:       0.08,
      monteCarloWeight: 0.12,
    };

    modelRepository.saveParams(finalParams);

    return {
      optimized:      true,
      matches:        allMatches.length,
      testMatches:    testSet.length,
      outcomeAccuracy: Number((bestScore * 100).toFixed(1)),
      params:         finalParams,
    };
  },
};
