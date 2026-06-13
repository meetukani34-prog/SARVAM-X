import React, { useState } from "react"

interface FooterProps {
  onNavigate: (view: "landing" | "auth" | "sarvam" | "trinetra", platform?: "sarvam" | "trinetra") => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleLinkClick = (e: React.MouseEvent, title: string) => {
    e.preventDefault();
    if (title === "About Us") {
      return;
    }
    setActiveModal(title);
  };

  const modalContent: Record<string, { desc: string; extra: string; img?: string }> = {
    "Enterprise API": {
      desc: "Our Enterprise API provides low-latency, high-throughput access to SARVAM-X's cognitive models.",
      extra: "Integrate seamlessly into your existing pipelines with comprehensive SDKs and dedicated support channels."
    },
    "Pricing": {
      desc: "Transparent and scalable pricing tailored to your computational needs. Pay only for the intelligence you utilize.",
      extra: "Contact our sales team for custom volume discounts and enterprise SLAs."
    },
    "Documentation": {
      desc: "Comprehensive guides, API references, and tutorials for developers building on SARVAM-X.",
      extra: "Explore deep technical specifications and integration patterns.",
      img: "/doc_photo.png"
    },
    "Research Papers": {
      desc: "Access our latest peer-reviewed research on cognitive architectures, explainable AI, and neural network safety.",
      extra: "Stay at the forefront of artificial intelligence breakthroughs.",
      img: "/research_photo.png"
    },
    "Blog": {
      desc: "The latest news, product updates, and technical insights from the engineering teams at SARVAM-X.",
      extra: "Read case studies on how industry leaders are leveraging our digital twins.",
      img: "/blog_photo.png"
    },
    "System Status": {
      desc: "Real-time uptime metrics and operational status for all SARVAM-X Hubs and TRINETRA Consoles.",
      extra: "Current status: All systems nominal. 99.999% uptime maintained across global edge locations.",
      img: "/status_photo.png"
    },
    "Careers": {
      desc: "Join our team of visionary researchers, engineers, and designers building the future of cognitive intelligence.",
      extra: "View open positions and learn about our remote-first, high-performance culture."
    },
    "Press": {
      desc: "Official press releases, media kits, and brand assets for SARVAM-X.",
      extra: "For media inquiries, please contact press@sarvam-x.ai."
    },
    "Contact": {
      desc: "Get in touch with our global support and sales teams.",
      extra: "We offer 24/7 priority support for Enterprise clients via your TRINETRA portal."
    },
    "Privacy Policy": {
      desc: "We adhere strictly to global data protection frameworks (GDPR, CCPA). Your data is never used to train base models without explicit consent.",
      extra: "Review our zero-trust architecture and cryptographic security protocols."
    },
    "Terms and Conditions": {
      desc: "The legal framework governing your use of the SARVAM-X intelligence network and associated services.",
      extra: "Includes usage limits, acceptable use policies, and liability clauses."
    },
    "Cookie Policy": {
      desc: "Details on how we use tracking technologies to ensure security and optimize performance on our platforms.",
      extra: "You have full control over your telemetry preferences via the main dashboard."
    },
    "Security": {
      desc: "Our infrastructure features SOC2 compliance, end-to-end encryption, and continuous automated penetration testing.",
      extra: "Report vulnerabilities through our bug bounty program."
    }
  };

  const currentContent = activeModal ? modalContent[activeModal] || { desc: "Information currently unavailable.", extra: "Please check back later." } : null;

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

      {/* Links Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/[0.05] bg-black/20">
        {/* Column 1 */}
        <div className="flex flex-col gap-4">
          <h4 className="text-white font-bold text-sm tracking-wider mb-2">PLATFORMS</h4>
          <button onClick={() => onNavigate("sarvam")} className="text-left text-sm text-muted-foreground/70 hover:text-primary transition-colors">SARVAM-X Hub</button>
          <button onClick={() => onNavigate("trinetra")} className="text-left text-sm text-muted-foreground/70 hover:text-purple transition-colors">TRINETRA Console</button>
          <a href="#" onClick={(e) => handleLinkClick(e, "Enterprise API")} className="text-left text-sm text-muted-foreground/70 hover:text-white transition-colors">Enterprise API</a>
          <a href="#" onClick={(e) => handleLinkClick(e, "Pricing")} className="text-left text-sm text-muted-foreground/70 hover:text-white transition-colors">Pricing</a>
        </div>
        
