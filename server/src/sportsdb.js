
import { normalize } from './teams.js';
import { getCache, setCache } from './cache.js';
const BASE_URL = 'https://www.thesportsdb.com/api/v1/json';
const ttl = Number(process.env.CACHE_TTL_HOURS || 24);
const apiKey = () => process.env.THESPORTSDB_KEY || '123';
async function getJsonCached(url) {
  const cached = getCache(url, ttl); if (cached) return { data: cached, cached: true };
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`TheSportsDB HTTP ${response.status}`);
  const data = await response.json(); setCache(url, data); return { data, cached: false };
}
export async function fetchTeamProfile(team) {
  for (const label of [team.name, ...team.aliases]) {
    const url = `${BASE_URL}/${apiKey()}/searchteams.php?t=${encodeURIComponent(label)}`;
    const { data } = await getJsonCached(url);
    const list = (data?.teams || []).filter(t => (t.strSport || '').toLowerCase() === 'soccer');
    const found = list.find(t => normalize(t.strTeam) === normalize(label)) || list[0];
    if (found) return found;
  }
  return null;
}
export async function fetchRecentEvents(team) {
  const profile = await fetchTeamProfile(team);
  if (!profile?.idTeam) return { profile, events: [], source: 'TheSportsDB' };
  const url = `${BASE_URL}/${apiKey()}/eventslast.php?id=${profile.idTeam}`;
  const { data, cached } = await getJsonCached(url);
  return { profile, events: Array.isArray(data?.results) ? data.results : [], source: 'TheSportsDB', cached };
}
