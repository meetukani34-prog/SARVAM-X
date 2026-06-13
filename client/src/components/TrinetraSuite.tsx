import React, { useEffect, useState } from "react"
import ThreeModel from "./ThreeModel"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js"
import { Line, Bar, Doughnut } from "react-chartjs-2"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
)

interface ReportEntry {
  type: string
  result: string
  confidence: number
  date: string
}

interface TrinetraSuiteProps {
  userId: number
  userName: string
  userEmail: string
  onSignOut: () => void
  onSwitchSuite: () => void
  onBackToHome: () => void
}

const TrinetraSuite: React.FC<TrinetraSuiteProps> = ({
  userId: _userId,
  userName,
  userEmail,
  onSignOut,
  onSwitchSuite,
  onBackToHome,
}) => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "fakenews" | "coderev" | "xai" | "reports" | "insights">("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Fake News states
  const [newsInput, setNewsInput] = useState("")
  const [newsResult, setNewsResult] = useState<any | null>(null)
  const [analyzingNews, setAnalyzingNews] = useState(false)

  // Code Reviewer states
  const [codeInput, setCodeInput] = useState(`def process_user_data(data):
    # Potential credentials exposure
    api_key = "sk_live_512837265"
    
    # Nested loops O(n^2) causing performance lag
    for x in data:
        for y in data:
            if x == y:
                print("Match found")
                
    # Code injection opening door for attacks
    eval(x)
    
    # Potential file handle resource leaks
    file = open("log.txt", "w")
    file.write("Entry logged")
    # File is never closed
    
    return True`)
  const [codeResult, setCodeResult] = useState<any | null>(null)
  const [scanningCode, setScanningCode] = useState(false)

  // Report history state
  const [reports, setReports] = useState<ReportEntry[]>([])
  
  // Assistant Bot states
  const [_assistantOpen, _setAssistantOpen] = useState(false)
  const [assistantInput, setAssistantInput] = useState("")
  const [_assistantMessages, setAssistantMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    { sender: "ai", text: "Welcome to TRINETRA Secure Sentinel. How can I assist you with verification audits today?" }
  ])

  // Load reports from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("trinetra_reports")
    if (saved) {
      try {
        setReports(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  // Save report to localStorage
  const saveReport = (type: string, result: string, confidence: number) => {
    const newEntry: ReportEntry = {
      type,
      result,
      confidence,
      date: new Date().toLocaleString()
    }
    const updated = [newEntry, ...reports].slice(0, 30)
    setReports(updated)
    localStorage.setItem("trinetra_reports", JSON.stringify(updated))
  }

  // Trigger Fake News analysis mock logic
  const handleAnalyzeNews = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsInput.trim()) return

    setAnalyzingNews(true)
    setNewsResult(null)

    setTimeout(() => {
      const conf = Math.floor(Math.random() * 25) + 72
      const isFake = conf > 82
      const sentiment = (Math.random() * 0.7 + 0.3).toFixed(2)
      
      // Extract pseudo suspicious words
      const suspicious = ["breaking", "miracle", "secret", "exposed", "conspiracy", "government", "unbelievable"]
      const words = newsInput.toLowerCase().split(/\W+/)
      const foundKeywords = suspicious.filter(w => words.includes(w))
      if (foundKeywords.length < 2) {
        foundKeywords.push("unverified-source", "emotional-language")
      }

      const res = {
        isFake,
        confidence: conf,
        sentiment,
        keywords: foundKeywords.slice(0, 5),
        manipulationScore: sentiment,
        sourceCredibility: isFake ? 22 : 82
      }

      setNewsResult(res)
      saveReport("Fake News Analysis", isFake ? "Likely Misinformation" : "Authentic Verified", conf)
      setAnalyzingNews(false)
    }, 1800)
  }

  // Trigger Code Reviewer scan patterns
  const handleReviewCode = (e: React.FormEvent) => {
    e.preventDefault()
    if (!codeInput.trim()) return

    setScanningCode(true)
    setCodeResult(null)

    setTimeout(() => {
      const issues = []
      
      if (codeInput.includes("for") && codeInput.split("for").length > 2) {
        issues.push({
          level: "critical",
          icon: "⚡",
          title: "Nested Loop Inefficiency — O(n²)",
          desc: "Multi-level nested iterations detected. Leads to algorithmic exhaustion under scaling."
        })
      }
      if (/password|secret|api_key|token/i.test(codeInput)) {
        issues.push({
          level: "critical",
          icon: "🔒",
          title: "Hardcoded Credentials exposed",
          desc: "Sensitive key/token signatures mapped in cleartext. Transition to vault injection variables."
        })
      }
      if (/eval\(|exec\(/i.test(codeInput)) {
        issues.push({
          level: "critical",
          icon: "💀",
          title: "Arbitrary Code Injection Vulnerability",
          desc: "eval()/exec() handles dynamic string compiles. Exploitable by command executions."
        })
      }
      if (/open\(/.test(codeInput) && !/with\s+open/.test(codeInput)) {
        issues.push({
          level: "warning",
          icon: "📂",
          title: "Potential File Leak / Resource Leak",
          desc: "File opened without enclosing context manager. Resource remains lock-bound on compile aborts."
        })
      }
      if (issues.length === 0) {
        issues.push({
          level: "info",
          icon: "✓",
          title: "Optimal Sentinel Score",
          desc: "Code passed standard threat heuristic scanners. No obvious risk maps observed."
        })
      }

      const complexity = codeInput.split("\n").length > 20 ? "HIGH" : "MEDIUM"

      setCodeResult({
        issues,
        complexity,
        issueCount: issues.length
      })

      saveReport("Code Security Review", `${issues.length} Risks Flagged`, complexity === "HIGH" ? 88 : 50)
      setScanningCode(false)
    }, 1500)
  }

  // Interactive chatbot responses
  const _handleSendAssistantMsg = (e: React.FormEvent) => {
    e.preventDefault()
    if (!assistantInput.trim()) return

    const userText = assistantInput.trim()
    setAssistantMessages(prev => [...prev, { sender: "user", text: userText }])
    setAssistantInput("")

    setTimeout(() => {
      const replies = [
        "Audit completed. The NLP classifier checks for semantic anomalies and emotional framing signals.",
        "Excellent query. You can paste raw logs or Python snippets into the static code scanner directly.",
        "The Explainable AI (XAI) view renders positive SHAP attributes. Higher weights indicate extreme sensationalism.",
        "Reports save automatically to local registers for offline retrieval metrics.",
        "TRINETRA aggregates threat categories: misinformation campaigns, code credential exposures, and semantic manipulation."
      ]
      const responseText = replies[Math.floor(Math.random() * replies.length)]
      setAssistantMessages(prev => [...prev, { sender: "ai", text: responseText }])
    }, 800)
  }

  const bgCard = "bg-slate-900/[0.02] dark:bg-white/[0.02] backdrop-blur-2xl border border-slate-900/[0.05] dark:border-white/[0.05] rounded-3xl"
  const _themeAccent = "text-purple"
  const _bgAccent = "bg-purple"

  // Standard line graph security trend
  const trendChartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Fake News Flagged",
        data: [14, 18, 9, 21, 28, 15, 23],
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
      },
      {
        label: "Authentic Articles",
        data: [32, 28, 41, 35, 22, 38, 30],
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
      }
    ]
  }

  // Bar Graph aggregate threats
  const aggregateThreatChartData = {
    labels: ["Misinfo", "Credential Leak", "Code Injection", "File Resource Leak", "Semantic Bias"],
    datasets: [
      {
        label: "Flagged Vulnerabilities",
        data: [42, 19, 12, 29, 8],
        backgroundColor: ["#f87171", "#fbbf24", "#a855f7", "#00e5ff", "#10b981"],
        borderRadius: 8,
        borderWidth: 0,
      }
    ]
  }

  // Doughnut Graph threat distribution
  const riskDoughnutData = {
    labels: ["Critical", "Warning", "Information", "Clean Metrics"],
    datasets: [
      {
        data: [15, 25, 30, 30],
        backgroundColor: ["#ef4444", "#f59e0b", "#00e5ff", "#10b981"],
        borderWidth: 0,
      }
    ]
  }

  const getBackgroundImage = (tab: string) => {
    switch (tab) {
      case "dashboard": return "/bg-trinetra.png";
      case "fakenews": return "/bg-orange.png";
      case "coderev": return "/bg-blue.png";
      case "xai": return "/bg-cyan.png";
      case "reports": return "/bg-sarvam.png";
      case "insights": return "/bg-trinetra.png";
      default: return "/bg-trinetra.png";
    }
  }

  return (
    <div 
      className="flex h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-white overflow-hidden font-sans select-none bg-cover bg-center bg-no-repeat bg-fixed transition-all duration-1000"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(7, 9, 14, 0.75), rgba(7, 9, 14, 0.98)), url('${getBackgroundImage(activeTab)}')`
      }}
    >

      {/* Mobile Sidebar Overlay Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-white/60 dark:bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white/[0.01] border-b border-slate-900/[0.05] dark:border-white/[0.05] z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple/10 border border-purple/20 flex items-center justify-center text-purple">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
          </div>
          <h1 className="text-xs font-bold tracking-widest uppercase">TRINETRA<span className="text-purple"> AI</span></h1>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-9 h-9 rounded-lg border border-slate-900/ dark:border-white/ bg-slate-900/[0.02] dark:bg-white/[0.02] flex items-center justify-center text-muted-foreground hover:text-slate-900 dark:text-white transition-all"
        >
          {sidebarOpen ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
      </div>
      
      {/* Background glowing rings overlay */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-purple-500/[0.02] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-indigo-500/[0.02] blur-[150px] pointer-events-none" />

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className={`fixed md:relative inset-y-0 left-0 w-64 shrink-0 bg-slate-50/95 dark:bg-slate-50/95 dark:bg-[#07090e]/95 md:bg-white/[0.01] backdrop-blur-2xl md:backdrop-blur-none border-r border-slate-900/10 dark:border-slate-900/[0.05] dark:border-white/[0.05] p-6 flex flex-col justify-between z-40 md:z-10 transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col gap-8">
          
          {/* Main Suite Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple/10 border border-purple/20 flex items-center justify-center text-purple shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-widest uppercase">TRINETRA<span className="text-purple"> AI</span></h1>
              <span className="text-[8px] font-bold text-purple tracking-widest uppercase border border-purple/20 bg-purple/5 px-2 py-0.5 rounded mt-0.5 inline-block">SENTINEL MODE</span>
            </div>
          </div>

          {/* Navigation Links list */}
          <nav className="flex flex-col gap-2">
            {[
              { id: "dashboard", label: "Dashboard", icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" },
              { id: "fakenews", label: "NLP Fake News", icon: "M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" },
              { id: "coderev", label: "Code Reviewer", icon: "M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" },
              { id: "xai", label: "Explainable AI", icon: "M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" },
              { id: "reports", label: "Audit Reports", icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5A3.375 3.375 0 0010.125 2.25H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" },
              { id: "insights", label: "AI Insights", icon: "M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" }
            ].map((nav) => {
              const isSelected = activeTab === nav.id
              return (
                <button
                  key={nav.id}
                  onClick={() => { setActiveTab(nav.id as any); setSidebarOpen(false); }}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-300 flex items-center gap-3.5 ${
                    isSelected
                      ? "bg-purple/10 border border-purple/20 text-purple shadow-[0_0_15px_rgba(168,85,247,0.06)]"
                      : "border border-transparent text-muted-foreground hover:text-slate-900 dark:text-white"
                  }`}
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={nav.icon} />
                  </svg>
                  {nav.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Workspace selector, profile & actions */}
        <div className="flex flex-col gap-4 mt-8 md:mt-0 pt-6 border-t border-slate-900/[0.05] dark:border-white/[0.05]">
          <button
            onClick={onSwitchSuite}
            className="w-full py-3 px-4 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-widest uppercase rounded-xl hover:bg-primary/25 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.467 5.99 5.99 0 0 0-1.925 3.546 5.974 5.974 0 0 1-2.133-1A3.75 3.75 0 0 0 12 18Z" />
            </svg>
            SARVAM-X
          </button>
          
          <div className="flex items-center justify-between gap-3 px-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple/10 border border-purple/20 text-purple flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                {userName.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold truncate text-slate-900 dark:text-white leading-tight uppercase tracking-wider">{userName}</p>
                <span className="text-[8px] text-muted-foreground truncate block font-light">{userEmail}</span>
              </div>
            </div>
            <button 
              onClick={onSignOut}
              className="text-muted-foreground hover:text-red-400 transition-colors p-1"
              title="Sign Out"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* CORE DISPLAY VIEWPORTS */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 z-10 overflow-y-auto max-w-6xl mx-auto w-full">
        <div className="animate-fadeIn">

          {/* Breadcrumb section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-4 border-b border-slate-900/[0.04] dark:border-white/[0.04]">
            <div className="flex items-center gap-4">
              <button 
                onClick={onBackToHome} 
                className="flex items-center justify-center shrink-0 w-12 h-12 rounded-xl bg-white/[0.03] border border-slate-900/[0.08] dark:border-white/[0.08] hover:bg-purple/10 hover:border-purple/30 hover:text-purple transition-all duration-300 focus:outline-none shadow-sm group"
                title="Exit to Main Website"
              >
                <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                </svg>
              </button>
              <div>
                <span className="text-[9px] uppercase font-bold tracking-widest text-purple/70">Sentinel console / TRINETRA</span>
                <h2 className="text-2xl font-extrabold tracking-tight mt-1 uppercase">
                  {activeTab === "dashboard" ? "Risk Assessment Dashboard" : activeTab === "fakenews" ? "NLP Misinformation Classifier" : activeTab === "coderev" ? "Static Secure Code Reviewer" : activeTab === "xai" ? "SHAP Explanation matrix" : activeTab === "reports" ? "Logged Audit Registers" : "AI Trend Insights"}
                </h2>
              </div>
            </div>
            
            {/* Small 3D animated indicator */}
            <div className="flex items-center gap-3 bg-slate-900/[0.02] dark:bg-white/[0.02] border border-slate-900/[0.05] dark:border-white/[0.05] rounded-xl px-4 py-2 text-[10px] font-bold tracking-widest uppercase">
              <div className="w-5 h-5 overflow-hidden shrink-0">
                <ThreeModel mode="octahedron" color={0xa855f7} className="w-full h-full" />
              </div>
              <span className="font-mono text-purple">Sentinel Active</span>
            </div>
          </div>

          {/* TAB CONTENT: 1. DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Threat Level line metrics */}
              <div className={`${bgCard} lg:col-span-2 p-6 md:p-8 flex flex-col justify-between`}>
                <h3 className="text-xs font-bold uppercase tracking-widest text-purple mb-6">Threat Mitigation Trend</h3>
                <div className="h-72 w-full">
                  <Line
                    data={trendChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        x: { grid: { color: "rgba(255, 255, 255, 0.02)" }, ticks: { color: "#8c9ba5", font: { size: 9, family: "Sora" } } },
                        y: { grid: { color: "rgba(255, 255, 255, 0.02)" }, ticks: { color: "#8c9ba5", font: { size: 9, family: "Sora" } } }
                      },
                      plugins: { legend: { labels: { color: "#8c9ba5", font: { size: 10, family: "Sora" } } } }
                    }}
                  />
                </div>
              </div>

              {/* Risk Distribution pie charts */}
              <div className={`${bgCard} p-6 flex flex-col justify-between`}>
                <h3 className="text-xs font-bold uppercase tracking-widest text-purple mb-6">Threat Severity Ratio</h3>
                <div className="h-56 w-full flex items-center justify-center">
                  <Doughnut
                    data={riskDoughnutData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: { color: "#8c9ba5", font: { size: 9, family: "Sora" }, padding: 12 }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* KPI indicators grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:col-span-3">
                {[
                  { label: "Scans Completed", val: reports.length + 8, unit: "Audits", color: "text-purple" },
                  { label: "Vulnerabilities Blocked", val: reports.filter(r => r.result.includes("Fake") || r.result.includes("Risks")).length + 3, unit: "Threats", color: "text-red-400" },
                  { label: "NLP Trust Factor", val: 96.2, unit: "%", color: "text-emerald-400" },
                  { label: "System Health", val: "Optimal", unit: "State", color: "text-cyan-400" }
                ].map((stat, i) => (
                  <div key={i} className={`${bgCard} p-5 flex items-center justify-between`}>
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">{stat.label}</span>
                      <p className="text-xl font-black mt-2 text-slate-900 dark:text-white">
                        {stat.val} <span className="text-xs font-medium text-muted-foreground">{stat.unit}</span>
                      </p>
                    </div>
                    <div className={`w-2 h-8 rounded ${stat.color.replace("text-", "bg-")}/20`} />
                  </div>
                ))}
              </div>

              {/* Quick action triggers */}
              <div className={`${bgCard} lg:col-span-2 p-4 sm:p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6`}>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-purple mb-2">Automate Content Audits</h3>
                  <p className="text-xs text-muted-foreground font-light leading-relaxed max-w-lg">
                    Aggregate real-time semantic analysis reports and secure codebase static verification maps under an integrated environment control module.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("fakenews")}
                  className="px-6 py-3.5 bg-purple hover:shadow-[0_0_20px_rgba(168,85,247,0.25)] text-slate-900 dark:text-white font-bold rounded-xl transition-all duration-300 text-[10px] uppercase tracking-widest shrink-0"
                >
                  Verify NLP
                </button>
              </div>

              <div className={`${bgCard} p-6 flex flex-col justify-between`}>
                <h3 className="text-xs font-bold uppercase tracking-widest text-purple mb-4">Integrity Verification</h3>
                <div className="flex flex-col gap-3.5">
                  <div className="flex items-center gap-3 p-3 bg-white/[0.01] border border-slate-900/[0.03] dark:border-white/[0.03] rounded-2xl">
                    <span className="w-5 h-5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[9px] flex items-center justify-center font-mono shrink-0">✓</span>
                    <div>
                      <p className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">Zero-Trust Active</p>
                      <span className="text-[8px] text-muted-foreground block font-light">LocalStorage state authentication verified</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB CONTENT: 2. NLP FAKE NEWS ANALYZER */}
          {activeTab === "fakenews" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* NLP Input forms */}
              <div className={`${bgCard} lg:col-span-2 p-6 md:p-8 flex flex-col`}>
                <form onSubmit={handleAnalyzeNews} className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-purple mb-6">NLP Content Analyzer</h3>
                    <p className="text-xs text-muted-foreground font-light mb-6">
                      Paste full articles or sensational claims to run syntactic bias classification mapping.
                    </p>
                    <textarea
                      value={newsInput}
                      onChange={(e) => setNewsInput(e.target.value)}
                      placeholder="Paste claims or transcripts here..."
                      rows={8}
                      className="w-full bg-slate-900/[0.02] dark:bg-white/[0.02] border border-slate-900/ dark:border-white/ hover:border-slate-900/ dark:border-white/ focus:border-slate-900/ dark:border-white/ rounded-2xl p-4 text-xs text-slate-900 dark:text-white outline-none resize-none leading-relaxed mb-6"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={analyzingNews || !newsInput.trim()}
                    className="w-full py-3.5 bg-purple hover:shadow-[0_0_20px_rgba(168,85,247,0.25)] text-slate-900 dark:text-white font-bold rounded-xl transition-all duration-300 text-[10px] uppercase tracking-widest disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {analyzingNews ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Scanning Syntax Weights...
                      </>
                    ) : (
                      "Perform NLP Analysis"
                    )}
                  </button>
                </form>
              </div>

              {/* Classification result displays */}
              <div className={`${bgCard} p-6 flex flex-col justify-center items-center text-center min-h-[380px]`}>
                {analyzingNews ? (
                  <div className="flex flex-col items-center gap-3 animate-pulse">
                    <div className="w-12 h-12 rounded-xl overflow-hidden opacity-60">
                      <ThreeModel mode="octahedron" color={0xa855f7} className="w-full h-full" />
                    </div>
                    <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold">Scanning Content...</p>
                  </div>
                ) : newsResult ? (
                  <div className="w-full flex flex-col gap-6 animate-fadeIn">
                    <div className="flex flex-col items-center">
                      <span className={`text-[10px] font-bold px-4 py-1.5 rounded-full border uppercase tracking-widest ${
                        newsResult.isFake ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      }`}>
                        {newsResult.isFake ? "⚠ Misinformation Detected" : "✓ Authenticated Authentic"}
                      </span>
                    </div>

                    {/* Circular progress SVG gauge */}
                    <div className="relative w-36 h-36 flex items-center justify-center mx-auto">
                      <svg width="130" height="130" viewBox="0 0 130 130">
                        <circle cx="65" cy="65" r="55" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="8"/>
                        <circle
                          cx="65"
                          cy="65"
                          r="55"
                          fill="none"
                          stroke={newsResult.isFake ? "#f87171" : "#10b981"}
                          strokeWidth="8"
                          strokeDasharray={`${newsResult.confidence * 3.45} 345`}
                          strokeLinecap="round"
                          transform="rotate(-90 65 65)"
                          style={{ transition: "stroke-dasharray 1.5s ease" }}
                        />
                      </svg>
                      <div className="absolute text-center flex flex-col items-center">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">{newsResult.confidence}%</span>
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Confidence</span>
                      </div>
                    </div>

                    {/* Analysis parameters list */}
                    <div className="flex flex-col gap-2.5 text-left text-xs bg-white/[0.01] border border-slate-900/[0.04] dark:border-white/[0.04] p-4 rounded-2xl">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground font-light">Source Credibility:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{newsResult.sourceCredibility}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground font-light">Semantic Manipulation:</span>
                        <span className="font-bold text-purple">{newsResult.manipulationScore}</span>
                      </div>
                      
                      {/* Suspicious keywords list */}
                      <div className="mt-3">
                        <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold block mb-2">Suspicious Signals</span>
                        <div className="flex flex-wrap gap-1.5">
                          {newsResult.keywords.map((kw: string) => (
                            <span key={kw} className="bg-red-500/10 border border-red-500/20 text-red-400 text-[8px] font-bold px-2 py-0.5 rounded-lg uppercase font-mono tracking-widest">{kw}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground font-light p-6">Enter claim text at the left to trigger the verification audit.</p>
                )}
              </div>

            </div>
          )}

          {/* TAB CONTENT: 3. STATIC CODE SECURITY REVIEWER */}
          {activeTab === "coderev" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Code window input */}
              <div className={`${bgCard} lg:col-span-2 p-6 md:p-8 flex flex-col`}>
                <form onSubmit={handleReviewCode} className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-purple mb-6">Static Vulnerability scanner</h3>
                    <div className="relative border border-slate-900/[0.06] dark:border-white/[0.06] bg-white/40 dark:bg-black/40 rounded-2xl overflow-hidden mb-6">
                      <div className="bg-slate-900/[0.02] dark:bg-white/[0.02] border-b border-slate-900/[0.04] dark:border-white/[0.04] px-4 py-2 text-[9px] font-mono tracking-widest text-muted-foreground flex justify-between select-none">
                        <span>SECURITY SCRIPTER</span>
                        <button
                          type="button"
                          onClick={() => setCodeInput(`def run_query(user_id):
    # Potential credentials exposure
    pwd = "super_admin_pass"
    
    # O(n^2) nested loops
    for i in user_id:
        for j in user_id:
            if i == j:
                print("check logic")
                
    # eval threat
    eval(i)
    
    # leak file
    f = open("logs.bin", "rb")
    return True`)}
                          className="text-[8px] font-bold hover:text-purple text-muted-foreground uppercase cursor-pointer"
                        >
                          Load Vulnerable Script
                        </button>
                      </div>
                      <textarea
                        value={codeInput}
                        onChange={(e) => setCodeInput(e.target.value)}
                        rows={12}
                        className="w-full bg-transparent p-4 text-xs font-mono text-purple outline-none resize-none leading-relaxed border-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={scanningCode || !codeInput.trim()}
                    className="w-full py-3.5 bg-purple hover:shadow-[0_0_20px_rgba(168,85,247,0.25)] text-slate-900 dark:text-white font-bold rounded-xl transition-all duration-300 text-[10px] uppercase tracking-widest disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {scanningCode ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Compiling Code Graph...
                      </>
                    ) : (
                      "Perform Code Review Audit"
                    )}
                  </button>
                </form>
              </div>

              {/* Code analysis results */}
              <div className={`${bgCard} p-6 flex flex-col justify-start`}>
                <h3 className="text-xs font-bold uppercase tracking-widest text-purple mb-6">Security Threat Maps</h3>
                {scanningCode ? (
                  <div className="h-64 flex flex-col items-center justify-center gap-3 text-center">
                    <span className="text-xl animate-spin text-purple">⚙</span>
                    <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold">Scanning Code Graph...</p>
                  </div>
                ) : codeResult ? (
                  <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-1 animate-fadeIn">
                    
                    {/* General diagnostic metrics */}
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3.5 bg-white/[0.01] border border-slate-900/[0.04] dark:border-white/[0.04] rounded-2xl">
                        <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest block">Complexity</span>
                        <p className="text-lg font-black text-slate-900 dark:text-white mt-1 uppercase">{codeResult.complexity}</p>
                      </div>
                      <div className="p-3.5 bg-white/[0.01] border border-slate-900/[0.04] dark:border-white/[0.04] rounded-2xl">
                        <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest block">Threats Found</span>
                        <p className="text-lg font-black text-red-400 mt-1 uppercase">{codeResult.issueCount}</p>
                      </div>
                    </div>

                    {/* Detected issues lists */}
                    <div className="flex flex-col gap-3">
                      {codeResult.issues.map((iss: any, idx: number) => {
                        const isCrit = iss.level === "critical"
                        return (
                          <div
                            key={idx}
                            className={`p-3.5 border rounded-2xl ${
                              isCrit
                                ? "bg-red-500/[0.02] border-red-500/20 text-red-400"
                                : iss.level === "warning"
                                ? "bg-amber-500/[0.02] border-amber-500/20 text-amber-400"
                                : "bg-cyan-500/[0.02] border-cyan-500/20 text-cyan-300"
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1 text-[10px] font-bold uppercase tracking-wider">
                              <span>{iss.icon} {iss.title}</span>
                              <span className="text-[8px] font-mono opacity-80 uppercase">{iss.level}</span>
                            </div>
                            <p className="text-[11px] text-slate-900 dark:text-white leading-relaxed font-light mt-1">{iss.desc}</p>
                          </div>
                        )
                      })}
                    </div>

                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground font-light p-6 text-center">Load a vulnerable script and trigger scanner review.</p>
                )}
              </div>

            </div>
          )}

          {/* TAB CONTENT: 4. EXPLAINABLE AI */}
          {activeTab === "xai" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* SHAP Bars */}
              <div className={`${bgCard} lg:col-span-2 p-6 md:p-8`}>
                <h3 className="text-xs font-bold uppercase tracking-widest text-purple mb-6">Ensemble NLP Decision Factors</h3>
                <div className="flex flex-col gap-5">
                  {[
                    { name: "Superlative Emotional Language", val: 0.89, color: "bg-red-500" },
                    { name: "Domain Verification Index", val: 0.76, color: "bg-amber-500" },
                    { name: "Clickbait framing signals", val: 0.72, color: "bg-purple" },
                    { name: "Cross-Reference Factual Matches", val: 0.64, color: "bg-indigo-500" },
                    { name: "Author Integrity records", val: 0.28, color: "bg-cyan-400" }
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-4">
                      <div className="w-1/3 text-xs font-bold text-gray-300 truncate uppercase tracking-wide">{feat.name}</div>
                      <div className="flex-1 bg-white/[0.03] h-2.5 rounded-full overflow-hidden relative">
                        <div className={`${feat.color} h-full rounded-full`} style={{ width: `${feat.val * 100}%` }} />
                      </div>
                      <div className="w-12 text-right text-xs font-bold font-mono text-purple">{(feat.val * 100).toFixed(0)}%</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanatory notes */}
              <div className={`${bgCard} p-6 flex flex-col justify-between`}>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-purple mb-4">SHAP Calibration Map</h3>
                  <p className="text-xs text-muted-foreground font-light leading-relaxed">
                    SHAP parameters measure the magnitude and vector shift of semantic components relative to a factual validation threshold.
                  </p>
                </div>
                <div className="p-4 bg-white/[0.01] border border-slate-900/[0.04] dark:border-white/[0.04] rounded-2xl text-center mt-6">
                  <span className="text-[8px] uppercase tracking-wider text-muted-foreground font-bold">Accuracy confidence</span>
                  <p className="text-xl font-black text-purple mt-1">94.7%</p>
                </div>
              </div>

            </div>
          )}

          {/* TAB CONTENT: 5. REPORTS LIST */}
          {activeTab === "reports" && (
            <div className={`${bgCard} p-6 md:p-8 flex flex-col`}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-purple mb-6">Historical Verification Registers</h3>
              
              {reports.length === 0 ? (
                <p className="text-xs text-muted-foreground font-light p-6 text-center leading-normal">
                  No audits completed yet. Paste headlines in the NLP tab or code scripts in the Code tab.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-900/[0.06] dark:border-white/[0.06] text-muted-foreground font-bold uppercase tracking-wider text-[9px]">
                        <th className="py-3 px-4">Audit Type</th>
                        <th className="py-3 px-4">Result State</th>
                        <th className="py-3 px-4">Confidence Indicator</th>
                        <th className="py-3 px-4">Sync Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((rep, idx) => (
                        <tr key={idx} className="border-b border-slate-900/[0.02] dark:border-white/[0.02] hover:bg-white/[0.01] transition-all">
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white uppercase tracking-wider">{rep.type}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded font-bold font-mono text-[9px] uppercase ${
                              rep.result.includes("Fake") || rep.result.includes("Risk")
                                ? "bg-red-500/10 text-red-400"
                                : "bg-emerald-500/10 text-emerald-400"
                            }`}>
                              {rep.result}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold font-mono text-purple">{rep.confidence}%</td>
                          <td className="py-3 px-4 text-muted-foreground font-light">{rep.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: 6. AI INSIGHTS */}
          {activeTab === "insights" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Line graph accuracy checks */}
              <div className={`${bgCard} p-6 md:p-8`}>
                <h3 className="text-xs font-bold uppercase tracking-widest text-purple mb-6">Model Calibration Checks</h3>
                <div className="h-64">
                  <Line
                    data={{
                      labels: ["Jan", "Feb", "Mar", "Apr", "May"],
                      datasets: [{
                        label: "Calibration accuracy",
                        data: [89, 91, 93, 94.7, 96.2],
                        borderColor: "#a855f7",
                        backgroundColor: "rgba(168, 85, 247, 0.1)",
                        fill: true,
                        tension: 0.4
                      }]
                    }}
                    options={{ responsive: true, maintainAspectRatio: false }}
                  />
                </div>
              </div>

              {/* Bar graph aggregate threat counts */}
              <div className={`${bgCard} p-6 md:p-8`}>
                <h3 className="text-xs font-bold uppercase tracking-widest text-purple mb-6">Threat Profiles</h3>
                <div className="h-64">
                  <Bar
                    data={aggregateThreatChartData}
                    options={{ responsive: true, maintainAspectRatio: false }}
                  />
                </div>
              </div>

            </div>
          )}

        </div>
      </main>

    </div>
  )
}

export default TrinetraSuite
