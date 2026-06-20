import React from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ForecastChart({ history = [], forecast = [], height = 350 }) {
  // Construct a single continuous dataset for charting
  // We take the last 30 days of history and append the predictions.
  const chartHistory = history.slice(-30).map(item => ({
    date: item.date,
    actual: item.close,
    forecast: null,
    lower: null,
    upper: null
  }));

  // Get the last item of history to connect the lines smoothly
  const lastHistoryItem = chartHistory[chartHistory.length - 1];
  
  const chartForecast = forecast.map((item, idx) => ({
    date: item.date,
    actual: null,
    // Connect the first forecast step to the last actual price
    forecast: item.predicted_price,
    lower: item.confidence_lower,
    upper: item.confidence_upper
  }));

  // Insert a transition node to bridge the gap between lines
  if (lastHistoryItem && chartForecast.length > 0) {
    chartForecast.unshift({
      date: lastHistoryItem.date,
      actual: null,
      forecast: lastHistoryItem.actual,
      lower: lastHistoryItem.actual,
      upper: lastHistoryItem.actual
    });
  }

  const chartData = [...chartHistory, ...chartForecast];

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <ComposedChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.04)" />
          <XAxis 
            dataKey="date" 
            stroke="rgba(255, 255, 255, 0.3)" 
            fontSize={10}
            tickLine={false}
            axisLine={false}
            dy={8}
            minTickGap={20}
          />
          <YAxis 
            stroke="rgba(255, 255, 255, 0.3)" 
            fontSize={10} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(tick) => `$${tick.toFixed(0)}`}
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ 
              background: 'rgba(17, 24, 39, 0.9)', 
              borderColor: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: '12px',
              backdropFilter: 'blur(8px)',
              color: '#fff'
            }}
            labelStyle={{ color: '#9ca3af', fontWeight: 'bold' }}
          />
          <Legend 
            verticalAlign="top" 
            height={36} 
            iconType="circle"
            wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }}
          />
          
          {/* Confidence interval area */}
          <Area 
            name="Confidence Range"
            dataKey="upper"
            rangeKey="lower"
            stroke="none"
            fill="rgba(139, 92, 246, 0.1)" 
            connectNulls
            legendType="none"
          />
          
          {/* Lower area bound just for tooltip display structure */}
          <Area 
            name="Lower Band"
            dataKey="lower"
            stroke="none"
            fill="none"
            legendType="none"
          />
          
          {/* Historical price line */}
          <Line 
            name="Historical Close"
            type="monotone" 
            dataKey="actual" 
            stroke="#8b5cf6" 
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5 }}
          />
          
          {/* Forecasted price line */}
          <Line 
            name="Forecasted Close"
            type="monotone" 
            dataKey="forecast" 
            stroke="#10b981" 
            strokeDasharray="4 4"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5 }}
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
