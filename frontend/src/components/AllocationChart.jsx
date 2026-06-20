import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#a855f7', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899'];

export default function AllocationChart({ holdings = [] }) {
  if (holdings.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900/10 border border-darkBorder rounded-2xl">
        <p className="text-gray-500 text-sm font-medium">No assets to allocate.</p>
      </div>
    );
  }

  // Aggregate holdings by symbol
  const data = holdings.map(item => ({
    name: item.symbol,
    value: item.market_value
  }));

  const totalValue = data.reduce((acc, curr) => acc + curr.value, 0);

  const formatTooltip = (value) => {
    const pct = ((value / totalValue) * 100).toFixed(1);
    return [`$${value.toLocaleString()} (${pct}%)`, 'Allocation'];
  };

  return (
    <div className="h-64 w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(11, 15, 25, 0.6)" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              background: 'rgba(17, 24, 39, 0.85)', 
              borderColor: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: '12px',
              backdropFilter: 'blur(8px)',
              color: '#fff'
            }}
            formatter={formatTooltip}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconSize={8}
            iconType="circle"
            wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
