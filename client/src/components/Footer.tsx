import React from "react"

interface FooterProps {
  onNavigate: (view: "landing" | "auth" | "sarvam" | "trinetra", platform?: "sarvam" | "trinetra") => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="relative w-full z-10">
      {/* Top divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* CTA Banner */}
      <div className="relative overflow-hidden bg-gradient-to-b from-white/[0.02] to-transparent">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 rounded-full bg-primary/[0.04] blur-[100px]" />
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-64 h-64 rounded-full bg-purple/[0.04] blur-[100px]" />
        </div>
        <div className="max-w-3xl mx-auto text-center py-20 px-6">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Experience the Future of AI?
          </h3>
          <p className="text-sm text-muted-foreground/70 font-light mb-8 max-w-lg mx-auto">
            Join the SARVAM-X intelligence network. Two platforms, one mission — empowering cognition and securing intelligence.
          </p>
          <button
            onClick={() => onNavigate("auth", "sarvam")}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg font-bold text-sm uppercase tracking-wider hover:shadow-[0_10px_40px_rgba(34,197,94,0.3)] transition-all duration-300 active:scale-[0.97]"
          >
            Get Started Free
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.05] bg-black/40">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-white font-bold text-sm tracking-wider">SARVAM<span className="text-primary">-X</span></span>
            <span className="text-white/20">|</span>
            <span className="text-[11px] text-muted-foreground/50 uppercase tracking-wider">AI Intelligence Hub</span>
          </div>
          <div className="flex items-center gap-6 text-[11px] text-muted-foreground/40">
            <button onClick={() => onNavigate("auth", "sarvam")} className="hover:text-muted-foreground/70 transition-colors">Login</button>
            <button onClick={() => onNavigate("sarvam")} className="hover:text-muted-foreground/70 transition-colors">Dashboard</button>
            <button onClick={() => onNavigate("trinetra")} className="hover:text-muted-foreground/70 transition-colors">TRINETRA</button>
          </div>
          <div className="text-[10px] text-muted-foreground/30">
            &copy; {new Date().getFullYear()} SARVAM AI. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
