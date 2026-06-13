import React, { useEffect, useState } from "react"

interface PlatformSelectorProps {
  onNavigate: (view: "landing" | "auth" | "sarvam" | "trinetra", platform?: "sarvam" | "trinetra") => void
}

const PlatformSelector: React.FC<PlatformSelectorProps> = ({ onNavigate }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLoggedIn(!!localStorage.getItem("sarvam_uid"))
    }
  }, [])

  const handleEnterPlatform = (targetPlatform: "sarvam" | "trinetra") => {
    if (isLoggedIn) {
      onNavigate(targetPlatform)
    } else {
      onNavigate("auth", targetPlatform)
    }
  }

  return (
    <section id="platforms" className="relative py-16 sm:py-28 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center z-10">
      {/* Background Accents */}
      <div className="absolute top-1/3 left-0 w-[500px] h-[500px] rounded-full bg-primary/[0.03] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] rounded-full bg-purple/[0.03] blur-[150px] pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-2xl mb-20">
        <span className="inline-block text-[10px] uppercase font-bold tracking-[0.2em] text-primary/80 border border-primary/15 bg-primary/5 px-4 py-1.5 rounded-full mb-5">
          Choose Your Suite
        </span>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
          Two Platforms.{" "}
          <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
            One Mission.
          </span>
        </h2>
        <p className="text-muted-foreground text-sm md:text-base font-light leading-relaxed">
          Access specialized intelligence suites for cognitive learning analysis, enterprise security operations, 
          and automated AI-powered verification — all built on shared neural architecture.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
        {/* SARVAM-X Card */}
        <div className="group relative rounded-3xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-xl overflow-hidden transition-all duration-700 hover:-translate-y-3 hover:border-primary/25 hover:shadow-[0_30px_80px_rgba(0,0,0,0.5),_0_0_60px_rgba(34,197,94,0.06)]">
          {/* Top accent bar */}
          <div className="h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Corner Glow */}
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-primary/8 blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />

          <div className="p-5 sm:p-8 md:p-10">
            {/* Header Area */}
            <div className="flex items-start gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] transition-all duration-500">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.467 5.99 5.99 0 0 0-1.925 3.546 5.974 5.974 0 0 1-2.133-1A3.75 3.75 0 0 0 12 18Z" />
                </svg>
              </div>
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
                  <h3 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wide text-slate-900 dark:text-white">
                    SARVAM<span className="text-primary">-X</span>
                  </h3>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-primary border border-primary/20 bg-primary/5 px-2.5 py-1 rounded-full">
                    Education
                  </span>
                </div>
                <p className="text-sm font-semibold text-muted-foreground">
                  Explainable AI Learning Twin
                </p>
              </div>
            </div>

            <p className="text-sm font-light text-muted-foreground/80 leading-relaxed mb-8">
              Creates a digital twin of a student's cognitive progress, auto-debugs code with heuristic trace analysis across 11 languages, 
              and breaks down neural decisions into transparent SHAP-based reasoning. Powered by 
              enterprise-grade security infrastructure and zero-trust architecture.
            </p>

            {/* Feature Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2.5 sm:gap-y-3 mb-8 sm:mb-10">
              {[
                "Digital Twin Cognitive Simulation",
                "Multi-Language Code Debugger",
                "SHAP Explainable AI Panel",
                "Dynamic Skill Heatmap Matrix",
                "Luminous Mentor Voice AI",
                "Real-time Session Analytics",
                "What-If Scenario Projections",
                "Enterprise Zero-Trust Auth"
              ].map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span className="text-[11px] text-muted-foreground/90 font-medium leading-snug">{feat}</span>
                </div>
              ))}
            </div>

            {/* Action */}
            <button
              onClick={() => handleEnterPlatform("sarvam")}
              className="group/btn relative w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl transition-all duration-300 hover:shadow-[0_10px_40px_rgba(34,197,94,0.3)] flex items-center justify-center gap-3 text-center text-sm uppercase tracking-widest select-none overflow-hidden cursor-pointer"
            >
              <span className="relative z-10">{isLoggedIn ? "Go to Dashboard" : "Enter SARVAM-X"}</span>
              <svg className="w-4 h-4 relative z-10 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-emerald-500 to-primary opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
            </button>
          </div>
        </div>

        {/* TRINETRA AI Card */}
        <div className="group relative rounded-3xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-xl overflow-hidden transition-all duration-700 hover:-translate-y-3 hover:border-purple/25 hover:shadow-[0_30px_80px_rgba(0,0,0,0.5),_0_0_60px_rgba(168,85,247,0.06)]">
          {/* Top accent bar */}
          <div className="h-[2px] bg-gradient-to-r from-transparent via-purple to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Corner Glow */}
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-purple/8 blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />

          <div className="p-5 sm:p-8 md:p-10">
            {/* Header Area */}
            <div className="flex items-start gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-purple/10 border border-purple/20 flex items-center justify-center text-purple shrink-0 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all duration-500">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
                  <h3 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wide text-slate-900 dark:text-white">
                    TRINETRA<span className="text-purple"> AI</span>
                  </h3>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-purple border border-purple/20 bg-purple/5 px-2.5 py-1 rounded-full">
                    Security
                  </span>
                </div>
                <p className="text-sm font-semibold text-muted-foreground">
                  Intelligent Verification & Security Engine
                </p>
              </div>
            </div>

            <p className="text-sm font-light text-muted-foreground/80 leading-relaxed mb-8">
              Advanced sentinel-grade verification platform. Utilizes multi-layer NLP for misinformation detection, 
              static analysis scanners for vulnerability prediction, and AI-powered surveillance analytics. 
              Built for enterprise threat intelligence with real-time monitoring dashboards.
            </p>

            {/* Feature Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2.5 sm:gap-y-3 mb-8 sm:mb-10">
              {[
                "NLP Fake News Analyzer",
                "AI Code Reviewer & Scanner",
                "Confidence Radar Graphs",
                "SHAP Decision Explainer",
                "Real-time Threat Monitoring",
                "AI-Powered Surveillance",
                "Security Alert Dashboard",
                "Automated Risk Assessment"
              ].map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-purple shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span className="text-[11px] text-muted-foreground/90 font-medium leading-snug">{feat}</span>
                </div>
              ))}
            </div>

            {/* Action */}
            <button
              onClick={() => handleEnterPlatform("trinetra")}
              className="group/btn relative w-full py-4 bg-purple text-purple-foreground font-bold rounded-xl transition-all duration-300 hover:shadow-[0_10px_40px_rgba(168,85,247,0.3)] flex items-center justify-center gap-3 text-center text-sm uppercase tracking-widest select-none overflow-hidden cursor-pointer"
            >
              <span className="relative z-10">{isLoggedIn ? "Go to Dashboard" : "Enter TRINETRA AI"}</span>
              <svg className="w-4 h-4 relative z-10 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-r from-purple via-violet-500 to-purple opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PlatformSelector
