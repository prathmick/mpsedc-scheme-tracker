export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center gap-2 mt-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1 rounded border text-sm disabled:opacity-40 hover:bg-gray-100"
      >
        Prev
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-1 rounded border text-sm ${p === page ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-100'}`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-1 rounded border text-sm disabled:opacity-40 hover:bg-gray-100"
      >
        Next
      </button>
    </div>
  );
}
