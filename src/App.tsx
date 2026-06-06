/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, Download, Trash2, Filter, Search, Hexagon, LayoutDashboard, Brain, Network, Shield, MonitorPlay, MessageSquare } from 'lucide-react';
import { Packet, SystemStats } from './types';
import { generateMockPacket, generateAttackBurst } from './lib/simulator';
import { PacketTable } from './components/PacketTable';
import { PacketDetails } from './components/PacketDetails';
import { DashboardCards } from './components/DashboardCards';
import { ProtocolChart } from './components/ProtocolChart';
import { TrafficTimeline } from './components/TrafficTimeline';
import { AIChatBot } from './components/AIChatBot';
import { NetworkMap } from './components/NetworkMap';
import { CyberScore } from './components/CyberScore';
import { AttackSimulator } from './components/AttackSimulator';
import { VoiceAssistant } from './components/VoiceAssistant';
import { ThreatHunting } from './components/ThreatHunting';
import { IncidentManagement } from './components/IncidentManagement';
import { DeviceInventory } from './components/DeviceInventory';
import { ReportsCompliance } from './components/ReportsCompliance';

type ViewMode = 'dashboard' | 'nexus' | 'map' | 'alerts' | 'simulator' | 'hunting' | 'incidents' | 'inventory' | 'reports';

