import { useEffect, useState } from "react"
import Navbar from "./components/Navbar"
import HeroSection from "./components/HeroSection"
import StatsSection from "./components/StatsSection"
import PlatformSelector from "./components/PlatformSelector"
import FeaturesSection from "./components/FeaturesSection"
import HowItWorks from "./components/HowItWorks"
import TechStack from "./components/TechStack"
import PricingSection from "./components/PricingSection"
import Footer from "./components/Footer"

// Newly created components
import AuthView from "./components/AuthView"
import SarvamSuite from "./components/SarvamSuite"
import TrinetraSuite from "./components/TrinetraSuite"
import { api } from "./lib/api"

type ViewType = "landing" | "auth" | "sarvam" | "trinetra"

function App() {
  // Restore last view from localStorage (default to "landing")
  const [activeView, setActiveView] = useState<ViewType>(() => {
    const saved = localStorage.getItem("sarvam_view") as ViewType | null
    return saved && ["landing", "auth", "sarvam", "trinetra"].includes(saved) ? saved : "landing"
  })
  const [authPlatform, setAuthPlatform] = useState<"sarvam" | "trinetra">("sarvam")
  
  // Optimistically restore user states from localStorage to prevent loading screen delay
  const [userId, setUserId] = useState<number | null>(() => {
    const saved = localStorage.getItem("sarvam_userId")
    return saved ? parseInt(saved, 10) : null
  })
  const [userName, setUserName] = useState(() => localStorage.getItem("sarvam_userName") || "")
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem("sarvam_userEmail") || "")

  // Persist activeView to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("sarvam_view", activeView)
  }, [activeView])

  // Check auth session on load and on view change
  const syncSession = async () => {
    try {
      const res = await api.getMe()
      if (res.success) {
        setUserId(res.user_id)
        setUserName(res.name)
        setUserEmail(res.email)
        localStorage.setItem("sarvam_userId", res.user_id.toString())
        localStorage.setItem("sarvam_userName", res.name)
        localStorage.setItem("sarvam_userEmail", res.email)
        return true
      } else {
        // Clear invalid session silently
        setUserId(null)
        setUserName("")
        setUserEmail("")
        localStorage.removeItem("sarvam_userId")
        localStorage.removeItem("sarvam_userName")
        localStorage.removeItem("sarvam_userEmail")
        localStorage.removeItem("sarvam_token")
        if (activeView === "sarvam" || activeView === "trinetra") {
          setActiveView("landing")
        }
      }
    } catch (err) {
      // Session expired or network error
      setUserId(null)
      setUserName("")
      setUserEmail("")
      localStorage.removeItem("sarvam_userId")
      localStorage.removeItem("sarvam_userName")
      localStorage.removeItem("sarvam_userEmail")
      localStorage.removeItem("sarvam_token")
      
      // If we optimistically loaded a protected view but auth failed, kick to landing
      if (activeView === "sarvam" || activeView === "trinetra") {
        setActiveView("landing")
      }
    }
    return false
  }

  // On initial mount: verify JWT session asynchronously
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("report")) {
      setActiveView("trinetra")
      setAuthPlatform("trinetra")
      // Still try to sync session in background but don't kick if it fails
      syncSession()
    } else {
      syncSession()
    }
  }, [])

  const handleNavigate = async (view: ViewType, platform: "sarvam" | "trinetra" = "sarvam") => {
    setAuthPlatform(platform)
    
    // Redirect if trying to access secure portals unauthenticated
    if (view === "sarvam" || view === "trinetra") {
      const isAuthenticated = await syncSession()
      if (!isAuthenticated) {
        setActiveView("auth")
        return
      }
    }

    setActiveView(view)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleAuthSuccess = (platform: "sarvam" | "trinetra") => {
    syncSession().then(() => {
      setActiveView(platform)
      window.scrollTo({ top: 0, behavior: "smooth" })
    })
  }

  const handleSignOut = async () => {
    try {
      await api.logout()
    } catch (err) {
      console.error("Logout error", err)
    }
    setUserId(null)
    setUserName("")
    setUserEmail("")
    setActiveView("landing")
  }

  // Render view router
  return (
    <div className="bg-slate-50 dark:bg-[#07090e] min-h-screen text-slate-900 dark:text-foreground relative selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      {activeView === "landing" && (
        <>
          <Navbar activeView="landing" onNavigate={handleNavigate} isLoggedIn={!!userId} />
          <HeroSection />
          <StatsSection />
          <PlatformSelector onNavigate={handleNavigate} />
          <FeaturesSection />
          <HowItWorks />
          <PricingSection onNavigate={handleNavigate} />
          <TechStack />
          <Footer onNavigate={handleNavigate} />
        </>
      )}

      {activeView === "auth" && (
        <AuthView
          initialPlatform={authPlatform}
          onAuthSuccess={handleAuthSuccess}
          onBackToHome={() => handleNavigate("landing")}
        />
      )}

      {activeView === "sarvam" && userId && (
        <SarvamSuite
          userId={userId}
          userName={userName}
          userEmail={userEmail}
          onSignOut={handleSignOut}
          onSwitchSuite={() => handleNavigate("trinetra")}
          onBackToHome={() => handleNavigate("landing")}
        />

      )}

      {activeView === "trinetra" && (
        <TrinetraSuite
          userId={userId || 0}
          userName={userName || "Guest Auditor"}
          userEmail={userEmail || "anonymous@trinetra.ai"}
          onSignOut={handleSignOut}
          onSwitchSuite={() => handleNavigate("sarvam")}
          onBackToHome={() => {
            // Remove report from URL if leaving
            const url = new URL(window.location.href)
            if (url.searchParams.get("report")) {
              url.searchParams.delete("report")
              window.history.replaceState({}, "", url.toString())
            }
            handleNavigate("landing")
          }}
        />
      )}
    </div>
  )
}

export default App
