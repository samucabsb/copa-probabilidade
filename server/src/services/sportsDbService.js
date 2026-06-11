import { env } from '../config/env.js';
import { cacheRepository } from '../repositories/cacheRepository.js';
import { normalize } from '../utils/normalize.js';

const BASE_URL = 'https://www.thesportsdb.com/api/v1/json';

export class SportsDbService {
  async getJson(url) {
    const cached = cacheRepository.get(url);
    if (cached) return { data: cached, cached: true };

    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`TheSportsDB respondeu HTTP ${response.status}`);

    const data = await response.json();
    cacheRepository.set(url, data);
    return { data, cached: false };
  }

  async fetchTeamProfile(team) {
    for (const label of [team.name, ...team.aliases]) {
      const url = `${BASE_URL}/${env.sportsDbKey}/searchteams.php?t=${encodeURIComponent(label)}`;
      const { data } = await this.getJson(url);
      const teams = (data?.teams || []).filter(item => (item.strSport || '').toLowerCase() === 'soccer');
      const exact = teams.find(item => normalize(item.strTeam) === normalize(label)) || teams[0];
      if (exact) return exact;
    }
    return null;
  }

  async fetchRecentEvents(team) {
    try {
      const profile = await this.fetchTeamProfile(team);
      if (!profile?.idTeam) return { profile, events: [], warning: 'Perfil não encontrado na TheSportsDB.' };

      const url = `${BASE_URL}/${env.sportsDbKey}/eventslast.php?id=${profile.idTeam}`;
      const { data, cached } = await this.getJson(url);
      return {
        profile,
        cached,
        events: Array.isArray(data?.results) ? data.results : [],
        warning: null
      };
    } catch (error) {
      return { profile: null, cached: false, events: [], warning: error.message };
    }
  }
}

export const sportsDbService = new SportsDbService();
