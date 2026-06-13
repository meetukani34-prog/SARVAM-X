import React, { useEffect, useRef, useState } from "react"
import ThreeModel from "./ThreeModel"
import { api } from "../lib/api"

import DOMPurify from 'dompurify'

// Access global faceapi loaded via CDN script in index.html
declare const faceapi: any

interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}

interface MentorPanelProps {
  userId: number
}

const MentorPanel: React.FC<MentorPanelProps> = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisionActive, setIsVisionActive] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  
  const [phase, setPhase] = useState<"IDLE" | "THINKING" | "SPEAKING">("IDLE")
  const [userEmotion, setUserEmotion] = useState("neutral")
  const [emotionConfidence, setEmotionConfidence] = useState(0)
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState("")

  const videoRef = useRef<HTMLVideoElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const visionIntervalRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [])

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatHistory, phase])

  // Initialize greet
  useEffect(() => {
    if (isOpen && chatHistory.length === 0) {
      setChatHistory([
        { role: "system", content: "Neural Sync Active — Cognitive Mirror Linked" },
        { role: "assistant", content: "I am Luminous. Your digital learning mirror is active. How shall we expand your capacity today?" }
      ])
      speak("I am Luminous. Your digital learning mirror is active. How shall we expand your capacity today?")
    }
  }, [isOpen])

  // TTS Speech Synthesis with support for Hinglish/Hindi
  const speak = (text: string) => {
    if (!text || !synthRef.current) return
    synthRef.current.cancel()

    const cleanText = text.replace(/\*\*|`|#/g, "").slice(0, 250) // truncate for voice
    const utterance = new SpeechSynthesisUtterance(cleanText)
    
    // Choose appropriate language voice
    if (/[\u0900-\u097F]/.test(cleanText)) {
      utterance.lang = "hi-IN" // Hindi
    } else {
      utterance.lang = "en-US" // English
    }

    const voices = synthRef.current.getVoices()
    const matchingVoice = voices.find((v) => v.lang.startsWith(utterance.lang.split("-")[0]))
    if (matchingVoice) utterance.voice = matchingVoice

    utterance.onstart = () => {
      setIsSpeaking(true)
      setPhase("SPEAKING")
    }
    utterance.onend = () => {
      setIsSpeaking(false)
      setPhase("IDLE")
    }
    utterance.onerror = () => {
      setIsSpeaking(false)
      setPhase("IDLE")
    }

    currentUtteranceRef.current = utterance
    synthRef.current.speak(utterance)
  }

  // Vladmandic Face-API model dynamic initialization & execution
  const initFaceApiModels = async () => {
    if (typeof faceapi === "undefined") return false
    const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model"
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      ])
      return true
    } catch (e) {
      console.error("Face-API models failed to load", e)
      return false
    }
  }

  const toggleVision = async () => {
    if (isVisionActive) {
      setIsVisionActive(false)
      if (visionIntervalRef.current) clearInterval(visionIntervalRef.current)
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
        videoRef.current.srcObject = null
      }
      setUserEmotion("neutral")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setIsVisionActive(true)
      setUserEmotion("syncing...")

      // Verify FaceAPI script is loaded
      if (typeof faceapi === "undefined") {
        setUserEmotion("script missing")
        return
      }

      const modelsLoaded = await initFaceApiModels()
      if (!modelsLoaded) {
        setUserEmotion("models fail")
        return
      }

      setUserEmotion("vision active")

      // Face tracking scanning intervals
      visionIntervalRef.current = setInterval(async () => {
        if (!videoRef.current || !isVisionActive || typeof faceapi === "undefined") return
        try {
          const detections = await faceapi
            .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
            .withFaceExpressions()

          if (detections) {
            const expressions = detections.expressions
            const best = Object.entries(expressions).reduce((a: any, b: any) => (a[1] > b[1] ? a : b))
            const detectedEmotion = best[0]
            const confidence = best[1] as number

            setUserEmotion(detectedEmotion)
            setEmotionConfidence(confidence)

            // Trigger Empathetic resonance responses on high expressions
            if (confidence > 0.82 && !isStreaming && !isSpeaking) {
              reactToEmotion(detectedEmotion)
            }
          }
        } catch (err) {
          console.warn("Face check error", err)
        }
      }, 1200)

    } catch (err) {
      console.error("Webcam not accessed", err)
      alert("Camera permissions are required for Luminous Mentor Face Emotion Sync.")
      setIsVisionActive(false)
    }
  }

  // Cleanup vision interval on unmount
  useEffect(() => {
    return () => {
      if (visionIntervalRef.current) clearInterval(visionIntervalRef.current)
    }
  }, [])

  // Empathetic resonance comment logs
  const reactToEmotion = (emotion: string) => {
    let response = ""
    if (emotion === "sad" || emotion === "fearful") {
      response = "I perceive some cognitive fatigue or tension in your expression. Remember to breathe — we proceed in micro-steps."
    } else if (emotion === "happy") {
      response = "Superb! I detect genuine learning resonance. Keep riding this wave of high momentum!"
    } else if (emotion === "surprised") {
      response = "Ah, a breakthrough discovery! That flash of surprise represents cognitive mapping in action."
    }

    if (response) {
      setChatHistory((prev) => [
        ...prev,
        { role: "system", content: `Empathetic Resonance Toggled: ${emotion.toUpperCase()}` },
        { role: "assistant", content: response }
      ])
      speak(response)
    }
  }

  // Send interactive chat message & stream response (Event Stream)
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!inputText.trim() || isStreaming) return

    const userText = inputText.trim()
    setInputText("")
    
    // Add user message to history
    setChatHistory((prev) => [...prev, { role: "user", content: userText }])
    setPhase("THINKING")
    setIsStreaming(true)

    // Build context
    const emotionContext = isVisionActive ? `\n(User current expression: ${userEmotion})` : ""
    
    try {
      const response = await fetch(api.getChatStreamUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          message: userText + emotionContext,
          history: chatHistory.slice(-8).map((h) => ({ role: h.role, content: h.content }))
        })
      })

      if (!response.ok) throw new Error("Connection failed")

      // Add fresh placeholder message
      setChatHistory((prev) => [...prev, { role: "assistant", content: "" }])

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ""
      let buffer = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() || ""

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const payload = line.slice(6).trim()
              if (payload === "[DONE]") continue
              try {
                const parsed = JSON.parse(payload)
                if (parsed.token) {
                  fullContent += parsed.token
                  // Update the last assistant bubble in chatHistory
                  setChatHistory((prev) => {
                    const copy = [...prev]
                    if (copy.length > 0 && copy[copy.length - 1].role === "assistant") {
                      copy[copy.length - 1].content = fullContent
                    }
                    return copy
                  })
                }
              } catch (e) {}
            }
          }
        }
      }

      setPhase("IDLE")
      setIsStreaming(false)
      // Vocalize response
      speak(fullContent)

    } catch (err) {
      console.error(err)
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: "Cognitive connection timed out. Please verify that the Flask backend is actively running." }
      ])
      setIsStreaming(false)
      setPhase("IDLE")
    }
  }

  // Formatter helper for markdown tags
  const renderFormattedBubble = (text: string) => {
    // Bold matches
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary font-semibold">$1</strong>')
    // Code blocks matches
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-primary/10 text-cyan-400 font-mono text-xs px-1.5 py-0.5 rounded border border-primary/20">$1</code>')
    
    // Sanitize to prevent XSS
    const cleanHtml = DOMPurify.sanitize(formatted)
    
    return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} className="leading-relaxed text-sm text-gray-200" />
  }

  return (
    <>
      {/* Floating Action Button (FAB) Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 sm:bottom-6 right-3 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center cursor-pointer shadow-[0_8px_30px_rgba(0,0,0,0.5)] border transition-all duration-500 hover:scale-110 hover:-translate-y-1 ${
          isOpen
            ? "bg-red-500/20 border-red-500/40 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
            : "bg-primary/20 border-primary/40 text-primary shadow-[0_0_30px_rgba(34,197,94,0.2)]"
        }`}
      >
        {isOpen ? (
          <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <span className="absolute animate-ping inline-flex h-8 w-8 rounded-full bg-primary/20 opacity-75"></span>
            <svg className="w-6 h-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.913-6m-8.913-6L9 3m0 0l-1.087 1.087M9 3l1.087 1.087m-1.087 1.087l8.913 6.001M18 18.235l-3.375-3.375m0 0a3 3 0 114.243-4.242 3 3 0 01-4.243 4.242z" />
            </svg>
          </div>
        )}
      </button>

      {/* Slide-out Glowing Mentor Widget Panel */}
      <div
        className={`fixed bottom-20 sm:bottom-24 right-3 sm:right-6 w-[calc(100vw-1.5rem)] sm:w-96 max-w-96 h-[70vh] sm:h-[520px] max-h-[520px] z-50 bg-[#0a0d14]/90 backdrop-blur-2xl border border-slate-900/[0.08] dark:border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.7)] flex flex-col transition-all duration-500 ease-out origin-bottom-right transform ${
          isOpen ? "scale-100 translate-y-0 opacity-100" : "scale-75 translate-y-8 opacity-0 pointer-events-none"
        }`}
      >
        {/* Glow Line Top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />

        {/* Top Header Section */}
        <div className="p-4 bg-slate-900/[0.02] dark:bg-white/[0.02] border-b border-slate-900/[0.05] dark:border-white/[0.05] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Luminous Avatar 3D viewport */}
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 overflow-hidden relative shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <ThreeModel mode="dodecahedron" color={0x00f2ff} className="w-full h-full" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Luminous Mentor</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${phase !== "IDLE" ? "bg-cyan-400 animate-ping" : "bg-emerald-400 animate-pulse"}`} />
                <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">
                  {phase === "SPEAKING" ? "Speaking..." : phase === "THINKING" ? "Thinking..." : "Sync Active"}
                </span>
              </div>
            </div>
          </div>

          {/* Toggle camera view */}
          <button
            onClick={toggleVision}
            id="vision-toggle"
            className={`px-3 py-1.5 rounded-lg border text-[9px] uppercase font-bold tracking-widest flex items-center gap-1.5 duration-300 transition-all ${
              isVisionActive
                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                : "bg-slate-900/[0.02] dark:bg-white/[0.02] border-slate-900/10 dark:border-white/10 text-muted-foreground hover:text-slate-900 dark:text-white"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Vision
          </button>
        </div>

        {/* Video stream container when vision active */}
        <div
          className={`relative bg-white dark:bg-black transition-all duration-500 overflow-hidden flex items-center justify-center ${
            isVisionActive ? "h-24 border-b border-slate-900/[0.04] dark:border-white/[0.04]" : "h-0"
          }`}
        >
          <video
            ref={videoRef}
            id="mentor-vision-feed"
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover opacity-75"
          />
          {/* Facial analysis scanline */}
          <div className="absolute top-0 bottom-0 left-0 right-0 pointer-events-none bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent animate-scanline border-b border-cyan-500/20" />
          <div className="absolute bottom-2 left-2 bg-white/60 dark:bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-md border border-slate-900/10 dark:border-white/10 flex items-center gap-1.5 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span id="user-emotion-label" className="text-[8px] font-bold text-slate-900 dark:text-white uppercase tracking-widest font-mono">
              USER: {userEmotion.toUpperCase()} {(emotionConfidence * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Dynamic Bubble Logs Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4" id="mentor-messages">
          {chatHistory.map((chat, idx) => {
            if (chat.role === "system") {
              return (
                <div key={idx} className="flex justify-center my-1.5">
                  <span className="bg-slate-900/[0.02] dark:bg-white/[0.02] border border-slate-900/[0.06] dark:border-white/[0.06] text-muted-foreground text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest font-mono shadow-sm">
                    {chat.content}
                  </span>
                </div>
              )
            }

            const isAI = chat.role === "assistant"
            return (
              <div
                key={idx}
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-md border animate-fadeIn ${
                  isAI
                    ? "bg-slate-900/[0.02] dark:bg-white/[0.02] border-slate-900/[0.04] dark:border-white/[0.04] text-gray-200 self-start rounded-tl-none hover:border-cyan-500/20 transition-all duration-300"
                    : "bg-cyan-500/10 border-cyan-500/20 text-slate-900 dark:text-white self-end rounded-tr-none"
                }`}
              >
                {isAI ? renderFormattedBubble(chat.content) : <div>{chat.content}</div>}
              </div>
            )
          })}

          {phase === "THINKING" && (
            <div className="flex justify-start">
              <div className="bg-slate-900/[0.02] dark:bg-white/[0.02] border border-slate-900/[0.04] dark:border-white/[0.04] rounded-2xl rounded-tl-none p-3 px-4 flex items-center gap-1 text-[10px] text-muted-foreground font-semibold tracking-wider animate-pulse">
                <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce delay-100" />
                <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce delay-200" />
                <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce delay-300" />
                <span>LINK SYNCING...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar Form */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white/[0.01] border-t border-slate-900/[0.05] dark:border-white/[0.05] flex gap-2">
          <input
            type="text"
            id="mentor-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isStreaming}
            placeholder="Sync a question with Luminous..."
            className="flex-1 bg-slate-900/[0.02] dark:bg-white/[0.02] border border-slate-900/10 dark:border-white/10 hover:border-slate-900/10 dark:border-white/10 focus:border-slate-900/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-muted-foreground/50 outline-none transition-all duration-300 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isStreaming}
            className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 cursor-pointer shadow-[0_4px_12px_rgba(6,182,212,0.1)] hover:scale-105 hover:bg-cyan-500/20 transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
      </div>
    </>
  )
}

export default MentorPanel
