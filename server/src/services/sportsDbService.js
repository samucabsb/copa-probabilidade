/**
 * sportsDbService.js — v1.0.3
 *
 * Busca dados ao vivo do TheSportsDB automaticamente a cada previsão.
 * Cache de 30 minutos (env.recentEventsCacheTtlMinutes) — após isso,
 * os resultados mais recentes de cada seleção são buscados da internet.
 *
 * FLUXO:
 *   1. Busca o perfil do time no TheSportsDB (cache longo — dados estáticos)
 *   2. Busca os últimos eventos do time (cache curto — 30 min)
 *   3. Salva os eventos buscados no banco local para uso offline/histórico
 *
 * O predictionModelService usa os eventos ao vivo PRIMEIRO (peso maior
 * por recência), e só usa a base local como suplemento se o TheSportsDB
 * não retornar dados suficientes.
 */
import { env }              from '../config/env.js';
import { cacheRepository }  from '../repositories/cacheRepository.js';
import { matchRepository }  from '../repositories/matchRepository.js';
import { normalize }        from '../utils/normalize.js';
import { filterSeniorTeamEvents } from '../utils/matchFilters.js';

const BASE     = 'https://www.thesportsdb.com/api/v1/json';
const minToHrs = m => Math.max(Number(m || 0) / 60, 1 / 60);

/** Converte evento da TheSportsDB para formato interno */
function toMatch(e) {
  const hs = Number(e.intHomeScore), as = Number(e.intAwayScore);
  if (!Number.isFinite(hs) || !Number.isFinite(as) || !e.strHomeTeam || !e.strAwayTeam || !e.dateEvent)
    return null;
  return {
    id:          e.idEvent || `${e.dateEvent}-${normalize(e.strHomeTeam)}-${normalize(e.strAwayTeam)}`,
    date:        e.dateEvent,
    competition: e.strLeague || 'Partida',
    homeTeam:    e.strHomeTeam,
    awayTeam:    e.strAwayTeam,
    homeScore:   hs,
    awayScore:   as,
    venue:       'neutral',
    xgHome:      null,
    xgAway:      null,
    source:      'TheSportsDB',
    createdAt:   Date.now(),
  };
}

export const sportsDbService = {

  /** Requisição HTTP com cache */
  async getJson(url, ttlHours = env.cacheTtlHours) {
    const cached = cacheRepository.get(url, ttlHours);
    if (cached) return { data: cached, cached: true };
    const r = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!r.ok) throw new Error(`TheSportsDB HTTP ${r.status} — ${url}`);
    const data = await r.json();
    cacheRepository.set(url, data);
    return { data, cached: false };
  },

  /**
   * Encontra o perfil de um time no TheSportsDB.
   * Tenta o nome em inglês, depois cada alias do time.
   * Cache longo (env.cacheTtlHours) porque o idTeam não muda.
   */
  async fetchTeamProfile(team) {
    const candidates = [team.name, ...team.aliases].filter(Boolean);
    for (const label of candidates) {
      try {
        const url = `${BASE}/${env.sportsDbKey}/searchteams.php?t=${encodeURIComponent(label)}`;
        const { data } = await this.getJson(url);
        const list = (data?.teams || []).filter(t => (t.strSport || '').toLowerCase() === 'soccer');
        const found = list.find(t => normalize(t.strTeam) === normalize(label)) || list[0];
        if (found) return found;
      } catch (_) {
        // tenta o próximo alias
      }
    }
    return null;
  },

  /**
   * Busca os últimos eventos de um time DA INTERNET.
   * Cache curto: env.recentEventsCacheTtlMinutes (padrão 30 min).
   *
   * IMPORTANTE: esses eventos são salvos no banco local automaticamente,
   * acumulando histórico ao longo do uso do sistema.
   */
  async fetchRecentEvents(team) {
    try {
      const profile = await this.fetchTeamProfile(team);

      if (!profile?.idTeam) {
        return {
          events:  [],
          cached:  false,
          source:  'TheSportsDB',
          warning: `Perfil de "${team.displayName}" não encontrado no TheSportsDB. Usando apenas dados históricos embutidos.`,
        };
      }

      const ttl = minToHrs(env.recentEventsCacheTtlMinutes); // ~0.5h
      const { data, cached } = await this.getJson(
        `${BASE}/${env.sportsDbKey}/eventslast.php?id=${profile.idTeam}`,
        ttl
      );

      const events = filterSeniorTeamEvents(Array.isArray(data?.results) ? data.results : []);

      // Salva automaticamente no banco local (acumula histórico)
      const saved = matchRepository.upsertMany(events.map(toMatch).filter(Boolean));

      return {
        profile,
        events,
        cached,
        source:       'TheSportsDB (ao vivo)',
        savedToLocal: saved,
        warning:      events.length === 0
          ? `TheSportsDB não retornou eventos recentes para "${team.displayName}".`
          : null,
      };

    } catch (err) {
      return {
        events:  [],
        cached:  false,
        source:  'TheSportsDB (erro)',
        warning: `Falha ao buscar dados ao vivo para "${team.displayName}": ${err.message}`,
      };
    }
  },
};
