import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDate } from '../utils/formatters';

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [transitioning, setTransitioning] = useState(false);

  async function fetchApp() {
    try {
      const { data } = await axiosInstance.get(`/applications/${id}`);
      setApp(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load application');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchApp(); }, [id]);

  async function handleTransition(status) {
    setTransitioning(true);
    try {
      await axiosInstance.patch(`/applications/${id}/status`, { status });
      await fetchApp();
    } catch (err) {
      alert(err.response?.data?.message || 'Transition failed');
    } finally {
      setTransitioning(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!app) return null;

  return (
    <div className="max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Application #{app.id}</h1>
        <Link to="/applications" className="text-sm text-blue-600 hover:underline">← Back</Link>
      </div>

      <div className="bg-white rounded shadow p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="font-medium text-gray-600">Citizen Name:</span> <span>{app.citizenName}</span></div>
          <div><span className="font-medium text-gray-600">Aadhaar:</span> <span>{app.citizenAadhaar}</span></div>
          <div><span className="font-medium text-gray-600">Scheme:</span> <span>{app.schemeName}</span></div>
          <div><span className="font-medium text-gray-600">District:</span> <span>{app.district}</span></div>
          <div><span className="font-medium text-gray-600">Status:</span> <StatusBadge status={app.status} /></div>
          <div><span className="font-medium text-gray-600">Officer:</span> <span>{app.officerName}</span></div>
          <div><span className="font-medium text-gray-600">Created:</span> <span>{formatDate(app.createdAt)}</span></div>
          <div><span className="font-medium text-gray-600">Updated:</span> <span>{formatDate(app.updatedAt)}</span></div>
        </div>

        {/* Workflow actions */}
        <div className="pt-4 border-t flex gap-3">
          {user?.role === 'User' && app.status === 'Draft' && (
            <button
              onClick={() => handleTransition('Review')}
              disabled={transitioning}
              className="px-4 py-2 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 disabled:opacity-50"
            >
              Submit for Review
            </button>
          )}
          {user?.role === 'Admin' && app.status === 'Review' && (
            <>
              <button
                onClick={() => handleTransition('Approved')}
                disabled={transitioning}
                className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => handleTransition('Draft')}
                disabled={transitioning}
                className="px-4 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 disabled:opacity-50"
              >
                Return to Draft
              </button>
            </>
          )}
          <Link to={`/applications/${id}/edit`} className="px-4 py-2 border rounded text-sm hover:bg-gray-50">
            Edit
          </Link>
        </div>
      </div>
    </div>
  );
}
