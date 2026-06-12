import { httpClient } from './httpClient.js';
export async function fetchTeams() { const data = await httpClient.get('/teams'); return data.teams || []; }
