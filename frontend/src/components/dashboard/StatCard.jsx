export default function StatCard({ icon: Icon, count, label }) {
  return (
    <div className="bg-white rounded shadow p-6 flex items-center gap-4">
      <div className="bg-blue-100 p-3 rounded-lg">
        <Icon size={24} className="text-blue-600" />
      </div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{count}</p>
      </div>
    </div>
  );
}
