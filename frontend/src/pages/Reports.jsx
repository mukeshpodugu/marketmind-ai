import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FileText, Download, ShieldAlert, FileSpreadsheet, CheckCircle } from 'lucide-react';

export default function Reports() {
  const { user } = useAuth();
  const [symbol, setSymbol] = useState('AAPL');
  const [format, setFormat] = useState('pdf');
  const [loading, setLoading] = useState(false);
  const [reportsList, setReportsList] = useState([]);

  const loadReportsHistory = async () => {
    if (user?.role === 'guest') return;
    try {
      const data = await api.getReportsList();
      setReportsList(data);
    } catch (err) {
      console.error('Failed to load reports log:', err);
    }
  };

  useEffect(() => {
    loadReportsHistory();
  }, [user]);

  const handleDownload = async (e) => {
    e.preventDefault();
    if (!symbol) return;

    setLoading(true);
    try {
      // Trigger native browser download by redirecting to the download URL
      const url = api.getReportDownloadUrl(symbol.toUpperCase(), format);
      
      // Delay slightly to simulate generation in the UI
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      window.open(url, '_blank');
      
      // Reload download log history
      loadReportsHistory();
    } catch (err) {
      console.error('Download trigger failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role === 'guest') {
    return (
      <Layout title="AI Document Exporter">
        <div className="glass p-8 rounded-3xl max-w-lg mx-auto text-center space-y-6 my-12 border border-darkBorder">
          <ShieldAlert className="h-12 w-12 text-brand-400 mx-auto" />
          <h3 className="text-xl font-bold text-white">Unlock Document Exporter</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Registered accounts can download comprehensive stock analysis reports containing predictive forecasts, technical indicators, and news sentiments in PDF/Excel format.
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
    <Layout title="AI Document Exporter">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Generator Form */}
        <div className="lg:col-span-1 glass p-6 rounded-2xl h-fit">
          <h3 className="font-bold text-white text-base mb-4 flex items-center space-x-2">
            <FileText className="h-5 w-5 text-brand-400" />
            <span>Generate Document</span>
          </h3>
          
          <form onSubmit={handleDownload} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Stock Symbol</label>
              <input
                type="text"
                required
                className="w-full bg-gray-900/60 border border-darkBorder rounded-xl px-4 py-3 text-xs text-white uppercase focus:outline-none focus:border-brand-500"
                placeholder="AAPL"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Export Format</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormat('pdf')}
                  className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all ${
                    format === 'pdf' 
                      ? 'bg-brand-600/10 border-brand-500 text-brand-300' 
                      : 'bg-gray-900/40 border-darkBorder text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <FileText className="h-6 w-6 mb-2" />
                  <span className="text-xs font-semibold">PDF Brief</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('excel')}
                  className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all ${
                    format === 'excel' 
                      ? 'bg-brand-600/10 border-brand-500 text-brand-300' 
                      : 'bg-gray-900/40 border-darkBorder text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <FileSpreadsheet className="h-6 w-6 mb-2" />
                  <span className="text-xs font-semibold">Excel Sheet</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl text-xs shadow flex items-center justify-center space-x-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>{loading ? 'Compiling Report...' : 'Compile and Download'}</span>
            </button>
          </form>
        </div>

        {/* Generated Reports Log */}
        <div className="lg:col-span-2 glass p-6 rounded-2xl">
          <h3 className="font-bold text-white text-base mb-4 flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-brand-400" />
            <span>Document Generation History</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-darkBorder text-gray-400 font-semibold">
                  <th className="pb-3">Document Title</th>
                  <th className="pb-3">Format Type</th>
                  <th className="pb-3">Compilation Timestamp</th>
                  <th className="pb-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-darkBorder/40 text-gray-300">
                {reportsList.map((rep) => (
                  <tr key={rep.id} className="hover:bg-gray-800/10">
                    <td className="py-3.5 font-bold text-white">{rep.name}</td>
                    <td className="py-3.5 uppercase">{rep.file_type}</td>
                    <td className="py-3.5 text-gray-400">{new Date(rep.created_at).toLocaleString()}</td>
                    <td className="py-3.5 text-center">
                      <span className="bg-emerald-500/15 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold">Generated</span>
                    </td>
                  </tr>
                ))}
                {reportsList.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-gray-500 font-medium">
                      No reports generated yet on this profile.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
