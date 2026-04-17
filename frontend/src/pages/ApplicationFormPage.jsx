import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

export default function ApplicationFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({ citizenName: '', citizenAadhaar: '', schemeId: '', district: '' });
  const [schemes, setSchemes] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    axiosInstance.get('/schemes').then(({ data }) => setSchemes(data));
    if (isEdit) {
      axiosInstance.get(`/applications/${id}`).then(({ data }) => {
        setForm({
          citizenName: data.citizenName,
          citizenAadhaar: '',  // Don't pre-fill masked Aadhaar
          schemeId: data.schemeId,
          district: data.district,
        });
        setIsApproved(data.status === 'Approved');
      });
    }
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setLoading(true);
    try {
      if (isEdit) {
        await axiosInstance.put(`/applications/${id}`, form);
      } else {
        await axiosInstance.post('/applications', form);
      }
      navigate('/applications');
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors([{ msg: err.response?.data?.message || 'Save failed' }]);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{isEdit ? 'Edit Application' : 'New Application'}</h1>
        <Link to="/applications" className="text-sm text-blue-600 hover:underline">← Back</Link>
      </div>

      {isApproved && (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 rounded p-3 mb-4 text-sm">
          This application is Approved and cannot be modified.
        </div>
      )}

      {errors.length > 0 && (
        <ul className="text-red-600 text-sm mb-4 list-disc list-inside">
          {errors.map((e, i) => <li key={i}>{e.msg || e.message}</li>)}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded shadow p-6 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Citizen Name</label>
          <input
            type="text"
            value={form.citizenName}
            onChange={(e) => setForm({ ...form, citizenName: e.target.value })}
            required
            disabled={isApproved}
            className="w-full border rounded px-3 py-2 text-sm disabled:bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar (12 digits)</label>
          <input
            type="text"
            value={form.citizenAadhaar}
            onChange={(e) => setForm({ ...form, citizenAadhaar: e.target.value })}
            required={!isEdit}
            pattern="\d{12}"
            maxLength={12}
            disabled={isApproved}
            placeholder={isEdit ? 'Enter new Aadhaar to update' : ''}
            className="w-full border rounded px-3 py-2 text-sm disabled:bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Scheme</label>
          <select
            value={form.schemeId}
            onChange={(e) => setForm({ ...form, schemeId: e.target.value })}
            required
            disabled={isApproved}
            className="w-full border rounded px-3 py-2 text-sm disabled:bg-gray-100"
          >
            <option value="">Select a scheme</option>
            {schemes.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
          <input
            type="text"
            value={form.district}
            onChange={(e) => setForm({ ...form, district: e.target.value })}
            required
            disabled={isApproved}
            className="w-full border rounded px-3 py-2 text-sm disabled:bg-gray-100"
          />
        </div>
        {!isApproved && (
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-700 text-white py-2 rounded text-sm font-medium hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEdit ? 'Update Application' : 'Create Application'}
          </button>
        )}
      </form>
    </div>
  );
}
