import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import useApplications from '../hooks/useApplications';
import StatusBadge from '../components/common/StatusBadge';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Eye, Edit, Trash2, Download } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

export default function ApplicationsPage() {
  const { user } = useContext(AuthContext);
  const [filters, setFilters] = useState({ schemeId: '', status: '', district: '', search: '' });
  const [page, setPage] = useState(1);
  const { applications, pagination, loading, refetch } = useApplications(filters, { page, limit: 10 });

  async function handleExport() {
    try {
      const { data } = await axiosInstance.get('/applications/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'applications_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Export failed');
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Applications</h1>
        <div className="flex gap-2">
          {user?.role === 'Admin' && (
            <button onClick={handleExport} className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">
              <Download size={16} /> Export CSV
            </button>
          )}
          <Link to="/applications/new" className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
            + New Application
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded shadow p-4 mb-4 grid grid-cols-4 gap-3">
        <input
          placeholder="Search citizen name..."
          value={filters.search}
          onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setPage(1); }}
          className="border rounded px-3 py-2 text-sm"
        />
        <input
          placeholder="District"
          value={filters.district}
          onChange={(e) => { setFilters({ ...filters, district: e.target.value }); setPage(1); }}
          className="border rounded px-3 py-2 text-sm"
        />
        <select
          value={filters.status}
          onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Review">Review</option>
          <option value="Approved">Approved</option>
        </select>
        <button onClick={() => { setFilters({ schemeId: '', status: '', district: '', search: '' }); setPage(1); }} className="border rounded px-3 py-2 text-sm hover:bg-gray-50">
          Reset
        </button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          <div className="bg-white rounded shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Citizen Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Scheme</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">District</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Created</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{app.citizenName}</td>
                    <td className="px-4 py-3">{app.schemeName}</td>
                    <td className="px-4 py-3">{app.district}</td>
                    <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                    <td className="px-4 py-3">{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right flex justify-end gap-2">
                      <Link to={`/applications/${app.id}`} className="text-blue-600 hover:text-blue-800"><Eye size={16} /></Link>
                      <Link to={`/applications/${app.id}/edit`} className="text-gray-600 hover:text-gray-800"><Edit size={16} /></Link>
                      <button className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                    </td>
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
