import React from "react"

const steps = [
  {
    step: "01",
    title: "Authenticate & Profile",
    desc: "Sign in with enterprise-grade auth. Your cognitive profile is initialized and your digital twin begins learning.",
    color: "text-primary border-primary/20 bg-primary/5",
    glow: "bg-primary/10",
  },
  {
    step: "02",
    title: "Choose Your Platform",
    desc: "Access SARVAM-X for cognitive learning analytics or TRINETRA AI for security verification and threat intelligence.",
    color: "text-purple border-purple/20 bg-purple/5",
    glow: "bg-purple/10",
  },
  {
    step: "03",
    title: "AI Processes & Learns",
    desc: "Our neural models analyze your inputs — code, text, or behavior patterns — using SHAP-driven explainable AI pipelines.",
    color: "text-cyan-400 border-cyan-400/20 bg-cyan-400/5",
    glow: "bg-cyan-400/10",
  },
  {
    step: "04",
    title: "Insights & Action",
    desc: "Receive transparent AI decisions, heatmap analytics, threat reports, and actionable recommendations in real time.",
    color: "text-emerald-400 border-emerald-400/20 bg-emerald-400/5",
    glow: "bg-emerald-400/10",
  },
]

const HowItWorks: React.FC = () => {
  return (
    <section id="workflow" className="relative py-28 px-6 md:px-12 max-w-6xl mx-auto z-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-20">
        <span className="inline-block text-[10px] uppercase font-bold tracking-[0.2em] text-cyan-400/80 border border-cyan-400/15 bg-cyan-400/5 px-4 py-1.5 rounded-full mb-5">
          Workflow
        </span>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
          How It{" "}
          <span className="bg-gradient-to-r from-cyan-400 to-primary bg-clip-text text-transparent">
            Works
          </span>
        </h2>
        <p className="text-muted-foreground text-sm md:text-base font-light">
          From authentication to actionable intelligence — in four seamless steps.
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-purple/30 to-emerald-400/30 md:-translate-x-px" />

        <div className="space-y-16 md:space-y-20">
          {steps.map((s, i) => {
            const isEven = i % 2 === 0
            return (
              <div key={i} className="relative flex items-start gap-6 md:gap-0">
                {/* Desktop: alternating layout */}
                <div className={`hidden md:flex items-center w-full ${isEven ? "" : "flex-row-reverse"}`}>
                  {/* Content side */}
                  <div className={`w-[calc(50%-40px)] ${isEven ? "text-right pr-8" : "text-left pl-8"}`}>
                    <div className={`inline-block text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border mb-3 ${s.color}`}>
                      Step {s.step}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{s.title}</h3>
                    <p className="text-sm text-muted-foreground/80 font-light leading-relaxed">{s.desc}</p>
                  </div>

                  {/* Center dot */}
                  <div className="w-20 flex items-center justify-center shrink-0">
                    <div className={`relative w-14 h-14 rounded-full border ${s.color} flex items-center justify-center`}>
                      <span className="text-sm font-bold">{s.step}</span>
                      <div className={`absolute inset-0 rounded-full ${s.glow} blur-xl opacity-50`} />
                    </div>
                  </div>

                  {/* Empty side */}
                  <div className="w-[calc(50%-40px)]" />
                </div>

                {/* Mobile: all left-aligned */}
                <div className="md:hidden flex items-start gap-5">
                  <div className={`relative w-14 h-14 rounded-full border ${s.color} flex items-center justify-center shrink-0`}>
                    <span className="text-sm font-bold">{s.step}</span>
                    <div className={`absolute inset-0 rounded-full ${s.glow} blur-xl opacity-50`} />
                  </div>
                  <div>
                    <div className={`inline-block text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border mb-2 ${s.color}`}>
                      Step {s.step}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1.5">{s.title}</h3>
                    <p className="text-sm text-muted-foreground/80 font-light leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
