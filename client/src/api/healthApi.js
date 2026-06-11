import { httpClient } from './httpClient.js';

export function fetchHealth() {
  return httpClient.get('/health');
}
