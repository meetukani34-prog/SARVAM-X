import React, { useState } from "react";
import { api } from "../lib/api";
import type { DebugResponse } from "../lib/api";

const CodeOracle: React.FC = () => {
  const [codeInput, setCodeInput] = useState<string>("");
  const [language, setLanguage] = useState<string>("python");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DebugResponse | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeInput.trim()) return;
    
    setAnalyzing(true);
    try {
      const res = await api.debugCode(codeInput, language);
      setResult(res);
    } catch (err) {
      console.error("Failed to analyze code:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const bgCard = "bg-white/[0.02] border border-slate-900/[0.05] dark:border-white/[0.05] rounded-3xl shadow-xl shadow-slate-900/5 dark:shadow-black/20 backdrop-blur-3xl";

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn">
      <p className="text-center text-sm text-muted-foreground font-light -mt-2 mb-2">
        Drop your broken code. The Oracle detects, refines, and explains — in any language.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* Left: Code Input */}
        <div className={`${bgCard} p-0 flex flex-col overflow-hidden`}>
          <form onSubmit={handleAnalyze} className="flex-1 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-900/[0.05] dark:border-white/[0.05] bg-slate-900/[0.02] dark:bg-white/[0.02]">
              <div className="flex flex-wrap gap-2">
                {["python", "javascript", "typescript", "c++", "go"].map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang)}
                    className={`px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded-lg border transition-all ${
                      language === lang 
                        ? "bg-purple/20 border-purple/40 text-purple" 
                        : "border-transparent text-muted-foreground hover:bg-white/[0.05]"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
            
            <textarea
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              rows={16}
              className="w-full h-full bg-transparent p-4 text-xs font-mono text-purple outline-none resize-none"
              placeholder="Paste your vulnerable or broken code here..."
            />

            <div className="px-4 py-3 border-t border-slate-900/[0.05] dark:border-white/[0.05] flex justify-between items-center bg-slate-900/[0.02] dark:bg-white/[0.02]">
              <span className="text-[10px] font-mono text-muted-foreground">{codeInput.split('\n').length} lines</span>
              <button
                type="submit"
                disabled={analyzing || !codeInput.trim()}
                className="px-6 py-2 bg-purple text-slate-900 dark:text-white font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                {analyzing ? "Analyzing..." : "✦ Refine Code"}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Results */}
        <div className={`${bgCard} p-6 flex flex-col overflow-y-auto max-h-[600px]`}>
          <h3 className="text-xs font-bold uppercase tracking-widest text-purple mb-4">Oracle Analysis</h3>
          
          {!result ? (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground font-light text-center px-8">
              Awaiting code submission for multi-language AST scanning and vulnerability detection.
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl text-center">
                  <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Complexity</span>
                  <div className="text-lg font-black mt-1 text-slate-900 dark:text-white">{result.complexity || "Low"}</div>
                </div>
                <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl text-center">
                  <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Efficiency</span>
                  <div className="text-lg font-black mt-1 text-slate-900 dark:text-white">{result.efficiency || 100}%</div>
                </div>
              </div>

              {result.errors && result.errors.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-3">Detected Issues ({result.errors.length})</h4>
                  <div className="flex flex-col gap-3">
                    {result.errors.map((err, i) => (
                      <div key={i} className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-mono text-red-400 font-bold">Line {err.line}: {err.type}</span>
                          <span className="text-[8px] font-bold bg-red-500/20 text-red-400 px-2 py-0.5 rounded uppercase">{err.severity}</span>
                        </div>
                        <p className="text-xs text-slate-900 dark:text-white font-light">{err.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.fixes && result.fixes.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-3">Proposed Fixes</h4>
                  <div className="flex flex-col gap-3">
                    {result.fixes.map((fix, i) => (
                      <div key={i} className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                        <p className="text-xs text-slate-900 dark:text-white font-light mb-2">{fix.explanation}</p>
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                          <div className="bg-red-500/10 text-red-400 p-2 rounded line-through">{fix.original}</div>
                          <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded">{fix.replacement}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.xai_explanation && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 mb-3">XAI Explanation</h4>
                  <p className="text-xs text-slate-900 dark:text-white leading-relaxed font-light p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                    {result.xai_explanation}
                  </p>
                </div>
              )}

              {result.exec_out && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Terminal Output</h4>
                  <div className="text-[10px] text-slate-300 font-mono leading-relaxed p-4 bg-black/40 border border-slate-700/50 rounded-xl whitespace-pre-wrap">
                    {result.exec_out}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeOracle;
