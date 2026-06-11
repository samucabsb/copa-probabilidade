import { httpClient } from './httpClient.js';

export async function createPrediction(payload) {
  return httpClient.post('/predictions', payload);
}

export async function fetchPredictionHistory(limit = 8) {
  const data = await httpClient.get(`/predictions/history?limit=${limit}`);
  return data.predictions || [];
}
