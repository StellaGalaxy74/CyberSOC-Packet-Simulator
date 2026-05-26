import React from 'react';
import { Packet } from '../types';
import { X, AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';

interface PacketDetailsProps {
  packet: Packet | null;
  onClose: () => void;
}

export const PacketDetails: React.FC<PacketDetailsProps> = ({ packet, onClose }) => {
  if (!packet) return null;

  return (
    <div className="absolute inset-y-0 right-0 w-96 bg-gray-900 border-l border-gray-800 flex flex-col shadow-2xl z-20">
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-950">
        <h3 className="font-semibold text-gray-200 flex items-center">
          <Info size={16} className="mr-2 text-cyan-400" />
          Packet Inspector
        </h3>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-6">
        
        {/* Threat Banner */}
        {packet.isSuspicious && (
           <div className="bg-red-950/50 border border-red-900/50 rounded-md p-3 flex flex-col space-y-2">
              <div className="flex items-start space-x-3">
                 <ShieldAlert size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
                 <div>
                   <h4 className="text-red-400 font-medium text-sm">Suspicious Activity Detected</h4>
                   <p className="text-red-300 text-xs mt-1">Signature matched: {packet.threatType}</p>
                 </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                 {packet.tags?.map(t => (
                    <span key={t} className="px-2 py-0.5 bg-red-900/40 text-red-200 text-[10px] rounded border border-red-500/30 uppercase tracking-widest">{t}</span>
                 ))}
                 {packet.reputationScore !== undefined && (
                    <span className="px-2 py-0.5 bg-orange-900/40 text-orange-200 text-[10px] rounded border border-orange-500/30 font-mono">REP SCORE: {packet.reputationScore}</span>
                 )}
              </div>
           </div>
        )}

        {/* General Overview */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Frame {packet.id}</h4>
          <div className="grid grid-cols-2 gap-2 text-sm terminal-text">
            <span className="text-gray-500">Capture Time:</span>
            <span className="text-gray-300 text-right">{new Date(packet.timestamp).toLocaleTimeString()}</span>
            
            <span className="text-gray-500">Protocols:</span>
            <span className="text-cyan-400 text-right font-bold">{packet.protocol}</span>
            
            <span className="text-gray-500">Length:</span>
            <span className="text-gray-300 text-right">{packet.size} bytes</span>
          </div>
        </div>

        {/* IP Layer */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 border-b border-gray-800 pb-1">Internet Protocol (IPv4)</h4>
          <div className="grid grid-cols-2 gap-2 text-xs terminal-text bg-gray-950/50 p-2 rounded border border-gray-800/50">
            <span className="text-gray-500">Source:</span>
            <span className="text-blue-300 text-right">{packet.sourceIp}</span>
            
            <span className="text-gray-500">Destination:</span>
            <span className="text-emerald-300 text-right">{packet.destinationIp}</span>
            
            <span className="text-gray-500">Geo Origin:</span>
            <span className="text-gray-400 text-right">{packet.location ? `${packet.location.city}, ${packet.location.country}` : 'Unknown'}</span>
            
            <span className="text-gray-500">Version:</span>
            <span className="text-gray-400 text-right">4</span>
          </div>
        </div>

        {/* Transport Layer */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 border-b border-gray-800 pb-1">Transport Layer</h4>
          <div className="grid grid-cols-2 gap-2 text-xs terminal-text bg-gray-950/50 p-2 rounded">
            <span className="text-gray-500">Source Port:</span>
            <span className="text-gray-300 text-right">{packet.sourcePort}</span>
            
            <span className="text-gray-500">Dest Port:</span>
            <span className="text-gray-300 text-right">{packet.destinationPort}</span>
          </div>
        </div>
        
         {/* Payload Preview */}
         <div className="space-y-2 flex-grow flex flex-col">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 border-b border-gray-800 pb-1">Raw Payload Breakdown</h4>
          <div className="bg-gray-950 rounded border border-gray-800 p-2 overflow-x-auto text-[10px] terminal-text leading-relaxed text-gray-400 flex-grow whitespace-pre-wrap font-mono break-all">
            {packet.payloadPreview}
            {' '}... [Truncated for preview]
          </div>
        </div>

      </div>
    </div>
  );
};
