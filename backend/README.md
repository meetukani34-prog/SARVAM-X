# Flask API Backend: SARVAM-X Core Engines

This directory contains the Python Flask server and the Machine Learning/Behavioral engines that drive both the SARVAM Cognitive Suite and the TRINETRA Secure Sentinel.

---

## 📂 Backend File Structure

```
backend/
├── app.py                  # Flask Application, Route Handlers, CORS, NVIDIA LLM Connection
├── database.py             # SQLite3 Connection, Table Schemas, CRUD Utilities
├── requirements.txt        # Backend dependencies
├── db_storage/
│   └── sarvam.db           # SQLite database file (generated at startup)
└── models/
    ├── __init__.py
    ├── debugger.py         # AST Syntax Analyzer & Complexity Estimator
    ├── explainer.py        # Explainability Engine (XAI & SHAP breakdown)
    ├── momentum.py         # Behavioral Entropy & Learning Velocity Engine
    └── twin_model.py       # Digital Twin ML Predictor & What-If Simulator
```

---

## ⚙️ Core Modules & Models

### 1. Digital Twin & What-If Simulator (`models/twin_model.py`)
- **Digital Twin**: Models students using their historical learning metrics (session counts, focus hours, accuracy). Uses a mock linear regression model to predict current score levels and locate weak learning domains.
- **What-If Simulator**: Models projected scores by adjusting focus parameters. Returns forecasted score lifts and reduction in days to reach mastery based on simulated study hours.

### 2. Behavioral Entropy Engine (`models/momentum.py`)
- **Momentum Score**: Calculated from study velocity (questions/day) and focus consistency (low entropy).
- **Entropy Indicator**: Uses NumPy to calculate the Coefficient of Variation (CV) across session durations and accuracies. Higher entropy implies erratic, unfocused learning behavior.
- **Correction Force**: Recommends immediate target corrective tasks (e.g., "Solve 3 easy warm-up problems") when learning drift or velocity drag is detected.

### 3. Explainability Engine (`models/explainer.py`)
- **SHAP (SHapley Additive exPlanations)**: Calculates positive/negative attribute weights determining why a score prediction was made.
- **Narratives**: Synthesizes custom qualitative text summaries of student streaks, weak areas, and cognitive friction scores.

### 4. Code AST Debugger (`models/debugger.py`)
- **Abstract Syntax Trees (AST)**: Utilizes Python's native `ast` library to parse inputs, catch structural logic errors, calculate cyclomatic complexity, and recommend code improvements.
- **Execution**: Safely executes Python code snippets in a subprocess sandboxed with a time limit to display direct output/errors.

---

## 🔗 Main API Endpoints

### Authentication
- `POST /api/auth/signup`: Registers a new user account.
- `POST /api/auth/login`: Authenticates credentials and returns a `user_id`.
- `POST /api/auth/update`: Updates user profile name.
- `GET /api/user/<user_id>`: Fetches user information.

### SARVAM Suite Data
- `GET /api/dashboard/<user_id>`: Aggregates total KPIs, digital twin predictions, and recent streaks in one call.
- `POST /api/session`: Log a new academic study session.
- `GET /api/history/<user_id>`: Retrieves past logged sessions.
- `POST /api/predict`: Runs SHAP score forecast analysis.
- `POST /api/whatif`: Runs What-If master projection scenarios.
- `GET /api/heatmap/<user_id>`: Formats matrix data for the topic mastery calendar.
- `GET /api/momentum/<user_id>`: Returns entropy and momentum details.
- `POST /api/debug`: Analyzes code syntax, complexity, and security.

### Cognitive Mirror Dialogue
- `POST /api/chat`: Establishes a `text/event-stream` stream connection returning generated speech tokens from Llama 3.1 70B via Nvidia NIM. Adapts dynamic context prompts injected with student momentum indicators.
