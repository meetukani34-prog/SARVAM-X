/**
 * API client to interact with the Flask backend of SARVAM-X Cognitive Suite.
 */

// We default to port 5000 in development, or the window origin when built/served by Flask
const BASE_URL = import.meta.env.DEV ? 'http://localhost:5000' : (import.meta.env.VITE_API_URL || '');

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  user_id: number;
  name: string;
  email: string;
  access_token?: string;
  error?: string;
}

export interface HealthResponse {
  status: string;
  version: string;
  system: string;
}

export interface KPI {
  total_problems: number;
  focus_hours: number;
  avg_accuracy: number;
  session_count: number;
}

export interface TopicScore {
  topic: string;
  month: string;
  score: number;
}

export interface Session {
  id?: number;
  user_id: number;
  topic: string;
  accuracy: number;
  duration_min: number;
  problems_solved: number;
  timestamp?: string;
}

export interface TwinResponse {
  user: User;
  predicted_score: number;
  velocity: number;
  weak_topics: string[];
  study_plan: { [key: string]: string[] } | string[];
  shap_values: { [key: string]: number };
  feature_breakdown: { [key: string]: string };
  narrative: string;
  tips: string[];
  session_count: number;
}

export interface PredictResponse {
  predicted_score: number;
  shap_values: { [key: string]: number };
  feature_breakdown: { [key: string]: string };
  narrative: string;
  weak_topics: string[];
}

export interface DebugError {
  line: number;
  type: string;
  message: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
}

export interface DebugFix {
  original: string;
  replacement: string;
  explanation: string;
}

export interface TraceLog {
  time: string;
  level: string;
  message: string;
}

export interface DebugResponse {
  errors: DebugError[];
  fixes: DebugFix[];
  complexity: string;
  efficiency: number;
  xai_explanation: string;
  trace_log: TraceLog[];
  exec_out?: string;
  exec_err?: string;
  exec_code?: number;
  error?: string;
}

export interface ExplainResponse {
  narrative: string;
  feature_breakdown: { [key: string]: string };
  improvement_tips: string[];
  predicted_score: number;
  confidence: number;
  anomaly_risk: number;
  stability: 'High' | 'Medium' | 'Low';
}

export interface HeatmapResponse {
  grid: { [topic: string]: { [month: string]: number } };
  months: string[];
  topics: string[];
  avg_proficiency: number;
  mastery_distribution: {
    expertise: number;
    proficiency: number;
    foundational: number;
  };
}

export interface WhatIfResponse {
  original_score: number;
  simulated_score: number;
  improvement: number;
  feature_boosts: { [key: string]: number };
  extra_hours: number;
}

export interface LearningPathResponse {
  study_plan: string[];
  weak_topics: string[];
  tips: string[];
}

export interface DashboardResponse {
  user: User;
  predicted_score: number;
  velocity: number;
  weak_topics: string[];
  study_plan: string[];
  feature_breakdown: { [key: string]: string };
  narrative: string;
  tips: string[];
  session_count: number;
  kpis: KPI;
  daily_status: Array<{ topic: string; score: number }>;
  shap_values: { [key: string]: number };
}

export interface HistoryResponse {
  success: boolean;
  sessions: Session[];
}

export interface MomentumResponse {
  momentum: number;
  trend: string;
  velocity: number;
  streak: number;
  level: string;
  status: string;
  cognitive_friction: number;
}

export interface FakeNewsResponse {
  isFake: boolean;
  confidence: number;
  sentiment: string;
  keywords: string[];
  manipulationScore: string;
  sourceCredibility: number;
  explanation: string;
}

// Helper for requests
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const token = localStorage.getItem('sarvam_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };
  // Send cookies with requests for JWT auth
  const response = await fetch(url, { ...options, headers, credentials: 'include' });
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || `HTTP error! status: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  // Auth Operations
  async signup(name: string, email: string, password: string): Promise<AuthResponse> {
    const res = await request<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    if (res.success && res.access_token) {
      localStorage.setItem('sarvam_token', res.access_token);
    }
    return res;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.success && res.access_token) {
      localStorage.setItem('sarvam_token', res.access_token);
    }
    return res;
  },
  
  async logout(): Promise<{ success: boolean; message: string }> {
    localStorage.removeItem('sarvam_token');
    return request<{ success: boolean; message: string }>('/api/auth/logout', {
      method: 'POST',
    });
  },

  async updateProfile(name: string): Promise<{ success: boolean; name: string }> {
    return request<{ success: boolean; name: string }>('/api/auth/update', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  async getMe(): Promise<{ success: boolean; user_id: number; name: string; email: string }> {
    return request<{ success: boolean; user_id: number; name: string; email: string }>('/api/user/me');
  },

  // Health
  async getHealth(): Promise<HealthResponse> {
    return request<HealthResponse>('/api/health');
  },

  // Session Logging
  async logSession(session: Session): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>('/api/session', {
      method: 'POST',
      body: JSON.stringify(session),
    });
  },

  // Digital Twin details
  async getTwin(): Promise<TwinResponse> {
    return request<TwinResponse>(`/api/twin`);
  },

  // Predict endpoint
  async predict(): Promise<PredictResponse> {
    return request<PredictResponse>('/api/predict', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  // Debug Code (Python execution etc.)
  async debugCode(code: string, language: string = 'python'): Promise<DebugResponse> {
    return request<DebugResponse>('/api/debug', {
      method: 'POST',
      body: JSON.stringify({ code, language }),
    });
  },

  // Fake News Analysis using LLM
  async analyzeFakeNews(text: string): Promise<{ success: boolean; data: FakeNewsResponse; error?: string }> {
    return request<{ success: boolean; data: FakeNewsResponse; error?: string }>('/api/fakenews/analyze', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  // Explainability narrative
  async getExplanation(): Promise<ExplainResponse> {
    return request<ExplainResponse>('/api/explain', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  // Skill Heatmap
  async getHeatmap(): Promise<HeatmapResponse> {
    return request<HeatmapResponse>(`/api/heatmap`);
  },

  // What-If Simulator
  async runWhatIf(extraHours: number): Promise<WhatIfResponse> {
    return request<WhatIfResponse>('/api/whatif', {
      method: 'POST',
      body: JSON.stringify({ extra_hours_per_day: extraHours }),
    });
  },

  // Learning Path
  async getLearningPath(): Promise<LearningPathResponse> {
    return request<LearningPathResponse>(`/api/path`);
  },

  // Comprehensive Dashboard fetch
  async getDashboard(): Promise<DashboardResponse> {
    return request<DashboardResponse>(`/api/dashboard`);
  },

  // Session History
  async getHistory(): Promise<HistoryResponse> {
    return request<HistoryResponse>(`/api/history`);
  },

  // Cognitive Mirror Momentum state
  async getMomentum(): Promise<MomentumResponse> {
    return request<MomentumResponse>(`/api/momentum`);
  },

  // Stream helper for chat endpoint
  getChatStreamUrl(): string {
    return `${BASE_URL}/api/chat`;
  }
};
