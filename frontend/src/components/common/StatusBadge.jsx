export default function StatusBadge({ status }) {
  const colors = {
    Draft: 'bg-gray-200 text-gray-800',
    Review: 'bg-yellow-200 text-yellow-900',
    Approved: 'bg-green-200 text-green-900',
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>
      {status}
    </span>
  );
}
