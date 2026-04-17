import useOnlineStatus from '../../hooks/useOnlineStatus';

export default function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-yellow-500 text-yellow-900 text-center py-2 text-sm font-medium z-50">
      You are offline. Some features may not be available.
    </div>
  );
}
