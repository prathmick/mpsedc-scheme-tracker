import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';

export default function useSchemes() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSchemes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.get('/schemes');
      setSchemes(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load schemes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSchemes(); }, [fetchSchemes]);

  return { schemes, loading, error, refetch: fetchSchemes };
}
