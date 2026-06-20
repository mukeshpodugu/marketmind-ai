import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Mail, Phone, MapPin, CheckCircle, HelpCircle } from 'lucide-react';

export default function ContactSupport() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate support ticket submissions
    setSuccess(true);
    setSubject('');
    setMessage('');
    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <Layout title="Help & Support Desk">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* Support details */}
        <div className="lg:col-span-1 glass p-6 rounded-2xl h-fit space-y-6">
          <h3 className="font-bold text-white text-base flex items-center space-x-2 border-b border-darkBorder pb-3">
            <HelpCircle className="h-5 w-5 text-brand-400" />
            <span>Support Coordinates</span>
          </h3>

          <p className="text-gray-400 text-xs leading-relaxed">
            Have questions regarding forecast model configurations, indicator settings, or portfolio integrations? Get in touch directly:
          </p>

          <div className="space-y-4 text-xs">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-brand-400" />
              <div>
                <span className="text-[10px] text-gray-500 block leading-none mb-0.5">Direct Email</span>
                <a href="mailto:mukeshpodugu123@gmail.com" className="text-white hover:text-brand-400 hover:underline font-bold">
                  mukeshpodugu123@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-brand-400" />
              <div>
                <span className="text-[10px] text-gray-500 block leading-none mb-0.5">Phone Line</span>
                <span className="text-white font-bold">8143999463</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <MapPin className="h-4 w-4 text-brand-400" />
              <div>
                <span className="text-[10px] text-gray-500 block leading-none mb-0.5">Location</span>
                <span className="text-white font-bold">Srikakulam</span>
              </div>
            </div>
          </div>
        </div>

        {/* Support ticket form */}
        <div className="lg:col-span-2 glass p-6 rounded-2xl">
          <h3 className="font-bold text-white text-base mb-4">Submit Help Ticket</h3>

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs font-semibold flex items-center space-x-2 mb-4">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>Ticket submitted successfully! Analyst Podugu Mukesh will reply to your registered email soon.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Subject</label>
              <input
                type="text"
                required
                className="w-full bg-gray-900/60 border border-darkBorder rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                placeholder="Model training connection failed..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Description / Message</label>
              <textarea
                required
                rows={5}
                className="w-full bg-gray-900/60 border border-darkBorder rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                placeholder="Provide detailed description of the error..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="bg-brand-600 hover:bg-brand-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow transition-colors"
            >
              Submit Ticket
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
