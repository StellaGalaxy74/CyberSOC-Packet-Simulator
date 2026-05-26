import React from 'react';
import { SystemStats } from '../types';
import { cn } from '../lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface CyberScoreProps {
  score: number;
  grade: string;
}

export const CyberScore: React.FC<CyberScoreProps> = ({ score, grade }) => {
  const getGradeColor = (g: string) => {
    switch (g) {
      case 'A': return '#10b981'; // Emerald
      case 'B': return '#84cc16'; // Lime
      case 'C': return '#eab308'; // Yellow
      case 'D': return '#f97316'; // Orange
      case 'F': return '#ef4444'; // Red
      default: return '#374151'; // Gray
    }
  };

  const invertedScore = 100 - score; // If threat score is 20, health is 80
  const color = getGradeColor(grade);
  
  const data = [
    { name: 'Health', value: invertedScore },
    { name: 'Risk', value: score },
  ];

  return (
    <div className="glass-panel p-3 rounded-lg flex flex-col items-center justify-center relative overflow-hidden border border-gray-800 h-full">
       <h3 className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 mb-1 w-full text-left absolute top-2 left-3 z-10">
          Security Posture
       </h3>
       
       <div className="relative w-full h-full flex items-center justify-center pt-4">
         {/* Holographic glowing rings */}
         <div className="absolute inset-4 border border-cyan-500/10 rounded-full animate-spin-slow"></div>
         <div className="absolute inset-6 border border-cyan-500/20 rounded-full animate-spin-reverse-slow"></div>
         
         <ResponsiveContainer width={120} height={120}>
           <PieChart>
             <Pie
               data={data}
               cx="50%"
               cy="60%"
               startAngle={180}
               endAngle={0}
               innerRadius={35}
               outerRadius={45}
               paddingAngle={2}
               dataKey="value"
               stroke="none"
               isAnimationActive={false}
             >
               <Cell key="health" fill={color} />
               <Cell key="risk" fill="#1f2937" />
             </Pie>
           </PieChart>
         </ResponsiveContainer>
         
         <div className="absolute flex flex-col items-center justify-center pointer-events-none mt-2">
            <span className="text-2xl font-bold font-mono tracking-tight" style={{ color }}>{grade}</span>
            <span className="text-[9px] text-gray-500 uppercase tracking-widest">{invertedScore.toFixed(0)}%</span>
         </div>
       </div>
    </div>
  );
};
