import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import AllocationChart from '../components/AllocationChart';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Wallet, Plus, Trash2, ShieldAlert, ArrowUpRight, ArrowDownRight, LineChart } from 'lucide-react';

export default function Portfolio() {
  const { user } = useAuth();
  const [portfolios, setPortfolios] = useState([]);
  const [activePort, setActivePort] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add holding form states
  const [symbol, setSymbol] = useState('');
  const [shares, setShares] = useState('');
  const [buyPrice, setBuyPrice] = useState('');

  const loadPortfolios = async () => {
    if (user?.role === 'guest') {
      setLoading(false);
      return;
    }
    setError('');
    try {
      const data = await api.getPortfolios();
      setPortfolios(data);
      
      if (data.length > 0) {
        const portId = data[0].id;
        setActivePort(data[0]);
        const sum = await api.getPortfolioSummary(portId);
        setSummary(sum);
      } else {
        // Automatically create a default portfolio for new users
        const newPort = await api.createPortfolio('My Primary Portfolio');
        setPortfolios([newPort]);
        setActivePort(newPort);
        const sum = await api.getPortfolioSummary(newPort.id);
        setSummary(sum);
      }
    } catch (err) {
      setError(err.message || 'Failed to load portfolio database records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolios();
  }, [user]);

  const handleAddHolding = async (e) => {
    e.preventDefault();
    if (!activePort || !symbol || !shares || !buyPrice) return;
    setError('');
    try {
      await api.addHolding(
        activePort.id,
        symbol.toUpperCase(),
        parseFloat(shares),
        parseFloat(buyPrice),
        new Date().toISOString()
      );
      // Reset inputs
      setSymbol('');
      setShares('');
      setBuyPrice('');
      // Reload portfolio summary
      const sum = await api.getPortfolioSummary(activePort.id);
      setSummary(sum);
    } catch (err) {
      setError(err.message || 'Failed to buy holding');
    }
  };

  const handleRemoveHolding = async (holdingId) => {
    if (!activePort) return;
    setError('');
    try {
      await api.removeHolding(activePort.id, holdingId);
      const sum = await api.getPortfolioSummary(activePort.id);
      setSummary(sum);
    } catch (err) {
      setError(err.message || 'Failed to remove holding');
    }
  };

  if (user?.role === 'guest') {
    return (
      <Layout title="My Investments Portfolio">
        <div className="glass p-8 rounded-3xl max-w-lg mx-auto text-center space-y-6 my-12 border border-darkBorder">
          <ShieldAlert className="h-12 w-12 text-brand-400 mx-auto" />
          <h3 className="text-xl font-bold text-white">Unlock Portfolio Monitoring</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Registered accounts can record stock transactions, calculate total returns, view allocation breakdowns, and access prediction indicators.
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
    <Layout title="My Investments Portfolio">
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl mb-8 flex items-center space-x-3 text-sm">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="h-96 glass shimmer-loader rounded-2xl" />
      ) : (
        <div className="space-y-8">
          {summary && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase">Portfolio Net Asset Value</span>
                    <h4 className="text-2xl font-black text-white mt-1">${summary.total_value.toLocaleString()}</h4>
                  </div>
                  <div className="p-3 rounded-xl bg-brand-600/10 border border-brand-500/20 text-brand-400">
                    <Wallet className="h-6 w-6" />
                  </div>
                </div>

                <div className="glass p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase">Accumulated Total Returns</span>
                    <h4 className={`text-2xl font-black mt-1 ${summary.total_gain_loss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ${summary.total_gain_loss.toLocaleString()}
                    </h4>
                  </div>
                  <div className={`p-3 rounded-xl ${summary.total_gain_loss >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                    {summary.total_gain_loss >= 0 ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownRight className="h-6 w-6" />}
                  </div>
                </div>

                <div className="glass p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase">Percentage Gain / Loss</span>
                    <h4 className={`text-2xl font-black mt-1 ${summary.total_gain_loss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {summary.total_gain_loss >= 0 ? '+' : ''}{summary.total_gain_loss_percent.toFixed(2)}%
                    </h4>
                  </div>
                  <div className="p-3 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400">
                    <LineChart className="h-6 w-6" />
                  </div>
                </div>
              </div>

              {/* Transactions grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Holdings Table */}
                <div className="lg:col-span-2 glass p-6 rounded-2xl">
                  <h3 className="font-bold text-white text-base mb-4">Current Asset Holdings</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-darkBorder text-gray-400 font-semibold">
                          <th className="pb-3">Ticker</th>
                          <th className="pb-3 text-right">Shares</th>
                          <th className="pb-3 text-right">Buy Price</th>
                          <th className="pb-3 text-right">Current Price</th>
                          <th className="pb-3 text-right">Market Value</th>
                          <th className="pb-3 text-right">Return</th>
                          <th className="pb-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-darkBorder/40 text-gray-300">
                        {summary.holdings.map((h) => {
                          const isPos = h.gain_loss >= 0;
                          return (
                            <tr key={h.id} className="hover:bg-gray-800/10">
                              <td className="py-3.5">
                                <span className="font-bold text-white block">{h.symbol}</span>
                                <span className="text-[10px] text-gray-500 leading-none">{h.name}</span>
                              </td>
                              <td className="py-3.5 text-right">{h.shares.toFixed(2)}</td>
                              <td className="py-3.5 text-right">${h.buy_price.toFixed(2)}</td>
                              <td className="py-3.5 text-right">${h.current_price.toFixed(2)}</td>
                              <td className="py-3.5 text-right">${h.market_value.toLocaleString()}</td>
                              <td className={`py-3.5 text-right font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isPos ? '+' : ''}{h.gain_loss_percent.toFixed(1)}%
                              </td>
                              <td className="py-3.5 text-center">
                                <button
                                  onClick={() => handleRemoveHolding(h.id)}
                                  className="p-1.5 rounded hover:bg-rose-500/15 text-gray-500 hover:text-rose-400 transition-colors"
                                  title="Delete Transaction"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {summary.holdings.length === 0 && (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-gray-500 font-medium">
                              Your portfolio is empty. Add a holding transaction below to begin tracking.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Donut and Add Forms */}
                <div className="space-y-6">
                  {/* Allocation Chart */}
                  <div className="glass p-6 rounded-2xl">
                    <h3 className="font-bold text-white text-base mb-2">Asset Weight Allocation</h3>
                    <AllocationChart holdings={summary.holdings} />
                  </div>

                  {/* Add Holding Form */}
                  <div className="glass p-6 rounded-2xl">
                    <h3 className="font-bold text-white text-base mb-4 flex items-center space-x-2">
                      <Plus className="h-5 w-5 text-brand-400" />
                      <span>Record Transaction</span>
                    </h3>
                    
                    <form onSubmit={handleAddHolding} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Stock Ticker</label>
                        <input
                          type="text"
                          required
                          className="w-full bg-gray-900/60 border border-darkBorder rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-brand-500"
                          placeholder="AAPL"
                          value={symbol}
                          onChange={(e) => setSymbol(e.target.value)}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Shares Count</label>
                          <input
                            type="number"
                            required
                            step="any"
                            min="0.001"
                            className="w-full bg-gray-900/60 border border-darkBorder rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                            placeholder="10.0"
                            value={shares}
                            onChange={(e) => setShares(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Buy Price ($)</label>
                          <input
                            type="number"
                            required
                            step="any"
                            min="0.01"
                            className="w-full bg-gray-900/60 border border-darkBorder rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                            placeholder="175.25"
                            value={buyPrice}
                            onChange={(e) => setBuyPrice(e.target.value)}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-2.5 rounded-xl text-xs shadow transition-colors"
                      >
                        Add Transaction
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </Layout>
  );
}
