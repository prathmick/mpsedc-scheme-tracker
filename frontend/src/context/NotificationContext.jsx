import { createContext, useState, useCallback } from 'react';

export const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const notify = useCallback((type, message) => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, notify, dismiss }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`px-4 py-3 rounded shadow-lg text-white text-sm max-w-xs ${
              n.type === 'success' ? 'bg-green-600' :
              n.type === 'error' ? 'bg-red-600' :
              n.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-600'
            }`}
          >
            <div className="flex justify-between items-start gap-2">
              <span>{n.message}</span>
              <button onClick={() => dismiss(n.id)} className="ml-2 font-bold leading-none">×</button>
            </div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
