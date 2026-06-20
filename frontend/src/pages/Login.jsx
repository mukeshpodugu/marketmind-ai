import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { TrendingUp, AlertTriangle, KeyRound } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Forgot Password States
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [showForgot, setShowForgot] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(username, password);
      login(data.access_token, data.username, data.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Incorrect username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotMsg('');
    try {
      const res = await api.forgotPassword(forgotEmail);
      setForgotMsg(res.message + (res.reset_token ? ` Reset Token: ${res.reset_token}` : ''));
    } catch (err) {
      setForgotMsg('Error generating reset token.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-darkBg px-6 relative">
      <div className="absolute top-1/4 left-1/4 h-64 w-64 bg-brand-500/10 rounded-full filter blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-64 w-64 bg-violet-500/10 rounded-full filter blur-3xl" />

      <div className="glass p-8 rounded-3xl w-full max-w-md border border-darkBorder shadow-2xl relative z-10">
        <div className="flex flex-col items-center space-y-3 mb-8">
          <div className="bg-brand-600 p-2.5 rounded-xl text-white shadow-lg shadow-brand-500/20">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Sign In to MarketMind AI</h2>
          <p className="text-xs text-gray-400">Enter credentials to unlock analytics</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 mb-4">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Username</label>
            <input
              type="text"
              required
              className="w-full bg-gray-900/60 border border-darkBorder rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
              placeholder="admin or enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full bg-gray-900/60 border border-darkBorder rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center text-xs">
            <button
              type="button"
              onClick={() => setShowForgot(true)}
              className="text-brand-400 hover:underline"
            >
              Forgot Password?
            </button>
            <Link to="/register" className="text-gray-400 hover:text-white transition-colors">
              Need an account? Sign Up
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-brand-500/20 hover:shadow-brand-500/30 flex items-center justify-center"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Guest shortcut info */}
        <div className="mt-6 border-t border-darkBorder pt-4 text-center">
          <p className="text-xs text-gray-500">
            Developer credentials: Register as <b>admin</b> to view Admin features.
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass p-6 rounded-2xl w-full max-w-sm border border-darkBorder text-left">
            <div className="flex items-center space-x-2 mb-4 text-brand-400">
              <KeyRound className="h-5 w-5" />
              <h3 className="font-bold text-white text-lg">Reset Password</h3>
            </div>
            
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full bg-gray-900/60 border border-darkBorder rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                  placeholder="name@email.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
              </div>

              {forgotMsg && (
                <div className="bg-brand-500/10 border border-brand-500/20 text-brand-300 p-3 rounded-xl text-xs break-words">
                  {forgotMsg}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold py-2 rounded-xl"
                >
                  Generate Token
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForgot(false); setForgotMsg(''); }}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold py-2 rounded-xl"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
