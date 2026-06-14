import 'dotenv/config';
import { createApp }          from './app.js';
import { env }                from './config/env.js';
import { initializeDatabase } from './database/initializeDatabase.js';
import { matchRepository }    from './repositories/matchRepository.js';
import { HISTORICAL_MATCHES, HISTORICAL_MATCH_COUNT } from './data/historicalMatches.js';

// ── 1. Banco de dados ──────────────────────────────────────────────────────────
await initializeDatabase();

// ── 2. Auto-seed de partidas históricas embutidas ─────────────────────────────
//    Usa upsert — sem duplicatas, mesmo rodando múltiplas vezes.
//    Não requer nenhuma ação manual (sem CSV, sem import:matches).
try {
  const now = Date.now();
  const toInsert = HISTORICAL_MATCHES.map(m => ({ ...m, createdAt: m.createdAt ?? now }));
  matchRepository.upsertMany(toInsert);
  console.log(`✓ Base histórica: ${HISTORICAL_MATCH_COUNT} partidas embutidas carregadas`);
} catch (err) {
  console.warn('⚠ Aviso ao carregar partidas históricas embutidas:', err.message);
}

// ── 3. App ────────────────────────────────────────────────────────────────────
createApp().listen(env.port, () =>
  console.log(`\n🏆 Copa Probabilidade v1.0.3 — http://localhost:${env.port}\n`)
);
