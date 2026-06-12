function numberFromEnv(value, fallback) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : fallback; }
export const env = {
  port: numberFromEnv(process.env.PORT, 3333), clientOrigin: process.env.CLIENT_ORIGIN || '*', sportsDbKey: process.env.THESPORTSDB_KEY || '123',
  cacheTtlHours: numberFromEnv(process.env.CACHE_TTL_HOURS, 24), recentEventsCacheTtlMinutes: numberFromEnv(process.env.RECENT_EVENTS_CACHE_TTL_MINUTES, 30),
  monteCarloSimulations: numberFromEnv(process.env.MONTE_CARLO_SIMULATIONS, 50000), minBacktestMatchesForOptimization: numberFromEnv(process.env.MIN_BACKTEST_MATCHES_FOR_OPTIMIZATION, 8),
  historicalMatchesCsv: process.env.HISTORICAL_MATCHES_CSV || 'src/data/sample-matches.csv', squadStrengthCsv: process.env.SQUAD_STRENGTH_CSV || 'src/data/sample-squad-strength.csv'
};
