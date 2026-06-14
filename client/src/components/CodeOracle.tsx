import React, { useState } from "react"
import { api, DebugResponse } from "../lib/api"

export default function CodeOracle() {
  const [codeInput, setCodeInput] = useState("print(hello)")
  const [language, setLanguage] = useState("Python")
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<DebugResponse | null>(null)

  const languages = [
    { id: "python", label: "Python" },
    { id: "javascript", label: "JavaScript" },
    { id: "typescript", label: "TypeScript" },
    { id: "java", label: "Java" },
    { id: "cpp", label: "C++" },
    { id: "c", label: "C" },
    { id: "go", label: "Go" },
    { id: "rust", label: "Rust" },
    { id: "sql", label: "SQL" },
    { id: "ruby", label: "Ruby" },
    { id: "php", label: "PHP" },
    { id: "kotlin", label: "Kotlin" },
    { id: "dsa", label: "DSA" }
  ]

  const handleRefine = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!codeInput.trim()) return

    setIsScanning(true)
    setResult(null)

    try {
      const res = await api.debugCode(codeInput, language.toLowerCase())
      setResult(res)
    } catch (err) {
      console.error(err)
    } finally {
      setIsScanning(false)
    }
  }

  const copyToClipboard = () => {
    if (result?.refined_code) {
      navigator.clipboard.writeText(result.refined_code)
    } else {
      navigator.clipboard.writeText(codeInput)
    }
  }

  // Determine line count
  const lineCount = codeInput.split("\n").length

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in pb-12">
      <div className="text-center mb-4 mt-6">
        <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Drop your broken code. The Oracle detects, refines, and explains — in any language.
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-6xl mx-auto">
        
        {/* LEFT PANEL: Editor */}
        <div className="flex flex-col">
          <div className="bg-white/60 dark:bg-[#0d1117]/60 backdrop-blur-md rounded-3xl border border-slate-200/50 dark:border-white/5 flex flex-col overflow-hidden shadow-xl shadow-slate-200/20 dark:shadow-none h-[400px]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white/40 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-semibold rounded-full">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                </svg>
                {language}
              </div>
              <div className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider text-purple bg-purple/10 uppercase">
                Void
              </div>
            </div>
            
            {/* Textarea */}
            <textarea
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              className="flex-1 w-full bg-transparent resize-none outline-none p-6 font-mono text-sm text-slate-800 dark:text-slate-200"
              spellCheck={false}
              placeholder="Paste your code here..."
            />

            {/* Footer */}
            <div className="px-4 py-3 bg-white/40 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">{lineCount} lines</span>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setCodeInput("")}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={handleRefine}
                  disabled={isScanning || !codeInput.trim()}
                  className="px-5 py-2 bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2"
                >
                  {isScanning ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.64 5.93h1.43v4.28h-1.43zM5.93 11.64h4.28v1.43H5.93zM18.07 11.64h-4.28v1.43h4.28zM11.64 18.07h1.43v-4.28h-1.43zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                    </svg>
                  )}
                  Refine Code
                </button>
              </div>
            </div>
          </div>

          {/* Language Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setLanguage(lang.label)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 border ${
                  language === lang.label
                    ? "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "bg-white/50 dark:bg-black/20 border-slate-200/50 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-white/5"
                }`}
              >
                {language === lang.label && (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                )}
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL: Results */}
        {result ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold text-sm">
                <svg className="w-4 h-4 text-purple" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                Refinement Complete
              </div>
              <div className="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full flex items-center gap-1">
                ✓ done
              </div>
            </div>

            {/* Refined Code Block */}
            <div className="bg-[#0d1117] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <svg className="w-3.5 h-3.5 text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                  Refined Code
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="px-3 py-1.5 bg-white text-black text-[10px] font-bold rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  Teleport to Clipboard
                </button>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-slate-300 leading-relaxed">
                  {(result.refined_code || codeInput).split('\n').map((line, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="text-slate-600 select-none w-4 text-right">{i + 1}</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </pre>
              </div>
            </div>

            {/* Annotations */}
            <div className="bg-blue-50/50 dark:bg-[#151b23] border border-blue-100 dark:border-slate-800 rounded-2xl p-4 mt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-500 mb-4">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                Oracle Annotations
              </div>
              
              <div className="flex flex-col gap-4">
                {result.fixes && result.fixes.length > 0 ? (
                  result.fixes.map((fix, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="shrink-0">
                        <span className="px-2 py-1 bg-purple/10 text-purple border border-purple/20 text-[10px] font-bold rounded-md whitespace-nowrap">
                          Line {(fix as any).line || '?'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {fix.explanation}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No issues detected. Your code looks perfect!</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex items-center justify-center h-full bg-slate-50/50 dark:bg-black/10 border border-slate-200/50 dark:border-white/5 rounded-3xl min-h-[400px]">
            <p className="text-sm text-slate-400 font-medium">Analysis results will appear here</p>
          </div>
        )}

      </div>
    </div>
  )
}
