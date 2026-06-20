import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, Activity, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivityLogs() {
      if (user?.role === 'guest') {
        setLoading(false);
        return;
      }
      try {
        // Normal users can't see the global admin logs, so we fetch admin logs if admin,
        // or simulate user activity log based on portfolio transactions
        const adminLogs = await api.getAdminLogs();
        // Filter logs specifically belonging to the user
        const userLogs = adminLogs.filter(log => log.username === user?.username);
        setLogs(userLogs);
      } catch (err) {
        console.error('Failed to load user logs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadActivityLogs();
  }, [user]);

  return (
    <Layout title="My Account Profile">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Card */}
        <div className="lg:col-span-1 glass p-6 rounded-2xl h-fit space-y-6 text-center">
          <div className="h-20 w-20 rounded-full bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 text-3xl font-extrabold mx-auto">
            {user?.username.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{user?.username}</h3>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mt-2 ${
              user?.role === 'admin' ? 'bg-red-500/25 text-red-300' : (user?.role === 'guest' ? 'bg-gray-800 text-gray-400' : 'bg-brand-500/20 text-brand-300')
            }`}>
              {user?.role} Permissions
            </span>
          </div>

          <div className="border-t border-darkBorder pt-4 space-y-3 text-xs text-left">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Security Rating</span>
              <span className="text-emerald-400 font-bold flex items-center space-x-1">
                <ShieldCheck className="h-4 w-4" />
                <span>Verified</span>
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Session Status</span>
              <span className="text-white font-semibold">Active</span>
            </div>
          </div>
        </div>

        {/* Activity Logs */}
        <div className="lg:col-span-2 glass p-6 rounded-2xl">
          <h3 className="font-bold text-white text-base mb-4 flex items-center space-x-2">
            <Activity className="h-5 w-5 text-brand-400" />
            <span>My Security Activity Logs</span>
          </h3>

          {user?.role === 'guest' ? (
            <div className="py-8 text-center text-gray-500 text-xs">
              Logs are not tracked for guest profiles.
            </div>
          ) : (
            loading ? (
              <div className="h-48 glass shimmer-loader rounded-xl" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-darkBorder text-gray-400 font-semibold">
                      <th className="pb-3">Action performed</th>
                      <th className="pb-3">Details</th>
                      <th className="pb-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-darkBorder/40 text-gray-300">
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td className="py-3.5 font-bold text-white">{log.action}</td>
                        <td className="py-3.5">{log.details}</td>
                        <td className="py-3.5 text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                    {logs.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-gray-500 font-medium">
                          No recent actions logged.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>
    </Layout>
  );
}
