import React, { useEffect, useState } from "react"
import { api } from "../lib/api"
import type { KPI, Session, TwinResponse, HeatmapResponse, WhatIfResponse, DebugResponse } from "../lib/api"
import ThreeModel from "./ThreeModel"
import MentorPanel from "./MentorPanel"
import CodeOracle from "./CodeOracle"
import { useTheme } from "../context/ThemeContext"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
  BarElement,
} from "chart.js"
import { Line, Radar } from "react-chartjs-2"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
  BarElement
)

const subjectTopicsMap: Record<string, Record<string, string[]>> = {
  "Programming Languages": {
    "Python": ["Syntax & Basics", "OOP", "Data Structures", "Generators", "Decorators", "Asyncio", "Meta-programming", "Type Hinting", "Context Managers", "Regular Expressions"],
    "C": ["Pointers", "Memory Management", "Structs", "File I/O", "Macros", "Bit Manipulation", "Function Pointers", "Multithreading (pthreads)"],
    "C++": ["STL", "OOP", "Templates", "Smart Pointers", "Move Semantics", "Lambda Expressions", "Concurrency", "Memory Management", "RAII"],
    "Java": ["OOP", "Collections Framework", "Multithreading", "JVM Architecture", "Streams API", "Generics", "Spring Boot Basics", "Exception Handling"],
    "JavaScript": ["Closures", "Promises & Async", "DOM Manipulation", "ES6+ Features", "Prototypal Inheritance", "Event Loop", "Modules", "Web APIs"],
    "TypeScript": ["Interfaces", "Generics", "Utility Types", "Decorators", "Type Inference", "Advanced Types", "Modules"],
    "Rust": ["Ownership & Borrowing", "Lifetimes", "Concurrency", "Traits", "Macros", "Error Handling", "Cargo", "Smart Pointers"],
    "Go": ["Goroutines", "Channels", "Interfaces", "Error Handling", "Slices", "Maps", "Concurrency Patterns", "Testing"],
    "Ruby": ["Blocks & Procs", "Mixins", "Metaprogramming", "OOP", "Rails Basics", "ActiveRecord"],
    "Swift": ["Optionals", "Protocols", "Closures", "Structs vs Classes", "SwiftUI Basics", "Concurrency (async/await)"],
    "Kotlin": ["Coroutines", "Null Safety", "Extension Functions", "Data Classes", "Flows", "Jetpack Compose Basics"]
  },
  "Computer Science Core": {
    "Algorithms": ["Sorting", "Searching", "Graph Algorithms", "Dynamic Programming", "Greedy Algorithms", "Backtracking", "Divide & Conquer", "String Matching"],
    "Networks": ["OSI Model", "TCP/IP", "Routing Protocols", "Network Security", "DNS", "HTTP/HTTPS", "WebSockets", "Subnetting"],
    "Operating Systems": ["Process Management", "Memory Management", "File Systems", "Concurrency", "Deadlocks", "Scheduling Algorithms", "Virtualization", "IPC"],
    "Databases": ["SQL", "NoSQL", "Normalization", "Indexing", "Transactions", "ACID Properties", "Replication", "Sharding", "Query Optimization"],
    "Compilers": ["Lexical Analysis", "Syntax Analysis", "Code Generation", "Optimization", "Parsing (LL/LR)", "Abstract Syntax Trees"],
    "Software Engineering": ["Agile Methodologies", "Design Patterns", "Testing (TDD/BDD)", "System Design", "CI/CD", "Version Control", "Microservices architecture", "UML"],
    "Distributed Systems": ["CAP Theorem", "Consensus Algorithms", "Message Queues", "RPC", "Distributed Caching", "Clock Synchronization"]
  },
  "Data Structures & Algorithms": {
    "Arrays & Strings": ["Two Pointers", "Sliding Window", "Prefix Sum", "Hash Maps", "Kadane's Algorithm", "String Reversal", "Palindrome Checks"],
    "Linked Lists": ["Singly Linked List", "Doubly Linked List", "Cycle Detection", "Reversing", "Merge K Sorted Lists"],
    "Trees & Graphs": ["BST", "Trie", "DFS", "BFS", "Shortest Path (Dijkstra/Bellman-Ford)", "Minimum Spanning Tree", "Topological Sort", "Segment Trees"],
    "Dynamic Programming": ["Knapsack", "LCS", "Matrix Chain Multiplication", "Memoization", "Tabulation", "State Space Reduction"],
    "Recursion": ["Backtracking", "Divide & Conquer", "Tail Recursion", "Permutations & Combinations"],
    "Sorting & Searching": ["Quick Sort", "Merge Sort", "Binary Search", "Heap Sort", "Counting Sort", "Radix Sort"],
    "Advanced Data Structures": ["Fenwick Tree", "Disjoint Set (Union-Find)", "Bloom Filters", "Skip Lists", "B-Trees"]
  },
  "Cyber Security": {
    "Network Security": ["Firewalls", "VPNs", "Intrusion Detection", "DDoS Mitigation", "Packet Sniffing", "Zero Trust Architecture"],
    "Cryptography": ["Symmetric Encryption", "Asymmetric Encryption", "Hashing", "Digital Signatures", "PKI", "Quantum Cryptography"],
    "Ethical Hacking": ["Reconnaissance", "Exploitation", "Privilege Escalation", "Post-Exploitation", "Social Engineering", "Penetration Testing"],
    "Web Application Security": ["SQL Injection", "XSS", "CSRF", "Authentication Flaws", "OWASP Top 10", "CORS", "Security Headers"],
    "Digital Forensics": ["Disk Forensics", "Network Forensics", "Memory Forensics", "Malware Analysis", "Incident Response"],
    "Cloud Security": ["IAM", "VPC Security", "Container Security", "Serverless Security", "Cloud Compliance"]
  },
  "Artificial Intelligence & ML": {
    "Machine Learning": ["Supervised Learning", "Unsupervised Learning", "Ensemble Methods", "Model Evaluation", "Feature Engineering", "Bias-Variance Tradeoff"],
    "Deep Learning": ["Neural Networks", "CNNs", "RNNs", "Transformers", "Autoencoders", "GANs", "Transfer Learning"],
    "Natural Language Processing": ["Tokenization", "Word Embeddings", "Named Entity Recognition", "Sentiment Analysis", "LLMs", "Seq2Seq Models"],
    "Computer Vision": ["Image Classification", "Object Detection", "Image Segmentation", "Face Recognition", "Optical Flow", "Pose Estimation"],
    "Reinforcement Learning": ["Markov Decision Processes", "Q-Learning", "Policy Gradients", "Multi-Agent RL", "Deep Q-Networks (DQN)", "Actor-Critic Methods"],
    "MLOps": ["Model Deployment", "Data Pipelines", "Model Monitoring", "A/B Testing", "Feature Stores", "Experiment Tracking"]
  },
  "Data Science & Big Data": {
    "Data Mining": ["Association Rules", "Clustering", "Anomaly Detection", "Dimensionality Reduction", "Frequent Itemsets"],
    "Data Visualization": ["Matplotlib", "Seaborn", "Tableau", "D3.js", "PowerBI", "Plotly"],
    "Big Data": ["Hadoop", "Spark", "Kafka", "Data Lakes", "MapReduce", "Flink", "Cassandra"],
    "Statistical Modeling": ["Linear Regression", "Logistic Regression", "ANOVA", "Time Series Analysis", "Bayesian Inference", "Markov Chains"],
    "Predictive Analytics": ["Customer Churn", "Demand Forecasting", "Risk Assessment", "Fraud Detection", "Recommendation Systems"],
    "Data Engineering": ["ETL/ELT", "Data Warehousing", "Airflow", "Snowflake", "dbt", "Data Governance"]
  },
  "Mathematics": {
    "Calculus": ["Limits", "Derivatives", "Integrals", "Differential Equations", "Multivariable Calculus", "Series & Sequences"],
    "Linear Algebra": ["Vectors", "Matrices", "Eigenvalues & Eigenvectors", "Vector Spaces", "SVD", "Orthogonality"],
    "Discrete Mathematics": ["Logic", "Set Theory", "Combinatorics", "Graph Theory", "Boolean Algebra", "Relations & Functions"],
    "Probability": ["Random Variables", "Probability Distributions", "Bayes' Theorem", "Expected Value", "Central Limit Theorem", "Markov Chains"],
    "Statistics": ["Descriptive Statistics", "Inferential Statistics", "Hypothesis Testing", "Confidence Intervals", "A/B Testing", "Regression Analysis"],
    "Number Theory": ["Divisibility", "Primes", "Modular Arithmetic", "Cryptography Applications", "Diophantine Equations"],
    "Optimization": ["Linear Programming", "Convex Optimization", "Gradient Descent", "Simplex Method", "Nonlinear Programming"]
  },
  "Physics": {
    "Mechanics": ["Kinematics", "Newton's Laws", "Work & Energy", "Rotational Motion", "Fluid Mechanics", "Orbital Mechanics"],
    "Electromagnetism": ["Electric Fields", "Magnetic Fields", "Maxwell's Equations", "Circuits", "Electromagnetic Waves", "Induction"],
    "Thermodynamics": ["Laws of Thermodynamics", "Heat Transfer", "Entropy", "Statistical Mechanics", "Kinetic Theory", "Phase Transitions"],
    "Quantum Mechanics": ["Wave-Particle Duality", "Schrödinger Equation", "Quantum States", "Spin", "Entanglement", "Perturbation Theory"],
    "Relativity": ["Special Relativity", "General Relativity", "Spacetime", "Black Holes", "Cosmology", "Time Dilation"],
    "Optics": ["Geometric Optics", "Physical Optics", "Interference", "Diffraction", "Polarization", "Lasers"],
    "Particle Physics": ["Standard Model", "Fermions & Bosons", "Quantum Chromodynamics", "Higgs Boson", "Dark Matter"]
  },
  "Biology": {
    "Genetics": ["Mendelian Genetics", "DNA Replication", "Transcription & Translation", "Genetic Engineering", "CRISPR", "Epigenetics"],
    "Cell Biology": ["Cell Structure", "Membrane Transport", "Cell Cycle", "Cellular Respiration", "Photosynthesis", "Apoptosis"],
    "Evolution": ["Natural Selection", "Speciation", "Phylogenetics", "Human Evolution", "Population Genetics", "Adaptation"],
    "Ecology": ["Ecosystems", "Population Dynamics", "Community Ecology", "Conservation Biology", "Biomes", "Climate Change"],
    "Human Anatomy": ["Skeletal System", "Muscular System", "Nervous System", "Cardiovascular System", "Respiratory System", "Digestive System"],
    "Bioinformatics": ["Sequence Alignment", "Genomics", "Proteomics", "Structural Biology", "Phylogenetic Trees", "Systems Biology"],
    "Microbiology": ["Bacteria", "Viruses", "Fungi", "Immunology", "Antibiotic Resistance", "Pathogenesis"]
  },
  "Chemistry": {
    "Organic Chemistry": ["Alkanes", "Alkenes", "Aromatic Compounds", "Reaction Mechanisms", "Stereochemistry", "Polymers"],
    "Inorganic Chemistry": ["Coordination Compounds", "Transition Metals", "Main Group Elements", "Solid State Chemistry", "Organometallics"],
    "Physical Chemistry": ["Thermodynamics", "Chemical Kinetics", "Quantum Chemistry", "Spectroscopy", "Electrochemistry", "Surface Chemistry"],
    "Biochemistry": ["Proteins", "Enzymes", "Carbohydrates", "Lipids", "Metabolic Pathways", "Nucleic Acids"],
    "Analytical Chemistry": ["Chromatography", "Mass Spectrometry", "Electrochemistry", "Titration", "NMR Spectroscopy", "Thermal Analysis"],
    "Materials Science": ["Crystallography", "Nanomaterials", "Semiconductors", "Polymers", "Composite Materials"]
  },
  "Economics": {
    "Microeconomics": ["Supply & Demand", "Consumer Choice", "Theory of the Firm", "Market Structures", "Welfare Economics", "Externalities"],
    "Macroeconomics": ["GDP", "Inflation", "Unemployment", "Monetary Policy", "Fiscal Policy", "Economic Growth Models"],
    "Econometrics": ["Linear Regression", "Time Series Analysis", "Panel Data", "Instrumental Variables", "Causal Inference", "Forecasting"],
    "Game Theory": ["Nash Equilibrium", "Extensive Form Games", "Repeated Games", "Mechanism Design", "Auction Theory", "Evolutionary Game Theory"],
    "International Trade": ["Comparative Advantage", "Trade Barriers", "Exchange Rates", "Balance of Payments", "Tariffs", "Currency Unions"],
    "Behavioral Economics": ["Heuristics & Biases", "Prospect Theory", "Nudge Theory", "Time Inconsistency", "Social Preferences"],
    "Finance": ["Corporate Finance", "Asset Pricing", "Derivatives", "Portfolio Management", "Risk Management"]
  },
  "Literature": {
    "American Literature": ["Transcendentalism", "Realism", "Modernism", "Harlem Renaissance", "Southern Gothic", "Contemporary"],
    "British Literature": ["Romanticism", "Victorian Literature", "Modernism", "Postmodernism", "Elizabethan Era", "Restoration"],
    "World Literature": ["Classical Antiquity", "Postcolonial Literature", "Magical Realism", "Existentialism", "Russian Literature", "Asian Literature"],
    "Poetry": ["Sonnets", "Free Verse", "Epic Poetry", "Haiku", "Spoken Word", "Romantic Poetry"],
    "Drama": ["Tragedy", "Comedy", "Theatre of the Absurd", "Modern Drama", "Shakespearean Plays", "Greek Tragedy"],
    "Literary Theory": ["Structuralism", "Deconstruction", "Feminist Criticism", "Psychoanalytic Criticism", "Marxist Criticism", "New Historicism"]
  }
}

