import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Heart, Plus, Trash2, ShieldAlert, ArrowUpRight, ArrowDownRight, Eye } from 'lucide-react';

export default function Watchlist() {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [symbol, setSymbol] = useState('');

  // Local prices simulated for watchlists display
  const [prices, setPrices] = useState({});

  const loadWatchlist = async () => {
    if (user?.role === 'guest') {
      setLoading(false);
      return;
    }
    setError('');
    try {
      const data = await api.getWatchlist();
      setWatchlist(data);

      // Simulate prices for watched stocks
      const priceMap = {};
      for (const item of data) {
        const sym = item.stock.symbol;
        // Generate stable mock prices for display
        const seed = sumSymbolAscii(sym);
        const price = 50 + (seed % 400) + Math.random() * 2;
        const change = (seed % 5 === 0) ? -2.4 : 1.8;
        priceMap[sym] = { price, change };
      }
      setPrices(priceMap);
    } catch (err) {
      setError(err.message || 'Failed to retrieve watchlist data');
    } finally {
      setLoading(false);
    }
  };

  const sumSymbolAscii = (sym) => {
    return sym.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  };

  useEffect(() => {
    loadWatchlist();
  }, [user]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!symbol) return;
    setError('');
    try {
      await api.addToWatchlist(symbol.toUpperCase());
      setSymbol('');
      loadWatchlist();
    } catch (err) {
      setError(err.message || 'Failed to add stock to watchlist');
    }
  };

  const handleRemove = async (watchlistId) => {
    setError('');
    try {
      await api.removeFromWatchlist(watchlistId);
      loadWatchlist();
    } catch (err) {
      setError(err.message || 'Failed to remove stock');
    }
  };

  if (user?.role === 'guest') {
    return (
      <Layout title="Favorites Watchlist">
        <div className="glass p-8 rounded-3xl max-w-lg mx-auto text-center space-y-6 my-12 border border-darkBorder">
          <ShieldAlert className="h-12 w-12 text-brand-400 mx-auto" />
          <h3 className="text-xl font-bold text-white">Access Favorites Tracking</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Registered accounts can track key symbols, receive real-time alerts, and monitor daily pricing adjustments.
          </p>
          <a
            href="/register"
            className="inline-block bg-brand-600 hover:bg-brand-500 text-white font-bold px-6 py-3 rounded-xl text-sm shadow-md"
          >
            Create Free Account
          </a>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Favorites Watchlist">
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl mb-8 flex items-center space-x-3 text-sm">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Add Symbol Input Bar */}
      <form onSubmit={handleAdd} className="flex space-x-3 mb-8">
        <input
          type="text"
          required
          className="flex-1 bg-gray-900/60 border border-darkBorder rounded-2xl px-4 py-3.5 text-sm text-white uppercase focus:outline-none focus:border-brand-500 transition-colors"
          placeholder="Add Ticker Symbol to Watchlist (e.g. AAPL, NVDA, TSLA)"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
        />
        <button
          type="submit"
          className="bg-brand-600 hover:bg-brand-500 text-white px-8 rounded-2xl text-sm font-bold shadow flex items-center space-x-2 shrink-0 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Track Stock</span>
        </button>
      </form>

      {loading ? (
        <div className="h-64 glass shimmer-loader rounded-2xl" />
      ) : (
        <div className="glass p-6 rounded-2xl">
          <div className="flex items-center space-x-2 mb-6 border-b border-darkBorder pb-4">
            <Eye className="h-5 w-5 text-brand-400" />
            <h3 className="font-bold text-white text-base">Monitored Assets</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-darkBorder text-gray-400 font-semibold">
                  <th className="pb-3">Symbol</th>
                  <th className="pb-3">Company Name</th>
                  <th className="pb-3">Sector</th>
                  <th className="pb-3 text-right">Approx Close Price</th>
                  <th className="pb-3 text-right">Daily Change</th>
                  <th className="pb-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-darkBorder/40 text-gray-300">
                {watchlist.map((item) => {
                  const details = prices[item.stock.symbol] || { price: 100.0, change: 0.5 };
                  const isPos = details.change >= 0;
                  return (
                    <tr key={item.id} className="hover:bg-gray-800/10">
                      <td className="py-4 font-bold text-white uppercase">{item.stock.symbol}</td>
                      <td className="py-4">{item.stock.name}</td>
                      <td className="py-4 text-gray-400">{item.stock.sector || 'Financials'}</td>
                      <td className="py-4 text-right font-bold text-white">${details.price.toFixed(2)}</td>
                      <td className={`py-4 text-right font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPos ? <ArrowUpRight className="h-3 w-3 inline mr-0.5" /> : <ArrowDownRight className="h-3 w-3 inline mr-0.5" />}
                        {details.change.toFixed(2)}%
                      </td>
                      <td className="py-4 text-center">
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="p-1.5 rounded hover:bg-rose-500/15 text-gray-500 hover:text-rose-400 transition-colors"
                          title="Untrack Stock"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {watchlist.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-gray-500 font-medium">
                      Your watchlist is empty. Add a symbol above to start tracking.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
}