export default function App() {
  const [activeView, setActiveView] = useState<ViewMode>('dashboard');
  const [wallboardMode, setWallboardMode] = useState(false);
  const [voiceActive, setVoiceActive] = useState(true);
  
  const [isSniffing, setIsSniffing] = useState(false);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [filteredPackets, setFilteredPackets] = useState<Packet[]>([]);
  const [selectedPacket, setSelectedPacket] = useState<Packet | null>(null);
  
  // Dashboard State
  const [stats, setStats] = useState<SystemStats>({
    totalPackets: 0,
    activeConnections: 0,
    bandwidthUsage: 0,
    threatScore: 0,
    securityGrade: 'A',
    protocolCounts: { TCP: 0, UDP: 0, ICMP: 0, HTTP: 0, DNS: 0 }
  });
  
  // Chart Data
  const [historicData, setHistoricData] = useState<any[]>(Array(20).fill({ time: '', bandwidth: 0, packets: 0 }));
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [protocolFilter, setProtocolFilter] = useState('ALL');

  const packetsRef = useRef<Packet[]>([]);
  const simulationInterval = useRef<NodeJS.Timeout | null>(null);
  const statsInterval = useRef<NodeJS.Timeout | null>(null);

  // Apply filters whenever packets or filter criteria change
  useEffect(() => {
    let result = packets;
    if (protocolFilter !== 'ALL') {
      result = result.filter(p => p.protocol === protocolFilter);
    }
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.sourceIp.includes(lowerTerm) || 
        p.destinationIp.includes(lowerTerm) ||
        p.sourcePort.toString().includes(lowerTerm) ||
        p.destinationPort.toString().includes(lowerTerm)
      );
    }
    setFilteredPackets(result);
  }, [packets, protocolFilter, searchTerm]);

  const toggleSniffing = () => {
    if (isSniffing) {
      if (simulationInterval.current) clearInterval(simulationInterval.current);
      if (statsInterval.current) clearInterval(statsInterval.current);
      setIsSniffing(false);
    } else {
      setIsSniffing(true);
      
      // Simulate incoming packets
      simulationInterval.current = setInterval(() => {
        // Generate 1-5 packets per tick
        const numPackets = Math.floor(Math.random() * 5) + 1;
        const newPackets = Array.from({ length: numPackets }, () => generateMockPacket());
        
        setPackets(prev => {
          const updated = [...newPackets, ...prev].slice(0, 1000); // Keep last 1000
          packetsRef.current = updated;
          return updated;
        });

      }, 500); // Trigger every 500ms

      // Start stats calculation loop
      statsInterval.current = setInterval(calculateStats, 1000);
    }
  };

  const calculateStats = useCallback(() => {
      const currentPackets = packetsRef.current;
      
      const recentPackets = currentPackets.slice(0, 50); 
      const newBandwidth = recentPackets.reduce((acc, p) => acc + p.size, 0) * 8 / 1000000; // Mbps approx
      const newThreats = recentPackets.filter(p => p.isSuspicious).length;
      
      const pCounts = { TCP: 0, UDP: 0, ICMP: 0, HTTP: 0, DNS: 0 };
      currentPackets.forEach(p => {
         if (pCounts[p.protocol as keyof typeof pCounts] !== undefined) {
             pCounts[p.protocol as keyof typeof pCounts]++;
         }
      });

      setStats(prev => {
          let newScore = prev.threatScore * 0.95 + (newThreats * 15);
          newScore = Math.min(100, Math.max(0, newScore));
          
          let grade: SystemStats['securityGrade'] = 'A';
          if (newScore > 80) grade = 'F';
          else if (newScore > 60) grade = 'D';
          else if (newScore > 40) grade = 'C';
          else if (newScore > 20) grade = 'B';
          
          return {
              totalPackets: currentPackets.length,
              activeConnections: Math.floor(currentPackets.length / (Math.random() * 5 + 5)), // Faux metric
              bandwidthUsage: newBandwidth,
              threatScore: newScore,
              securityGrade: grade,
              protocolCounts: pCounts
          };
      });

      const now = new Date();
      setHistoricData(prev => {
          const newPoint = {
              time: now.toLocaleTimeString(),
              bandwidth: newBandwidth,
              packets: recentPackets.length
          };
          return [...prev.slice(1), newPoint];
      });

  }, []);

  const clearPackets = () => {
    setPackets([]);
    packetsRef.current = [];
    setSelectedPacket(null);
    setStats({
      totalPackets: 0,
      activeConnections: 0,
      bandwidthUsage: 0,
      threatScore: 0,
      securityGrade: 'A',
      protocolCounts: { TCP: 0, UDP: 0, ICMP: 0, HTTP: 0, DNS: 0 }
    });
    setHistoricData(Array(20).fill({ time: '', bandwidth: 0, packets: 0 }));
  };

  const triggerAttack = (type: Packet['threatType'], targetIp: string, intensity: number) => {
      const burst = generateAttackBurst(type, targetIp, intensity);
      setPackets(prev => {
          const updated = [...burst, ...prev].slice(0, 1000);
          packetsRef.current = updated;
          return updated;
      });
  };

  const handleVoiceCommand = (commandText: string) => {
      const lowerCmd = commandText.toLowerCase();
      if (lowerCmd.includes('start') && (lowerCmd.includes('capture') || lowerCmd.includes('sniffing'))) {
          if (!isSniffing) toggleSniffing();
      } else if (lowerCmd.includes('stop') || lowerCmd.includes('pause')) {
          if (isSniffing) toggleSniffing();
      } else if (lowerCmd.includes('suspicious') || lowerCmd.includes('threat')) {
          setActiveView('alerts');
      } else if (lowerCmd.includes('topology') || lowerCmd.includes('map')) {
          setActiveView('map');
      } else if (lowerCmd.includes('assistant') || lowerCmd.includes('nexus')) {
          setActiveView('nexus');
      } else if (lowerCmd.includes('simulator') || lowerCmd.includes('lab')) {
          setActiveView('simulator');
      }
  };

  return (
    <div className={`h-screen w-full flex overflow-hidden text-gray-200 ${wallboardMode ? 'bg-[#000510]' : ''}`}>
      
      {/* Sidebar Navigation */}
      {!wallboardMode && (
         <aside className="w-16 md:w-64 shrink-0 glass-panel border-t-0 border-b-0 border-l-0 flex flex-col z-20 overflow-y-auto">
         <div className="h-16 border-b border-gray-800 flex items-center justify-center md:justify-start md:px-6 shrink-0 sticky top-0 bg-[#030712] z-10">
            <Hexagon className="text-cyan-400 shrink-0" size={28} />
            <div className="hidden md:block ml-3">
               <h1 className="text-lg font-bold tracking-tight text-white m-0 leading-tight">CyberSOC</h1>
               <p className="text-[9px] text-cyan-500 font-mono tracking-widest uppercase">Nexus Enterprise</p>
            </div>
         </div>
         
         <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
            <div className="hidden md:block text-[10px] uppercase font-mono tracking-widest text-gray-500 px-4 mt-2 mb-1">Command Center</div>
            <NavButton active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} icon={<LayoutDashboard size={18} />} label="Overview Dashboard" variant="cyan" />
            
            <div className="hidden md:block text-[10px] uppercase font-mono tracking-widest text-gray-500 px-4 mt-4 mb-1">Investigations</div>
            <NavButton active={activeView === 'nexus'} onClick={() => setActiveView('nexus')} icon={<Brain size={18} />} label="AI Threat Investigation" variant="fuchsia" />
            <NavButton active={activeView === 'map'} onClick={() => setActiveView('map')} icon={<Network size={18} />} label="Live Network Map" variant="emerald" />
            <NavButton active={activeView === 'alerts'} onClick={() => setActiveView('alerts')} icon={<Shield size={18} />} label="Threat Intelligence Feed" variant="red" badge={stats.threatScore > 30} />
            
            <div className="hidden md:block text-[10px] uppercase font-mono tracking-widest text-gray-500 px-4 mt-4 mb-1">Operations (SOC)</div>
            <NavButton active={activeView === 'simulator'} onClick={() => setActiveView('simulator')} icon={<MonitorPlay size={18} />} label="Attack Simulation Lab" variant="orange" />
            <NavButton active={activeView === 'hunting'} onClick={() => setActiveView('hunting')} icon={<Search size={18} />} label="Threat Hunting" variant={activeView === 'hunting' ? 'cyan' : 'gray'} />
            <NavButton active={activeView === 'incidents'} onClick={() => setActiveView('incidents')} icon={<Shield size={18} />} label="Incident Management" variant={activeView === 'incidents' ? 'cyan' : 'gray'} />
            
            <div className="hidden md:block text-[10px] uppercase font-mono tracking-widest text-gray-500 px-4 mt-4 mb-1">System</div>
            <NavButton active={activeView === 'inventory'} onClick={() => setActiveView('inventory')} icon={<Hexagon size={18} />} label="Device Inventory" variant={activeView === 'inventory' ? 'cyan' : 'gray'} />
            <NavButton active={activeView === 'reports'} onClick={() => setActiveView('reports')} icon={<LayoutDashboard size={18} />} label="Reports & Compliance" variant={activeView === 'reports' ? 'cyan' : 'gray'} />
         </nav>
         
         <div className="p-4 border-t border-gray-800 hidden md:block shrink-0 sticky bottom-0 bg-[#030712]">
             <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
                <div className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-2">System Status</div>
                <div className="flex items-center text-xs mb-3">
                   <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981] mr-2 animate-pulse"></div>
                   <span className="text-gray-300 font-mono tracking-tight text-[11px]">CORE_NODE_ONLINE</span>
                </div>
                <button 
                   onClick={() => setWallboardMode(!wallboardMode)}
                   className="w-full flex items-center justify-center text-xs px-2 py-1.5 bg-gray-800 border border-gray-700 hover:bg-gray-700 hover:border-gray-600 rounded text-gray-300 transition-colors shadow-sm"
                >
                   <MonitorPlay size={12} className="mr-2" />
                   Wallboard Mode
                </button>
             </div>
         </div>
      </aside>
      )}

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
         {/* Top Controls Header */}
         <header className="glass-panel border-t-0 border-l-0 border-r-0 px-6 py-3 flex items-center justify-between shrink-0 z-10 gap-4">
            <div className="flex items-center space-x-4 shrink-0">
               {wallboardMode && (
                   <button onClick={() => setWallboardMode(false)} className="bg-gray-800 hover:bg-gray-700 p-1.5 rounded text-gray-400">
                       <Hexagon size={16} className="text-cyan-400" />
                   </button>
               )}
               <h2 className="text-lg font-bold text-gray-100 flex items-center gap-3 w-48 xl:w-auto overflow-hidden text-ellipsis whitespace-nowrap">
                  {activeView === 'dashboard' && 'Traffic Intelligence'}
                  {activeView === 'nexus' && 'AI Security Assistant'}
                  {activeView === 'map' && 'Network Topology Map'}
                  {activeView === 'alerts' && 'Threat Detections'}
                  {activeView === 'simulator' && <span className="text-orange-400 flex items-center"><Shield className="mr-2 shrink-0"/> Attack Simulator Lab</span>}
                  {activeView === 'hunting' && 'Threat Hunting'}
                  {activeView === 'incidents' && 'Incident Management'}
                  {activeView === 'inventory' && 'Device Inventory'}
                  {activeView === 'reports' && 'Reports & Compliance'}
                  
                  {wallboardMode && <span className="text-xs bg-cyan-900/40 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30 uppercase tracking-widest font-mono ml-2 shrink-0">Wallboard LIVE</span>}
               </h2>
            </div>
            
            {!wallboardMode && (
               <div className="flex-1 max-w-xl hidden md:flex items-center bg-gray-900 border border-gray-800 rounded-md px-3 py-1.5 text-sm">
                  <Search size={14} className="text-gray-500 mr-2 shrink-0" />
                  <input type="text" placeholder="Global Search (Press '/' to focus)..." className="bg-transparent border-none outline-none text-gray-300 w-full placeholder-gray-600 font-mono" />
               </div>
            )}

            {/* Controls */}
            <div className="flex items-center space-x-4 shrink-0">
               <div className="flex items-center space-x-2 bg-gray-900/50 rounded p-1 border border-gray-800">
                  <button 
                     onClick={toggleSniffing}
                     className={`flex items-center px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                     isSniffing 
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                        : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                     }`}
                  >
                     {isSniffing ? <><Square size={14} className="mr-2" /> Stop Sniffing</> : <><Play size={14} className="mr-2" /> Start Sniffing</>}
                  </button>
                  <button onClick={clearPackets} className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition-colors" title="Clear Buffer">
                     <Trash2 size={16} />
                  </button>
                  <div className="w-px h-6 bg-gray-700 mx-1"></div>
                  <button className="flex items-center px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors">
                     <Download size={14} className="mr-2" /> Export PCAP
                  </button>
               </div>
               
               <div className="flex items-center">
                  <span className="relative flex h-3 w-3 mr-2">
                     {isSniffing && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>}
                     <span className={`relative inline-flex rounded-full h-3 w-3 ${isSniffing ? 'bg-cyan-500' : 'bg-gray-600'}`}></span>
                  </span>
                  <span className="text-xs font-mono text-gray-400">{isSniffing ? 'SNIFFING [eth0]' : 'OFFLINE'}</span>
               </div>
            </div>
         </header>

         {/* View Content area */}
         <main className="flex-1 overflow-y-auto p-4 md:p-6 relative">
            
            {activeView === 'dashboard' && (
               <div className="flex flex-col h-full min-h-[800px] gap-4">
                  <div className="shrink-0 flex gap-4 h-[120px]">
                     <div className="flex-1 h-full">
                        <DashboardCards stats={stats} historicData={historicData} />
                     </div>
                     {!wallboardMode && (
                        <div className="w-48 shrink-0 h-full">
                           <CyberScore score={stats.threatScore} grade={stats.securityGrade} />
                        </div>
                     )}
                  </div>

                  <div className="shrink-0 h-72">
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
                        <div className="lg:col-span-2 h-full relative">
                           <TrafficTimeline data={historicData} />
                        </div>
                        <div className="h-full relative">
                           <ProtocolChart stats={stats} />
                        </div>
                     </div>
                  </div>

                  <div className="flex flex-col flex-1 min-h-[400px]">
                     <div className="flex items-center justify-between mb-4 shrink-0">
                     <div className="flex items-center space-x-2">
                        <div className="relative">
                           <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                           <input 
                              type="text" 
                              placeholder="Filter by IP, Port..." 
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="bg-gray-900 border border-gray-800 rounded pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-cyan-500 font-mono text-gray-300 w-64 transition-colors"
                           />
                        </div>
                        <div className="flex items-center bg-gray-900 border border-gray-800 rounded p-1">
                           <Filter size={14} className="text-gray-500 mx-2" />
                           <select 
                              value={protocolFilter}
                              onChange={(e) => setProtocolFilter(e.target.value)}
                              className="bg-transparent text-sm text-gray-300 outline-none font-mono py-0.5 pr-2"
                           >
                              <option value="ALL">All Protocols</option>
                              <option value="TCP">TCP</option>
                              <option value="UDP">UDP</option>
                              <option value="ICMP">ICMP</option>
                              <option value="HTTP">HTTP</option>
                              <option value="DNS">DNS</option>
                           </select>
                        </div>
                     </div>
                     <button 
                        onClick={() => {
                           if(selectedPacket) setActiveView('nexus');
                        }}
                        disabled={!selectedPacket}
                        className="text-xs flex items-center px-3 py-1.5 bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-fuchsia-500/30 transition-colors"
                     >
                        <Brain size={12} className="mr-2" /> Ask AI about selected packet
                     </button>
                  </div>

                  <div className="flex-grow relative flex min-h-0">
                     <PacketTable 
                        packets={filteredPackets} 
                        onRowClick={setSelectedPacket} 
                        selectedPacketId={selectedPacket?.id || null} 
                     />
                     {selectedPacket && (
                        <PacketDetails packet={selectedPacket} onClose={() => setSelectedPacket(null)} />
                     )}
                  </div>
                  </div>
               </div>
            )}

            {activeView === 'nexus' && (
               <div className="h-full flex gap-4">
                  <div className="flex-1 max-w-4xl mx-auto h-full">
                     <AIChatBot selectedPacket={selectedPacket} />
                  </div>
                  {/* Optional Side Panel for Nexus View displaying current active object */}
                  {selectedPacket && (
                     <div className="w-80 hidden xl:block h-full relative">
                        <PacketDetails packet={selectedPacket} onClose={() => setSelectedPacket(null)} />
                     </div>
                  )}
               </div>
            )}

            {activeView === 'map' && (
               <div className="h-full w-full">
                 <NetworkMap packets={packets} />
               </div>
            )}

            {activeView === 'alerts' && (
               <div className="h-full flex flex-col glass-panel rounded-lg border border-gray-800 p-6 overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
                     <h2 className="text-xl font-bold flex items-center text-red-500">
                        <Shield className="mr-2" /> Threat Intelligence Feed
                     </h2>
                     <div className="flex space-x-2 text-sm font-mono">
                        <span className="bg-red-950/50 text-red-400 px-2 py-1 rounded border border-red-900/50">Critical: {packets.filter(p=>p.isSuspicious && p.threatType === 'DDoS Attempt').length}</span>
                        <span className="bg-yellow-950/50 text-yellow-400 px-2 py-1 rounded border border-yellow-900/50">Warning: {packets.filter(p=>p.isSuspicious && p.threatType !== 'DDoS Attempt').length}</span>
                     </div>
                  </div>
                  
                  <div className="space-y-3">
                     {packets.filter(p => p.isSuspicious).slice(0, 20).map((threat, i) => {
                        const isHighSeverity = threat.threatType === 'DDoS Attempt' || (threat.reputationScore ?? 0) > 80;
                        return (
                        <div key={i} className={`rounded p-4 flex items-start gap-4 hover:border-red-900/50 transition-all cursor-pointer ${isHighSeverity ? 'bg-red-950/10 border border-red-900/30 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.05)]' : 'bg-gray-900/50 border border-gray-800'}`} onClick={() => {
                           setSelectedPacket(threat);
                           setActiveView('nexus');
                        }}>
                           <div className="mt-1">
                              {threat.threatType === 'DDoS Attempt' ? (
                                 <Shield size={20} className="text-red-500" />
                              ) : (
                                 <Shield size={20} className="text-yellow-500" />
                              )}
                           </div>
                           <div className="flex-1">
                              <h4 className={`font-semibold ${threat.threatType === 'DDoS Attempt' ? 'text-red-400' : 'text-yellow-400'}`}>
                                 System Alert: {threat.threatType}
                              </h4>
                              <p className="text-sm text-gray-400 mt-1">
                                 Detected malicious payload signature from source <span className="font-mono text-gray-300">{threat.sourceIp}</span> targeting port <span className="font-mono text-gray-300">{threat.destinationPort}</span>.
                              </p>
                              <div className="flex gap-4 mt-3 text-xs font-mono text-gray-500">
                                 <span>Time: {new Date(threat.timestamp).toLocaleTimeString()}</span>
                                 <span>Proto: {threat.protocol}</span>
                                 <span>Size: {threat.size}B</span>
                              </div>
                           </div>
                           <div>
                              <button className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded transition-colors">
                                 Analyze in Nexus
                              </button>
                           </div>
                        </div>
                        );
                     })}
                     {packets.filter(p => p.isSuspicious).length === 0 && (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                           No threats detected in current session buffer.
                        </div>
                     )}
                  </div>
               </div>
            )}
            {activeView === 'simulator' && (
               <div className="h-full flex gap-4">
                  <div className="w-96 shrink-0 h-full">
                     <AttackSimulator onSimulateAttack={triggerAttack} />
                  </div>
                  <div className="flex-1 flex flex-col h-full bg-gray-900 border border-gray-800 rounded-lg p-4 overflow-hidden relative">
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cyber-net.png')] opacity-[0.03]"></div>
                     <h3 className="text-gray-400 font-mono text-sm uppercase mb-4 relative z-10 flex items-center">
                        <MonitorPlay size={16} className="mr-2" /> Target Environment Telemetry
                     </h3>
                     <div className="flex-1 relative z-10">
                        <TrafficTimeline data={historicData} />
                     </div>
                     <div className="mt-4 relative z-10 p-4 border border-orange-500/20 bg-orange-950/10 rounded">
                        <h4 className="text-orange-400 font-bold mb-2">Simulation Guidelines</h4>
                        <p className="text-sm text-gray-400">Launch scripted attack sequences to observe SOC monitoring and threat recognition capabilities in real-time. All packets are safely confined to this educational sandbox environment.</p>
                     </div>
                  </div>
               </div>
            )}
            
            {activeView === 'hunting' && <ThreatHunting packets={packets} />}
            {activeView === 'incidents' && <IncidentManagement />}
            {activeView === 'inventory' && <DeviceInventory />}
            {activeView === 'reports' && <ReportsCompliance />}
         </main>
      </div>

      <VoiceAssistant onCommand={handleVoiceCommand} isActive={voiceActive} />
    </div>
  );
}

