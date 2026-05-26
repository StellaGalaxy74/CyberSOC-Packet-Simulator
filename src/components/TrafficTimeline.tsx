import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface TrafficTimelineProps {
  data: any[];
}

export const TrafficTimeline: React.FC<TrafficTimelineProps> = ({ data }) => {
  return (
    <div className="glass-panel p-4 rounded-lg flex flex-col h-64 min-h-[256px]">
      <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-4">Traffic Timeline (Packets/s)</h3>
      <div className="flex-grow flex items-center justify-center w-full h-full min-h-[0]">
            {data.length < 2 ? (
                <div className="text-gray-500 text-sm">Gathering timeline data...</div>
            ) : (
                <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                <AreaChart data={data}>
                    <defs>
                    <linearGradient id="colorPackets" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                    </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis 
                        dataKey="time" 
                        stroke="#4b5563" 
                        fontSize={10} 
                        tickMargin={10}
                        tickFormatter={(value) => value.split(':')[2]} // Just show seconds
                    />
                    <YAxis 
                        stroke="#4b5563" 
                        fontSize={10}
                        tickFormatter={(value) => Math.round(value).toString()}
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#f3f4f6', fontSize: '12px' }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="packets" 
                        stroke="#06b6d4" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorPackets)" 
                        isAnimationActive={false}
                    />
                </AreaChart>
                </ResponsiveContainer>
            )}
      </div>
    </div>
  );
};
