import fs from 'fs';
import path from 'path';
import { WORLD_CUP_TEAMS } from '../data/worldCupTeams.js';

const CACHE_DIR = path.resolve('.cache');
const JSON_DB_PATH = path.join(CACHE_DIR, 'database.json');
const SQLITE_DB_PATH = path.join(CACHE_DIR, 'database.db');
const SCHEMA_VERSION = 1;

function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
}

function emptyJsonDb() {
  return { schemaVersion: SCHEMA_VERSION, teams: [], api_cache: [], predictions: [] };
}

export class DatabaseAdapter {
  constructor() {
    this.engine = 'json';
    this.sqlite = null;
    this.json = emptyJsonDb();
  }

  async connect() {
    ensureCacheDir();
    try {
      const mod = await import('node:sqlite');
      this.sqlite = new mod.DatabaseSync(SQLITE_DB_PATH);
      this.engine = 'sqlite';
    } catch (_) {
      this.engine = 'json';
      this.json = this.loadJson();
    }
  }

  migrate() {
    if (this.engine === 'sqlite') {
      this.sqlite.exec(`
        CREATE TABLE IF NOT EXISTS teams (
          code TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          display_name TEXT NOT NULL,
          flag TEXT NOT NULL,
          group_name TEXT NOT NULL,
          fifa_rank INTEGER NOT NULL,
          aliases_json TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS api_cache (
          cache_key TEXT PRIMARY KEY,
          value_json TEXT NOT NULL,
          created_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS predictions (
          id TEXT PRIMARY KEY,
          home_team_code TEXT NOT NULL,
          away_team_code TEXT NOT NULL,
          venue TEXT NOT NULL,
          result_json TEXT NOT NULL,
          created_at INTEGER NOT NULL
        );
      `);
      return;
    }

    this.json = { ...emptyJsonDb(), ...this.json, schemaVersion: SCHEMA_VERSION };
    this.persistJson();
  }

  seed() {
    const existingTeams = this.getTeams();
    if (existingTeams.length === WORLD_CUP_TEAMS.length) return;

    if (this.engine === 'sqlite') {
      const insert = this.sqlite.prepare(`
        INSERT OR REPLACE INTO teams(code, name, display_name, flag, group_name, fifa_rank, aliases_json)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const team of WORLD_CUP_TEAMS) {
        insert.run(team.code, team.name, team.displayName, team.flag, team.group, team.fifaRank, JSON.stringify(team.aliases));
      }
      return;
    }

    this.json.teams = WORLD_CUP_TEAMS;
    this.persistJson();
  }

  getTeams() {
    if (this.engine === 'sqlite') {
      return this.sqlite.prepare('SELECT * FROM teams ORDER BY display_name ASC').all().map(row => ({
        code: row.code,
        name: row.name,
        displayName: row.display_name,
        flag: row.flag,
        group: row.group_name,
        fifaRank: row.fifa_rank,
        aliases: JSON.parse(row.aliases_json)
      }));
    }
    return [...this.json.teams].sort((a, b) => a.displayName.localeCompare(b.displayName, 'pt-BR'));
  }

  getCache(cacheKey, ttlHours) {
    const maxAge = ttlHours * 60 * 60 * 1000;
    const now = Date.now();
    if (this.engine === 'sqlite') {
      const row = this.sqlite.prepare('SELECT value_json, created_at FROM api_cache WHERE cache_key = ?').get(cacheKey);
      if (!row || now - row.created_at > maxAge) return null;
      return JSON.parse(row.value_json);
    }
    const item = this.json.api_cache.find(entry => entry.cache_key === cacheKey);
    if (!item || now - item.created_at > maxAge) return null;
    return item.value;
  }

  setCache(cacheKey, value) {
    const createdAt = Date.now();
    if (this.engine === 'sqlite') {
      this.sqlite.prepare('INSERT OR REPLACE INTO api_cache(cache_key, value_json, created_at) VALUES (?, ?, ?)')
        .run(cacheKey, JSON.stringify(value), createdAt);
      return;
    }
    this.json.api_cache = this.json.api_cache.filter(entry => entry.cache_key !== cacheKey);
    this.json.api_cache.push({ cache_key: cacheKey, value, created_at: createdAt });
    this.persistJson();
  }

  insertPrediction(prediction) {
    if (this.engine === 'sqlite') {
      this.sqlite.prepare(`
        INSERT INTO predictions(id, home_team_code, away_team_code, venue, result_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        prediction.id,
        prediction.homeTeamCode,
        prediction.awayTeamCode,
        prediction.venue,
        JSON.stringify(prediction.result),
        prediction.createdAt
      );
      return;
    }
    this.json.predictions.unshift(prediction);
    this.json.predictions = this.json.predictions.slice(0, 100);
    this.persistJson();
  }

  listPredictions(limit = 8) {
    if (this.engine === 'sqlite') {
      return this.sqlite.prepare('SELECT * FROM predictions ORDER BY created_at DESC LIMIT ?').all(limit).map(row => ({
        id: row.id,
        homeTeamCode: row.home_team_code,
        awayTeamCode: row.away_team_code,
        venue: row.venue,
        result: JSON.parse(row.result_json),
        createdAt: row.created_at
      }));
    }
    return this.json.predictions.slice(0, limit);
  }

  loadJson() {
    if (!fs.existsSync(JSON_DB_PATH)) return emptyJsonDb();
    try {
      return { ...emptyJsonDb(), ...JSON.parse(fs.readFileSync(JSON_DB_PATH, 'utf-8')) };
    } catch (_) {
      return emptyJsonDb();
    }
  }

  persistJson() {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(this.json, null, 2));
  }
}

export const database = new DatabaseAdapter();