function NavButton({ active, onClick, icon, label, variant, badge = false }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; variant: 'cyan' | 'fuchsia' | 'emerald' | 'red' | 'orange' | 'gray'; badge?: boolean }) {
  const colors = {
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    fuchsia: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    gray: 'text-gray-400 hover:text-gray-200 hover:bg-gray-800 border-transparent text-gray-400'
  };
  
  const iconColors = {
    cyan: 'text-cyan-400',
    fuchsia: 'text-fuchsia-400',
    emerald: 'text-emerald-400',
    red: 'text-red-400',
    orange: 'text-orange-400',
    gray: 'text-gray-500'
  };

  const activeColor = active ? colors[variant] : colors['gray'];
  const activeIconColor = active ? iconColors[variant] : 'text-gray-500 group-hover:text-gray-300';

  return (
    <button 
      onClick={onClick}
      className={`flex items-center px-4 py-2.5 rounded-lg transition-all group border ${activeColor} ${!active && 'hover:bg-gray-800'}`}
      title={label}
    >
      <div className="relative flex items-center justify-center shrink-0">
         {React.cloneElement(icon as React.ReactElement, { className: activeIconColor } as any)}
         {badge && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 animate-ping"></span>}
      </div>
      <span className="hidden md:block ml-3 font-medium text-sm whitespace-nowrap overflow-hidden text-ellipsis">{label}</span>
    </button>
  );
}

