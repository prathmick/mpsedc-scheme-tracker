export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
        <p className="text-gray-800 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded border text-sm hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded bg-red-600 text-white text-sm hover:bg-red-700">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
