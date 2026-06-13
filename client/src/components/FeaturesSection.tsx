import React from "react"

interface FeatureItem {
  title: string
  desc: string
  colorClass: string
  iconBg: string
  icon: React.ReactNode
}

const FeaturesSection: React.FC = () => {
  const features: FeatureItem[] = [
    {
      title: "Neural Processing Engine",
      desc: "Multi-layer cognitive architectures for deep analysis. Processes behavioral patterns, code structures, and text semantics through ensemble ML models.",
      colorClass: "text-primary",
      iconBg: "bg-primary/10 border-primary/20",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21M6.75 6.75h10.5a2.25 2.25 0 0 1 2.25 2.25v10.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V9a2.25 2.25 0 0 1 2.25-2.25Z" />
        </svg>
      ),
    },
    {
      title: "Threat Intelligence & NLP",
      desc: "Sentinel-grade detection: static code vulnerability scanning, fake news credibility analysis, and real-time risk classification powered by transformer models.",
      colorClass: "text-purple",
      iconBg: "bg-purple/10 border-purple/20",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
        </svg>
      ),
    },
    {
      title: "Explainable AI (XAI)",
      desc: "Complete decision transparency. SHAP values, feature importance graphs, confidence distributions, and step-by-step reasoning narratives for every AI output.",
      colorClass: "text-cyan-400",
      iconBg: "bg-cyan-400/10 border-cyan-400/20",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      ),
    },
    {
      title: "Digital Twin Simulation",
      desc: "Maps cognitive profiles with predictive modeling. What-if projections, skill trajectory analytics, and personalized AI coaching through dynamic twin synchronization.",
      colorClass: "text-emerald-400",
      iconBg: "bg-emerald-400/10 border-emerald-400/20",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      ),
    },
    {
      title: "Multi-Language Debugger",
      desc: "Heuristic code analysis across 11+ languages. Real-time execution traces, error detection with line-level annotations, and AI-suggested fixes with explanations.",
      colorClass: "text-amber-400",
      iconBg: "bg-amber-400/10 border-amber-400/20",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
      ),
    },
    {
      title: "Zero-Trust Security",
      desc: "Enterprise authentication, encrypted data pipelines, session-scoped access control, and secure API architecture ensuring complete data integrity at every layer.",
      colorClass: "text-rose-400",
      iconBg: "bg-rose-400/10 border-rose-400/20",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
      ),
    },
  ]

  return (
    <section id="features" className="relative py-16 sm:py-28 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center z-10">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.02] blur-[200px] pointer-events-none" />

      {/* Title */}
      <div className="text-center max-w-2xl mb-12 sm:mb-20">
        <span className="inline-block text-[10px] uppercase font-bold tracking-[0.2em] text-purple/80 border border-purple/15 bg-purple/5 px-4 py-1.5 rounded-full mb-5">
          Capabilities
        </span>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
          Powered By{" "}
          <span className="bg-gradient-to-r from-purple to-primary bg-clip-text text-transparent">
            Advanced AI
          </span>
        </h2>
        <p className="text-muted-foreground text-sm md:text-base font-light leading-relaxed">
          Six core AI pillars combining SARVAM-X cognitive learning with SENTINEL-grade enterprise security infrastructure.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
        {features.map((feat, idx) => (
          <div
            key={idx}
            className="group relative rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-sm p-5 sm:p-7 overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-1 hover:border-white/[0.12] hover:bg-white/[0.04] hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-purple to-cyan-400 opacity-0 group-hover:opacity-60 transition-opacity duration-500" />

            {/* Icon */}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-5 ${feat.iconBg} ${feat.colorClass} transition-all duration-300 group-hover:scale-110`}>
              {feat.icon}
            </div>

            {/* Text */}
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2.5">{feat.title}</h3>
            <p className="text-xs text-muted-foreground/70 leading-relaxed font-light flex-1">{feat.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default FeaturesSection
