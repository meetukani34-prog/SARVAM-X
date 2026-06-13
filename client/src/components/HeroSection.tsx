import React from "react"
import ThreeModel from "./ThreeModel"

const HeroSection: React.FC = () => {
  return (
    <section id="hub" className="relative min-h-screen flex items-center bg-hero-bg overflow-hidden">
      {/* 3D Holographic Background */}
      <div className="absolute inset-0 opacity-70">
        <ThreeModel mode="rings" className="w-full h-full" />
      </div>

      {/* Dark overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent z-[1] pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-hero-bg to-transparent z-[1] pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 pointer-events-none w-full max-w-[90%] lg:max-w-3xl px-4 sm:px-6 md:px-12 lg:px-16 pb-10 pt-24 sm:pt-32 md:pt-40">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest mb-6 opacity-0 animate-fade-up"
          style={{ animationDelay: "0.1s" }}
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Next-Gen Intelligence Suite
        </div>

        {/* Heading */}
        <h1
          className="text-[clamp(2.5rem,7vw,5.5rem)] font-bold leading-[1.02] tracking-[-0.04em] text-foreground mb-4 md:mb-6 opacity-0 animate-fade-up"
          style={{ animationDelay: "0.25s" }}
        >
          <span className="block">SARVAM-X</span>
          <span className="block bg-gradient-to-r from-primary via-emerald-400 to-primary bg-clip-text text-transparent">
            AI Intelligence Hub
          </span>
        </h1>

        {/* Description */}
        <p
          className="text-muted-foreground text-[clamp(0.9rem,1.6vw,1.15rem)] font-light mb-6 md:mb-10 opacity-0 animate-fade-up leading-relaxed max-w-xl"
          style={{ animationDelay: "0.45s" }}
        >
          Enterprise-grade cognitive AI. Digital learning twins, real-time code debugging, 
          NLP-powered threat intelligence, and transparent explainable AI — all in one unified platform.
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-wrap gap-4 opacity-0 animate-fade-up"
          style={{ animationDelay: "0.6s" }}
        >
          <a
            href="#platforms"
            className="group relative bg-primary text-primary-foreground px-5 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-bold rounded-lg cursor-pointer transition-all duration-300 hover:shadow-[0_10px_40px_rgba(34,197,94,0.3)] active:scale-[0.97] pointer-events-auto select-none text-center uppercase tracking-wider overflow-hidden"
          >
            <span className="relative z-10">Explore Platforms</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-emerald-400 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </a>
          <a
            href="#features"
            className="bg-slate-900/5 dark:bg-white/5 text-foreground border border-slate-900/10 dark:border-white/10 px-5 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-bold rounded-lg cursor-pointer hover:bg-slate-900/5 dark:bg-white/5 hover:border-slate-900/10 dark:border-white/10 transition-all duration-300 active:scale-[0.97] pointer-events-auto select-none text-center uppercase tracking-wider backdrop-blur-sm"
          >
            Learn More
          </a>
        </div>

        {/* Trust metrics */}
        <div
          className="flex flex-wrap gap-5 sm:gap-8 mt-8 sm:mt-10 md:mt-14 opacity-0 animate-fade-up"
          style={{ animationDelay: "0.8s" }}
        >
          {[
            { value: "2", label: "AI Platforms" },
            { value: "94.7%", label: "AI Accuracy" },
            { value: "12+", label: "AI Models" },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col pointer-events-auto">
              <span className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mt-1">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 opacity-0 animate-fade-up" style={{ animationDelay: "1.2s" }}>
        <div className="w-6 h-10 rounded-full border-2 border-slate-900/10 dark:border-white/10 flex items-start justify-center p-1.5">
          <div className="w-1 h-2.5 rounded-full bg-primary animate-bounce" />
        </div>
      </div>
    </section>
  )
}

export default HeroSection
