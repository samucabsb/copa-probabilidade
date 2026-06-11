import { database } from '../database/databaseAdapter.js';

export class PredictionRepository {
  save(prediction) {
    database.insertPrediction(prediction);
  }

  listRecent(limit = 8) {
    return database.listPredictions(limit);
  }
}

export const predictionRepository = new PredictionRepository();
