
import fs from 'fs';
import path from 'path';
const CACHE_DIR = path.resolve('.cache');
const JSON_CACHE = path.join(CACHE_DIR, 'cache.json');
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
let sqliteDb = null;
try {
  const mod = await import('node:sqlite');
  sqliteDb = new mod.DatabaseSync(path.join(CACHE_DIR, 'cache.db'));
  sqliteDb.exec('CREATE TABLE IF NOT EXISTS api_cache (key TEXT PRIMARY KEY, value TEXT NOT NULL, created_at INTEGER NOT NULL)');
} catch (_) { sqliteDb = null; }
function readJsonCache() { if (!fs.existsSync(JSON_CACHE)) return {}; try { return JSON.parse(fs.readFileSync(JSON_CACHE, 'utf-8')); } catch { return {}; } }
function writeJsonCache(cache) { fs.writeFileSync(JSON_CACHE, JSON.stringify(cache, null, 2)); }
export function cacheEngine() { return sqliteDb ? 'sqlite' : 'json-fallback'; }
export function getCache(key, ttlHours = 24) {
  const now = Date.now(), maxAge = ttlHours * 60 * 60 * 1000;
  if (sqliteDb) { const row = sqliteDb.prepare('SELECT value, created_at FROM api_cache WHERE key = ?').get(key); if (!row || now - row.created_at > maxAge) return null; return JSON.parse(row.value); }
  const item = readJsonCache()[key]; if (!item || now - item.created_at > maxAge) return null; return item.value;
}
export function setCache(key, value) {
  const created = Date.now();
  if (sqliteDb) { sqliteDb.prepare('INSERT OR REPLACE INTO api_cache(key,value,created_at) VALUES(?,?,?)').run(key, JSON.stringify(value), created); return; }
  const cache = readJsonCache(); cache[key] = { value, created_at: created }; writeJsonCache(cache);
}
export function dumpCachedPredictions() {
  const rows = [];
  if (sqliteDb) { for (const r of sqliteDb.prepare('SELECT key, value FROM api_cache').all()) rows.push({ key: r.key, value: JSON.parse(r.value) }); }
  else { const cache = readJsonCache(); for (const [key, item] of Object.entries(cache)) rows.push({ key, value: item.value }); }
  return rows;
}
