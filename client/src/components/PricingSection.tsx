import React from "react";

interface PricingSectionProps {
  onNavigate: (view: "landing" | "auth" | "sarvam" | "trinetra", platform?: "sarvam" | "trinetra") => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({ onNavigate }) => {
  return (
    <section className="relative w-full py-32 overflow-hidden z-10 bg-slate-50 dark:bg-[#07090e]">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[600px] bg-primary/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">
            Pricing Plans
          </h2>
          <p className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
            Scale your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple">Intelligence</span>
          </p>
          <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto font-light leading-relaxed">
            Transparent pricing in Indian Rupees. Whether you're a hobbyist exploring cognitive models or an enterprise scaling operations, we have a plan for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Starter Plan */}
          <div className="relative group rounded-3xl border border-slate-900/10 dark:border-white/10 bg-white/50 dark:bg-[#0b0e14]/50 backdrop-blur-xl p-8 hover:border-slate-900/20 dark:hover:border-white/20 transition-all duration-300 flex flex-col">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Starter</h3>
            <p className="text-sm text-muted-foreground/70 mb-6 min-h-[40px]">Perfect for individuals and small prototype projects.</p>
            <div className="mb-8">
              <span className="text-5xl font-extrabold text-slate-900 dark:text-white">₹0</span>
              <span className="text-muted-foreground/60 text-sm"> / month</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-slate-800 dark:text-white/80 text-sm">
                <svg className="w-5 h-5 text-primary/70 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Basic SARVAM-X Hub Access
              </li>
              <li className="flex items-center gap-3 text-slate-800 dark:text-white/80 text-sm">
                <svg className="w-5 h-5 text-primary/70 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                100 API Requests / day
              </li>
              <li className="flex items-center gap-3 text-slate-800 dark:text-white/80 text-sm">
                <svg className="w-5 h-5 text-primary/70 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Standard Community Support
              </li>
            </ul>
            <button 
              onClick={() => onNavigate("auth")}
              className="w-full py-4 rounded-xl border border-slate-900/10 dark:border-white/10 hover:border-slate-900/30 dark:hover:border-white/30 text-slate-900 dark:text-white font-bold tracking-wide hover:bg-slate-900/5 dark:hover:bg-white/[0.02] transition-colors"
            >
              Start for Free
            </button>
          </div>

          {/* Professional Plan */}
          <div className="relative group rounded-3xl border border-primary/40 bg-gradient-to-b from-white dark:from-[#0b0e14] to-white/50 dark:to-[#0b0e14]/50 backdrop-blur-xl p-8 shadow-[0_0_40px_rgba(34,197,94,0.1)] hover:shadow-[0_0_60px_rgba(34,197,94,0.2)] transition-all duration-300 flex flex-col transform md:-translate-y-4">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-t-3xl opacity-80" />
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest py-1 px-4 rounded-full">
              Most Popular
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Professional</h3>
            <p className="text-sm text-muted-foreground/70 mb-6 min-h-[40px]">Ideal for developers and growing startups needing full access.</p>
            <div className="mb-8">
              <span className="text-5xl font-extrabold text-slate-900 dark:text-white">₹399</span>
              <span className="text-muted-foreground/60 text-sm"> / month</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-slate-800 dark:text-white/90 text-sm">
                <svg className="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Full SARVAM-X Hub Access
              </li>
              <li className="flex items-center gap-3 text-slate-800 dark:text-white/90 text-sm">
                <svg className="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Basic TRINETRA Security Tools
              </li>
              <li className="flex items-center gap-3 text-slate-800 dark:text-white/90 text-sm">
                <svg className="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                1,000 API Requests / day
              </li>
              <li className="flex items-center gap-3 text-slate-800 dark:text-white/90 text-sm">
                <svg className="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Priority Email Support
              </li>
            </ul>
            <button 
              onClick={() => onNavigate("auth")}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold tracking-wide hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:bg-primary/90 transition-all duration-300"
            >
              Get Professional
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="relative group rounded-3xl border border-slate-900/10 dark:border-white/10 bg-white/50 dark:bg-[#0b0e14]/50 backdrop-blur-xl p-8 hover:border-slate-900/20 dark:hover:border-white/20 transition-all duration-300 flex flex-col">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Enterprise</h3>
            <p className="text-sm text-muted-foreground/70 mb-6 min-h-[40px]">For large scale organizations requiring custom SLAs and dedicated infrastructure.</p>
            <div className="mb-8">
              <span className="text-5xl font-extrabold text-slate-900 dark:text-white">Custom</span>
              <span className="text-muted-foreground/60 text-sm"> / year</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-slate-800 dark:text-white/80 text-sm">
                <svg className="w-5 h-5 text-purple shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Custom Model Deployments
              </li>
              <li className="flex items-center gap-3 text-slate-800 dark:text-white/80 text-sm">
                <svg className="w-5 h-5 text-purple shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Full TRINETRA Admin Console
              </li>
              <li className="flex items-center gap-3 text-slate-800 dark:text-white/80 text-sm">
                <svg className="w-5 h-5 text-purple shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Unlimited API Access & Compute
              </li>
              <li className="flex items-center gap-3 text-slate-800 dark:text-white/80 text-sm">
                <svg className="w-5 h-5 text-purple shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                24/7 Dedicated Account Manager
              </li>
            </ul>
            <button 
              onClick={() => onNavigate("auth")}
              className="w-full py-4 rounded-xl border border-slate-900/10 dark:border-white/10 hover:border-purple/50 text-slate-900 dark:text-white font-bold tracking-wide hover:bg-purple/10 transition-colors"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
