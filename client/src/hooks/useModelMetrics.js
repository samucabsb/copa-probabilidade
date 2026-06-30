import { useCallback, useEffect, useState } from 'react';
import { fetchModelMetrics, runBacktest } from '../api/modelApi.js';

export function useModelMetrics() {
  const [report, setReport]       = useState(null);
  const [params, setParams]       = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError]         = useState('');

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchModelMetrics();
      setParams(data.params || null);
      const lastBacktest = (data.metrics || []).find(m => m.label === 'backtest');
      if (lastBacktest) setReport(lastBacktest.value);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  async function runNewBacktest() {
    setIsRunning(true);
    setError('');
    try {
      const data = await runBacktest();
      setReport(data.report);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRunning(false);
    }
  }

  return { report, params, isLoading, isRunning, error, runNewBacktest, refresh };
}
