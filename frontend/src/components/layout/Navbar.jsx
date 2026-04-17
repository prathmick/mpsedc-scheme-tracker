import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="bg-blue-800 text-white px-6 py-3 flex items-center justify-between shadow">
      <h1 className="text-lg font-semibold tracking-wide">MPSEDC Scheme Tracker</h1>
      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm text-blue-200">
            {user.email} <span className="ml-1 text-xs bg-blue-600 px-2 py-0.5 rounded">{user.role}</span>
          </span>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-1 text-sm hover:text-blue-200 transition-colors"
          title="Logout"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
}
