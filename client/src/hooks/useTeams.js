import { useEffect, useState } from 'react';
import { fetchTeams } from '../api/teamApi.js';

export function useTeams() {
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    fetchTeams()
      .then(data => { if (isMounted) setTeams(data.sort((a, b) => a.displayName.localeCompare(b.displayName, 'pt-BR'))); })
      .catch(err => { if (isMounted) setError(err.message); })
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, []);

  return { teams, isLoading, error };
}
