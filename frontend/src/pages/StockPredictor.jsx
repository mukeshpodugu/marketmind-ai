import React, { useState } from 'react';
import Layout from '../components/Layout';
import ForecastChart from '../components/ForecastChart';
import FeatureImportanceChart from '../components/FeatureImportanceChart';
import SentimentChart from '../components/SentimentChart';
import { api } from '../services/api';
import { Search, BrainCircuit, ShieldAlert, Award, FileText, ChevronRight } from 'lucide-react';

export default function StockPredictor() {
  const [symbol, setSymbol] = useState('AAPL');
  const [searchVal, setSearchVal] = useState('AAPL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stockDetail, setStockDetail] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [horizon, setHorizon] = useState('day'); // day, week, month, quarter

  const handlePredict = async (e) => {
    if (e) e.preventDefault();
    if (!searchVal) return;
    
    setLoading(true);
    setError('');
    
    try {
      const sym = searchVal.toUpperCase();
      setSymbol(sym);

      // 1. Fetch stock details (historical close price)
      const detail = await api.getStockDetail(sym, 180);
      setStockDetail(detail);

      // 2. Fetch ML predictions
      const pred = await api.predictStock(sym);
      setPredictions(pred);

      // 3. Fetch sentiment
      const sent = await api.getSentiment(sym);
      setSentiment(sent);
    } catch (err) {
      setError(err.message || 'Prediction failed. Verify symbol and check backend logs.');
    } finally {
      setLoading(false);
    }
  };

  // Run on startup
  React.useEffect(() => {
    handlePredict();
  }, []);

  return (
    <Layout title="Predictive AI Model Lab">
      {/* Search form */}
      <form onSubmit={handlePredict} className="flex space-x-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
          <input
            type="text"
            required
            className="w-full bg-gray-900/60 border border-darkBorder rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
            placeholder="Search stock ticker (e.g. AAPL, TSLA, NVDA, AMD, BTC-USD)"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-600 hover:bg-brand-500 text-white px-8 rounded-2xl text-sm font-bold shadow-md shadow-brand-500/20 hover:shadow-brand-500/30 flex items-center space-x-2 shrink-0 transition-colors"
        >
          <BrainCircuit className="h-5 w-5" />
          <span>{loading ? 'Running AI Models...' : 'Run Forecast Models'}</span>
        </button>
      </form>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl mb-8 flex items-center space-x-3 text-sm">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-8 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-28 glass rounded-2xl" />
            <div className="h-28 glass rounded-2xl" />
            <div className="h-28 glass rounded-2xl" />
          </div>
          <div className="h-96 glass rounded-2xl" />
        </div>
      ) : (
        predictions && stockDetail && (
          <div className="space-y-8">
            {/* Top overview metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="glass p-5 rounded-2xl">
                <span className="text-xs font-bold text-gray-500 uppercase">Ticker Profile</span>
                <h4 className="text-xl font-bold text-white mt-2">{symbol}</h4>
                <p className="text-xs text-gray-400 mt-1">{stockDetail.name}</p>
              </div>

              <div className="glass p-5 rounded-2xl">
                <span className="text-xs font-bold text-gray-500 uppercase">Optimal Model Selected</span>
                <div className="flex items-center space-x-2 mt-2">
                  <Award className="h-5 w-5 text-brand-400" />
                  <h4 className="text-lg font-bold text-white capitalize">{predictions.best_model}</h4>
                </div>
                <p className="text-xs text-gray-400 mt-1">Based on lowest validation RMSE</p>
              </div>

              <div className="glass p-5 rounded-2xl">
                <span className="text-xs font-bold text-gray-500 uppercase">Confidence Level</span>
                <h4 className="text-xl font-bold text-white mt-2">{(predictions.confidence_score * 100).toFixed(0)}%</h4>
                <p className="text-xs text-gray-400 mt-1">Forecast directional safety score</p>
              </div>

              <div className="glass p-5 rounded-2xl">
                <span className="text-xs font-bold text-gray-500 uppercase">Investment Risk Class</span>
                <h4 className={`text-xl font-bold mt-2 ${
                  predictions.risk_category === 'Low' ? 'text-emerald-400' : (predictions.risk_category === 'Medium' ? 'text-amber-400' : 'text-rose-400')
                }`}>{predictions.risk_category}</h4>
                <p className="text-xs text-gray-400 mt-1">Risk Rating: {predictions.risk_score}/10</p>
              </div>
            </div>

            {/* Prediction Graph & Horisons */}
            <div className="glass p-6 rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-darkBorder pb-4 mb-6">
                <div>
                  <h3 className="font-bold text-white text-base">Forecast Price Path</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Dashed line displays estimated trajectory</p>
                </div>
                
                {/* Horizon selectors */}
                <div className="flex bg-gray-900/60 p-1 border border-darkBorder rounded-xl mt-3 sm:mt-0 text-xs">
                  {['day', 'week', 'month', 'quarter'].map((hz) => (
                    <button
                      key={hz}
                      onClick={() => setHorizon(hz)}
                      className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-colors ${
                        horizon === hz ? 'bg-brand-600 text-white shadow' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {hz === 'day' ? 'Next Day' : (hz === 'week' ? '1 Week' : (hz === 'month' ? '1 Month' : '1 Quarter'))}
                    </button>
                  ))}
                </div>
              </div>

              <ForecastChart 
                history={stockDetail.history} 
                forecast={predictions.predictions[horizon]} 
              />
            </div>

            {/* Model evaluations table & explainable AI factors */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Models Comparison Table */}
              <div className="lg:col-span-2 glass p-6 rounded-2xl">
                <h3 className="font-bold text-white text-base mb-4">API Model Performance comparison</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-darkBorder text-gray-400 font-semibold">
                        <th className="pb-3">Model Type</th>
                        <th className="pb-3 text-right">RMSE (Error)</th>
                        <th className="pb-3 text-right">MAE</th>
                        <th className="pb-3 text-right">MAPE</th>
                        <th className="pb-3 text-right">R² (Fit)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-darkBorder/40">
                      {Object.keys(predictions.metrics).map((mKey) => {
                        const mVal = predictions.metrics[mKey];
                        const isBest = predictions.best_model === mKey;
                        return (
                          <tr key={mKey} className={`hover:bg-gray-800/10 ${isBest ? 'bg-brand-600/5 font-semibold text-white' : 'text-gray-300'}`}>
                            <td className="py-3 flex items-center space-x-2">
                              <span className="capitalize">{mKey}</span>
                              {isBest && (
                                <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase">Winner</span>
                              )}
                            </td>
                            <td className="py-3 text-right">{mVal.rmse.toFixed(3)}</td>
                            <td className="py-3 text-right">{mVal.mae.toFixed(3)}</td>
                            <td className="py-3 text-right">{mVal.mape.toFixed(2)}%</td>
                            <td className="py-3 text-right">{mVal.r2.toFixed(3)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Explainable AI Factors */}
              <div className="glass p-6 rounded-2xl">
                <h3 className="font-bold text-white text-base mb-4">Explainable AI Drivers</h3>
                <FeatureImportanceChart data={predictions.explainable_factors} />
              </div>
            </div>

            {/* Sentiment breakdown & detailed explanations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Sentiment Chart */}
              <div className="glass p-6 rounded-2xl">
                <h3 className="font-bold text-white text-base mb-4">News Sentiment Composition</h3>
                {sentiment && (
                  <SentimentChart 
                    positive={sentiment.positive_count} 
                    negative={sentiment.negative_count} 
                    neutral={sentiment.neutral_count} 
                  />
                )}
              </div>

              {/* Technical Drivers Text Summary */}
              <div className="glass p-6 rounded-2xl flex flex-col justify-between">
                <h3 className="font-bold text-white text-base mb-4 flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-brand-400" />
                  <span>Factor Interpretations</span>
                </h3>
                
                <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
                  {predictions.explainable_factors.map((f, i) => (
                    <div key={i} className="text-xs space-y-1 py-1.5 border-b border-darkBorder/40 last:border-0">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-gray-300">{f.feature}</span>
                        <span className={f.impact > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {f.impact > 0 ? 'Bullish Influence' : 'Bearish Influence'}
                        </span>
                      </div>
                      <p className="text-gray-500 leading-relaxed text-[11px]">{f.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </Layout>
  );
}
