import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  LineChart, Wallet, Heart, TrendingUp, AlertCircle,
  ArrowUpRight, ArrowDownRight, Newspaper
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [moodData, setMoodData] = useState(null);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [portfolioVal, setPortfolioVal] = useState('$0.00');
  const [portChange, setPortChange] = useState('');
  const [portChangeType, setPortChangeType] = useState('none');
  const [loading, setLoading] = useState(true);

  // Popular stock prices display
  const [tickers, setTickers] = useState([
    { symbol: 'AAPL', price: 175.20, change: 1.45, changePct: 0.83 },
    { symbol: 'MSFT', price: 415.50, change: -2.30, changePct: -0.55 },
    { symbol: 'NVDA', price: 852.10, change: 14.80, changePct: 1.77 },
    { symbol: 'TSLA', price: 181.15, change: -4.20, changePct: -2.27 },
  ]);

  const sectors = [
    { name: 'Technology', perf: 1.85, status: 'positive' },
    { name: 'Financials', perf: 0.42, status: 'positive' },
    { name: 'Healthcare', perf: -0.15, status: 'negative' },
    { name: 'Energy', perf: 1.10, status: 'positive' },
    { name: 'Consumer Discretionary', perf: -0.65, status: 'negative' },
  ];

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // 1. Fetch general sentiment
        const sentimentRes = await api.getSentiment('GENERAL');
        setMoodData(sentimentRes);

        // 2. Fetch watchlists if registered user
        if (user && user.role !== 'guest') {
          const wl = await api.getWatchlist();
          setWatchlistCount(wl.length);

          const port = await api.getPortfolios();
          if (port.length > 0) {
            const summary = await api.getPortfolioSummary(port[0].id);
            setPortfolioVal(`$${summary.total_value.toLocaleString()}`);
            if (summary.total_gain_loss !== 0) {
              setPortChange(`${summary.total_gain_loss_percent.toFixed(1)}%`);
              setPortChangeType(summary.total_gain_loss >= 0 ? 'positive' : 'negative');
            }
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [user]);

  return (
    <Layout title="Market Overview Dashboard">
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1,2,3,4].map(i => <div key={i} className="h-36 glass shimmer-loader rounded-2xl" />)}
        </div>
      ) : (
        <>
          {/* Main KPI Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Portfolio Valuation" 
              value={portfolioVal} 
              change={portChange}
              changeType={portChangeType}
              icon={Wallet} 
              description={user?.role === 'guest' ? 'Unlock portfolio tracking by creating an account' : 'Aggregate value of holdings'}
            />
            <StatCard 
              title="Market Mood Index" 
              value={moodData ? `${moodData.mood_index}/100` : '50/100'} 
              change={moodData ? moodData.sentiment_label : 'Neutral'}
              changeType={moodData?.sentiment_label === 'Greed' ? 'positive' : (moodData?.sentiment_label === 'Fear' ? 'negative' : 'none')}
              icon={LineChart} 
              description="Aggregated NLP text news sentiment index"
            />
            <StatCard 
              title="Watchlist Favorites" 
              value={watchlistCount.toString()} 
              change={watchlistCount > 0 ? 'Active Monitoring' : 'No Assets'}
              changeType={watchlistCount > 0 ? 'positive' : 'none'}
              icon={Heart} 
              description={user?.role === 'guest' ? 'Sign up to build personal watchlists' : 'Symbols tracked on your profile'}
            />
            <StatCard 
              title="Predictive Confidence" 
              value="94.6%" 
              change="Stable"
              changeType="positive"
              icon={TrendingUp} 
              description="Overall historical directional success score"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left side: Tickers & Sectors */}
            <div className="lg:col-span-2 space-y-8">
              {/* Popular Ticker Grid */}
              <div className="glass p-6 rounded-2xl">
                <h3 className="text-base font-bold text-white mb-4">Popular Market Tickers</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tickers.map((t) => {
                    const isPos = t.change >= 0;
                    return (
                      <div key={t.symbol} className="bg-gray-900/40 p-4 rounded-xl border border-darkBorder flex justify-between items-center">
                        <div>
                          <span className="font-bold text-white block">{t.symbol}</span>
                          <span className="text-xs text-gray-500">Global Equities</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-white block">${t.price.toFixed(2)}</span>
                          <span className={`inline-flex items-center text-xs font-semibold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isPos ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                            {t.changePct.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sector Performance Board */}
              <div className="glass p-6 rounded-2xl">
                <h3 className="text-base font-bold text-white mb-4">Sector Heat Performance</h3>
                <div className="space-y-3">
                  {sectors.map((sec) => (
                    <div key={sec.name} className="flex justify-between items-center py-2.5 border-b border-darkBorder/40 last:border-0">
                      <span className="text-sm text-gray-300 font-medium">{sec.name}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        sec.status === 'positive' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {sec.status === 'positive' ? '+' : ''}{sec.perf.toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side: News sentiment intelligence */}
            <div className="space-y-8">
              <div className="glass p-6 rounded-2xl flex flex-col h-full">
                <div className="flex items-center space-x-2 border-b border-darkBorder pb-4 mb-4">
                  <Newspaper className="h-5 w-5 text-brand-400" />
                  <h3 className="font-bold text-white text-base">News Intelligence</h3>
                </div>

                <div className="space-y-4 overflow-y-auto max-h-[360px] pr-1">
                  {moodData?.recent_news.map((item) => (
                    <div key={item.id} className="p-3 bg-gray-900/30 border border-darkBorder rounded-xl space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] text-gray-500 uppercase font-bold">{item.source || 'Finance News'}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-extrabold ${
                          item.sentiment_label === 'positive' ? 'bg-emerald-500/10 text-emerald-400' : (item.sentiment_label === 'negative' ? 'bg-rose-500/10 text-rose-400' : 'bg-gray-800 text-gray-400')
                        }`}>
                          {item.sentiment_label}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-gray-200 hover:text-white leading-snug cursor-pointer">{item.title}</h4>
                      <p className="text-[10px] text-gray-500 leading-relaxed truncate">{item.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
