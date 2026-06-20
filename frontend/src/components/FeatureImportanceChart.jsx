import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function FeatureImportanceChart({ data = [] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-56 bg-gray-900/10 border border-darkBorder rounded-2xl">
        <p className="text-gray-500 text-sm">No XAI factors calculated.</p>
      </div>
    );
  }

  // Format dataset for Recharts: map feature to 'name' and importance to 'value'
  const chartData = data.map(item => ({
    name: item.feature,
    value: item.importance,
    impact: item.impact, // +1 for positive impact, -1 for negative impact
    description: item.description
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="glass p-3 rounded-xl max-w-xs text-xs space-y-1">
          <p className="font-bold text-white">{dataPoint.name}</p>
          <p className="text-gray-400">Relative Weight: <span className="text-brand-300 font-bold">{(dataPoint.value * 100).toFixed(0)}%</span></p>
          <p className="text-[11px] text-gray-300 italic leading-relaxed">{dataPoint.description}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
        >
          <XAxis 
            type="number" 
            stroke="rgba(255, 255, 255, 0.2)" 
            fontSize={9}
            tickLine={false}
            axisLine={false}
            domain={[0, 1]}
          />
          <YAxis 
            dataKey="name" 
            type="category" 
            stroke="rgba(255, 255, 255, 0.5)" 
            fontSize={9}
            tickLine={false}
            axisLine={false}
            width={90}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={14}>
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.impact > 0 ? '#10b981' : '#f43f5e'} 
                fillOpacity={0.7}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
