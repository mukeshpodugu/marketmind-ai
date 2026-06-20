import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, BrainCircuit, ShieldCheck, Cpu, ArrowRight, Github } from 'lucide-react';
import { settings } from '../../../backend/app/config'; // We will hardcode or fetch dynamically. Let's hardcode developer details to be safe.

export default function Home() {
  const navigate = useNavigate();
  const { registerGuest } = useAuth();

  const handleGuestEntry = () => {
    registerGuest();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-darkBg text-gray-100 flex flex-col justify-between overflow-x-hidden">
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto w-full px-6 py-5 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="bg-brand-600 p-2 rounded-xl text-white shadow-lg shadow-brand-500/25">
            <TrendingUp className="h-5 w-5" />
          </div>
          <span className="font-bold text-xl tracking-wide text-white">MarketMind AI</span>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/login')} 
            className="text-gray-300 hover:text-white text-sm font-semibold transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate('/register')} 
            className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-md shadow-brand-500/25 hover:shadow-brand-500/35"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20 flex-1 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
        <div className="space-y-8 text-left">
          <div className="inline-flex items-center space-x-2 bg-brand-500/10 border border-brand-500/20 px-4 py-1.5 rounded-full text-xs font-bold text-brand-400">
            <Cpu className="h-4 w-4 animate-spin" />
            <span>Next-Gen Machine Learning Forecasting</span>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Predict Markets with <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-violet-400 to-indigo-400">
              AI-Powered Precision
            </span>
          </h1>
          
          <p className="text-gray-400 text-lg leading-relaxed max-w-xl">
            Leverage six advanced machine learning models, including Deep Learning LSTMs, GRUs, and XGBoost, combined with FinBERT news sentiment intelligence to forecast stock price directions, manage watchlists, and build optimized portfolios.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => navigate('/register')}
              className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-4 rounded-2xl font-bold transition-all flex items-center justify-center space-x-2 group shadow-lg shadow-brand-500/20"
            >
              <span>Initialize Account</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={handleGuestEntry}
              className="glass hover:bg-gray-800/40 text-gray-200 px-8 py-4 rounded-2xl font-bold transition-all border border-darkBorder"
            >
              Explore as Guest User
            </button>
          </div>
        </div>

        {/* Hero Visual Card */}
        <div className="relative flex justify-center lg:justify-end">
          <div className="absolute -top-12 -left-12 h-64 w-64 bg-brand-500/10 rounded-full filter blur-3xl" />
          <div className="absolute -bottom-12 -right-12 h-64 w-64 bg-indigo-500/10 rounded-full filter blur-3xl" />
          
          <div className="glass p-8 rounded-3xl w-full max-w-lg border border-darkBorder shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-darkBorder pb-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Best Forecasting Model</h3>
                  <p className="text-xs text-gray-500">Auto-evaluating accuracies...</p>
                </div>
              </div>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-1 rounded-full font-bold">Bi-LSTM Winner</span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center bg-gray-900/40 p-3.5 rounded-xl border border-darkBorder">
                <span className="text-sm font-semibold text-gray-400">Next-Day AAPL Forecast</span>
                <span className="text-sm font-bold text-white">$182.40 (+2.4%)</span>
              </div>
              <div className="flex justify-between items-center bg-gray-900/40 p-3.5 rounded-xl border border-darkBorder">
                <span className="text-sm font-semibold text-gray-400">FinBERT News Sentiment</span>
                <span className="text-sm font-bold text-emerald-400">88.5% Positive Mood</span>
              </div>
              <div className="flex justify-between items-center bg-gray-900/40 p-3.5 rounded-xl border border-darkBorder">
                <span className="text-sm font-semibold text-gray-400">Model RMSE Accuracy</span>
                <span className="text-sm font-bold text-brand-300">98.42% Confidence</span>
              </div>
            </div>

            {/* Glowing borders */}
            <div className="absolute top-0 right-0 h-16 w-16 border-t-2 border-r-2 border-brand-500/40 rounded-tr-3xl" />
            <div className="absolute bottom-0 left-0 h-16 w-16 border-b-2 border-l-2 border-brand-500/40 rounded-bl-3xl" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-darkBorder py-8 bg-gray-950/40 z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 space-y-4 md:space-y-0">
          <div>
            <p className="font-semibold text-gray-400">MarketMind AI – Intelligent Stock Prediction & Financial Analytics</p>
            <p className="mt-1">Developed by PODUGU MUKESH | Srikakulam</p>
          </div>
          <div className="flex items-center space-x-6">
            <span>Email: <a href="mailto:mukeshpodugu123@gmail.com" className="text-brand-400 hover:underline">mukeshpodugu123@gmail.com</a></span>
            <span>Phone: <span className="text-gray-400">8143999463</span></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
