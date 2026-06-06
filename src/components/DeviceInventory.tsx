import React from 'react';
import { Hexagon, Server, Laptop, MonitorSmartphone, Wifi, Search } from 'lucide-react';

export const DeviceInventory: React.FC = () => {
  const devices = [
    { ip: '192.168.1.10', name: 'DB-Prod-01', type: 'Server', os: 'Linux (Ubuntu)', risk: 'Low', status: 'Online' },
    { ip: '192.168.1.55', name: 'Web-Front-02', type: 'Server', os: 'Linux (CentOS)', risk: 'Medium', status: 'Online' },
    { ip: '10.0.0.42', name: 'User-Laptop-JDoe', type: 'Workstation', os: 'Windows 11', risk: 'High', status: 'Offline' },
    { ip: '10.0.0.99', name: 'Guest-Mobile', type: 'Mobile', os: 'iOS', risk: 'Low', status: 'Online' },
    { ip: '192.168.1.254', name: 'Core-Switch', type: 'Network', os: 'Cisco IOS', risk: 'Low', status: 'Online' },
  ];

  const getIcon = (type: string) => {
      switch(type) {
          case 'Server': return <Server size={16} className="text-purple-400" />;
          case 'Workstation': return <Laptop size={16} className="text-cyan-400" />;
          case 'Mobile': return <MonitorSmartphone size={16} className="text-gray-400" />;
          case 'Network': return <Wifi size={16} className="text-emerald-400" />
          default: return <Server size={16} className="text-gray-400" />;
      }
  }

  return (
    <div className="h-full flex flex-col glass-panel rounded-lg border border-gray-800 p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h2 className="text-xl font-bold flex items-center text-gray-200">
          <Hexagon className="mr-2 text-cyan-400" /> Network Device Inventory
        </h2>
        <div className="flex items-center bg-gray-900 border border-gray-800 rounded px-3 py-1.5 text-sm w-64">
           <Search size={14} className="text-gray-500 mr-2" />
           <input type="text" placeholder="Search IP or hostname" className="bg-transparent border-none outline-none text-gray-300 w-full" />
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded border border-gray-800 bg-gray-950">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-900 text-gray-400 font-mono text-xs border-b border-gray-800 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 font-medium">Device Profile</th>
              <th className="px-4 py-3 font-medium">IP Address</th>
              <th className="px-4 py-3 font-medium">OS Fingerprint</th>
              <th className="px-4 py-3 font-medium">Risk Score</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {devices.map((dev, i) => (
              <tr key={i} className="hover:bg-gray-900/50 transition-colors">
                <td className="px-4 py-3 text-gray-300">
                   <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-gray-900 border border-gray-800 rounded">
                         {getIcon(dev.type)}
                      </div>
                      <div>
                         <div className="font-medium text-gray-200">{dev.name}</div>
                         <div className="text-xs text-gray-500 font-mono mt-0.5">{dev.type}</div>
                      </div>
                   </div>
                </td>
                <td className="px-4 py-3 font-mono text-cyan-500">{dev.ip}</td>
                <td className="px-4 py-3 text-gray-400">{dev.os}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs border ${
                    dev.risk === 'High' ? 'bg-red-950/50 text-red-400 border-red-900/50' :
                    dev.risk === 'Medium' ? 'bg-orange-950/50 text-orange-400 border-orange-900/50' :
                    'bg-emerald-950/50 text-emerald-400 border-emerald-900/50'
                  }`}>
                    {dev.risk}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400">
                    <span className="flex items-center gap-1.5">
                       <span className={`h-2 w-2 rounded-full ${dev.status === 'Online' ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-gray-600'}`}></span>
                       {dev.status}
                    </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
