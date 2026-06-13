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
  const [activeView, setActiveView] = useState<ViewType>("landing")
  const [authPlatform, setAuthPlatform] = useState<"sarvam" | "trinetra">("sarvam")
  
  // User states
  const [userId, setUserId] = useState<number | null>(null)
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")

  // Check auth session on load and on view change
  const syncSession = async () => {
    try {
      const res = await api.getMe()
      if (res.success) {
        setUserId(res.user_id)
        setUserName(res.name)
        setUserEmail(res.email)
        return true
      }
    } catch (err) {
      setUserId(null)
      setUserName("")
      setUserEmail("")
    }
    return false
  }

  useEffect(() => {
    syncSession()
  }, [activeView])

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

      {activeView === "trinetra" && userId && (
        <TrinetraSuite
          userId={userId}
          userName={userName}
          userEmail={userEmail}
          onSignOut={handleSignOut}
          onSwitchSuite={() => handleNavigate("sarvam")}
          onBackToHome={() => handleNavigate("landing")}
        />
      )}
    </div>
  )
}

export default App
