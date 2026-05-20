import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Global error boundary overlay for diagnostics
window.addEventListener('error', (event) => {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="background: #111; color: #ff5555; padding: 24px; font-family: monospace; min-height: 100vh; overflow-y: auto;">
        <h2 style="color: #ff3333; margin-bottom: 8px;">[Runtime JavaScript Error]</h2>
        <p style="font-weight: bold; font-size: 16px;">${event.message}</p>
        <pre style="background: #222; padding: 16px; border-radius: 8px; border: 1px solid #444; overflow-x: auto;">
Source: ${event.filename}:${event.lineno}:${event.colno}
Stack: ${event.error?.stack || 'No stack trace available'}
        </pre>
        <p style="color: #888; margin-top: 16px;">Please capture a screenshot of this error.</p>
      </div>
    `;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="background: #111; color: #ff9900; padding: 24px; font-family: monospace; min-height: 100vh; overflow-y: auto;">
        <h2 style="color: #ffaa00; margin-bottom: 8px;">[Unhandled Promise Rejection]</h2>
        <p style="font-weight: bold; font-size: 16px;">${event.reason?.message || event.reason}</p>
        <pre style="background: #222; padding: 16px; border-radius: 8px; border: 1px solid #444; overflow-x: auto;">
Stack: ${event.reason?.stack || 'No stack trace available'}
        </pre>
      </div>
    `;
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
