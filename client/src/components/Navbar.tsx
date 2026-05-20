import React, { useEffect, useState } from "react"
import { Button } from "./ui/button"

interface NavbarProps {
  activeView: string
  onNavigate: (view: "landing" | "auth" | "sarvam" | "trinetra", platform?: "sarvam" | "trinetra") => void
}

const Navbar: React.FC<NavbarProps> = ({ activeView, onNavigate }) => {
  const links = ["Hub", "Platforms", "Features", "Workflow"]
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLoggedIn(!!localStorage.getItem("sarvam_uid"))

      const handleScroll = () => setScrolled(window.scrollY > 50)
      window.addEventListener("scroll", handleScroll)
      return () => window.removeEventListener("scroll", handleScroll)
    }
  }, [activeView])

  const handleDashboardClick = () => {
    // Determine which portal to route to based on last logged or default to sarvam
    onNavigate("sarvam")
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 py-4 transition-all duration-500 ${
        scrolled
          ? "bg-hero-bg/80 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      {/* Left: Logo */}
      <button 
        onClick={() => onNavigate("landing")}
        className="flex items-center gap-3 select-none group bg-transparent border-none cursor-pointer"
      >
        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
        </div>
        <span className="text-foreground text-lg font-bold tracking-tight">
          SARVAM<span className="text-primary">-X</span>
        </span>
      </button>

      {/* Center: Navigation Links */}
      <div className="hidden md:flex items-center gap-8">
        {links.map((link) => {
          const href = `#${link.toLowerCase()}`
          return (
            <a
              key={link}
              href={href}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.15em] font-medium"
            >
              {link}
            </a>
          )
        })}
      </div>

      {/* Right: CTA Button */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 text-[10px] text-primary/60 uppercase tracking-widest font-bold mr-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Neural Link Active
        </div>
        
        {isLoggedIn ? (
          <Button
            onClick={handleDashboardClick}
            variant="navCta"
            size="lg"
            className="hidden md:inline-flex rounded-lg uppercase text-[11px] tracking-widest px-6 font-bold cursor-pointer"
          >
            Dashboard
          </Button>
        ) : (
          <Button
            onClick={() => onNavigate("auth", "sarvam")}
            variant="navCta"
            size="lg"
            className="hidden md:inline-flex rounded-lg uppercase text-[11px] tracking-widest px-6 font-bold cursor-pointer"
          >
            Get Started
          </Button>
        )}

        {/* Mobile */}
        {isLoggedIn ? (
          <button 
            onClick={handleDashboardClick}
            className="md:hidden text-primary font-bold text-xs tracking-widest border border-primary/20 px-3 py-1.5 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
          >
            Console
          </button>
        ) : (
          <button 
            onClick={() => onNavigate("auth", "sarvam")}
            className="md:hidden text-primary font-bold text-xs tracking-widest border border-primary/20 px-3 py-1.5 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  )
}

export default Navbar
