import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User } from 'lucide-react';

export default function Layout({ children, title }) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex bg-darkBg text-gray-100">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Panel */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header className="h-16 glass-nav px-8 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">{title}</h2>
          </div>

          <div className="flex items-center space-x-4">
            {/* Quick Status Pill */}
            <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold text-emerald-400">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Realtime Core Online</span>
            </div>

            {/* Profile Pill */}
            {user && (
              <div className="flex items-center space-x-2 bg-gray-800/40 border border-darkBorder px-3 py-1.5 rounded-xl">
                {user.role === 'admin' ? (
                  <ShieldCheck className="h-4 w-4 text-red-400" />
                ) : (
                  <User className="h-4 w-4 text-brand-400" />
                )}
                <span className="text-xs font-bold text-gray-300 capitalize">{user.username} ({user.role})</span>
              </div>
            )}
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
