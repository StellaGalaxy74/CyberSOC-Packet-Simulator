import React from 'react';
import { LayoutDashboard, FileText, Download, CheckCircle, ShieldAlert } from 'lucide-react';

export const ReportsCompliance: React.FC = () => {
  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden glass-panel rounded-lg border border-gray-800 p-6">
      <div className="flex items-center justify-between shrink-0 border-b border-gray-800 pb-4">
        <h2 className="text-xl font-bold flex items-center text-gray-200">
          <LayoutDashboard className="mr-2 text-cyan-400" /> Reports & Compliance
        </h2>
        <button className="px-3 py-1.5 bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-500/30 rounded text-sm hover:bg-fuchsia-500/30 transition-colors flex items-center gap-2">
          <FileText size={16} /> Generate Executive Report
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6 flex-1 overflow-y-auto pr-2">
          
         <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5">
             <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center">
                 <CheckCircle className="mr-2 text-emerald-400" size={18} /> Compliance Status
             </h3>
             <div className="space-y-4">
                 {[
                     { standard: 'ISO 27001', pct: 92, status: 'Compliant' },
                     { standard: 'SOC 2 Type II', pct: 85, status: 'Needs Review' },
                     { standard: 'GDPR Data Privacy', pct: 98, status: 'Compliant' },
                     { standard: 'NIST Framework', pct: 76, status: 'Action Required' },
                 ].map(comp => (
                     <div key={comp.standard} className="bg-gray-950 border border-gray-800 rounded p-3">
                         <div className="flex justify-between items-center mb-2">
                             <span className="font-medium text-gray-300">{comp.standard}</span>
                             <span className={comp.pct >= 90 ? 'text-emerald-400 text-sm' : comp.pct >= 80 ? 'text-yellow-400 text-sm' : 'text-orange-400 text-sm'}>{comp.pct}% coverage</span>
                         </div>
                         <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                             <div className={`h-full ${comp.pct >= 90 ? 'bg-emerald-500' : comp.pct >= 80 ? 'bg-yellow-500' : 'bg-orange-500'}`} style={{ width: `${comp.pct}%` }}></div>
                         </div>
                     </div>
                 ))}
             </div>
         </div>

         <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5">
             <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center">
                 <FileText className="mr-2 text-cyan-400" size={18} /> Available Reports
             </h3>
             <div className="space-y-3">
                 {[
                     { title: 'Weekly SOC Summary', date: 'May 05, 2026', type: 'PDF' },
                     { title: 'Threat Intelligence Brief', date: 'May 04, 2026', type: 'PDF' },
                     { title: 'DDoS Incident Post-Mortem', date: 'May 02, 2026', type: 'DOCX' },
                     { title: 'Data Exfiltration Analysis', date: 'Apr 28, 2026', type: 'PDF' },
                     { title: 'Network Baseline Export', date: 'Apr 25, 2026', type: 'JSON' },
                 ].map((report, i) => (
                     <div key={i} className="bg-gray-950 border border-gray-800 rounded p-3 flex justify-between items-center hover:border-gray-600 transition-colors cursor-pointer group">
                         <div className="flex items-center gap-3">
                             <div className="bg-gray-900 p-2 rounded text-gray-500 group-hover:text-cyan-400 transition-colors">
                                 <FileText size={16} />
                             </div>
                             <div>
                                 <div className="text-sm font-medium text-gray-300">{report.title}</div>
                                 <div className="text-xs text-gray-500 mt-0.5">{report.date}</div>
                             </div>
                         </div>
                         <button className="p-2 text-gray-500 hover:text-gray-200 bg-gray-800 rounded-full transition-colors" title="Download">
                             <Download size={14} />
                         </button>
                     </div>
                 ))}
             </div>
         </div>

      </div>
    </div>
  );
};
