export const env = {
  port: Number(process.env.PORT || 3333),
  clientOrigin: process.env.CLIENT_ORIGIN || '*',
  sportsDbKey: process.env.THESPORTSDB_KEY || '123',
  cacheTtlHours: Number(process.env.CACHE_TTL_HOURS || 24)
};
