import React from 'react';
import { SystemStats } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ProtocolChartProps {
  stats: SystemStats;
}

const COLORS = {
  'TCP': '#22d3ee', // Cyan 400
  'UDP': '#60a5fa', // Blue 400
  'ICMP': '#34d399', // Emerald 400
  'HTTP': '#e879f9', // Fuchsia 400
  'DNS': '#facc15'  // Yellow 400
};

export const ProtocolChart: React.FC<ProtocolChartProps> = ({ stats }) => {
  const data = Object.entries(stats.protocolCounts)
    .map(([name, value]) => ({ name, value }))
    .filter(item => item.value > 0);

  return (
    <div className="glass-panel p-4 rounded-lg flex flex-col h-64 min-h-[256px]">
      <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-4">Protocol Distribution</h3>
      <div className="flex-grow w-full h-full min-h-[0]">
        <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#9ca3af'} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#f3f4f6' }}
              itemStyle={{ color: '#f3f4f6' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
