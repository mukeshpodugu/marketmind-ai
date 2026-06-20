import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { TrendingUp, AlertTriangle } from 'lucide-react';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // 1. Register User
      await api.register(username, email, password);
      // 2. Perform auto-login
      const data = await api.login(username, password);
      login(data.access_token, data.username, data.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
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
          <h2 className="text-2xl font-extrabold text-white">Create Account</h2>
          <p className="text-xs text-gray-400">Unlock portfolios and advanced forecasting</p>
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
              placeholder="Pick a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <p className="text-[10px] text-gray-500 mt-1">Tip: Include "admin" in username to register as Admin role.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full bg-gray-900/60 border border-darkBorder rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full bg-gray-900/60 border border-darkBorder rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-brand-500/20 hover:shadow-brand-500/30 flex items-center justify-center"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs">
          <Link to="/login" className="text-brand-400 hover:underline">
            Already have an account? Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
