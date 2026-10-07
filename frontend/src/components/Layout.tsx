import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/auth';
import { LayoutDashboard, Key, MessageSquare, Settings, LogOut, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Layout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">SecureAI</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/" className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
            <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
          </Link>
          <Link to="/playground" className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
            <MessageSquare className="w-5 h-5 mr-3" /> Playground
          </Link>
          <Link to="/api-keys" className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
            <Key className="w-5 h-5 mr-3" /> API Keys
          </Link>
          <Link to="/settings" className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
            <Settings className="w-5 h-5 mr-3" /> Settings
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">{user?.email}</div>
          <button onClick={handleLogout} className="flex items-center text-red-600 hover:text-red-700">
            <LogOut className="w-5 h-5 mr-3" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-end px-6">
          <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
