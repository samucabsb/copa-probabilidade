import { httpClient } from './httpClient.js';
export async function createPrediction(payload) { return httpClient.post('/predictions', payload); }
