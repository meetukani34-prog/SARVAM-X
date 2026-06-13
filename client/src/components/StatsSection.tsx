import React, { useEffect, useRef, useState } from "react"

function useCountUp(target: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!startOnView) return
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const start = Date.now()
          const tick = () => {
            const elapsed = Date.now() - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
            setCount(Math.floor(eased * target))
            if (progress < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration, startOnView])

  return { count, ref }
}

interface StatItem {
  value: number
  suffix: string
  label: string
  icon: React.ReactNode
  color: string
}

const StatsSection: React.FC = () => {
  const stats: StatItem[] = [
    {
      value: 142,
      suffix: "+",
      label: "Active Analyses Running",
      color: "text-primary",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
    },
    {
      value: 94,
      suffix: ".7%",
      label: "AI Detection Accuracy",
      color: "text-emerald-400",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      value: 23,
      suffix: "",
      label: "Threats Detected Today",
      color: "text-purple",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      ),
    },
    {
      value: 12,
      suffix: "+",
      label: "AI Models Deployed",
      color: "text-cyan-400",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z" />
        </svg>
      ),
    },
  ]

  return (
    <section className="relative py-12 sm:py-20 px-4 sm:px-6 md:px-12 z-10">
      {/* Divider line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] max-w-5xl h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {stats.map((stat, i) => {
          const { count, ref } = useCountUp(stat.value)
          return (
            <div
              key={i}
              ref={ref}
              className="group relative flex flex-col items-center text-center p-6 md:p-8 rounded-2xl border border-slate-900/10 dark:border-white/10 bg-slate-900/[0.02] dark:bg-white/[0.02] hover:bg-white/[0.04] hover:border-slate-900/10 dark:border-white/10 transition-all duration-500"
            >
              {/* Icon */}
              <div className={`${stat.color} mb-4 opacity-60 group-hover:opacity-100 transition-opacity`}>
                {stat.icon}
              </div>
              {/* Number */}
              <div className={`text-4xl md:text-5xl font-bold ${stat.color} tabular-nums`}>
                {count}{stat.suffix}
              </div>
              {/* Label */}
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground/60 mt-3 font-medium">
                {stat.label}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default StatsSection
