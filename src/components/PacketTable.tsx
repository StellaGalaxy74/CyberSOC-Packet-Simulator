import React from 'react';
import { Packet } from '../types';
import { cn } from '../lib/utils';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

interface PacketTableProps {
  packets: Packet[];
  onRowClick: (packet: Packet) => void;
  selectedPacketId: string | null;
}

const getProtocolColor = (protocol: string) => {
  switch (protocol) {
    case 'TCP': return 'text-cyan-400';
    case 'UDP': return 'text-blue-400';
    case 'ICMP': return 'text-emerald-400';
    case 'HTTP': return 'text-fuchsia-400';
    case 'DNS': return 'text-yellow-400';
    default: return 'text-gray-400';
  }
};

export const PacketTable: React.FC<PacketTableProps> = ({ packets, onRowClick, selectedPacketId }) => {
  return (
    <div className="w-full flex-grow overflow-hidden flex flex-col h-full bg-gray-900/50 rounded-md border border-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="text-xs uppercase bg-gray-800/80 text-gray-400 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Time (ms)</th>
              <th scope="col" className="px-4 py-3 font-medium">Source</th>
              <th scope="col" className="px-4 py-3 font-medium">Destination</th>
              <th scope="col" className="px-4 py-3 font-medium">Protocol</th>
              <th scope="col" className="px-4 py-3 font-medium">Length</th>
              <th scope="col" className="px-4 py-3 font-medium">Info</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 terminal-text text-xs">
            {packets.map((packet) => (
              <tr 
                key={packet.id}
                onClick={() => onRowClick(packet)}
                className={cn(
                  "hover:bg-gray-800/50 cursor-pointer transition-colors",
                  selectedPacketId === packet.id ? "bg-gray-800/80 border-l-2 border-cyan-500" : "border-l-2 border-transparent",
                  packet.isSuspicious && selectedPacketId !== packet.id && "bg-red-950/20"
                )}
              >
                <td className="px-4 py-2 text-gray-500">{new Date(packet.timestamp).toISOString().split('T')[1].replace('Z', '')}</td>
                <td className="px-4 py-2 font-medium">{packet.sourceIp}:{packet.sourcePort}</td>
                <td className="px-4 py-2 font-medium">{packet.destinationIp}:{packet.destinationPort}</td>
                <td className={cn("px-4 py-2 font-bold", getProtocolColor(packet.protocol))}>{packet.protocol}</td>
                <td className="px-4 py-2 text-gray-400">{packet.size}</td>
                <td className="px-4 py-2 flex items-center space-x-2">
                  {packet.isSuspicious ? (
                     <span className="flex items-center text-red-400">
                        <ShieldAlert size={14} className="mr-1" />
                        {packet.threatType}
                     </span>
                  ) : (
                    <span className="text-gray-500 truncate w-48 block">{packet.payloadPreview.substring(0, 30)}...</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {packets.length === 0 && (
        <div className="flex-grow flex items-center justify-center flex-col text-gray-500 space-y-4">
          <ShieldCheck size={48} className="opacity-20" />
          <p>No packets captured. Start sniffing to see traffic.</p>
        </div>
      )}
    </div>
  );
};
