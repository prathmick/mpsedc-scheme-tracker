import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FileText, LayoutDashboard, BookOpen, ClipboardList } from 'lucide-react';

const linkClass = ({ isActive }) =>
  `flex items-center gap-2 px-4 py-2 rounded text-sm transition-colors ${
    isActive ? 'bg-blue-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
  }`;

export default function Sidebar() {
  const { user } = useContext(AuthContext);

  return (
    <aside className="w-56 bg-gray-800 min-h-full flex flex-col py-4 gap-1">
      <NavLink to="/applications" className={linkClass}>
        <FileText size={16} /> Applications
      </NavLink>
      {user?.role === 'Admin' && (
        <>
          <NavLink to="/dashboard" className={linkClass}>
            <LayoutDashboard size={16} /> Dashboard
          </NavLink>
          <NavLink to="/schemes" className={linkClass}>
            <BookOpen size={16} /> Schemes
          </NavLink>
          <NavLink to="/audit-logs" className={linkClass}>
            <ClipboardList size={16} /> Audit Logs
          </NavLink>
        </>
      )}
    </aside>
  );
}
