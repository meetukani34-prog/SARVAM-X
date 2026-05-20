# React Frontend SPA: SARVAM-X Interface

This directory hosts the React Single Page Application (SPA) built on Vite, styled with Tailwind CSS, and optimized for high-performance rendering.

---

## 📂 Frontend File Structure

```
client/
├── index.html              # HTML Entrypoint (loads Vladmandic face-api.js & Sora Font)
├── package.json            # Scripts and dev dependencies
├── tsconfig.json           # TS Configuration (App & Node targets)
├── vite.config.ts          # Vite asset routing configurations
├── public/                 # Static assets (3D models, audio, SVG sprites)
└── src/
    ├── App.tsx             # State router & Navigation Shell
    ├── App.css             # Main styling, Tailwind directives, custom glows
    ├── index.css           # Tailwind custom overrides
    ├── main.tsx            # DOM mounting and rendering hook
    ├── components/
    │   ├── AuthView.tsx    # Slide-in Login panel & Platform select
    │   ├── ThreeModel.tsx  # Three.js 3D canvas rendering
    │   ├── Navbar.tsx      # Main top header layout
    │   ├── SarvamSuite.tsx # SARVAM dashboard, What-If simulator, AST editor
    │   ├── MentorPanel.tsx # AI Chatbot console & face-api camera feed
    │   ├── TrinetraSuite.tsx # TRINETRA scanner, NLP news audits, reports
    │   └── ui/             # Reusable design elements (buttons, inputs)
    └── lib/
        ├── api.ts          # Central fetch client for backend integration
        └── utils.ts        # Helper classes for UI layouts
```

---

## 🎨 Design & Aesthetic Features

- **Cyberpunk Dark Mode**: Custom neon palettes featuring `primary` (emerald-500 glow for learning success) and `purple` (amethyst-500 glow for security threat sentinel).
- **Glassmorphism**: Backdrop blur structures with semi-transparent borders:
  ```css
  bg-white/[0.02] backdrop-blur-2xl border border-white/[0.05]
  ```
- **Three.js Visualizers**: Floating abstract 3D models rendered dynamically inside the Authentication frame (`ThreeModel.tsx`).
- **Interactive Graphs**: Responsive line, bar, radar, and gauge visual indicators provided by `react-chartjs-2` and `Chart.js`.

---

## 🔬 Special Frontend Libraries

### 1. Dynamic Face Emotion Tracker (`components/MentorPanel.tsx`)
- Loads `@vladmandic/face-api` dynamically from the CDN to avoid bundling overhead.
- Requests user webcam access, automatically runs facial detection, and maps expressions to emotional state vectors.
- Emitted emotion classes: `Neutral`, `Happy`, `Sad`, `Angry`, `Surprised`, `Fearful`, `Disgusted`.
- Modifies the AI Mentor chat prompt dynamically (e.g., matching a sad expression with supportivehinglish feedback).

### 2. Client-Side API Router (`lib/api.ts`)
- Features a clean, single-point fetch class configuration.
- Targets `http://localhost:5000` in development and dynamically switches to the window origin (`''`) when compiled in production.

---

## 🛠️ Build Options

### Local Development Server
Starts a Vite local hot-reloader. (Note: Ensure the backend Flask server is running at localhost:5000 so the API client can fetch data successfully.)
```bash
npm run dev
```

### Production Bundler
Compiles all modules, stylesheets, and index pointers. Outputs production-ready compiled files to `../frontend`:
```bash
npm run build
```
The output files include:
- `index.html`: Entry structure.
- `/assets`: Minified, chunked JS and compiled CSS packages.
- Flask automatically hosts these assets upon completion.
