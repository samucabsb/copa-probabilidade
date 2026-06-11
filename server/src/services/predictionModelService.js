import { ELO_RATINGS } from '../data/eloRatings.js';
import { clamp, poisson, toPercent } from '../utils/math.js';
import { normalize } from '../utils/normalize.js';

const MAX_GOALS = 7;
const AVG_GOALS = 1.32;
const WORLD_AVG_ELO = 1800;

function competitionWeight(name = '') {
  const value = name.toLowerCase();
  if (value.includes('world cup')) return 1.35;
  if (value.includes('qualification') || value.includes('qualifier')) return 1.22;
  if (value.includes('euro') || value.includes('copa') || value.includes('africa') || value.includes('asian') || value.includes('concacaf')) return 1.15;
  if (value.includes('nations league')) return 1.05;
  if (value.includes('friendly')) return 0.68;
  return 1.0;
}

function inferSide(event, team) {
  const names = [team.name, team.displayName, ...team.aliases].map(normalize);
  const home = normalize(event.strHomeTeam || '');
  const away = normalize(event.strAwayTeam || '');
  if (names.includes(home) || names.some(name => home.includes(name) || name.includes(home))) return 'home';
  if (names.includes(away) || names.some(name => away.includes(name) || name.includes(away))) return 'away';
  return null;
}

function parseEvents(events, team) {
  return events.map((event, index) => {
    const side = inferSide(event, team);
    const homeScore = Number(event.intHomeScore);
    const awayScore = Number(event.intAwayScore);
    if (!side || Number.isNaN(homeScore) || Number.isNaN(awayScore)) return null;

    const goalsFor = side === 'home' ? homeScore : awayScore;
    const goalsAgainst = side === 'home' ? awayScore : homeScore;
    const opponent = side === 'home' ? event.strAwayTeam : event.strHomeTeam;

    return {
      date: event.dateEvent,
      competition: event.strLeague || 'Partida',
      homeTeam: event.strHomeTeam,
      awayTeam: event.strAwayTeam,
      homeScore,
      awayScore,
      opponent,
      side,
      goalsFor,
      goalsAgainst,
      result: goalsFor > goalsAgainst ? 'W' : goalsFor === goalsAgainst ? 'D' : 'L',
      weight: (1 / Math.sqrt(index + 1)) * competitionWeight(event.strLeague || '')
    };
  }).filter(Boolean).slice(0, 18);
}

function findTeamByEventName(name, teams) {
  const normalized = normalize(name || '');
  return teams.find(team =>
    normalize(team.name) === normalized ||
    normalize(team.displayName) === normalized ||
    team.aliases.some(alias => normalize(alias) === normalized)
  );
}

function summarizeTeam(team, rawEvents, teams) {
  const matches = parseEvents(rawEvents, team);
  let goalsForWeighted = 0;
  let goalsAgainstWeighted = 0;
  let adjustedAttackWeighted = 0;
  let adjustedDefenseWeighted = 0;
  let weightSum = 0;

  for (const match of matches) {
    const opponent = findTeamByEventName(match.opponent, teams);
    const opponentElo = ELO_RATINGS[opponent?.name] || WORLD_AVG_ELO;
    const opponentFactor = clamp(opponentElo / WORLD_AVG_ELO, 0.75, 1.25);

    goalsForWeighted += match.goalsFor * match.weight;
    goalsAgainstWeighted += match.goalsAgainst * match.weight;
    adjustedAttackWeighted += match.goalsFor * opponentFactor * match.weight;
    adjustedDefenseWeighted += (match.goalsAgainst / opponentFactor) * match.weight;
    weightSum += match.weight;
  }

  const wins = matches.filter(match => match.result === 'W').length;
  const draws = matches.filter(match => match.result === 'D').length;
  const losses = matches.filter(match => match.result === 'L').length;

  return {
    team,
    matches,
    matchCount: matches.length,
    avgGoalsFor: weightSum ? goalsForWeighted / weightSum : AVG_GOALS,
    avgGoalsAgainst: weightSum ? goalsAgainstWeighted / weightSum : AVG_GOALS,
    adjustedAttack: weightSum ? adjustedAttackWeighted / weightSum : AVG_GOALS,
    adjustedDefenseConceded: weightSum ? adjustedDefenseWeighted / weightSum : AVG_GOALS,
    form: { wins, draws, losses },
    dataQuality: matches.length >= 8 ? 'boa' : matches.length >= 4 ? 'média' : 'baixa'
  };
}

function eloFactor(teamA, teamB, venue) {
  const eloA = ELO_RATINGS[teamA.name] || WORLD_AVG_ELO;
  const eloB = ELO_RATINGS[teamB.name] || WORLD_AVG_ELO;
  const venueBonus = venue === 'home' ? 55 : venue === 'away' ? -55 : 0;
  return clamp(Math.pow(10, (eloA - eloB + venueBonus) / 900), 0.72, 1.35);
}

