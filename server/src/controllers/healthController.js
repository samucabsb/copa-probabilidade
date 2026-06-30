import { database } from '../database/databaseAdapter.js';
export const getHealth = (req, res) => res.json({ ok: true, version: '1.1.0', persistence: database.engine });
