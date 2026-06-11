import { Router } from 'express';
import { healthRoutes } from './healthRoutes.js';
import { predictionRoutes } from './predictionRoutes.js';
import { teamRoutes } from './teamRoutes.js';

export const apiRoutes = Router();
apiRoutes.use(healthRoutes);
apiRoutes.use(teamRoutes);
apiRoutes.use(predictionRoutes);
