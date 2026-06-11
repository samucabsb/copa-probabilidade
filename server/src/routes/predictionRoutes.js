import { Router } from 'express';
import { createPrediction, listPredictionHistory } from '../controllers/predictionController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validatePredictionRequest } from '../middleware/validatePredictionRequest.js';

export const predictionRoutes = Router();
predictionRoutes.post('/predictions', validatePredictionRequest, asyncHandler(createPrediction));
predictionRoutes.get('/predictions/history', listPredictionHistory);
