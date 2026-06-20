import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export default function SentimentChart({ positive = 0, negative = 0, neutral = 0 }) {
  const data = [
    { name: 'Positive', value: positive, color: '#10b981' }, // Emerald
    { name: 'Neutral', value: neutral, color: '#6b7280' },   // Gray
    { name: 'Negative', value: negative, color: '#f43f5e' }  // Rose
  ].filter(item => item.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-900/10 border border-darkBorder rounded-2xl">
        <p className="text-gray-500 text-sm">No sentiment metrics to chart.</p>
      </div>
    );
  }

  const total = positive + negative + neutral;

  return (
    <div className="h-48 w-full flex items-center justify-between">
      <div className="w-1/2 h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={60}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(11, 15, 25, 0.6)" strokeWidth={1} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(17, 24, 39, 0.85)', 
                borderColor: 'rgba(255, 255, 255, 0.1)', 
                borderRadius: '12px',
                color: '#fff'
              }}
              formatter={(value) => [`${value} articles (${((value / total) * 100).toFixed(0)}%)`, 'Volume']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend list */}
      <div className="w-1/2 pl-4 space-y-2">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <span className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-gray-400 font-medium">{item.name}</span>
            </span>
            <span className="font-bold text-white">
              {item.value} ({((item.value / total) * 100).toFixed(0)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
