import { useState } from 'react';
import useSchemes from '../hooks/useSchemes';
import axiosInstance from '../api/axiosInstance';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { Plus, Edit, Trash2 } from 'lucide-react';

const emptyForm = { name: '', description: '', department: '' };

export default function SchemesPage() {
  const { schemes, loading, refetch } = useSchemes();
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');

  function startEdit(scheme) {
    setEditId(scheme.id);
    setForm({ name: scheme.name, description: scheme.description || '', department: scheme.department || '' });
    setShowForm(true);
    setError('');
  }

  function startNew() {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError('');
  }

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    try {
      if (editId) {
        await axiosInstance.put(`/schemes/${editId}`, form);
      } else {
        await axiosInstance.post('/schemes', form);
      }
      setShowForm(false);
      refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    }
  }

  async function handleDelete() {
    try {
      await axiosInstance.delete(`/schemes/${deleteId}`);
      setDeleteId(null);
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
      setDeleteId(null);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Schemes</h1>
        <button onClick={startNew} className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
          <Plus size={16} /> Add Scheme
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editId ? 'Edit Scheme' : 'New Scheme'}</h2>
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
          <form onSubmit={handleSave} className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full border rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
            </div>
            <div className="col-span-3 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded text-sm hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <LoadingSpinner /> : (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Department</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Description</th>
                <th className="text-right px-4 py-3 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schemes.map((s) => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3">{s.department}</td>
                  <td className="px-4 py-3 text-gray-500">{s.description}</td>
                  <td className="px-4 py-3 text-right flex justify-end gap-2">
                    <button onClick={() => startEdit(s)} className="text-gray-600 hover:text-gray-800"><Edit size={16} /></button>
                    <button onClick={() => setDeleteId(s.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteId && (
        <ConfirmDialog
          message="Are you sure you want to delete this scheme? This cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
