import 'dotenv/config';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { initializeDatabase } from './database/initializeDatabase.js';
await initializeDatabase();
createApp().listen(env.port,()=>console.log(`API 1.0.2 em http://localhost:${env.port}`));
