import { predictionService } from '../services/predictionService.js';export async function createPrediction(req,res){res.status(201).json(await predictionService.createPrediction(req.body));}
