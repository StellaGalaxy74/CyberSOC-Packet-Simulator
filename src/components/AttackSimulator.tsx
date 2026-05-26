import React, { useState } from 'react';
import { Target, Skull, Activity, ShieldAlert, Crosshair, PlaySquare } from 'lucide-react';
import { Packet } from '../types';

interface AttackSimulatorProps {
  onSimulateAttack: (type: Packet['threatType'], targetIp: string, intensity: number) => void;
}

export const AttackSimulator: React.FC<AttackSimulatorProps> = ({ onSimulateAttack }) => {
  const [intensity, setIntensity] = useState(5);
  const [targetIp, setTargetIp] = useState('192.168.1.100');

  const attackTypes = [
     { id: 'DDoS Attempt', name: 'SYN Flood / DDoS', icon: <Activity size={16} className="text-red-500" /> },
     { id: 'Port Scan', name: 'Stealth Port Scan', icon: <Target size={16} className="text-yellow-500" /> },
     { id: 'Brute Force', name: 'SSH Brute Force', icon: <Crosshair size={16} className="text-orange-500" /> },
     { id: 'Malware Signature', name: 'Malware Exfiltration', icon: <Skull size={16} className="text-fuchsia-500" /> },
     { id: 'DNS Poisoning', name: 'DNS Cache Poisoning', icon: <ShieldAlert size={16} className="text-purple-500" /> },
  ];

  return (
    <div className="glass-panel p-4 rounded-lg flex flex-col border border-red-900/40 bg-red-950/10 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-transparent"></div>
      
      <h3 className="text-xs uppercase tracking-wider font-bold text-red-500 mb-4 flex items-center">
         <Skull size={14} className="mr-2" /> Live Attack Simulator
      </h3>

      <div className="space-y-4">
        <div>
           <label className="text-xs text-gray-400 font-mono block mb-1">Target IP</label>
           <input 
              type="text" 
              value={targetIp}
              onChange={(e) => setTargetIp(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded px-3 py-1.5 text-sm font-mono text-gray-300 focus:outline-none focus:border-red-500 transition-colors"
           />
        </div>

        <div>
           <label className="text-xs text-gray-400 font-mono flex justify-between mb-1">
              <span>Attack Intensity</span>
              <span className="text-red-400">T-{intensity}</span>
           </label>
           <input 
              type="range" 
              min="1" max="10" 
              value={intensity}
              onChange={(e) => setIntensity(parseInt(e.target.value))}
              className="w-full accent-red-500 cursor-pointer"
           />
        </div>

        <div className="grid grid-cols-1 gap-2 pt-2">
            {attackTypes.map((attack) => (
               <button 
                  key={attack.id}
                  onClick={() => onSimulateAttack(attack.id as any, targetIp, intensity)}
                  className="flex items-center justify-between px-3 py-2 bg-gray-900/50 hover:bg-gray-800 hover:border-red-900/50 border border-gray-800 rounded transition-all group"
               >
                   <div className="flex items-center text-sm text-gray-300 group-hover:text-white transition-colors">
                      <span className="mr-3 p-1.5 rounded bg-gray-950/50 group-hover:bg-gray-900">
                         {attack.icon}
                      </span>
                      {attack.name}
                   </div>
                   <PlaySquare size={14} className="text-gray-600 group-hover:text-red-400" />
               </button>
            ))}
        </div>
        
        <div className="mt-2 p-3 bg-red-950/30 border border-red-900/50 rounded flex items-start space-x-2">
           <ShieldAlert size={14} className="text-red-500 shrink-0 mt-0.5" />
           <p className="text-[10px] text-red-300/80 uppercase tracking-widest font-mono leading-relaxed">
              Safe Sandbox Mode Active. Simulated packets only.
           </p>
        </div>
      </div>
    </div>
  );
};
