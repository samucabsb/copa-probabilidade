import { useState } from 'react';
import { createPrediction } from '../api/predictionApi.js';

export function usePrediction() {
  const [prediction, setPrediction] = useState(null);
  const [previousPredictions, setPreviousPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function predict(payload) {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const data = await createPrediction(payload);
      setPreviousPredictions(stack => prediction ? [prediction, ...stack].slice(0, 10) : stack);
      setPrediction(data.result);
      setSuccessMessage('Previsão gerada com sucesso.');
      return data.result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  function goBackPrediction() {
    setPreviousPredictions(stack => {
      if (!stack.length) return stack;
      const [last, ...rest] = stack;
      setPrediction(last);
      setSuccessMessage('Previsão anterior restaurada.');
      setError('');
      return rest;
    });
  }

  return {
    prediction,
    isLoading,
    error,
    successMessage,
    canGoBack: previousPredictions.length > 0,
    predict,
    goBackPrediction,
    setSuccessMessage
  };
}
