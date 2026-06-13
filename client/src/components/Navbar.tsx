import React, { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { useTheme } from "../context/ThemeContext"

interface NavbarProps {
  activeView: string
  onNavigate: (view: "landing" | "auth" | "sarvam" | "trinetra", platform?: "sarvam" | "trinetra") => void
}

const Navbar: React.FC<NavbarProps> = ({ activeView, onNavigate }) => {
  const links = ["Hub", "Platforms", "Features", "Workflow"]
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLoggedIn(!!localStorage.getItem("sarvam_uid"))

      const handleScroll = () => setScrolled(window.scrollY > 50)
      window.addEventListener("scroll", handleScroll)
      return () => window.removeEventListener("scroll", handleScroll)
    }
  }, [activeView])

  // Close mobile menu on navigation
  const handleMobileNav = (href: string) => {
    setMobileMenuOpen(false)
    window.location.hash = href
  }

  const handleDashboardClick = () => {
    setMobileMenuOpen(false)
    onNavigate("sarvam")
  }

  const handleAuthClick = () => {
    setMobileMenuOpen(false)
    onNavigate("auth", "sarvam")
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 lg:px-12 py-3 sm:py-4 transition-all duration-500 ${
          scrolled
            ? "bg-hero-bg/80 backdrop-blur-xl border-b border-slate-900/[0.06] dark:border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        {/* Left: Logo */}
        <button 
          onClick={() => { setMobileMenuOpen(false); onNavigate("landing") }}
          className="flex items-center gap-2 sm:gap-3 select-none group bg-transparent border-none cursor-pointer"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <span className="text-foreground text-base sm:text-lg font-bold tracking-tight">
            SARVAM<span className="text-primary">-X</span>
          </span>
        </button>

        {/* Center: Navigation Links (Desktop) */}
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

        {/* Right: CTA Button + Hamburger */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-2 text-[10px] text-primary/60 uppercase tracking-widest font-bold mr-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Neural Link Active
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-nav-button/30 hover:bg-nav-button/50 border border-slate-900/ dark:border-white/ transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <svg className="w-5 h-5 text-slate-900/ dark:text-white/" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          
          {/* Desktop CTA */}
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
              onClick={handleAuthClick}
              variant="navCta"
              size="lg"
              className="hidden md:inline-flex rounded-lg uppercase text-[11px] tracking-widest px-6 font-bold cursor-pointer"
            >
              Get Started
            </Button>
          )}

          {/* Mobile CTA (compact) */}
          {isLoggedIn ? (
            <button 
              onClick={handleDashboardClick}
              className="md:hidden text-primary font-bold text-[10px] tracking-widest border border-primary/20 px-2.5 py-1.5 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
            >
              Console
            </button>
          ) : (
            <button 
              onClick={handleAuthClick}
              className="md:hidden text-primary font-bold text-[10px] tracking-widest border border-primary/20 px-2.5 py-1.5 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
            >
              Login
            </button>
          )}

          {/* Hamburger Menu Button (Mobile) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-9 h-9 rounded-lg border border-slate-900/ dark:border-white/ bg-slate-900/[0.02] dark:bg-white/[0.02] flex items-center justify-center text-muted-foreground hover:text-slate-900 dark:text-white hover:border-slate-900/ dark:border-white/ transition-all"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-slate-50/95 dark:bg-[#07090e]/95 backdrop-blur-2xl md:hidden transition-all duration-500 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className={`flex flex-col items-center justify-center h-full gap-6 transition-all duration-500 ${
          mobileMenuOpen ? "translate-y-0" : "-translate-y-8"
        }`}>
          {/* Nav Links */}
          {links.map((link, i) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              onClick={() => handleMobileNav(`#${link.toLowerCase()}`)}
              className="text-xl font-bold text-slate-900/ dark:text-white/ hover:text-primary uppercase tracking-[0.2em] transition-all duration-300"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {link}
            </a>
          ))}

          {/* Divider */}
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent my-2" />

          {/* Auth CTA */}
          {isLoggedIn ? (
            <button
              onClick={handleDashboardClick}
              className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl text-sm uppercase tracking-widest hover:shadow-[0_10px_40px_rgba(34,197,94,0.3)] transition-all"
            >
              Go to Dashboard
            </button>
          ) : (
            <button
              onClick={handleAuthClick}
              className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl text-sm uppercase tracking-widest hover:shadow-[0_10px_40px_rgba(34,197,94,0.3)] transition-all"
            >
              Get Started
            </button>
          )}

          {/* Status */}
          <div className="flex items-center gap-2 text-[10px] text-primary/60 uppercase tracking-widest font-bold mt-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Neural Link Active
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar
