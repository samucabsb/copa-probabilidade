import { useCallback, useEffect, useState } from 'react';
import { fetchPredictionHistory } from '../api/predictionApi.js';

export function usePredictionHistory() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      setHistory(await fetchPredictionHistory(8));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { history, isLoading, error, refresh };
}
