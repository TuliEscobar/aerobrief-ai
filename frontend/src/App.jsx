import React, { useState, useEffect, useRef } from 'react';
import { Send, Plane, Activity, Wind, CloudLightning, ShieldAlert, Sparkles, Trash2, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import axios from 'axios';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.DEV ? 'http://localhost:5000/api/v1' : '/api/v1';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleSend = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userText = inputValue.trim();
    setInputValue('');
    
    // Agregamos el mensaje del piloto
    const newMsg = { id: Date.now(), sender: 'pilot', text: userText };
    setMessages(prev => [...prev, newMsg]);
    setIsProcessing(true);

    try {
      // Llamada al backend
      const res = await axios.post(`${API_URL}/briefing/chat`, { message: userText });
      const { response, intercepted } = res.data;

      // Agregamos la respuesta de la IA
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        sender: 'ai', 
        text: response,
        intercepted: intercepted 
      }]);
    } catch (err) {
      console.error(err);
      setError('Connection to Operations failed. Check satellite link.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#050B14] text-cyan-50 overflow-hidden font-mono">
      {/* Estilo Radar de Fondo */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-10 pointer-events-none">
        <div className="w-[800px] h-[800px] rounded-full border border-cyan-500/20 absolute" />
        <div className="w-[600px] h-[600px] rounded-full border border-cyan-500/30 absolute" />
        <div className="w-[400px] h-[400px] rounded-full border border-cyan-500/40 absolute" />
        <div className="w-[200px] h-[200px] rounded-full border border-cyan-500/50 absolute" />
        <div className="absolute inset-0 rounded-full radar-sweep pointer-events-none mix-blend-screen" />
      </div>
      
      {/* Navbar Cabina */}
      <nav className="relative z-20 w-full h-16 bg-[#02050A]/90 backdrop-blur-md border-b border-cyan-800/40 flex items-center justify-between px-4 md:px-8 shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg border border-cyan-500/50 bg-cyan-950/30 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
             <Plane className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xs font-black tracking-widest text-cyan-400 uppercase">AeroBrief AI</h1>
            <p className="text-[9px] text-cyan-600 uppercase tracking-tighter">Pre-Flight Copilot System</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-950/30 border border-green-500/30 rounded-full">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[10px] text-green-400 uppercase font-bold tracking-widest">DATA LINK ONLINE</span>
           </div>
           <button onClick={clearChat} className="p-2 text-cyan-700 hover:text-cyan-400 transition-colors" title="Clear Log">
             <Trash2 className="w-4 h-4" />
           </button>
        </div>
      </nav>

      {/* Main Chat Area */}
      <main className="relative z-10 flex-1 overflow-y-auto custom-scrollbar scroll-smooth flex flex-col px-4 pt-4 pb-28 overscroll-contain">
        {messages.length === 0 && !isProcessing && (
          <div className="flex flex-col items-center justify-center flex-1 text-center opacity-40 my-auto">
            <Activity className="w-16 h-16 mb-4 text-cyan-600" />
            <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-[0.4em]">SYSTEM STANDBY</h2>
            <p className="text-[10px] text-cyan-600 mt-2 max-w-xs">
              Enter flight route or request METAR/NOTAMs.
              <br/>Example: "Status for LEMD to LEBL"
            </p>
          </div>
        )}

        <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
          {messages.map((msg) => {
            const isPilot = msg.sender === 'pilot';
            return (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={msg.id} className={cn("flex flex-col max-w-[88%]", isPilot ? "self-end items-end" : "self-start items-start")}>
                
                {/* Etiqueta Piloto/Torre */}
                <div className="flex items-center gap-2 mb-1 px-1 opacity-60">
                  {isPilot ? <span className="text-[10px] font-bold text-orange-400 uppercase">CMD (Pilot)</span> : <span className="text-[10px] font-bold text-cyan-400 uppercase">ATC (Copilot)</span>}
                </div>

                <div className={cn(
                  "p-4 rounded-xl shadow-lg border backdrop-blur-md flex flex-col gap-3 relative text-sm md:text-base leading-relaxed whitespace-pre-wrap",
                  isPilot 
                    ? "bg-orange-950/20 border-orange-500/20 rounded-tr-none text-orange-100" 
                    : "bg-cyan-950/20 border-cyan-500/20 rounded-tl-none text-cyan-100"
                )}>
                  {/* Si el bot interceptó ICAOs, mostramos el badge */}
                  {!isPilot && msg.intercepted && msg.intercepted.length > 0 && (
                    <div className="flex items-center gap-2 bg-blue-950/50 border border-blue-500/30 p-2 rounded-md mb-2">
                      <Cpu className="w-3 h-3 text-blue-400" />
                      <span className="text-[9px] text-blue-300 font-bold tracking-widest uppercase">Live NOAA Data Loaded: {msg.intercepted.join(', ')}</span>
                    </div>
                  )}

                  {/* Renderizamos el texto. Usaremos un renderizado sencillo, pero destacando peligros */}
                  <div dangerouslySetInnerHTML={{ 
                    __html: msg.text
                      .replace(/🔴/g, '<span class="text-red-400 animate-pulse text-lg">🔴</span>')
                      .replace(/🟡/g, '<span class="text-yellow-400 text-lg">🟡</span>')
                      .replace(/🟢/g, '<span class="text-green-400 text-lg">🟢</span>')
                      .replace(/PELIGRO/g, '<span class="text-red-500 font-black bg-red-950/50 px-1 rounded">PELIGRO</span>')
                      .replace(/CRÍTICO/gi, '<span class="text-red-500 font-black bg-red-950/50 px-1 rounded">CRÍTICO</span>')
                  }} />
                </div>
              </motion.div>
            );
          })}

          <AnimatePresence>
            {isProcessing && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col max-w-[88%] self-start items-start">
                 <div className="p-3 rounded-xl border border-cyan-500/30 bg-cyan-950/30 backdrop-blur-md rounded-tl-none flex items-center gap-3">
                   <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                   <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-widest animate-pulse">Processing Flight Data...</span>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      {/* Input Terminal */}
      <footer className="absolute bottom-0 left-0 right-0 z-30 p-4 bg-[#02050A]/95 border-t border-cyan-800/40 backdrop-blur-lg shrink-0 pb-6 md:pb-8">
        <div className="max-w-3xl mx-auto flex items-end gap-3 bg-black/60 border border-cyan-900/50 p-2 rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.1)]">
          <div className="p-3 bg-cyan-950/50 rounded-lg shrink-0 border border-cyan-800/50">
            <Wind className="w-5 h-5 text-cyan-500" />
          </div>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type clearance request or ICAO codes..."
            className="flex-1 bg-transparent text-sm md:text-base font-medium text-cyan-100 placeholder:text-cyan-800/70 outline-none px-2 py-3 custom-scrollbar resize-none"
            rows={1}
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          <button 
            onClick={handleSend} 
            disabled={!inputValue.trim() || isProcessing}
            className="w-12 h-12 shrink-0 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-900/50 disabled:text-cyan-700 text-black rounded-lg flex items-center justify-center transition-all disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </div>
      </footer>

      {error && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-red-950/90 text-red-400 rounded-lg border border-red-500/50 text-[10px] font-black uppercase shadow-2xl flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
}