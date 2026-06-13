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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b0e14] border border-white/10 rounded-2xl p-8 max-w-2xl w-full relative shadow-2xl animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold text-white mb-6 tracking-wide">{activeModal}</h2>
            <div className="text-muted-foreground/80 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <p>
                Welcome to the {activeModal} page. This is a placeholder popup for the {activeModal} section. 
                In a full production environment, this would contain the detailed text, legal jargon, or 
                company information specific to this topic.
              </p>
              <p>
                SARVAM-X is committed to maintaining the highest standards of transparency and security. 
                All data processed by our cognitive hubs and sentinel consoles complies with global 
                data protection regulations.
              </p>
              <p>
                For any immediate inquiries regarding {activeModal}, please contact our support team 
                through the main dashboard or via the Enterprise API portal.
              </p>
            </div>
            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => setActiveModal(null)}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  )
}

export default Footer
