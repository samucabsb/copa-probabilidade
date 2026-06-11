import { database } from './databaseAdapter.js';

export async function initializeDatabase() {
  await database.connect();
  database.migrate();
  database.seed();
  return database;
}
