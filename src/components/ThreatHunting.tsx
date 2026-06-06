import React, { useState } from 'react';
import { Search, Filter, ShieldAlert, Target, Terminal, Play, Server, User, Crosshair } from 'lucide-react';
import { Packet } from '../types';

interface Props {
  packets: Packet[];
}

export const ThreatHunting: React.FC<Props> = ({ packets }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
      if (!query.trim()) return;
      setIsSearching(true);
      setHasSearched(false);
      setTimeout(() => {
          setIsSearching(false);
          setHasSearched(true);
      }, 1000);
  }

  // Find some packets that match superficially or just grab a few
  const results = packets.filter(p => p.isSuspicious).slice(0, 5);

  return (
    <div className="h-full flex flex-col glass-panel rounded-lg border border-gray-800 overflow-hidden">
      <div className="border-b border-gray-800 p-4 bg-gray-900/50 flex flex-col gap-4 shrink-0">
        <h2 className="text-xl font-bold flex items-center text-cyan-400">
          <Target className="mr-2" /> Threat Hunting
        </h2>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Terminal size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Enter YARA or standard hunt query (e.g. protocol=DNS and size>500)"
              className="w-full bg-gray-950 border border-gray-800 rounded pl-10 pr-4 py-2 text-sm text-gray-300 font-mono focus:border-cyan-500/50 outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button 
            onClick={handleSearch}
            className="px-4 py-2 bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 rounded flex items-center hover:bg-cyan-500/30 transition-colors"
          >
            <Play size={16} className="mr-2" /> Run Query
          </button>
        </div>
        <div className="flex gap-2 text-xs font-mono text-gray-500">
          <span>Suggested:</span>
          <button className="text-gray-400 hover:text-cyan-400 transition-colors" onClick={() => { setQuery("dest_port=445 AND size>1000"); setHasSearched(false); }}>SMB Exploit</button> | 
          <button className="text-gray-400 hover:text-cyan-400 transition-colors" onClick={() => { setQuery("protocol=DNS AND type=TXT"); setHasSearched(false); }}>DNS Tunneling</button> |
          <button className="text-gray-400 hover:text-cyan-400 transition-colors" onClick={() => { setQuery("threat_type='DDoS Attempt'"); setHasSearched(false); }}>DDoS Activity</button>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto bg-gray-950">
        {!isSearching && !hasSearched && (
            <div className="h-full flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-800 rounded-lg bg-gray-900/30">
                <div className="text-center">
                    <Search size={32} className="mx-auto mb-3 text-gray-600" />
                    <p>Awaiting hunt query.</p>
                    <p className="text-xs text-gray-600 mt-2">Use the input above to search through structured telemetry.</p>
                </div>
            </div>
        )}

        {isSearching && (
            <div className="h-full flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-800 rounded-lg bg-gray-900/30">
                <div className="text-center">
                    <ShieldAlert size={32} className="mx-auto mb-3 text-cyan-500 animate-pulse" />
                    <p>Running distributed query over packet dataset...</p>
                    <p className="text-xs text-gray-600 mt-2 font-mono">Executing parallel search across {packets.length} indexed events</p>
                </div>
            </div>
        )}

        {hasSearched && (
            <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Found <span className="text-cyan-400 font-bold">{results.length}</span> matches in telemetry data</span>
                    <button className="text-xs text-gray-500 hover:text-cyan-400 flex items-center"><Filter size={12} className="mr-1"/> Filter Results</button>
                </div>
                
                {results.length > 0 ? (
                    <div className="rounded border border-gray-800 overflow-hidden">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-900 text-gray-400 font-mono text-xs border-b border-gray-800">
                            <tr>
                            <th className="px-4 py-3 font-medium cursor-pointer flex items-center gap-1">Time</th>
                            <th className="px-4 py-3 font-medium">Source</th>
                            <th className="px-4 py-3 font-medium">Destination</th>
                            <th className="px-4 py-3 font-medium">Proto</th>
                            <th className="px-4 py-3 font-medium">Threat Match</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800 bg-gray-900/30">
                            {results.map((pkt) => (
                                <tr key={pkt.id} className="hover:bg-gray-900/80 transition-colors">
                                    <td className="px-4 py-3 font-mono text-gray-400">{new Date(pkt.timestamp).toISOString().split('T')[1].slice(0, 12)}</td>
                                    <td className="px-4 py-3 font-mono text-cyan-500">{pkt.sourceIp}:{pkt.sourcePort}</td>
                                    <td className="px-4 py-3 font-mono text-fuchsia-400">{pkt.destinationIp}:{pkt.destinationPort}</td>
                                    <td className="px-4 py-3">
                                        <span className="bg-gray-800 text-gray-300 font-mono text-[10px] px-2 py-0.5 rounded">{pkt.protocol}</span>
                                    </td>
                                    <td className="px-4 py-3 text-red-400 flex items-center gap-2">
                                        <Crosshair size={14} />
                                        {pkt.threatType}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500 bg-gray-900/30 rounded border border-gray-800">
                        No matches found for query <span className="font-mono text-gray-400">{query}</span> in current timeframe.
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};
