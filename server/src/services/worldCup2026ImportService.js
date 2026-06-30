/**
 * worldCup2026ImportService.js
 *
 * Importa em massa os resultados reais da Copa do Mundo 2026 (TheSportsDB,
 * idLeague=4429, temporada 2026) — fase de grupos + mata-mata já disputado.
 *
 * Por que isso existe: o plano gratuito da TheSportsDB só devolve o ÚLTIMO
 * jogo de cada seleção via eventslast.php, o que deixa o modelo com pouquíssimo
 * dado recente por time. O endpoint eventsround.php, por rodada, devolve o
 * torneio inteiro de graça — então buscamos rodada por rodada e guardamos
 * tudo na base local. Isso vira a fonte de "dados mais recentes" mais forte
 * do sistema (jogos de 2026, não 2022/2024).
 *
 * Rounds confirmados na TheSportsDB para o formato de 48 seleções (testado
 * manualmente em 2026-06-30, com o torneio nas oitavas de final):
 *   1, 2, 3   → rodadas da fase de grupos (24 jogos cada)
 *   32        → rodada de 32 / oitavas de final (16 jogos)
 *   16        → oitavas de final seguintes / quartas (8 jogos no total)
 *   8, 4      → ainda vazios em 2026-06-30 (quartas/semifinal não disputadas) —
 *               mantidos na lista porque passam a vir preenchidos sozinhos.
 * O rótulo de rodada da FINAL ainda não foi confirmado: "2" hoje aponta para a
 * 2ª rodada da fase de grupos (testado), não para a final — por isso NÃO está
 * nesta lista para evitar contar a rodada 2 de grupos em duplicidade. Quando a
 * fase de mata-mata chegar lá, vale checar `eventsround.php?id=4429&s=2026&r=2`
 * de novo antes de adicionar.
 */
import { env }             from '../config/env.js';
import { sportsDbService } from './sportsDbService.js';
import { matchRepository } from '../repositories/matchRepository.js';

const BASE   = 'https://www.thesportsdb.com/api/v1/json';
const LEAGUE_ID = '4429'; // FIFA World Cup
const SEASON     = '2026';
const ROUNDS      = [1, 2, 3, 32, 16, 8, 4];
const minToHrs   = m => Math.max(Number(m || 0) / 60, 1 / 60);

function toMatch(e) {
  const hs = Number(e.intHomeScore), as = Number(e.intAwayScore);
  if (!Number.isFinite(hs) || !Number.isFinite(as) || !e.strHomeTeam || !e.strAwayTeam || !e.dateEvent)
    return null;
  return {
    id:          e.idEvent || `wc2026-${e.dateEvent}-${e.strHomeTeam}-${e.strAwayTeam}`,
    date:        e.dateEvent,
    competition: 'FIFA World Cup',
    homeTeam:    e.strHomeTeam,
    awayTeam:    e.strAwayTeam,
    homeScore:   hs,
    awayScore:   as,
    venue:       'neutral',
    xgHome:      null,
    xgAway:      null,
    source:      'TheSportsDB-WC2026',
    createdAt:   Date.now(),
  };
}

export const worldCup2026ImportService = {
  async importLatestResults() {
    const perRound = {};
    const allMatches = [];
    const ttlHours = minToHrs(env.recentEventsCacheTtlMinutes); // mesma cadência da busca ao vivo por time

    for (const round of ROUNDS) {
      try {
        const url = `${BASE}/${env.sportsDbKey}/eventsround.php?id=${LEAGUE_ID}&s=${SEASON}&r=${round}`;
        const { data } = await sportsDbService.getJson(url, ttlHours);
        const events = Array.isArray(data?.events) ? data.events : [];
        const matches = events.map(toMatch).filter(Boolean);
        perRound[round] = matches.length;
        allMatches.push(...matches);
      } catch (err) {
        perRound[round] = `erro: ${err.message}`;
      }
    }

    const imported = matchRepository.upsertMany(allMatches);
    return { imported, perRound };
  },
};
