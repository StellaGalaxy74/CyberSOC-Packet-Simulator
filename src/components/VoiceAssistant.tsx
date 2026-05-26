import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Activity, Bot, ChevronUp } from 'lucide-react';
import { cn } from '../lib/utils';
import Markdown from 'react-markdown';

interface VoiceAssistantProps {
  onCommand: (commandText: string) => void;
  isActive: boolean;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onCommand, isActive }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptChunk = event.results[i][0].transcript;
          currentTranscript += transcriptChunk;
          if (event.results[i].isFinal) {
             onCommand(transcriptChunk.trim());
          }
        }
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
         // Auto restart if it was meant to be listening
         if (isListening) recognitionRef.current.start();
      };
    }
    
    return () => {
       if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [onCommand, isListening]);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      if (recognitionRef.current) recognitionRef.current.start();
      setIsListening(true);
    }
  };

  if (!isActive) return null;

  return (
    <div 
       className="fixed bottom-6 right-6 z-50 flex flex-col items-end"
       onMouseEnter={() => setIsHovered(true)}
       onMouseLeave={() => setIsHovered(false)}
    >
       
       <div className={cn(
          "mb-4 glass-panel border border-cyan-500/30 rounded-lg p-4 w-72 transition-all duration-500 transform origin-bottom-right",
          isHovered || isListening ? "scale-100 opacity-100" : "scale-90 opacity-0 pointer-events-none"
       )}>
          <div className="flex items-center justify-between mb-3 border-b border-gray-800 pb-2">
             <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center">
                 <Bot size={14} className="mr-2" /> Voice Comms
             </span>
             {isListening && (
                 <span className="flex items-center text-[9px] font-mono text-cyan-500 animate-pulse">
                     <Activity size={10} className="mr-1" /> ACTIVE
                 </span>
             )}
          </div>
          <div className="text-sm font-mono text-gray-300 min-h-[40px] break-words">
             {transcript || (
                 <span className="text-gray-600 italic">"Start packet capture...", "Analyze threats..."</span>
             )}
          </div>
       </div>

       {/* Holographic Orb */}
       <div className="relative cursor-pointer group" onClick={toggleListening}>
           <div className={cn(
               "absolute -inset-4 rounded-full mix-blend-screen opacity-20 blur-xl transition-all duration-500",
               isListening ? "bg-cyan-500 animate-pulse" : "bg-gray-500 group-hover:bg-cyan-600"
           )}></div>
           
           <div className={cn(
               "relative w-16 h-16 rounded-full border border-gray-700/50 flex items-center justify-center transition-all duration-500 z-10 glass-panel",
               isListening ? "border-cyan-400 bg-cyan-950/80 shadow-[0_0_30px_rgba(6,182,212,0.4)]" : "bg-gray-900",
               isHovered && !isListening && "border-gray-500 bg-gray-800"
           )}>
               {isListening ? (
                   <Mic size={24} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
               ) : (
                   <MicOff size={24} className="text-gray-500 group-hover:text-cyan-600" />
               )}
               
               {isListening && (
                   <>
                       <div className="absolute inset-0 rounded-full border-2 border-cyan-400/50 animate-ping"></div>
                       <div className="absolute -inset-2 rounded-full border border-cyan-500/20 animate-[spin_4s_linear_infinite]" style={{ borderStyle: 'dashed' }}></div>
                       <div className="absolute -inset-4 rounded-full border border-cyan-400/10 animate-[spin_6s_linear_infinite_reverse]" style={{ borderStyle: 'dotted' }}></div>
                   </>
               )}
           </div>
       </div>
    </div>
  );
};
