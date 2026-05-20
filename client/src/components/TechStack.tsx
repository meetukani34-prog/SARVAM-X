import React from "react"

const techItems = [
  { name: "Python", desc: "ML Backend" },
  { name: "Flask", desc: "REST API" },
  { name: "React", desc: "Frontend UI" },
  { name: "Three.js", desc: "3D Visuals" },
  { name: "Spline", desc: "3D Scenes" },
  { name: "Chart.js", desc: "Analytics" },
  { name: "SHAP", desc: "XAI Engine" },
  { name: "NLP", desc: "Text Models" },
  { name: "Face API", desc: "Vision AI" },
  { name: "SQLite", desc: "Data Store" },
]

const TechStack: React.FC = () => {
  return (
    <section className="relative py-24 px-6 md:px-12 max-w-5xl mx-auto z-10">
      {/* Divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] max-w-md h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="text-center mb-16">
        <span className="inline-block text-[10px] uppercase font-bold tracking-[0.2em] text-emerald-400/80 border border-emerald-400/15 bg-emerald-400/5 px-4 py-1.5 rounded-full mb-5">
          Architecture
        </span>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          Built With{" "}
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Modern Stack
          </span>
        </h2>
        <p className="text-muted-foreground text-sm font-light max-w-lg mx-auto">
          A robust technology foundation powering both platforms end to end.
        </p>
      </div>

      {/* Tech grid */}
      <div className="flex flex-wrap justify-center gap-3 md:gap-4">
        {techItems.map((tech, i) => (
          <div
            key={i}
            className="group flex items-center gap-3 px-5 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-300 cursor-default"
          >
            <div className="w-2 h-2 rounded-full bg-primary/60 group-hover:bg-primary group-hover:shadow-[0_0_8px_rgba(34,197,94,0.4)] transition-all duration-300" />
            <div>
              <span className="text-sm font-semibold text-white">{tech.name}</span>
              <span className="text-[10px] text-muted-foreground/50 ml-2 uppercase tracking-wider">{tech.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default TechStack
