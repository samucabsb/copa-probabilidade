import { useEffect, useState } from 'react';
import { fetchHealth } from '../api/healthApi.js';

export function useHealth() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    let isMounted = true;
    fetchHealth().then(data => { if (isMounted) setHealth(data); }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  return health;
}
