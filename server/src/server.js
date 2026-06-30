import 'dotenv/config';
import { createApp }          from './app.js';
import { env }                from './config/env.js';
import { initializeDatabase } from './database/initializeDatabase.js';
import { matchRepository }    from './repositories/matchRepository.js';
import { HISTORICAL_MATCHES, HISTORICAL_MATCH_COUNT } from './data/historicalMatches.js';
import { worldCup2026ImportService } from './services/worldCup2026ImportService.js';

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

// ── 3. Importa os resultados reais da Copa do Mundo 2026 (fonte mais recente) ─
//    Roda no startup e depois periodicamente, para acompanhar o torneio ao vivo.
try {
  const summary = await worldCup2026ImportService.importLatestResults();
  console.log(`✓ Copa do Mundo 2026: ${summary.imported} partidas reais importadas/atualizadas`, summary.perRound);
} catch (err) {
  console.warn('⚠ Aviso ao importar partidas da Copa do Mundo 2026:', err.message);
}
setInterval(() => {
  worldCup2026ImportService.importLatestResults().catch(err =>
    console.warn('⚠ Falha no refresh periódico da Copa do Mundo 2026:', err.message)
  );
}, env.wc2026RefreshMinutes * 60_000);

// ── 4. App ────────────────────────────────────────────────────────────────────
createApp().listen(env.port, () =>
  console.log(`\n🏆 Copa Probabilidade v1.1.0 — http://localhost:${env.port}\n`)
);