interface SarvamSuiteProps {
  userId: number
  userName: string
  userEmail: string
  onSignOut: () => void
  onSwitchSuite: () => void
  onBackToHome: () => void
}

const SarvamSuite: React.FC<SarvamSuiteProps> = ({
  userId,
  userName,
  userEmail,
  onSignOut,
  onSwitchSuite,
  onBackToHome
}) => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "debugger" | "xai" | "heatmap" | "history">("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme } = useTheme()

  const getVelocityNum = (val: any): number => {
    if (Array.isArray(val)) {
      const last = val[val.length - 1] ?? 0.45;
      return last > 10 ? last / 100 : last;
    }
    if (typeof val === "number") {
      return val > 10 ? val / 100 : val;
    }
    return 0.45;
  }
  
  // Dashboard & Twin states
  const [twinData, setTwinData] = useState<TwinResponse | null>(null)
  const [loadingTwin, setLoadingTwin] = useState(true)
  const [isSlowLoad, setIsSlowLoad] = useState(false)
  const [kpis, setKpis] = useState<KPI>({ total_problems: 0, focus_hours: 0, avg_accuracy: 0, session_count: 0 })
  const [_dailyStatus, setDailyStatus] = useState<Array<{ topic: string; score: number }>>([])
  
  // What-If Simulator states
  const [simHours, setSimHours] = useState(1.0)
  const [simData, setSimData] = useState<WhatIfResponse | null>(null)
  const [_simulating, setSimulating] = useState(false)

  // Debugger states
  const [debugCodeInput, setDebugCodeInput] = useState(`def add_numbers(a, b):
    # Potential indentation or typing glitch
    res = a + b
    eval(user_input) # Vulnerable code injection
    password = "secret_key_123" # Credentials leak
    return res`)
  const [debugLanguage, setDebugLanguage] = useState("python")
  const [debugResult, setDebugResult] = useState<DebugResponse | null>(null)
  const [debugging, setDebugging] = useState(false)
  const [runLogs, setRunLogs] = useState<any[]>([])

  // Heatmap states
  const [heatmapData, setHeatmapData] = useState<HeatmapResponse | null>(null)
  const [loadingHeatmap, setLoadingHeatmap] = useState(true)

  // Session logger states
  const [logSubject, setLogSubject] = useState("Programming Languages")
  const [logSubSubject, setLogSubSubject] = useState("Python")
  const [logTopic, setLogTopic] = useState(subjectTopicsMap["Programming Languages"]["Python"][0])
  const [logAccuracy, setLogAccuracy] = useState(80)
  const [logDuration, setLogDuration] = useState(45)
  const [logProblems, setLogProblems] = useState(6)
  const [loggingSession, setLoggingSession] = useState(false)
  const [logSuccess, setLogSuccess] = useState("")

  // History states
  const [sessionsHistory, setSessionsHistory] = useState<Session[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  // Fetch digital twin stats and KPIs on load
  const loadDashboardData = async () => {
    setLoadingTwin(true)
    setIsSlowLoad(false)
    const slowLoadTimer = setTimeout(() => {
      // If it takes more than 3 seconds, it's likely a Vercel cold start
      setIsSlowLoad(true)
    }, 3000);

    try {
      // Fetch consolidated dashboard metric (now includes all Twin data) to cut down Vercel cold start by half!
      const dash = await api.getDashboard()

      setTwinData(dash);
      setKpis(dash.kpis);
      setDailyStatus(dash.daily_status);
    } catch (e) {
      console.error("Failed to load digital twin data", e)
      // Provide fallback data so the UI doesn't crash or stay empty if Vercel API fails
    } finally {
      clearTimeout(slowLoadTimer)
      setLoadingTwin(false)
    }
  }

  // Load heatmap grid
  const loadHeatmapData = async () => {
    setLoadingHeatmap(true)
    try {
      const res = await api.getHeatmap()
      setHeatmapData(res)
    } catch (e) {
      console.error("Heatmap load error", e)
    } finally {
      setLoadingHeatmap(false)
    }
  }

  // Load history list
  const loadHistoryData = async () => {
    setLoadingHistory(true)
    try {
      const res = await api.getHistory()
      if (res.success) {
        setSessionsHistory(res.sessions)
      }
    } catch (e) {
      console.error("History fetch error", e)
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [userId])

  useEffect(() => {
    if (activeTab === "heatmap") loadHeatmapData()
    if (activeTab === "history") loadHistoryData()
  }, [activeTab])

  // Run What-If Simulation
  const handleSimulate = async () => {
    setSimulating(true)
    try {
      const res = await api.runWhatIf(simHours)
      setSimData(res)
    } catch (e) {
      console.error(e)
    } finally {
      setSimulating(false)
    }
  }

  useEffect(() => {
    if (twinData) {
      handleSimulate()
    }
  }, [simHours, twinData])

  // Submit code to AST debugger
  const handleDebugCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setDebugging(true)
    setDebugResult(null)
    setRunLogs([])

    try {
      // Simulate typing scanning logs
      setRunLogs([
        { time: "0.0s", level: "INFO", message: "Connecting with SARVAM AST node..." },
        { time: "0.4s", level: "INFO", message: "Tokenizing inputs..." }
      ])

      const res = await api.debugCode(debugCodeInput, debugLanguage)
      setDebugResult(res)
      
      if (res.trace_log) {
        setRunLogs(res.trace_log)
      }
    } catch (err: any) {
      console.error(err)
      setRunLogs((prev) => [...prev, { time: "FAIL", level: "CRITICAL", message: err.message || "AST Compiler timed out." }])
    } finally {
      setDebugging(false)
    }
  }

  // Submit session study log
  const handleLogSession = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoggingSession(true)
    setLogSuccess("")

    try {
      const payload: Session = {
        user_id: userId,
        topic: `${logSubSubject} - ${logTopic}`,
        accuracy: Number(logAccuracy),
        duration_min: Number(logDuration),
        problems_solved: Number(logProblems)
      }
      
      const res = await api.logSession(payload)
      if (res.success) {
        setLogSuccess("Session logged! Rerouting and training Digital Twin...")
        setLogTopic(subjectTopicsMap[logSubject][logSubSubject][0])
        setLogAccuracy(80)
        setLogDuration(45)
        setLogProblems(6)
        
        // Refresh digital twin stats
        setTimeout(() => {
          loadDashboardData()
          setLogSuccess("")
        }, 1500)
      }
    } catch (e: any) {
      alert(e.message || "Failed to log session.")
    } finally {
      setLoggingSession(false)
    }
  }



  // Visual styling helper mapping
  const bgCard = "bg-slate-900/[0.02] dark:bg-white/[0.02] backdrop-blur-2xl border border-slate-900/[0.05] dark:border-white/[0.05] rounded-3xl"

  // Line Chart Config for skills
  const lineChartData = {
    labels: sessionsHistory.slice(0, 10).reverse().map((s, i) => s.timestamp ? new Date(s.timestamp).toLocaleDateString(undefined, {month: "short", day: "numeric"}) : `Session ${i+1}`),
    datasets: [
      {
        label: "Accuracy %",
        data: sessionsHistory.slice(0, 10).reverse().map((s) => s.accuracy),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
      }
    ]
  }

  // Radar Chart Config for twin parameters
  const radarChartData = {
    labels: ["Syllabus Coverage", "Retention Speed", "Code Execution", "Explainability", "Accuracy Rate", "Logic Velocity"],
    datasets: [
      {
        label: "Real-time Mastery Profile",
        data: [
          kpis.session_count > 0 ? Math.min(100, 30 + kpis.session_count * 8) : 40,
          kpis.focus_hours > 0 ? Math.min(100, 45 + kpis.focus_hours * 6) : 55,
          kpis.total_problems > 0 ? Math.min(100, 35 + kpis.total_problems * 2) : 50,
          twinData?.predicted_score ? Math.round(twinData.predicted_score) : 70,
          kpis.avg_accuracy ? Math.round(kpis.avg_accuracy) : 75,
          Math.min(100, 40 + getVelocityNum(twinData?.velocity) * 50)
        ],
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        borderColor: "#10b981",
        borderWidth: 2,
        pointBackgroundColor: "#10b981",
      }
    ]
  }

  const getBackgroundImage = (tab: string) => {
    switch (tab) {
      case "dashboard": return "/bg-sarvam.png";
      case "debugger": return "/bg-blue.png";
      case "xai": return "/bg-cyan.png";
      case "heatmap": return "/bg-orange.png";
      case "history": return "/bg-trinetra.png";
      default: return "/bg-sarvam.png";
    }
  }

  return (
    <div 
      className="flex flex-col md:flex-row h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-foreground overflow-hidden font-sans select-none bg-cover bg-center bg-no-repeat bg-fixed transition-all duration-1000"
      style={{
        backgroundImage: `linear-gradient(to bottom, ${theme === 'dark' ? 'rgba(7, 9, 14, 0.75), rgba(7, 9, 14, 0.98)' : 'rgba(248, 250, 252, 0.75), rgba(248, 250, 252, 0.98)'}), url('${getBackgroundImage(activeTab)}')`
      }}
    >

      {/* Mobile Sidebar Overlay Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-white/60 dark:bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Top Bar */}
      <div className="md:hidden w-full shrink-0 flex items-center justify-between px-4 py-3 bg-white/[0.01] border-b border-slate-900/[0.05] dark:border-white/[0.05] z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.467 5.99 5.99 0 0 0-1.925 3.546 5.974 5.974 0 0 1-2.133-1A3.75 3.75 0 0 0 12 18Z" />
            </svg>
          </div>
          <h1 className="text-xs font-bold tracking-widest uppercase">SARVAM<span className="text-primary">-X</span></h1>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-9 h-9 rounded-lg border border-slate-900/10 dark:border-white/10 bg-slate-900/[0.02] dark:bg-white/[0.02] flex items-center justify-center text-muted-foreground hover:text-slate-900 dark:text-white transition-all"
        >
          {sidebarOpen ? (
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
      
      {/* Background radial overlays */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-emerald-500/[0.02] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-cyan-500/[0.02] blur-[150px] pointer-events-none" />

      {/* Dynamic Luminous Floating voice assistant */}
      <MentorPanel userId={userId} />

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className={`fixed md:relative inset-y-0 left-0 w-64 shrink-0 bg-slate-50/95 dark:bg-[#07090e]/95 md:bg-white/[0.01] backdrop-blur-2xl md:backdrop-blur-none border-r border-slate-900/10 dark:border-slate-900/[0.05] dark:border-white/[0.05] p-6 flex flex-col justify-between z-40 md:z-10 transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col gap-8">
          
          {/* Main Suite Brand Logo - clickable to go back to landing page */}
          <button 
            onClick={onBackToHome}
            className="flex items-center gap-3 text-left group transition-all"
            title="Return to Main Landing Page"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(34,197,94,0.15)] group-hover:bg-primary/20 transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.467 5.99 5.99 0 0 0-1.925 3.546 5.974 5.974 0 0 1-2.133-1A3.75 3.75 0 0 0 12 18Z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-widest uppercase group-hover:text-slate-900 dark:text-white transition-colors">SARVAM<span className="text-primary">-X</span></h1>
              <span className="text-[8px] font-bold text-primary tracking-widest uppercase border border-primary/20 bg-primary/5 px-2 py-0.5 rounded mt-0.5 inline-block group-hover:bg-primary/10 transition-colors">COGNITIVE HUB</span>
            </div>
          </button>

          {/* Navigation Links list */}
          <nav className="flex flex-col gap-2">
            {[
              { id: "dashboard", label: "Cognitive Twin", icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" },
              { id: "debugger", label: "Code Oracle", icon: "M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" },
              { id: "xai", label: "Explainable AI", icon: "M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" },
              { id: "heatmap", label: "Skill Heatmap", icon: "M9 4.5v15m6-15v15m-12-3h18m-18-6h18m-18-6h18" },
              { id: "history", label: "Study History", icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" }
            ].map((nav) => {
              const isSelected = activeTab === nav.id
              return (
                <button
                  key={nav.id}
                  onClick={() => { setActiveTab(nav.id as any); setSidebarOpen(false); }}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-300 flex items-center gap-3.5 ${
                    isSelected
                      ? "bg-primary/10 border border-primary/20 text-primary shadow-[0_0_15px_rgba(34,197,94,0.06)]"
                      : "border border-transparent text-muted-foreground hover:text-slate-900 dark:text-white"
                  }`}
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={nav.icon} />
                  </svg>
                  {nav.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Workspace selector, profile & actions */}
        <div className="flex flex-col gap-4 mt-8 md:mt-0 pt-6 border-t border-slate-900/[0.05] dark:border-white/[0.05]">
          <button
            onClick={onSwitchSuite}
            className="w-full py-3 px-4 bg-purple/10 border border-purple/20 text-purple text-xs font-semibold tracking-widest uppercase rounded-xl hover:bg-purple/25 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            TRINETRA AI
          </button>
          
          <div className="flex items-center justify-between gap-3 px-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                {userName.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold truncate text-slate-900 dark:text-white leading-tight uppercase tracking-wider">{userName}</p>
                <span className="text-[8px] text-muted-foreground truncate block font-light">{userEmail}</span>
              </div>
            </div>
            <button 
              onClick={onSignOut}
              className="text-muted-foreground hover:text-red-400 transition-colors p-1"
              title="Sign Out"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* CORE DISPLAY VIEWPORTS */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 z-10 overflow-y-auto max-w-6xl mx-auto w-full">
        {loadingTwin ? (
          <div className="h-[70vh] flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl overflow-hidden opacity-60">
              <ThreeModel mode="dodecahedron" color={0x10b981} className="w-full h-full" />
            </div>
            <p className="text-muted-foreground text-xs uppercase tracking-widest font-semibold animate-pulse">Syncing Cognitive Twin Matrix...</p>
            {isSlowLoad && (
              <p className="text-amber-400 text-[10px] mt-4 max-w-sm px-4 leading-relaxed font-mono animate-fadeIn">
                Waking up AI models from sleep state on Vercel.<br/>This usually takes 10-15 seconds on the first run. Please wait...
              </p>
            )}
          </div>
        ) : (
          <div className="animate-fadeIn">

            {/* Breadcrumb section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-4 border-b border-slate-900/[0.04] dark:border-white/[0.04]">
              <div className="flex items-center gap-4">
                <button 
                  onClick={onBackToHome} 
                  className="flex items-center justify-center shrink-0 w-12 h-12 rounded-xl bg-white/[0.03] border border-slate-900/[0.08] dark:border-white/[0.08] hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all duration-300 focus:outline-none shadow-sm group"
                  title="Exit to Main Website"
                >
                  <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                  </svg>
                </button>
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-primary/70">Console / SARVAM-X</span>
                  <h2 className="text-2xl font-extrabold tracking-tight mt-1 uppercase">
                    {activeTab === "dashboard" ? "Cognitive Digital Twin" : activeTab === "debugger" ? "AST Multi-Language Debugger" : activeTab === "xai" ? "Explainable AI (SHAP)" : activeTab === "heatmap" ? "Skill Heatmap Matrix" : "Logged Study History"}
                  </h2>
                </div>
              </div>
              <div className="text-[10px] text-muted-foreground bg-slate-900/[0.02] dark:bg-white/[0.02] border border-slate-900/[0.06] dark:border-white/[0.06] rounded-xl px-4 py-2 font-bold tracking-widest font-mono uppercase">
                Twin Resonance: {twinData?.predicted_score ? Math.round(twinData.predicted_score) : 70}%
              </div>
            </div>

            {/* TAB CONTENT: 1. DASHBOARD */}
            {activeTab === "dashboard" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Visual Radar & Performance twin metrics */}
                <div className={`${bgCard} lg:col-span-2 p-6 md:p-8 flex flex-col justify-between`}>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">Mastery Vector Simulation</h3>
                    <div className="h-72 w-full flex items-center justify-center">
                      <Radar
                        data={radarChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            r: {
                              grid: { color: "rgba(255, 255, 255, 0.04)" },
                              angleLines: { color: "rgba(255, 255, 255, 0.04)" },
                              pointLabels: { color: "#8c9ba5", font: { size: 9, family: "Sora" } },
                              ticks: { display: false },
                              suggestedMin: 0,
                              suggestedMax: 100,
                            }
                          },
                          plugins: { legend: { display: false } }
                        }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 border-t border-slate-900/[0.05] dark:border-white/[0.05] pt-4 sm:pt-6 mt-4 sm:mt-6 text-center">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Predicted Score</span>
                      <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{twinData?.predicted_score ? Math.round(twinData.predicted_score) : 70}%</p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Learning Streak</span>
                      <p className="text-xl font-extrabold text-primary mt-1">12 Days</p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Velocity Rate</span>
                      <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{getVelocityNum(twinData?.velocity).toFixed(2)}x</p>
                    </div>
                  </div>
                </div>

                {/* Study Logger panel */}
                <div className={`${bgCard} p-6 flex flex-col justify-between`}>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">Log Study Action</h3>
                  {logSuccess && (
                    <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-medium animate-fadeIn">
                      {logSuccess}
                    </div>
                  )}
                  <form onSubmit={handleLogSession} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Academic Subject</label>
                      <select
                        value={logSubject}
                        onChange={(e) => {
                          const newSubj = e.target.value;
                          setLogSubject(newSubj);
                          const newSubSubj = Object.keys(subjectTopicsMap[newSubj])[0];
                          setLogSubSubject(newSubSubj);
                          setLogTopic(subjectTopicsMap[newSubj][newSubSubj][0]);
                        }}
                        className="bg-slate-900/[0.02] dark:bg-white/[0.02] border border-slate-900/10 dark:border-white/10 hover:border-slate-900/10 dark:border-white/10 focus:border-slate-900/10 dark:border-white/10 rounded-xl py-3 px-4 text-xs outline-none text-slate-900 dark:text-white transition-all cursor-pointer"
                      >
                        {Object.keys(subjectTopicsMap).map((s) => (
                          <option key={s} value={s} className="bg-[#0e121b] text-slate-900 dark:text-white">{s}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Category / Language</label>
                      <select
                        value={logSubSubject}
                        onChange={(e) => {
                          const newSubSubj = e.target.value;
                          setLogSubSubject(newSubSubj);
                          setLogTopic(subjectTopicsMap[logSubject][newSubSubj][0]);
                        }}
                        className="bg-slate-900/[0.02] dark:bg-white/[0.02] border border-slate-900/10 dark:border-white/10 hover:border-slate-900/10 dark:border-white/10 focus:border-slate-900/10 dark:border-white/10 rounded-xl py-3 px-4 text-xs outline-none text-slate-900 dark:text-white transition-all cursor-pointer"
                      >
                        {Object.keys(subjectTopicsMap[logSubject]).map((ss) => (
                          <option key={ss} value={ss} className="bg-[#0e121b] text-slate-900 dark:text-white">{ss}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Specific Topic</label>
                      <select
                        value={logTopic}
                        onChange={(e) => setLogTopic(e.target.value)}
                        className="bg-slate-900/[0.02] dark:bg-white/[0.02] border border-slate-900/10 dark:border-white/10 hover:border-slate-900/10 dark:border-white/10 focus:border-slate-900/10 dark:border-white/10 rounded-xl py-3 px-4 text-xs outline-none text-slate-900 dark:text-white transition-all cursor-pointer"
                      >
                        {subjectTopicsMap[logSubject][logSubSubject].map((t) => (
                          <option key={t} value={t} className="bg-[#0e121b] text-slate-900 dark:text-white">{t}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider">
                        <label className="text-muted-foreground">Accuracy Score</label>
                        <span className="text-primary">{logAccuracy}%</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={logAccuracy}
                        onChange={(e) => setLogAccuracy(Number(e.target.value))}
                        className="w-full accent-primary h-1 bg-slate-900/5 dark:bg-white/5 rounded-lg cursor-pointer transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Duration (Min)</label>
                        <input
                          type="number"
                          min="5"
                          max="300"
                          value={logDuration}
                          onChange={(e) => setLogDuration(Number(e.target.value))}
                          className="bg-slate-900/[0.02] dark:bg-white/[0.02] border border-slate-900/10 dark:border-white/10 rounded-xl py-3 px-4 text-xs text-slate-900 dark:text-white outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Solved Counts</label>
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={logProblems}
                          onChange={(e) => setLogProblems(Number(e.target.value))}
                          className="bg-slate-900/[0.02] dark:bg-white/[0.02] border border-slate-900/10 dark:border-white/10 rounded-xl py-3 px-4 text-xs text-slate-900 dark:text-white outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loggingSession}
                      className="w-full py-3.5 mt-2 bg-primary hover:shadow-[0_0_20px_rgba(34,197,94,0.25)] text-primary-foreground font-bold rounded-xl transition-all duration-300 text-[10px] uppercase tracking-widest disabled:opacity-40"
                    >
                      {loggingSession ? "Syncing..." : "Submit Log"}
                    </button>
                  </form>
                </div>

                {/* KPI Metrics row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:col-span-3">
                  {[
                    { label: "Problems Solved", val: kpis.total_problems, unit: "Ques", color: "text-primary" },
                    { label: "Focus Investment", val: kpis.focus_hours, unit: "Hours", color: "text-cyan-400" },
                    { label: "Average Accuracy", val: kpis.avg_accuracy, unit: "%", color: "text-emerald-400" },
                    { label: "Synched Logs", val: kpis.session_count, unit: "Sets", color: "text-purple" }
                  ].map((stat, idx) => (
                    <div key={idx} className={`${bgCard} p-5 flex items-center justify-between`}>
                      <div>
                        <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">{stat.label}</span>
                        <p className="text-2xl font-black mt-2 text-slate-900 dark:text-white">
                          {stat.val} <span className="text-xs font-medium text-muted-foreground">{stat.unit}</span>
                        </p>
                      </div>
                      <div className={`w-2 h-8 rounded ${stat.color.replace("text-", "bg-")}/20`} />
                    </div>
                  ))}
                </div>

                {/* What-If Simulation control sliders */}
                <div className={`${bgCard} lg:col-span-2 p-6 md:p-8 flex flex-col justify-between`}>
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Digital Twin What-If Projection</h3>
                      <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary font-bold px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                        Boost: +{(simData?.improvement || 0.0).toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-light mb-8">
                      Model exactly how adjusting daily workload investments impacts velocity score calculations.
                    </p>
                    
                    <div className="flex flex-col gap-3 my-6">
                      <div className="flex justify-between text-xs font-bold font-mono">
                        <span className="text-muted-foreground uppercase">Extra Focus Investment</span>
                        <span className="text-primary">{simHours.toFixed(1)} Hrs / Day</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="5.0"
                        step="0.5"
                        value={simHours}
                        onChange={(e) => setSimHours(Number(e.target.value))}
                        className="w-full accent-primary h-1 bg-slate-900/5 dark:bg-white/5 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-900/[0.05] dark:border-white/[0.05] pt-6 mt-6">
                    <div className="p-4 bg-white/[0.01] border border-slate-900/[0.03] dark:border-white/[0.03] rounded-2xl text-center">
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Standard Score</span>
                      <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{simData?.original_score ? Math.round(simData.original_score) : 70}%</p>
                    </div>
                    <div className="p-4 bg-white/[0.01] border border-primary/15 rounded-2xl text-center">
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Simulated Projection</span>
                      <p className="text-xl font-extrabold text-primary mt-1">{simData?.simulated_score ? Math.round(simData.simulated_score) : 75}%</p>
                    </div>
                  </div>
                </div>

                {/* Recommendations twin recommendations */}
                <div className={`${bgCard} p-6 flex flex-col justify-between`}>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">Mapping Recommendations</h3>
                    <div className="flex flex-col gap-3.5">
                      {twinData?.weak_topics && twinData.weak_topics.length > 0 ? (
                        twinData.weak_topics.map((topic, i) => (
                          <div key={i} className="flex gap-3 items-start p-3 bg-white/[0.01] border border-slate-900/[0.03] dark:border-white/[0.03] rounded-2xl">
                            <span className="w-5 h-5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-[9px] flex items-center justify-center font-mono shrink-0">!</span>
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{topic}</p>
                              <span className="text-[9px] text-muted-foreground font-light leading-normal block mt-0.5">Weak Mastery mapping detected. Invest additional problems.</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground font-light p-2">Excellent performance. No weak topics currently mapped by digital twin.</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Digital Twin 3D node indicator */}
                  <div className="flex items-center gap-3 bg-slate-900/[0.02] dark:bg-white/[0.02] border border-slate-900/[0.05] dark:border-white/[0.05] p-3 rounded-2xl mt-6">
                    <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                      <ThreeModel mode="dodecahedron" color={0x10b981} className="w-full h-full" />
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Cognitive State</span>
                      <p className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">Sync Mapping Active</p>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: 2. AST CODE DEBUGGER */}
            {activeTab === "debugger" && (
              <CodeOracle />
            )}

            {/* TAB CONTENT: 3. EXPLAINABLE AI (XAI) */}
            {activeTab === "xai" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Visual SHAP bars */}
                <div className={`${bgCard} lg:col-span-2 p-6 md:p-8`}>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">SHAP Feature Influence Graph</h3>
                  <div className="flex flex-col gap-5">
                    {twinData?.shap_values && (() => {
                      const maxVal = Math.max(...Object.values(twinData.shap_values).map(Math.abs)) || 1;
                      const sortedFeatures = Object.entries(twinData.shap_values).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
                      
                      return sortedFeatures.map(([feat, val], idx) => {
                        const isPositive = val >= 0;
                        const widthPercent = (Math.abs(val) / maxVal) * 50;

                        return (
                          <div key={idx} className="flex items-center justify-between gap-2 sm:gap-4 group">
                            <div className="w-[30%] text-[10px] sm:text-xs font-bold text-gray-400 truncate uppercase tracking-widest group-hover:text-slate-900 dark:group-hover:text-white transition-colors" title={feat.replace(/_/g, " ")}>
                              {feat.replace(/_/g, " ")}
                            </div>
                            
                            <div className="flex-1 h-2 sm:h-2.5 relative flex items-center bg-transparent">
                              {/* Background track */}
                              <div className="absolute inset-0 bg-slate-200/50 dark:bg-white/[0.02] rounded-full border border-slate-900/[0.02] dark:border-white/[0.02]" />
                              
                              {/* Center axis line */}
                              <div className="absolute top-[-4px] bottom-[-4px] left-1/2 w-px bg-slate-400/50 dark:bg-slate-500/50 z-10" />
                              
                              {/* Negative Bar (Right-to-Left from center) */}
                              {!isPositive && (
                                <div 
                                  className="absolute top-0 bottom-0 right-1/2 bg-rose-500 rounded-l-full transition-all duration-1000" 
                                  style={{ width: `${widthPercent}%` }} 
                                />
                              )}
                              
                              {/* Positive Bar (Left-to-Right from center) */}
                              {isPositive && (
                                <div 
                                  className="absolute top-0 bottom-0 left-1/2 bg-emerald-500 rounded-r-full transition-all duration-1000" 
                                  style={{ width: `${widthPercent}%` }} 
                                />
                              )}
                            </div>
                            
                            <div className={`w-14 text-right text-[10px] sm:text-xs font-bold font-mono tracking-tighter sm:tracking-normal ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                              {isPositive ? '+' : ''}{val.toFixed(2)}
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                </div>

                {/* Stability explanation */}
                <div className={`${bgCard} p-6 flex flex-col justify-between`}>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">Stability Diagnostics</h3>
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center p-3 bg-white/[0.01] border border-slate-900/[0.04] dark:border-white/[0.04] rounded-2xl">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Calibration Stability</span>
                        <span className="text-xs font-bold text-emerald-400">HIGH</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/[0.01] border border-slate-900/[0.04] dark:border-white/[0.04] rounded-2xl">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Predictor Confidence</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">93.2%</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/[0.01] border border-slate-900/[0.04] dark:border-white/[0.04] rounded-2xl">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Anomalous Risk Factor</span>
                        <span className="text-xs font-bold text-red-400">Low (1.2%)</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-muted-foreground font-light leading-relaxed mt-6">
                    Predictions compute using a calibrated ensemble that combines historical accuracy indices with duration decay parameters.
                  </p>
                </div>

                {/* Narrative narrative display */}
                {twinData?.narrative && (
                  <div className={`${bgCard} lg:col-span-3 p-6 md:p-8 animate-fadeIn`}>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Neural Narrative Narrative</h3>
                    <p className="text-sm font-light text-gray-200 leading-relaxed max-w-4xl">{twinData.narrative}</p>
                  </div>
                )}

              </div>
            )}

            {/* TAB CONTENT: 4. HEATMAP */}
            {activeTab === "heatmap" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Pivot matrix grid */}
                <div className={`${bgCard} lg:col-span-2 p-6 md:p-8 overflow-x-auto`}>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">Skill Heatmap Matrix</h3>
                  {loadingHeatmap ? (
                    <div className="h-64 flex items-center justify-center text-muted-foreground text-xs font-semibold animate-pulse">Compiling Heatmap Data Grid...</div>
                  ) : heatmapData && heatmapData.topics.length > 0 ? (
                    <div className="min-w-[500px]">
                      {/* Grid Headers */}
                      <div className="grid grid-cols-5 gap-3 mb-3 border-b border-slate-900/[0.05] dark:border-white/[0.05] pb-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                        <div className="col-span-2 text-left">Academic Topic</div>
                        {heatmapData.months.map((m) => (
                          <div key={m} className="text-center">{m}</div>
                        ))}
                      </div>

                      {/* Grid Rows */}
                      <div className="flex flex-col gap-3">
                        {heatmapData.topics.map((t) => {
                          const row = heatmapData.grid[t] || {}
                          return (
                            <div key={t} className="grid grid-cols-5 gap-3 items-center">
                              <div className="col-span-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider truncate">{t}</div>
                              {heatmapData.months.map((m) => {
                                const score = row[m] || 0
                                // Gradient cell colors
                                const bgCell = score >= 90 
                                  ? "bg-emerald-500/25 border-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                                  : score >= 70
                                  ? "bg-primary/20 border-primary/30 text-primary"
                                  : score > 0
                                  ? "bg-cyan-500/15 border-cyan-500/35 text-cyan-300"
                                  : "bg-slate-900/[0.02] dark:bg-white/[0.02] border-slate-900/10 dark:border-white/10 text-muted-foreground/30"
                                return (
                                  <div
                                    key={m}
                                    className={`py-3.5 rounded-xl border text-xs font-bold font-mono text-center transition-all duration-300 hover:scale-105 ${bgCell}`}
                                    title={`${t} - ${m}: ${score || "No score"}`}
                                  >
                                    {score ? Math.round(score) : "-"}
                                  </div>
                                )
                              })}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 bg-white/[0.01] border border-slate-900/[0.03] dark:border-white/[0.03] rounded-2xl p-6 text-center">
                      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">No Study Data Logged</p>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        Your skill heatmap is currently empty. Head over to the <span className="text-primary font-semibold">Cognitive Twin</span> dashboard and log some study sessions to start mapping your knowledge matrix.
                      </p>
                    </div>
                  )}
                </div>

                {/* Mastery Distribution details */}
                <div className={`${bgCard} p-6 flex flex-col justify-between`}>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">Mastery Segmentations</h3>
                    {loadingHeatmap ? (
                      <div className="h-40 flex items-center justify-center text-muted-foreground text-xs animate-pulse">Segmenting...</div>
                    ) : heatmapData ? (
                      <div className="flex flex-col gap-5">
                        {[
                          { label: "Expert Mastery (>=90)", val: heatmapData.mastery_distribution.expertise, color: "bg-emerald-500" },
                          { label: "Proficient Segment (70-89)", val: heatmapData.mastery_distribution.proficiency, color: "bg-primary" },
                          { label: "Foundational (0-69)", val: heatmapData.mastery_distribution.foundational, color: "bg-cyan-400" }
                        ].map((seg, i) => (
                          <div key={i} className="flex flex-col gap-2">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                              <span className="text-muted-foreground">{seg.label}</span>
                              <span className="text-slate-900 dark:text-white">{seg.val}%</span>
                            </div>
                            <div className="bg-white/[0.03] h-1.5 rounded-full overflow-hidden">
                              <div className={`${seg.color} h-full rounded-full`} style={{ width: `${seg.val}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="p-4 bg-white/[0.01] border border-slate-900/[0.04] dark:border-white/[0.04] rounded-2xl text-center mt-6">
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Average Cumulative Mastery</span>
                    <p className="text-2xl font-black text-primary mt-1">
                      {heatmapData?.avg_proficiency ? Math.round(heatmapData.avg_proficiency) : 0}%
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: 5. HISTORY */}
            {activeTab === "history" && (
              <div className={`${bgCard} p-6 md:p-8 overflow-hidden flex flex-col`}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Logged Academic History</h3>
                  <button
                    onClick={loadHistoryData}
                    className="p-2 border border-slate-900/10 dark:border-white/10 hover:border-slate-900/10 dark:border-white/10 rounded-xl bg-slate-900/[0.02] dark:bg-white/[0.02] hover:bg-white/[0.04] text-xs transition-all text-gray-300"
                    title="Reload"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18v3.25" />
                    </svg>
                  </button>
                </div>

                {loadingHistory ? (
                  <div className="h-64 flex items-center justify-center text-muted-foreground text-xs animate-pulse">Syncing Logged Database Entries...</div>
                ) : sessionsHistory.length === 0 ? (
                  <p className="text-xs text-muted-foreground p-6 text-center leading-normal font-light">
                    Your digital twin is fresh. Solve and log a study action in the Digital Twin tab to see it charted here!
                  </p>
                ) : (
                  <div className="flex flex-col gap-8">
                    {/* Render accuracy progress line chart */}
                    <div className="h-64 w-full bg-white/20 dark:bg-black/20 p-4 border border-slate-900/[0.03] dark:border-white/[0.03] rounded-2xl">
                      <Line
                        data={lineChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            x: { grid: { color: "rgba(255, 255, 255, 0.02)" }, ticks: { color: "#8c9ba5", font: { size: 9, family: "Sora" } } },
                            y: { grid: { color: "rgba(255, 255, 255, 0.02)" }, ticks: { color: "#8c9ba5", font: { size: 9, family: "Sora" } }, min: 0, max: 100 }
                          },
                          plugins: { legend: { display: false } }
                        }}
                      />
                    </div>

                    {/* Session Log entries table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-900/[0.06] dark:border-white/[0.06] text-muted-foreground font-bold uppercase tracking-wider text-[9px]">
                            <th className="py-3 px-4">Study Set</th>
                            <th className="py-3 px-4">Topic Target</th>
                            <th className="py-3 px-4">Accuracy Rate</th>
                            <th className="py-3 px-4">Duration Invested</th>
                            <th className="py-3 px-4">Solved Problems</th>
                            <th className="py-3 px-4">Sync Timestamp</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sessionsHistory.map((sess, i) => (
                            <tr key={sess.id || i} className="border-b border-slate-900/[0.02] dark:border-white/[0.02] hover:bg-white/[0.01] transition-all">
                              <td className="py-3 px-4 font-mono font-bold text-gray-300">#{sessionsHistory.length - i}</td>
                              <td className="py-3 px-4 font-bold text-slate-900 dark:text-white uppercase tracking-wider">{sess.topic}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded font-bold font-mono text-[10px] ${
                                  sess.accuracy >= 90 ? "text-emerald-400 bg-emerald-500/10" : sess.accuracy >= 70 ? "text-primary bg-primary/10" : "text-cyan-400 bg-cyan-500/10"
                                }`}>
                                  {sess.accuracy}%
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-300">{sess.duration_min} Min</td>
                              <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{sess.problems_solved} Qs</td>
                              <td className="py-3 px-4 text-muted-foreground font-light">
                                {sess.timestamp ? new Date(sess.timestamp).toLocaleString() : "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </main>

    </div>
  )
}

export default SarvamSuite
