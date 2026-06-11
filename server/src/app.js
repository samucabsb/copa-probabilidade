import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { apiRoutes } from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.clientOrigin === '*' ? '*' : env.clientOrigin }));
  app.use(express.json({ limit: '1mb' }));

  app.use('/api', apiRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
