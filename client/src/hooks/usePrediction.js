import { useState } from 'react';
import { createPrediction } from '../api/predictionApi.js';

export function usePrediction() {
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function predict(payload) {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    setPrediction(null);
    try {
      const data = await createPrediction(payload);
      setPrediction(data.result);
      setSuccessMessage('Previsão gerada e salva no histórico.');
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  return { prediction, isLoading, error, successMessage, predict, setSuccessMessage };
}
