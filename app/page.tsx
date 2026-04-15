'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Code, Play, Layout, Cpu, Sparkles, Terminal, ChevronRight } from 'lucide-react';

export default function AetherAI() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [code, setCode] = useState('// Your generated code will appear here...');
  const [logs, setLogs] = useState<{ type: string; message: string }[]>([]);
  const [previewContent, setPreviewContent] = useState<string | null>(null);

  const simulateGeneration = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setLogs([]);
    setCode('');

    const pushLog = (type: string, message: string) => {
      setLogs(prev => [...prev, { type, message }]);
    };

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      if (!res.body) throw new Error("No response body.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let finalCode = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const events = chunk.split("\n\n");
          
          for (const event of events) {
            if (event.startsWith("data: ")) {
              const dataStr = event.replace("data: ", "").trim();
              if (dataStr === "[DONE]") break;
              if (!dataStr) continue;

              try {
                const data = JSON.parse(dataStr);
                if (data.error) {
                  pushLog("error", data.error);
                  continue;
                }

                const { node, payload } = data;
                
                if (payload.messages && payload.messages.length > 0) {
                  const aiMsg = payload.messages[payload.messages.length - 1];
                  const msgContent = typeof aiMsg === "string" ? aiMsg : (aiMsg.content || aiMsg.kwargs?.content);
                  if (msgContent) pushLog(node, msgContent);
                }

                if (node === "frontend" && payload.frontend_code) {
                  finalCode = payload.frontend_code;
                  setCode(finalCode);
                }
              } catch (e) {
                console.error("Failed to parse chunk", e, dataStr);
              }
            }
          }
        }
      }
      
      if (finalCode) {
        setPreviewContent(finalCode);
      } else {
        setPreviewContent("Generation completed but no code was produced.");
      }
      pushLog('architect', 'Application blueprint successfully deployed.');
      
    } catch (error) {
      console.error(error);
      pushLog('error', 'Simulation failed due to network error.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="slite-container">
      {/* Sidebar / Left Pane */}
      <div className="pane-left">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <Cpu size={20} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white drop-shadow-md">Aether AI</h1>
        </div>

        <div className="command-bar">
          <Sparkles size={18} className="text-blue-500" />
          <input
            type="text"
            className="command-input"
            placeholder="Describe the app you want to build..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && simulateGeneration()}
          />
          <button 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={simulateGeneration}
            disabled={isGenerating}
          >
            <Send size={18} className={isGenerating ? 'text-gray-300' : 'text-blue-600'} />
          </button>
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto pr-2">
          <AnimatePresence>
            {logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`agent-bubble agent-${log.type} fade-in`}
              >
                <div className="flex items-center gap-2 font-mono text-xs uppercase mb-1 opacity-70">
                  {log.type === 'architect' && <Layout size={12} />}
                  {log.type === 'frontend' && <Code size={12} />}
                  {log.type === 'backend' && <Terminal size={12} />}
                  {log.type} agent
                </div>
                {log.message}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-auto">
          <div className="text-xs text-gray-400 font-mono flex items-center gap-2 mb-2">
            <Code size={12} /> GENERATED SOURCE
          </div>
          <div className="code-editor max-h-64">
            {code || '// Waiting for blueprint...'}
          </div>
        </div>
      </div>

      {/* Preview Pane / Right Pane */}
      <div className="pane-right">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium px-3 py-1 bg-white/10 text-white rounded-full shadow-sm flex items-center gap-2 border border-white/5">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
              Live Preview
            </div>
            <div className="text-xs text-white/50 flex items-center gap-1">
              <ChevronRight size={14} /> Localhost:3000
            </div>
          </div>
          <div className="flex gap-2">
            <button className="glass-btn text-xs py-1 px-3">
              <Play size={12} /> Refresh
            </button>
          </div>
        </div>

        <div className="preview-canvas flex-1 flex flex-col items-center justify-center p-8 text-center">
          {!previewContent ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-sm"
            >
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-lg">
                <Sparkles className="text-blue-400" size={32} />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-white">Your App Canvas</h2>
              <p className="text-gray-400 text-sm">
                Describe an application on the left to start the multi-agent generation process.
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full h-full text-left overflow-auto"
            >
              <div className="p-8 max-w-4xl mx-auto premium-card rounded-2xl">
                <h1 className="text-4xl font-bold mb-4 tracking-tight text-white border-b border-white/10 pb-4">
                  {prompt}
                </h1>
                <p className="text-blue-100/70 mb-8 text-lg font-light leading-relaxed">
                  This custom application was architected by Aether's multi-agent system, featuring optimized React components and a scalable backend skeleton.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {['Intelligent Routing', 'State Persistence', 'Premium Styling', 'API Integration'].map((feature, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ y: -5 }}
                      className="p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all cursor-default"
                    >
                      <div className={`w-10 h-10 rounded-lg mb-4 flex items-center justify-center text-white shadow-lg ${
                        i === 0 ? 'bg-blue-500' : 
                        i === 1 ? 'bg-indigo-500' : 
                        i === 2 ? 'bg-purple-500' : 'bg-pink-500'
                      }`}>
                        {i === 0 ? <Layout size={20} /> : 
                         i === 1 ? <Terminal size={20} /> : 
                         i === 2 ? <Sparkles size={20} /> : <Code size={20} />}
                      </div>
                      <h3 className="font-bold text-white mb-2">{feature}</h3>
                      <p className="text-sm text-blue-100/60 leading-relaxed">
                        A robust implementation component designed for performance and accessibility.
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-4 px-4 py-2 bg-black/20 rounded-lg border border-white/5 backdrop-blur-md">
           <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
            Aether Engine v1.0.4-beta
           </div>
           <div className="flex-1" />
           <div className="flex gap-2 items-center">
             <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
             <span className="text-[10px] font-mono text-gray-500">SYSTEM_READY</span>
           </div>
        </div>
      </div>
    </div>
  );
}
