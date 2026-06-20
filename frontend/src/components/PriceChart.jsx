import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PriceChart({ data, height = 300 }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center bg-gray-900/10 border border-darkBorder rounded-2xl" style={{ height }}>
        <p className="text-gray-500 text-sm">No historical data available.</p>
      </div>
    );
  }

  // Format YAxis ticks
  const formatYAxis = (tick) => {
    return `$${tick.toFixed(0)}`;
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.04)" />
          <XAxis 
            dataKey="date" 
            stroke="rgba(255, 255, 255, 0.3)" 
            fontSize={10}
            tickLine={false}
            axisLine={false}
            dy={8}
            minTickGap={30}
          />
          <YAxis 
            stroke="rgba(255, 255, 255, 0.3)" 
            fontSize={10} 
            tickLine={false}
            axisLine={false}
            tickFormatter={formatYAxis}
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ 
              background: 'rgba(17, 24, 39, 0.85)', 
              borderColor: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: '12px',
              backdropFilter: 'blur(8px)',
              color: '#fff'
            }}
            itemStyle={{ color: '#c4b5fd' }}
            labelStyle={{ color: '#9ca3af', fontWeight: 'bold' }}
            formatter={(value) => [`$${value.toFixed(2)}`, 'Close Price']}
          />
          <Area 
            type="monotone" 
            dataKey="close" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorPrice)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
