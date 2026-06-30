import { httpClient } from './httpClient.js';

export function fetchModelMetrics() { return httpClient.get('/model/metrics'); }
export function runBacktest()       { return httpClient.post('/model/backtest'); }
export function runOptimize()       { return httpClient.post('/model/optimize'); }
