import 'dotenv/config';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { initializeDatabase } from './database/initializeDatabase.js';

await initializeDatabase();

const app = createApp();
app.listen(env.port, () => {
  console.log(`API 1.0.0 em http://localhost:${env.port}`);
});
