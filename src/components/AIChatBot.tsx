import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, ShieldCheck, Paperclip, FileText, Download, Crosshair } from 'lucide-react';
import { cn } from '../lib/utils';
import Markdown from 'react-markdown';
import { Packet } from '../types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  attachment?: { name: string; type: string };
  isReport?: boolean;
}

interface AIChatBotProps {
  selectedPacket?: Packet | null;
}

const SUGGESTED_PROMPTS = [
  "Analyze recent suspicious traffic",
  "Show possible indicators of compromise",
  "Generate incident report",
  "Explain DNS poisoning",
  "Recommend mitigation steps"
];

export const AIChatBot: React.FC<AIChatBotProps> = ({ selectedPacket }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `**Welcome to Nexus AI SOC Assistant.**\n\nTo assist in threat resolution, please provide specific investigation details such as:\n\n* Packet captures (PCAP files)\n* SIEM alerts\n* IDS/IPS logs\n* Firewall logs\n* EDR telemetry\n* Suspicious IP addresses\n* Ports and protocols\n* DNS requests\n* Authentication failures\n* Network anomalies\n* Observed suspicious behavior\n\nOnce data is provided, I will identify attack patterns, detect indicators of compromise (IOCs), explain threat behavior, generate forensic insights, and recommend mitigation actions.` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('Analyzing...');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input.trim();
    if (!textToSend && !selectedFile) return;

    const userMessage = textToSend;
    setInput('');
    
    const newMsg: Message = { role: 'user', content: userMessage };
    if (selectedFile) {
        newMsg.attachment = { name: selectedFile.name, type: selectedFile.type };
        newMsg.content = userMessage || `Analyzed uploaded file: ${selectedFile.name}`;
    }
    
    setMessages(prev => [...prev, newMsg]);
    setIsLoading(true);

    let promptContext = '';
    if (selectedPacket) {
      promptContext = `\n\nContext - User is currently inspecting this network packet:\n${JSON.stringify({
        id: selectedPacket.id,
        protocol: selectedPacket.protocol,
        source: selectedPacket.sourceIp + ":" + selectedPacket.sourcePort,
        destination: selectedPacket.destinationIp + ":" + selectedPacket.destinationPort,
        size: selectedPacket.size,
        suspicious: selectedPacket.isSuspicious,
        threatType: selectedPacket.threatType,
      }, null, 2)}`;
    }
    
    if (selectedFile) {
       promptContext += `\n\nContext - User uploaded a file named ${selectedFile.name}. Treat this as a simulated PCAP/log analysis request and provide detailed forensic insights, IOCs, and mitigation steps based on a hypothetical malicious traffic capture.`;
    }
    
    const isReportReq = userMessage.toLowerCase().includes('generate incident report');

    try {
      let response: Response | undefined;
      let data: any;
      let retries = 0;
      const maxRetries = 3;
      
      while (retries <= maxRetries) {
        setLoadingStatus(retries === 0 ? 'Analyzing...' : `Model busy, retrying (${retries}/${maxRetries})...`);
        
        response = await fetch('/api/ask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ prompt: userMessage + promptContext })
        });

        const contentType = response?.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          if (response?.status === 503 || response?.status === 429) {
            data = { error: "The AI model is currently experiencing high demand." };
          } else {
            throw new Error(`Server returned non-JSON response (${response?.status}). The service might be temporarily unavailable.`);
          }
        }

        if (response?.ok) {
          break; // Success
        } else if (response?.status === 503 || response?.status === 429) {
          if (retries === maxRetries) {
             throw new Error(data.error || 'Failed to fetch from Nexus API after multiple retries.');
          }
          const delay = Math.pow(2, retries) * 1000 + Math.random() * 500;
          await new Promise(resolve => setTimeout(resolve, delay));
          retries++;
        } else {
           throw new Error(data.error || 'Failed to fetch from Nexus API');
        }
      }
      
      if (!response?.ok) {
         throw new Error(data?.error || 'Failed to fetch from Nexus API'); 
      }
      
      setSelectedFile(null);
      setMessages(prev => [...prev, { role: 'assistant', content: data.text, isReport: isReportReq }]);

    } catch (err: any) {
      console.error(err);
      setSelectedFile(null);
      setMessages(prev => [...prev, { role: 'assistant', content: `**Error**: ${err.message || 'Unable to reach Nexus AI backend.'} Please try again later.` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setSelectedFile(e.target.files[0]);
      }
  };

  return (
    <div className="flex flex-col h-full glass-panel rounded-lg overflow-hidden border border-gray-800">
       <div className="bg-gray-900/80 border-b border-gray-800 p-3 flex items-center shrink-0">
          <Bot className="text-fuchsia-400 mr-2" size={20} />
          <h2 className="text-sm font-semibold tracking-wider text-gray-200">CyberSOC Nexus AI Threat Investigator</h2>
          <div className="ml-auto flex items-center space-x-1">
             <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></div>
             <span className="text-[10px] uppercase font-mono text-emerald-500 tracking-wider">Online</span>
          </div>
       </div>

       <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
             <div key={i} className={cn(
                "flex max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
             )}>
                <div className={cn(
                   "shrink-0 h-8 w-8 rounded-full flex items-center justify-center border",
                   msg.role === 'user' ? "bg-gray-800 border-gray-700 ml-3" : "bg-fuchsia-950 border-fuchsia-900 mr-3"
                )}>
                   {msg.role === 'user' ? <User size={14} className="text-gray-300" /> : <Bot size={14} className="text-fuchsia-400" />}
                </div>
                
                <div className={cn(
                   "rounded-lg p-3 text-sm terminal-text",
                   msg.role === 'user' 
                     ? "bg-gray-800 text-gray-200" 
                     : "bg-fuchsia-950/10 border border-fuchsia-900/20 text-fuchsia-50 shadow-[0_0_15px_rgba(232,121,249,0.03)]"
                )}>
                   {msg.attachment && (
                       <div className="flex items-center space-x-2 bg-gray-900 border border-gray-700 rounded p-2 mb-2 text-xs">
                           <FileText size={14} className="text-gray-400" />
                           <span className="text-gray-300 truncate">{msg.attachment.name}</span>
                       </div>
                   )}
                   {msg.role === 'assistant' ? (
                      <div className="markdown-body prose prose-invert prose-sm max-w-none text-gray-300 prose-a:text-fuchsia-400 prose-code:text-emerald-300 prose-headings:text-fuchsia-300">
                         <Markdown>{msg.content}</Markdown>
                         {msg.isReport && (
                             <div className="mt-4 pt-4 border-t border-fuchsia-900/30 flex space-x-3">
                                 <button className="flex items-center space-x-2 text-xs bg-fuchsia-600/20 text-fuchsia-400 px-3 py-1.5 rounded hover:bg-fuchsia-600/30 transition-colors border border-fuchsia-500/20">
                                     <Download size={12} /> <span>Export PDF</span>
                                 </button>
                                 <button className="flex items-center space-x-2 text-xs bg-gray-800 text-gray-400 px-3 py-1.5 rounded hover:bg-gray-700 transition-colors border border-gray-700">
                                     <Download size={12} /> <span>Export JSON</span>
                                 </button>
                             </div>
                         )}
                      </div>
                   ) : (
                      msg.content
                   )}
                </div>
             </div>
          ))}
          {isLoading && (
             <div className="flex max-w-[85%] mr-auto">
                <div className="shrink-0 h-8 w-8 rounded-full bg-fuchsia-950 border border-fuchsia-900 mr-3 flex items-center justify-center">
                   <Bot size={14} className="text-fuchsia-400" />
                </div>
                <div className="rounded-lg p-3 text-sm bg-fuchsia-950/20 border border-fuchsia-900/30 text-fuchsia-400 flex items-center space-x-2">
                   <Loader2 size={14} className="animate-spin" />
                   <span className="font-mono text-xs animate-pulse">{loadingStatus}</span>
                </div>
             </div>
          )}
          <div ref={messagesEndRef} />
       </div>

       <div className="p-3 border-t border-gray-800 bg-gray-950 shrink-0">
          
          <div className="flex flex-wrap gap-2 mb-3">
             {SUGGESTED_PROMPTS.map((prompt, idx) => (
                 <button 
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="text-[10px] bg-gray-900 border border-gray-800 text-gray-400 hover:text-fuchsia-400 hover:border-fuchsia-500/30 px-2 py-1 rounded-full transition-colors flex items-center"
                 >
                     <Crosshair size={10} className="mr-1" /> {prompt}
                 </button>
             ))}
          </div>

          {selectedPacket && (
             <div className="mb-2 px-3 py-1.5 rounded bg-gray-900 border border-gray-800 flex items-center justify-between text-xs font-mono text-gray-400">
                <span className="flex items-center">
                    <ShieldCheck size={12} className="mr-2 text-fuchsia-500" />
                    Context attached: Packet {selectedPacket.id}
                </span>
                <span className={cn(
                    selectedPacket.isSuspicious ? "text-red-400" : "text-emerald-400"
                )}>{selectedPacket.protocol} {selectedPacket.size}B</span>
             </div>
          )}

          {selectedFile && (
             <div className="mb-2 px-3 py-1.5 rounded bg-gray-900 border border-gray-800 flex items-center justify-between text-xs font-mono text-gray-400">
                <span className="flex items-center">
                    <FileText size={12} className="mr-2 text-cyan-500" />
                    File attached: {selectedFile.name}
                </span>
                <button onClick={() => setSelectedFile(null)} className="text-red-400 hover:text-red-300">Remove</button>
             </div>
          )}

          <div className="relative flex items-center">
             <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute left-2 p-1.5 text-gray-500 hover:text-fuchsia-400 bg-gray-800 rounded transition-colors z-10"
                title="Upload PCAP or Log file"
             >
                <Paperclip size={14} />
             </button>
             <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange}
                className="hidden"
                accept=".pcap,.pcapng,.log,.csv,.json"
             />
             <input 
                type="text" 
                className="w-full bg-gray-900 border border-gray-800 rounded-md py-2.5 pl-10 pr-12 text-sm text-gray-200 focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 font-mono transition-all"
                placeholder="Ask Nexus AI about threats or upload a PCAP..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
             />
             <button 
                onClick={() => handleSend()}
                disabled={isLoading || (!input.trim() && !selectedFile)}
                className="absolute right-2 p-1.5 bg-fuchsia-600/20 text-fuchsia-400 hover:bg-fuchsia-500 hover:text-gray-900 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
                <Send size={14} />
             </button>
          </div>
       </div>
    </div>
  );
};