        {/* Column 2 */}
        <div className="flex flex-col gap-4">
          <h4 className="text-white font-bold text-sm tracking-wider mb-2">RESOURCES</h4>
          <a href="#" onClick={(e) => handleLinkClick(e, "Documentation")} className="text-sm text-muted-foreground/70 hover:text-white transition-colors">Documentation</a>
          <a href="#" onClick={(e) => handleLinkClick(e, "Research Papers")} className="text-sm text-muted-foreground/70 hover:text-white transition-colors">Research Papers</a>
          <a href="#" onClick={(e) => handleLinkClick(e, "Blog")} className="text-sm text-muted-foreground/70 hover:text-white transition-colors">Blog</a>
          <a href="#" onClick={(e) => handleLinkClick(e, "System Status")} className="text-sm text-muted-foreground/70 hover:text-white transition-colors">System Status</a>
        </div>

        {/* Column 3 */}
        <div className="flex flex-col gap-4">
          <h4 className="text-white font-bold text-sm tracking-wider mb-2">COMPANY</h4>
          <a href="#" className="text-sm text-muted-foreground/70 hover:text-white transition-colors">About Us</a>
          <a href="#" onClick={(e) => handleLinkClick(e, "Careers")} className="text-sm text-muted-foreground/70 hover:text-white transition-colors">Careers</a>
          <a href="#" onClick={(e) => handleLinkClick(e, "Press")} className="text-sm text-muted-foreground/70 hover:text-white transition-colors">Press</a>
          <a href="#" onClick={(e) => handleLinkClick(e, "Contact")} className="text-sm text-muted-foreground/70 hover:text-white transition-colors">Contact</a>
        </div>

        {/* Column 4 */}
        <div className="flex flex-col gap-4">
          <h4 className="text-white font-bold text-sm tracking-wider mb-2">LEGAL</h4>
          <a href="#" onClick={(e) => handleLinkClick(e, "Privacy Policy")} className="text-sm text-muted-foreground/70 hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" onClick={(e) => handleLinkClick(e, "Terms and Conditions")} className="text-sm text-muted-foreground/70 hover:text-white transition-colors">Terms and Conditions</a>
          <a href="#" onClick={(e) => handleLinkClick(e, "Cookie Policy")} className="text-sm text-muted-foreground/70 hover:text-white transition-colors">Cookie Policy</a>
          <a href="#" onClick={(e) => handleLinkClick(e, "Security")} className="text-sm text-muted-foreground/70 hover:text-white transition-colors">Security</a>
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

      {/* Generic Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07090e]/60 backdrop-blur-md">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40 shadow-[0_0_100px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-70" />
            
            {/* Ambient background glow inside modal */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="p-8 md:p-10 relative z-10">
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/[0.02] hover:bg-white/[0.1] text-white/50 hover:text-white transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.05] shadow-inner">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-wide">{activeModal}</h2>
                  <p className="text-xs text-primary/70 uppercase tracking-widest font-semibold mt-1">SARVAM-X Intelligence Network</p>
                </div>
              </div>
              
              <div className="text-white/70 space-y-5 max-h-[50vh] overflow-y-auto pr-4 text-sm md:text-base leading-relaxed font-light custom-scrollbar">
                {currentContent?.img && (
                  <div className="w-full h-48 rounded-xl overflow-hidden border border-white/10 mb-6 shadow-lg">
                    <img src={currentContent.img} alt={activeModal || "Resource"} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                  </div>
                )}
                <p>
                  Viewing documentation for: <strong className="text-white font-medium">{activeModal}</strong>.
                </p>
                <p>
                  {currentContent?.desc}
                </p>
                <p>
                  {currentContent?.extra}
                </p>
                <div className="p-4 rounded-xl bg-primary/[0.03] border border-primary/10 text-primary/90 text-sm">
                  <span className="font-semibold">Notice:</span> All activities within the SARVAM-X Hub and TRINETRA Console are monitored for quality and security assurance purposes.
                </div>
              </div>
              
              <div className="mt-10 pt-6 border-t border-white/[0.05] flex justify-end gap-4">
                <button 
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-3 bg-transparent hover:bg-white/[0.05] text-white/70 hover:text-white rounded-xl transition-colors font-medium text-sm tracking-wide"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="px-8 py-3 bg-primary text-primary-foreground hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] rounded-xl transition-all duration-300 font-bold text-sm uppercase tracking-wider"
                >
                  Acknowledge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </footer>
  )
}

export default Footer
