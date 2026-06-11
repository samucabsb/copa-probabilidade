import { database } from '../database/databaseAdapter.js';

export function getHealth(req, res) {
  res.json({ ok: true, version: '1.0.0', persistence: database.engine });
}
