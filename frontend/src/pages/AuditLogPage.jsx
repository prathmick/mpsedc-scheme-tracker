import { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDate } from '../utils/formatters';

export default function AuditLogPage() {
  const [filters, setFilters] = useState({ action: '', resourceType: '', userId: '', startDate: '', endDate: '' });
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);

  async function fetchLogs() {
    setLoading(true);
    try {
      const params = { ...filters, page, limit: 20 };
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const { data } = await axiosInstance.get('/audit-logs', { params });
      setLogs(data.data);
      setPagination(data.pagination);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(key, value) {
    setFilters({ ...filters, [key]: value });
    setPage(1);
  }

  function handleApplyFilters() {
    setPage(1);
    fetchLogs();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Audit Logs</h1>

      {/* Filters */}
      <div className="bg-white rounded shadow p-4 mb-4 grid grid-cols-5 gap-3">
        <input
          placeholder="User ID"
          value={filters.userId}
          onChange={(e) => handleFilterChange('userId', e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        />
        <select
          value={filters.action}
          onChange={(e) => handleFilterChange('action', e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">All Actions</option>
          <option value="LOGIN">LOGIN</option>
          <option value="REGISTER">REGISTER</option>
          <option value="CREATE_APPLICATION">CREATE_APPLICATION</option>
          <option value="UPDATE_APPLICATION">UPDATE_APPLICATION</option>
          <option value="DELETE_APPLICATION">DELETE_APPLICATION</option>
          <option value="STATUS_TRANSITION">STATUS_TRANSITION</option>
          <option value="CREATE_SCHEME">CREATE_SCHEME</option>
          <option value="UPDATE_SCHEME">UPDATE_SCHEME</option>
          <option value="DELETE_SCHEME">DELETE_SCHEME</option>
        </select>
        <select
          value={filters.resourceType}
          onChange={(e) => handleFilterChange('resourceType', e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">All Resources</option>
          <option value="user">User</option>
          <option value="application">Application</option>
          <option value="scheme">Scheme</option>
        </select>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => handleFilterChange('startDate', e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => handleFilterChange('endDate', e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        />
        <button onClick={handleApplyFilters} className="col-span-5 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
          Apply Filters
        </button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          <div className="bg-white rounded shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Timestamp</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">User (Email)</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Action</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Resource Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Resource ID</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs">{formatDate(log.createdAt)}</td>
                    <td className="px-4 py-3 text-xs">{log.userEmail}</td>
                    <td className="px-4 py-3 text-xs">{log.role}</td>
                    <td className="px-4 py-3 text-xs font-medium">{log.action}</td>
                    <td className="px-4 py-3 text-xs">{log.resourceType}</td>
                    <td className="px-4 py-3 text-xs">{log.resourceId}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
