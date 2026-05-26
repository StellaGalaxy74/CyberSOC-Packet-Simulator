import React from 'react';
import { SystemStats } from '../types';
import { Activity, Radio, Shield, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface DashboardCardsProps {
  stats: SystemStats;
  historicData: any[]; // Data for the mini-chart
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({ stats, historicData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      
      {/* Total Packets Card */}
      <div className="glass-panel p-4 rounded-lg flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Activity size={64} className="text-cyan-500" />
        </div>
        <div className="flex items-center space-x-2 text-gray-400 mb-2">
          <Activity size={16} className="text-cyan-400" />
          <span className="text-xs uppercase tracking-wider font-semibold">Total Packets</span>
        </div>
        <div className="text-3xl font-bold font-mono text-gray-100 mt-2 z-10">
          {stats.totalPackets.toLocaleString()}
        </div>
      </div>

       {/* Active Connections */}
       <div className="glass-panel p-4 rounded-lg flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Radio size={64} className="text-emerald-500" />
        </div>
        <div className="flex items-center space-x-2 text-gray-400 mb-2">
          <Radio size={16} className="text-emerald-400" />
          <span className="text-xs uppercase tracking-wider font-semibold">Active Conns</span>
        </div>
        <div className="text-3xl font-bold font-mono text-gray-100 mt-2 z-10">
          {stats.activeConnections}
        </div>
      </div>

      {/* Bandwidth Chart */}
       <div className="glass-panel p-4 rounded-lg flex flex-col justify-between relative overflow-hidden">
         <div className="flex items-center space-x-2 text-gray-400 mb-2 z-10">
          <Zap size={16} className="text-fuchsia-400" />
          <span className="text-xs uppercase tracking-wider font-semibold">Bandwidth (LIVE)</span>
        </div>
        
        <div className="h-16 w-full -ml-2 -mb-4 mt-2 min-h-[64px] min-w-full">
           <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={64}>
            <AreaChart data={historicData}>
              <defs>
                <linearGradient id="colorBandwidth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e879f9" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#e879f9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="step" 
                dataKey="bandwidth" 
                stroke="#e879f9" 
                fillOpacity={1} 
                fill="url(#colorBandwidth)" 
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="absolute top-4 right-4 text-sm font-bold font-mono text-fuchsia-400 z-10">
          {stats.bandwidthUsage.toFixed(1)} Mbps
        </div>
      </div>

      {/* Threat Score */}
      <div className={cn(
          "glass-panel p-4 rounded-lg flex flex-col justify-between relative overflow-hidden transition-colors duration-500",
          stats.threatScore > 70 ? "bg-red-950/40 border-red-900/50" : stats.threatScore > 30 ? "bg-yellow-950/20 border-yellow-900/40" : ""
      )}>
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Shield size={64} className={stats.threatScore > 70 ? "text-red-500" : "text-gray-500"} />
        </div>
        <div className="flex items-center space-x-2 text-gray-400 mb-2 z-10">
          <Shield size={16} className={cn(
             stats.threatScore > 70 ? "text-red-400" : stats.threatScore > 30 ? "text-yellow-400" : "text-emerald-400"
          )} />
          <span className="text-xs uppercase tracking-wider font-semibold">Threat Level</span>
        </div>
        <div className="flex items-end space-x-2 z-10 mt-2">
            <span className={cn(
                "text-3xl font-bold font-mono",
                 stats.threatScore > 70 ? "text-red-400" : stats.threatScore > 30 ? "text-yellow-400" : "text-gray-100"
            )}>
                {stats.threatScore.toFixed(0)}
            </span>
            <span className="text-xs text-gray-500 mb-1">/ 100</span>
        </div>
      </div>

    </div>
  );
};
