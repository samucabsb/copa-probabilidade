import 'dotenv/config';
import { initializeDatabase } from '../database/initializeDatabase.js';
import { worldCup2026ImportService } from '../services/worldCup2026ImportService.js';
await initializeDatabase();
console.log(JSON.stringify(await worldCup2026ImportService.importLatestResults(), null, 2));
