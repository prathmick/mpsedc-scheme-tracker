import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';

export default function useApplications(filters = {}, pagination = {}) {
  const [applications, setApplications] = useState([]);
  const [paginationInfo, setPaginationInfo] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { ...filters, ...pagination };
      // Remove empty values
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const { data } = await axiosInstance.get('/applications', { params });
      setApplications(data.data);
      setPaginationInfo(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters), JSON.stringify(pagination)]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return { applications, pagination: paginationInfo, loading, error, refetch: fetchApplications };
}
