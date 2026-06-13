import React, { useState } from "react"
import { api } from "../lib/api"
import ThreeModel from "./ThreeModel"
import { useTheme } from "../context/ThemeContext"


interface AuthViewProps {
  initialPlatform?: "sarvam" | "trinetra"
  onAuthSuccess: (platform: "sarvam" | "trinetra") => void
  onBackToHome: () => void
}

const AuthView: React.FC<AuthViewProps> = ({
  initialPlatform = "sarvam",
  onAuthSuccess,
  onBackToHome,
}) => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login")
  const [platform, setPlatform] = useState<"sarvam" | "trinetra">(initialPlatform)
  const { theme } = useTheme()
  
  // Form fields
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg("")
    setSuccessMsg("")

    try {
      if (activeTab === "login") {
        const res = await api.login(email, password)
        if (res.success) {
          setSuccessMsg(`Welcome back, ${res.name}! Syncing neural matrix...`)
          setTimeout(() => {
            onAuthSuccess(platform)
          }, 1500)
        }
      } else {
        const res = await api.signup(name, email, password)
        if (res.success) {
          setSuccessMsg("Account successfully created! Initializing digital twin...")
          setTimeout(() => {
            onAuthSuccess(platform)
          }, 1500)
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed. Please verify credentials.")
    } finally {
      setLoading(false)
    }
  }

  // Define accent colors based on selected platform
  const isSarvam = platform === "sarvam"

  const themeColor = isSarvam ? "text-primary" : "text-purple"
  const btnBg = isSarvam 
    ? "bg-primary text-primary-foreground hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]" 
    : "bg-purple text-purple-foreground hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]"


  return (
    <div 
      className="relative min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#07090e] px-4 py-12 overflow-hidden select-none bg-cover bg-center bg-no-repeat bg-fixed"
      style={{
        backgroundImage: `linear-gradient(to bottom, ${theme === 'dark' ? 'rgba(7, 9, 14, 0.75), rgba(7, 9, 14, 0.98)' : 'rgba(248, 250, 252, 0.75), rgba(248, 250, 252, 0.98)'}), url('${isSarvam ? "/bg-sarvam.png" : "/bg-trinetra.png"}')`
      }}
    >
      {/* 3D background element */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <ThreeModel mode="rings" color={isSarvam ? 0x10b981 : 0xa855f7} className="w-full h-full" />
      </div>

      {/* Grid Pattern overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      />

      {/* Auth Box wrapper */}
      <div className="relative z-10 w-full max-w-md bg-white/[0.03] backdrop-blur-2xl border border-slate-900/[0.06] dark:border-white/[0.06] rounded-3xl p-8 md:p-10 shadow-[0_30px_70px_rgba(0,0,0,0.6)] flex flex-col items-center">
        {/* Top bar glowing indicator */}
        <div 
          className="absolute top-0 left-10 right-10 h-[2px] transition-all duration-500"
          style={{
            background: isSarvam 
              ? "linear-gradient(to right, transparent, var(--color-primary), transparent)" 
              : "linear-gradient(to right, transparent, var(--color-purple), transparent)"
          }}
        />

        {/* Back Link */}
        <button 
          onClick={onBackToHome}
          className="absolute top-6 left-6 text-xs text-muted-foreground hover:text-slate-900 dark:text-white transition-colors flex items-center gap-2"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Hub
        </button>

        {/* Platform selection badge */}
        <div className="flex gap-2 p-1 bg-slate-900/[0.02] dark:bg-white/[0.02] border border-slate-900/[0.05] dark:border-white/[0.05] rounded-xl mt-6 mb-8 w-fit">
          <button
            onClick={() => setPlatform("sarvam")}
            className={`px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded-lg transition-all ${
              isSarvam 
                ? "bg-primary/10 text-primary border border-primary/20" 
                : "text-muted-foreground hover:text-slate-900 dark:text-white border border-transparent"
            }`}
          >
            SARVAM-X
          </button>
          <button
            onClick={() => setPlatform("trinetra")}
            className={`px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded-lg transition-all ${
              !isSarvam 
                ? "bg-purple/10 text-purple border border-purple/20" 
                : "text-muted-foreground hover:text-slate-900 dark:text-white border border-transparent"
            }`}
          >
            TRINETRA AI
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl mb-4 relative flex items-center justify-center">
            {/* Small spinning or pulsing 3D element placeholder */}
            <div className="absolute inset-0 rounded-xl overflow-hidden opacity-80 border border-slate-900/10 dark:border-white/10">
              <ThreeModel 
                mode={isSarvam ? "dodecahedron" : "octahedron"} 
                color={isSarvam ? 0x10b981 : 0xa855f7}
                className="w-full h-full" 
              />
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">
            {isSarvam ? "SARVAM" : "TRINETRA"}<span className={themeColor}>{isSarvam ? "-X" : " AI"}</span> Portal
          </h2>
          <p className="text-xs text-muted-foreground mt-1.5 font-light leading-relaxed">
            {isSarvam 
              ? "Access your cognitive neural mirror twin" 
              : "Verify security, vulnerabilities & fake news patterns"}
          </p>
        </div>

        {/* Dynamic sliding switch toggler */}
        <div className="w-full relative flex p-1 bg-slate-900/[0.02] dark:bg-white/[0.02] border border-slate-900/[0.05] dark:border-white/[0.05] rounded-xl mb-6">
          <div 
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-white/[0.04] border border-slate-900/[0.08] dark:border-white/[0.08] transition-all duration-300 ease-out shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
            style={{
              left: activeTab === "login" ? "4px" : "calc(50%)",
            }}
          />
          <button
            onClick={() => { setActiveTab("login"); setErrorMsg(""); }}
            className={`relative z-10 w-1/2 text-center py-2.5 text-xs font-semibold tracking-wider transition-colors uppercase ${
              activeTab === "login" ? "text-slate-900 dark:text-white" : "text-muted-foreground hover:text-slate-900 dark:text-white"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => { setActiveTab("signup"); setErrorMsg(""); }}
            className={`relative z-10 w-1/2 text-center py-2.5 text-xs font-semibold tracking-wider transition-colors uppercase ${
              activeTab === "signup" ? "text-slate-900 dark:text-white" : "text-muted-foreground hover:text-slate-900 dark:text-white"
            }`}
          >
            Register
          </button>
        </div>

        {/* Alert messaging */}
        {errorMsg && (
          <div className="w-full mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-medium flex items-center gap-2.5 animate-fadeIn">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="w-full mb-5 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-medium flex items-center gap-2.5 animate-fadeIn">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.746 3.746 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
            <span className="text-left leading-normal">{successMsg}</span>
          </div>
        )}

        {/* Sliding form panels inside viewport */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {activeTab === "signup" && (
            <div className="flex flex-col gap-1.5 animate-slideDown">
              <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <svg className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <input
                  type="text"
                  required
                  placeholder="Meet Ukani"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full bg-slate-900/[0.02] dark:bg-white/[0.02] border border-slate-900/10 dark:border-white/10 hover:border-slate-900/10 dark:border-white/10 focus:border-slate-900/10 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 dark:text-white placeholder-muted-foreground/40 outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(255,255,255,0.03)]`}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <svg className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <input
                type="email"
                required
                placeholder="user@sarvam.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/[0.02] dark:bg-white/[0.02] border border-slate-900/10 dark:border-white/10 hover:border-slate-900/10 dark:border-white/10 focus:border-slate-900/10 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 dark:text-white placeholder-muted-foreground/40 outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(255,255,255,0.03)]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mb-2">
            <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Password</label>
            <div className="relative">
              <svg className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/[0.02] dark:bg-white/[0.02] border border-slate-900/10 dark:border-white/10 hover:border-slate-900/10 dark:border-white/10 focus:border-slate-900/10 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 dark:text-white placeholder-muted-foreground/40 outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(255,255,255,0.03)]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 mt-2 flex items-center justify-center gap-2.5 rounded-xl font-bold uppercase text-[11px] tracking-widest select-none duration-300 disabled:opacity-40 outline-none transition-all ${btnBg}`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Syncing Neural Link...
              </>
            ) : activeTab === "login" ? (
              <>
                Sign In
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
              </>
            ) : (
              <>
                Create Account
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                </svg>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AuthView
