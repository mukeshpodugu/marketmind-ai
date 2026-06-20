import React from 'react';
import Layout from '../components/Layout';
import { User, Mail, Phone, MapPin, Award } from 'lucide-react';

export default function AboutUs() {
  return (
    <Layout title="About the Platform & Developer">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Intro */}
        <div className="glass p-8 rounded-3xl border border-darkBorder space-y-4">
          <h3 className="text-2xl font-black text-white tracking-wide">MarketMind AI</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            MarketMind AI is a production-grade financial analytics and stock price forecasting platform. Designed using a clean three-tier architecture (React + FastAPI + PyTorch/PostgreSQL), it implements six distinct machine learning algorithms (Linear Regression, Random Forests, XGBoost, and deep recurrent LSTM, GRU, and Bidirectional LSTM networks) along with FinBERT NLP news sentiment processing to compute forward stock price curves.
          </p>
        </div>

        {/* Developer Profile card */}
        <div className="glass p-8 rounded-3xl border border-darkBorder relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-brand-500/10 rounded-full filter blur-2xl" />
          
          <h3 className="text-lg font-bold text-white mb-6 flex items-center space-x-2">
            <Award className="h-5 w-5 text-brand-400" />
            <span>Developer Profile</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left Col Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-sm">
                <div className="h-9 w-9 rounded-xl bg-gray-900 flex items-center justify-center text-brand-400 border border-darkBorder">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-bold block uppercase leading-none mb-1">Developer Name</span>
                  <span className="text-white font-bold">PODUGU MUKESH</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-sm">
                <div className="h-9 w-9 rounded-xl bg-gray-900 flex items-center justify-center text-brand-400 border border-darkBorder">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-bold block uppercase leading-none mb-1">Email Contact</span>
                  <a href="mailto:mukeshpodugu123@gmail.com" className="text-brand-400 hover:underline font-bold">
                    mukeshpodugu123@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-sm">
                <div className="h-9 w-9 rounded-xl bg-gray-900 flex items-center justify-center text-brand-400 border border-darkBorder">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-bold block uppercase leading-none mb-1">Phone Number</span>
                  <span className="text-white font-bold">8143999463</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-sm">
                <div className="h-9 w-9 rounded-xl bg-gray-900 flex items-center justify-center text-brand-400 border border-darkBorder">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-bold block uppercase leading-none mb-1">Location</span>
                  <span className="text-white font-bold">Srikakulam</span>
                </div>
              </div>
            </div>

            {/* Right Col Academic Bio */}
            <div className="bg-gray-900/40 p-5 rounded-2xl border border-darkBorder text-left space-y-3 text-xs leading-relaxed text-gray-400">
              <h4 className="font-bold text-white text-xs mb-1">Technical Competencies</h4>
              <p>
                <b>Backend:</b> Python, FastAPI, SQLAlchemy, PostgreSQL, Redis, PyTorch, Scikit-Learn, XGBoost.
              </p>
              <p>
                <b>Frontend:</b> JavaScript, React, Tailwind CSS, Recharts, HTML5, CSS3.
              </p>
              <p>
                <b>DevOps:</b> Docker, Docker Compose, Microservices architecture, Automated Unit Testing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
