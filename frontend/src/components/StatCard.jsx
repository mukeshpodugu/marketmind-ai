import React from 'react';

export default function StatCard({ title, value, change, changeType, icon: Icon, description }) {
  const isPositive = changeType === 'positive';
  const isNegative = changeType === 'negative';
  
  return (
    <div className="glass glass-hover p-6 rounded-2xl flex flex-col justify-between h-36">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-400">{title}</span>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-brand-600/10 border border-brand-500/20 text-brand-400">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      
      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
        {change && (
          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
            isPositive 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' 
              : isNegative 
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/10' 
                : 'bg-gray-800 text-gray-400'
          }`}>
            {isPositive ? '+' : ''}{change}
          </span>
        )}
      </div>
      
      {description && (
        <span className="text-[11px] text-gray-500 mt-2 truncate">{description}</span>
      )}
    </div>
  );
}
