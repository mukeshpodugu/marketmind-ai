import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Server, Trash, ShieldCheck, Activity, LineChart, CheckCircle } from 'lucide-react';

export default function AdminPanel() {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState(null);
  const [modelAcc, setModelAcc] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadAdminData = async () => {
    if (user?.role !== 'admin') {
      setLoading(false);
      return;
    }
    setError('');
    try {
      const [u, metrics, acc, l] = await Promise.all([
        api.getAdminUsers(),
        api.getAdminSystemMetrics(),
        api.getAdminModelAccuracy(),
        api.getAdminLogs()
      ]);
      setUsersList(u);
      setSystemMetrics(metrics);
      setModelAcc(acc);
      setLogs(l);
    } catch (err) {
      setError(err.message || 'Failed to retrieve admin dashboard indicators');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [user]);

  const handleRoleChange = async (userId, newRole) => {
    setError('');
    setSuccessMsg('');
    try {
      await api.updateAdminUserRole(userId, newRole);
      setSuccessMsg('User permission role updated.');
      loadAdminData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to adjust role');
    }
  };

  const handleClearCache = async () => {
    setError('');
    setSuccessMsg('');
    try {
      const res = await api.clearAdminCache();
      setSuccessMsg(res.message);
      loadAdminData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError('Failed to clear model caches');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <Layout title="Platform Control Center">
        <div className="glass p-8 rounded-3xl max-w-lg mx-auto text-center space-y-6 my-12 border border-rose-500/20">
          <ShieldAlert className="h-12 w-12 text-rose-400 mx-auto" />
          <h3 className="text-xl font-bold text-white">Restricted Administrator Area</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Access to user roles configuration, prediction performance metrics, and log databases is restricted to platform administrators.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Platform Control Center">
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl mb-8 flex items-center space-x-3 text-sm">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl mb-8 flex items-center space-x-3 text-sm">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="h-96 glass shimmer-loader rounded-2xl" />
      ) : (
        <div className="space-y-8">
          {/* Top Systems Resource Row */}
          {systemMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="glass p-5 rounded-2xl">
                <span className="text-xs font-bold text-gray-500 uppercase flex items-center space-x-2">
                  <Server className="h-4 w-4 text-brand-400" />
                  <span>CPU Load</span>
                </span>
                <h4 className="text-2xl font-black text-white mt-2">{systemMetrics.cpu_usage_pct}%</h4>
              </div>

              <div className="glass p-5 rounded-2xl">
                <span className="text-xs font-bold text-gray-500 uppercase">Memory Allocations</span>
                <h4 className="text-2xl font-black text-white mt-2">{systemMetrics.ram_usage_pct}%</h4>
              </div>

              <div className="glass p-5 rounded-2xl">
                <span className="text-xs font-bold text-gray-500 uppercase">PostgreSQL Status</span>
                <h4 className="text-2xl font-black text-emerald-400 mt-2">{systemMetrics.postgres_connection_status}</h4>
              </div>

              <div className="glass p-5 rounded-2xl">
                <span className="text-xs font-bold text-gray-500 uppercase font-semibold">Redis Cache Status</span>
                <div className="flex items-center justify-between mt-2">
                  <h4 className="text-2xl font-black text-emerald-400">{systemMetrics.redis_connection_status}</h4>
                  <button
                    onClick={handleClearCache}
                    className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-semibold flex items-center space-x-1"
                  >
                    <Trash className="h-3.5 w-3.5" />
                    <span>Clear Cache</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User roles control */}
            <div className="lg:col-span-2 glass p-6 rounded-2xl">
              <h3 className="font-bold text-white text-base mb-4 flex items-center space-x-2">
                <ShieldCheck className="h-5 w-5 text-brand-400" />
                <span>Registered Users Control Board</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-darkBorder text-gray-400 font-semibold">
                      <th className="pb-3">Username</th>
                      <th className="pb-3">Email</th>
                      <th className="pb-3">Created Date</th>
                      <th className="pb-3 text-center">Security Level Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-darkBorder/40 text-gray-300">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-800/10">
                        <td className="py-3 font-bold text-white">{u.username}</td>
                        <td className="py-3">{u.email}</td>
                        <td className="py-3 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="py-3 text-center">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="bg-gray-900 border border-darkBorder rounded px-2 py-1 text-xs text-white uppercase focus:outline-none"
                          >
                            <option value="guest">Guest</option>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Model Accuracy Metrics */}
            <div className="glass p-6 rounded-2xl h-fit">
              <h3 className="font-bold text-white text-base mb-4 flex items-center space-x-2">
                <LineChart className="h-5 w-5 text-brand-400" />
                <span>ML Model Accuracies</span>
              </h3>

              <div className="space-y-3.5">
                {modelAcc.map((item, idx) => (
                  <div key={idx} className="p-3 bg-gray-900/40 border border-darkBorder rounded-xl text-xs space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white capitalize">{item.model_name}</span>
                      <span className="text-[10px] text-gray-500">RMSE Error: {item.avg_rmse}</span>
                    </div>
                    <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                      {/* Wider bar represents higher accuracy (inverse of RMSE) */}
                      <div className="bg-brand-500 h-full rounded-full" style={{ width: `${Math.max(10, 100 - item.avg_rmse * 10)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Audit Logs */}
          <div className="glass p-6 rounded-2xl">
            <h3 className="font-bold text-white text-base mb-4 flex items-center space-x-2">
              <Activity className="h-5 w-5 text-brand-400" />
              <span>Global Activity logs Audits</span>
            </h3>

            <div className="overflow-y-auto max-h-[300px] pr-1">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-darkBorder text-gray-400 font-semibold">
                    <th className="pb-3">Username</th>
                    <th className="pb-3">Action performed</th>
                    <th className="pb-3">Details</th>
                    <th className="pb-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-darkBorder/40 text-gray-300">
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="py-3 font-bold text-white">{log.username}</td>
                      <td className="py-3 font-semibold text-brand-300">{log.action}</td>
                      <td className="py-3 text-gray-400">{log.details}</td>
                      <td className="py-3 text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
