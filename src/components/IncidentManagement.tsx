import React from 'react';
import { Shield, Clock, AlertTriangle, CheckCircle, FileText, User } from 'lucide-react';

export const IncidentManagement: React.FC = () => {
  const incidents = [
    { id: 'INC-7041', title: 'Suspected DNS Tunneling', severity: 'High', status: 'Investigating', assignee: 'Auto-Triage', time: '10m ago' },
    { id: 'INC-7042', title: 'Multiple Failed SSH Auth', severity: 'Medium', status: 'Open', assignee: 'Unassigned', time: '25m ago' },
    { id: 'INC-7033', title: 'DDoS Attempt Blocked', severity: 'Critical', status: 'Resolved', assignee: 'Nexus AI', time: '2h ago' },
    { id: 'INC-7019', title: 'Malware Beacon Detected', severity: 'High', status: 'Resolved', assignee: 'John Doe', time: '1d ago' },
  ];

  return (
    <div className="h-full flex flex-col glass-panel rounded-lg border border-gray-800 p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h2 className="text-xl font-bold flex items-center text-gray-200">
          <Shield className="mr-2 text-cyan-400" /> Incident Management
        </h2>
        <button className="px-3 py-1.5 bg-gray-800 text-gray-300 border border-gray-700 rounded text-sm hover:bg-gray-700 transition-colors">
          Create Incident
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6 shrink-0">
         <div className="bg-gray-900/50 p-4 rounded border border-gray-800">
            <div className="text-gray-500 text-xs font-mono mb-1 uppercase">Active Incidents</div>
            <div className="text-2xl font-bold text-gray-200">12</div>
         </div>
         <div className="bg-gray-900/50 p-4 rounded border border-red-900/30">
            <div className="text-gray-500 text-xs font-mono mb-1 uppercase">Critical Priority</div>
            <div className="text-2xl font-bold text-red-500">2</div>
         </div>
         <div className="bg-gray-900/50 p-4 rounded border border-gray-800">
            <div className="text-gray-500 text-xs font-mono mb-1 uppercase">Unassigned</div>
            <div className="text-2xl font-bold text-gray-200">5</div>
         </div>
         <div className="bg-gray-900/50 p-4 rounded border border-gray-800">
            <div className="text-gray-500 text-xs font-mono mb-1 uppercase">Avg Resolution</div>
            <div className="text-2xl font-bold text-emerald-500">1.4h</div>
         </div>
      </div>

      <div className="flex-1 overflow-auto rounded border border-gray-800 bg-gray-950">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-900 text-gray-400 font-mono text-xs border-b border-gray-800 sticky top-0">
            <tr>
              <th className="px-4 py-3 font-medium">Incident ID</th>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Severity</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Assignee</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {incidents.map((inc) => (
              <tr key={inc.id} className="hover:bg-gray-900/50 transition-colors">
                <td className="px-4 py-3 font-mono text-cyan-500">{inc.id}</td>
                <td className="px-4 py-3 text-gray-300 font-medium">{inc.title}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs border ${
                    inc.severity === 'Critical' ? 'bg-red-950/50 text-red-400 border-red-900/50' :
                    inc.severity === 'High' ? 'bg-orange-950/50 text-orange-400 border-orange-900/50' :
                    'bg-yellow-950/50 text-yellow-400 border-yellow-900/50'
                  }`}>
                    {inc.severity}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400">
                   <div className="flex items-center gap-1.5">
                      {inc.status === 'Resolved' ? <CheckCircle size={14} className="text-emerald-500"/> : inc.status === 'Investigating' ? <Clock size={14} className="text-cyan-500 animate-pulse" /> : <AlertTriangle size={14} className="text-yellow-500"/>}
                      {inc.status}
                   </div>
                </td>
                <td className="px-4 py-3 text-gray-400 flex items-center gap-2">
                   <User size={14} /> {inc.assignee}
                </td>
                <td className="px-4 py-3 text-gray-500">{inc.time}</td>
                <td className="px-4 py-3"><button className="text-gray-500 hover:text-gray-300 bg-gray-800 border border-gray-700 px-2 py-1 rounded text-xs flex items-center gap-1"><FileText size={12}/> View Case</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