function buildScoreMatrix(lambdaHome, lambdaAway, mode = 'dixon-coles') {
  const rho = -0.09;
  const scores = [];
  let total = 0;

  for (let home = 0; home <= MAX_GOALS; home += 1) {
    for (let away = 0; away <= MAX_GOALS; away += 1) {
      let probability = poisson(home, lambdaHome) * poisson(away, lambdaAway);
      if (mode === 'dixon-coles') {
        if (home === 0 && away === 0) probability *= 1 - lambdaHome * lambdaAway * rho;
        if (home === 0 && away === 1) probability *= 1 + lambdaHome * rho;
        if (home === 1 && away === 0) probability *= 1 + lambdaAway * rho;
        if (home === 1 && away === 1) probability *= 1 - rho;
      }
      total += probability;
      scores.push({ home, away, probability });
    }
  }

  return scores
    .map(score => ({ ...score, probability: score.probability / total }))
    .sort((a, b) => b.probability - a.probability);
}

function outcomeProbabilities(matrix) {
  return matrix.reduce((acc, score) => {
    if (score.home > score.away) acc.homeWin += score.probability;
    else if (score.home === score.away) acc.draw += score.probability;
    else acc.awayWin += score.probability;
    return acc;
  }, { homeWin: 0, draw: 0, awayWin: 0 });
}

function confidence(homeStats, awayStats) {
  const dataScore = clamp((homeStats.matchCount + awayStats.matchCount) / 24, 0, 1);
  const qualityScore = (homeStats.dataQuality === 'boa' ? 0.25 : 0.12) + (awayStats.dataQuality === 'boa' ? 0.25 : 0.12);
  return Math.round(clamp(38 + dataScore * 38 + qualityScore * 22, 20, 90));
}

export class PredictionModelService {
  calculate({ homeTeam, awayTeam, homeEvents, awayEvents, venue, teams, warnings }) {
    const homeStats = summarizeTeam(homeTeam, homeEvents, teams);
    const awayStats = summarizeTeam(awayTeam, awayEvents, teams);

    const awayVenue = venue === 'home' ? 'away' : venue === 'away' ? 'home' : 'neutral';
    const homeExpected = clamp(
      (homeStats.adjustedAttack * 0.58 + awayStats.adjustedDefenseConceded * 0.42) * eloFactor(homeTeam, awayTeam, venue),
      0.12,
      4.8
    );
    const awayExpected = clamp(
      (awayStats.adjustedAttack * 0.58 + homeStats.adjustedDefenseConceded * 0.42) * eloFactor(awayTeam, homeTeam, awayVenue),
      0.12,
      4.8
    );

    const advancedMatrix = buildScoreMatrix(homeExpected, awayExpected, 'dixon-coles');
    const poissonMatrix = buildScoreMatrix(homeExpected, awayExpected, 'poisson');
    const bestAdvanced = advancedMatrix[0];
    const bestPoisson = poissonMatrix[0];
    const outcomes = outcomeProbabilities(advancedMatrix);

    return {
      version: '1.0.0',
      model: 'Elo + força adversário + recência/competição + Dixon-Coles',
      source: 'TheSportsDB + cache persistente local',
      venue,
      homeTeam,
      awayTeam,
      elo: {
        home: ELO_RATINGS[homeTeam.name] || WORLD_AVG_ELO,
        away: ELO_RATINGS[awayTeam.name] || WORLD_AVG_ELO
      },
      expectedGoals: {
        home: Number(homeExpected.toFixed(2)),
        away: Number(awayExpected.toFixed(2))
      },
      predictedScore: {
        home: bestAdvanced.home,
        away: bestAdvanced.away,
        probability: toPercent(bestAdvanced.probability)
      },
      comparison: {
        purePoisson: {
          home: bestPoisson.home,
          away: bestPoisson.away,
          probability: toPercent(bestPoisson.probability)
        },
        advanced: {
          home: bestAdvanced.home,
          away: bestAdvanced.away,
          probability: toPercent(bestAdvanced.probability)
        }
      },
      outcomes: {
        homeWin: toPercent(outcomes.homeWin),
        draw: toPercent(outcomes.draw),
        awayWin: toPercent(outcomes.awayWin)
      },
      confidence: confidence(homeStats, awayStats),
      topScores: advancedMatrix.slice(0, 10).map(score => ({
        home: score.home,
        away: score.away,
        probability: toPercent(score.probability)
      })),
      diagnostics: {
        home: homeStats,
        away: awayStats,
        warnings: warnings.filter(Boolean),
        notes: [
          'O modelo usa cache persistente, Elo, pesos de competição/recência e ajuste por força do adversário.',
          'Dixon-Coles corrige a probabilidade dos placares baixos.',
          'A interface não exige preenchimento manual de contexto.'
        ]
      }
    };
  }
}

export const predictionModelService = new PredictionModelService();
