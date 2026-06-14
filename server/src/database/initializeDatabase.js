/**
 * initializeDatabase.js — v1.0.3
 *
 * CORREÇÃO CRÍTICA: O seed() original do databaseAdapter.js tem um check
 * `if (getTeams().length === WORLD_CUP_TEAMS.length) return` que PULA
 * o seeding quando a contagem já bate (mesmo que os times sejam diferentes).
 * Este arquivo substitui esse comportamento por um INSERT OR REPLACE
 * incondicional, garantindo que TODOS os 48 times sempre estejam presentes.
 */
import { database }       from './databaseAdapter.js';
import { WORLD_CUP_TEAMS } from '../data/worldCupTeams.js';

export async function initializeDatabase() {
  await database.connect();
  database.migrate();

  // INSERT OR REPLACE é idempotente — sempre cobre todos os 48 times
  try {
    if (database.engine === 'sqlite') {
      const ins = database.sqlite.prepare(
        'INSERT OR REPLACE INTO teams VALUES(?,?,?,?,?,?,?)'
      );
      for (const t of WORLD_CUP_TEAMS) {
        ins.run(t.code, t.name, t.displayName, t.flag, t.group, t.fifaRank, JSON.stringify(t.aliases));
      }
    } else {
      database.json.teams = WORLD_CUP_TEAMS;
      database.persistJson();
    }
    console.log(`✓ ${WORLD_CUP_TEAMS.length} seleções da Copa 2026 carregadas (${database.engine})`);
  } catch (err) {
    console.error('Erro ao carregar seleções:', err.message);
  }

  return database;
}
