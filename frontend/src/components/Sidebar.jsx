import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  TrendingUp, LayoutDashboard, BrainCircuit, Wallet, 
  Eye, BarChart3, FileSpreadsheet, User, ShieldAlert, 
  HelpCircle, LogOut, Sun, Moon, Info 
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Stock Predictor', path: '/predictor', icon: BrainCircuit },
    { name: 'Portfolio', path: '/portfolio', icon: Wallet },
    { name: 'Watchlist', path: '/watchlist', icon: Eye },
    { name: 'Market Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'AI Reports', path: '/reports', icon: FileSpreadsheet },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'About Us', path: '/about', icon: Info },
    { name: 'Contact Support', path: '/support', icon: HelpCircle },
  ];

  return (
    <aside className="w-64 glass h-screen flex flex-col justify-between fixed top-0 left-0 z-20 border-r border-darkBorder">
      {/* Sidebar Header */}
      <div>
        <div className="p-6 border-b border-darkBorder flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="bg-brand-600 p-2 rounded-lg text-white shadow-md shadow-brand-500/25">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-wide text-white leading-tight">MarketMind AI</h1>
              <p className="text-xs text-brand-400 font-medium">by P. Mukesh</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium
                ${isActive 
                  ? 'bg-brand-600/20 text-white border-l-4 border-brand-500 shadow-sm shadow-brand-500/5' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
                }
              `}
            >
              <item.icon className="h-5 w-5 transition-transform group-hover:scale-110" />
              <span>{item.name}</span>
            </NavLink>
          ))}

          {/* Admin Panel Link */}
          {user && user.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `
                flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium
                ${isActive 
                  ? 'bg-red-500/20 text-red-200 border-l-4 border-red-500' 
                  : 'text-red-400/80 hover:text-red-300 hover:bg-red-500/10'
                }
              `}
            >
              <ShieldAlert className="h-5 w-5 transition-transform group-hover:scale-110" />
              <span>Admin Panel</span>
            </NavLink>
          )}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-darkBorder space-y-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-gray-400 hover:text-gray-200 hover:bg-gray-800/30 transition-colors text-sm font-medium"
        >
          <span className="flex items-center space-x-3">
            {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
          </span>
          <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${theme === 'dark' ? 'bg-brand-600' : 'bg-gray-600'}`}>
            <div className={`w-3 h-3 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </button>

        {/* User Info & Logout */}
        {user && (
          <div className="flex items-center justify-between px-2 pt-2">
            <div className="flex items-center space-x-2 truncate">
              <div className="h-9 w-9 rounded-full bg-brand-700/50 flex items-center justify-center text-white border border-brand-500/30 text-sm font-bold">
                {user.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="truncate text-left">
                <p className="text-sm font-semibold text-white truncate leading-none mb-1">{user.username}</p>
                <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold leading-none ${
                  user.role === 'admin' ? 'bg-red-500/20 text-red-300' : (user.role === 'guest' ? 'bg-gray-700 text-gray-400' : 'bg-brand-500/20 text-brand-300')
                }`}>
                  {user.role}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
