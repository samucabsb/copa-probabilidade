import { predictionService } from '../services/predictionService.js';

export async function createPrediction(req, res) {
  const prediction = await predictionService.createPrediction(req.body);
  res.status(201).json(prediction);
}

export function listPredictionHistory(req, res) {
  const requestedLimit = Number(req.query.limit || 8);
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 20) : 8;
  res.json({ predictions: predictionService.listRecentPredictions(limit) });
}
