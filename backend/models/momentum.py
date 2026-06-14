"""
Behavioral Entropy Engine — Momentum Analytics for the Cognitive Mirror
Tracks focus patterns, calculates momentum drag, and computes correction forces.
"""
import math
from datetime import datetime


class MomentumEngine:
    """Calculates the student's learning momentum and detects behavioral entropy."""

    # Thresholds
    OPTIMAL_VELOCITY = 8      # questions/day at peak
    MOMENTUM_DECAY = 0.15     # daily decay rate when idle
    ORBIT_TARGET = 85.0       # default target score orbit

    def calculate(self, sessions: list, topic_scores: list) -> dict:
        """Full momentum state from raw session data."""
        if not sessions:
            return self._empty_state()

        velocity = self._historical_velocity(sessions)
        entropy = self._behavioral_entropy(sessions)
        momentum = self._momentum_score(velocity, entropy)
        drag = self._detect_drag(velocity)
        correction = self._correction_force(sessions, drag)
        orbit = self._future_orbit(sessions, momentum)
        emotional = self._emotional_state(momentum, velocity)
        streaks = self._streak_data(sessions)

        return {
            "velocity": velocity,
            "entropy": round(entropy, 3),
            "momentum_score": round(momentum, 1),
            "momentum_state": self._state_label(momentum),
            "drag_detected": drag["detected"],
            "drag_details": drag,
            "correction_force": correction,
            "future_orbit": orbit,
            "emotional_state": emotional,
            "streaks": streaks,
        }

    def _historical_velocity(self, sessions) -> dict:
        """Calculate questions/day over recent windows."""
        if not sessions:
            return {"current": 0, "prev": 0, "delta": 0, "trend": "neutral"}

        # Sessions are newest-first
        recent = sessions[:7]   # last 7 sessions
        older = sessions[7:14]  # previous 7

        recent_probs = sum(s.get("problems_solved", 0) for s in recent)
        older_probs = sum(s.get("problems_solved", 0) for s in older)

        # Normalize to daily rate (assume ~1 session/day)
        current_rate = round(recent_probs / max(len(recent), 1), 1)
        prev_rate = round(older_probs / max(len(older), 1), 1) if older else current_rate

        delta = round(current_rate - prev_rate, 1)
        trend = "rising" if delta > 0.5 else "falling" if delta < -0.5 else "stable"

        return {
            "current": current_rate,
            "prev": prev_rate,
            "delta": delta,
            "trend": trend,
        }

    def _behavioral_entropy(self, sessions) -> float:
        """Higher entropy = more chaotic/unfocused study patterns."""
        if len(sessions) < 3:
            return 0.5

        accuracies = [s.get("accuracy", 50) for s in sessions[:10]]
        durations = [s.get("duration_min", 30) for s in sessions[:10]]

        def mean(lst):
            return sum(lst) / len(lst) if lst else 0
            
        def std(lst):
            m = mean(lst)
            return math.sqrt(sum((x - m) ** 2 for x in lst) / len(lst)) if lst else 0

        # Entropy = coefficient of variation (stddev / mean)
        acc_cv = std(accuracies) / max(mean(accuracies), 1)
        dur_cv = std(durations) / max(mean(durations), 1)

        entropy = (acc_cv + dur_cv) / 2
        return min(1.0, entropy)

    def _momentum_score(self, velocity: dict, entropy: float) -> float:
        """0-100 momentum score. High velocity + low entropy = high momentum."""
        vel_component = min(velocity["current"] / self.OPTIMAL_VELOCITY, 1.0) * 60
        entropy_penalty = entropy * 30
        trend_bonus = 10 if velocity["trend"] == "rising" else -5 if velocity["trend"] == "falling" else 0
        return max(0, min(100, vel_component - entropy_penalty + trend_bonus))

    def _detect_drag(self, velocity: dict) -> dict:
        """Detect if student is losing momentum."""
        detected = velocity["trend"] == "falling" or velocity["current"] < 3
        severity = "none"
        if detected:
            if velocity["current"] < 2:
                severity = "critical"
            elif velocity["delta"] < -2:
                severity = "high"
            else:
                severity = "moderate"

        return {
            "detected": detected,
            "severity": severity,
            "velocity_drop": abs(velocity["delta"]) if velocity["delta"] < 0 else 0,
            "message": self._drag_message(severity, velocity),
        }

    def _drag_message(self, severity: str, velocity: dict) -> str:
        if severity == "critical":
            return f"Your study velocity dropped to {velocity['current']} problems/session. That's significantly below your previous {velocity['prev']}. Let's find a small win to get back on track."
        elif severity == "high":
            return f"Noticed a dip from {velocity['prev']} to {velocity['current']} problems/session. A focused 30-minute sprint could reverse this."
        elif severity == "moderate":
            return f"Slight slowdown detected ({velocity['delta']:+.1f} problems/session). Nothing alarming, but consistency is key."
        return "Momentum is healthy. Keep this rhythm going."

    def _correction_force(self, sessions, drag: dict) -> dict:
        """Calculate specific actions needed to restore momentum."""
        if not drag["detected"]:
            return {"needed": False, "actions": [], "urgency": "none"}

        accs = [s.get("accuracy", 50) for s in sessions[:5]]
        avg_acc = sum(accs) / len(accs) if accs else 50.0
        target_gap = max(0, self.ORBIT_TARGET - avg_acc)
        problems_needed = max(3, int(target_gap * 0.4))
        hours_needed = round(problems_needed * 0.3, 1)

        actions = []
        if drag["severity"] in ("critical", "high"):
            actions.append({
                "action": f"Solve {problems_needed} problems in the next 48 hours",
                "impact": f"Restores your {self.ORBIT_TARGET}% score orbit",
                "effort": f"~{hours_needed} hours total"
            })
            actions.append({
                "action": "Start with 3 easy warm-up problems right now",
                "impact": "Breaks the inertia barrier",
                "effort": "~15 minutes"
            })
        else:
            actions.append({
                "action": f"Add one extra 30-minute session this week",
                "impact": "Maintains upward trajectory",
                "effort": "30 minutes"
            })

        return {
            "needed": True,
            "actions": actions,
            "urgency": drag["severity"],
            "problems_needed": problems_needed,
            "hours_needed": hours_needed,
        }

    def _future_orbit(self, sessions, momentum: float) -> dict:
        """Project future score trajectory."""
        if not sessions:
            return {"current": 50.0, "projected_7d": 50.0, "projected_30d": 50.0, "target": self.ORBIT_TARGET, "on_track": False}

        accs = [s.get("accuracy", 50) for s in sessions[:5]]
        current = float(sum(accs) / len(accs) if accs else 50.0)
        daily_growth = float((momentum - 50) * 0.02)  # momentum above 50 = growth

        projected_7d = float(min(100, max(0, current + daily_growth * 7)))
        projected_30d = float(min(100, max(0, current + daily_growth * 30 * 0.7)))  # decay factor

        return {
            "current": round(current, 1),
            "projected_7d": round(projected_7d, 1),
            "projected_30d": round(projected_30d, 1),
            "target": self.ORBIT_TARGET,
            "on_track": bool(projected_30d >= self.ORBIT_TARGET),
        }

    def _emotional_state(self, momentum: float, velocity: dict) -> dict:
        """Infer emotional state for empathetic dialogue."""
        if momentum >= 75:
            return {"state": "energized", "emoji": "fire", "color": "#10b981",
                    "message": "You're in a flow state. Ride this wave."}
        elif momentum >= 50:
            return {"state": "steady", "emoji": "balanced", "color": "#00e5ff",
                    "message": "Consistent progress. You're building something solid."}
        elif momentum >= 30:
            return {"state": "drifting", "emoji": "cloud", "color": "#f59e0b",
                    "message": "Feeling a bit scattered? That's okay. One small step."}
        else:
            return {"state": "stalled", "emoji": "anchor", "color": "#ef4444",
                    "message": "It's been quiet. No pressure — let's start with something tiny."}

    def _streak_data(self, sessions) -> dict:
        """Calculate study streaks."""
        if not sessions:
            return {"current": 0, "best": 0}
        # Simplified: count consecutive sessions with accuracy > 50
        streak = 0
        for s in sessions:
            if s.get("accuracy", 0) > 50:
                streak += 1
            else:
                break
        return {"current": streak, "best": max(streak, len(sessions) // 2)}

    def _state_label(self, momentum: float) -> str:
        if momentum >= 75: return "hyperdrive"
        if momentum >= 50: return "cruising"
        if momentum >= 30: return "drifting"
        return "stalled"

    def _empty_state(self):
        return {
            "velocity": {"current": 0, "prev": 0, "delta": 0, "trend": "neutral"},
            "entropy": 0.5, "momentum_score": 0, "momentum_state": "stalled",
            "drag_detected": False, "drag_details": {"detected": False, "severity": "none", "velocity_drop": 0, "message": ""},
            "correction_force": {"needed": False, "actions": [], "urgency": "none"},
            "future_orbit": {"current": 50, "projected_7d": 50, "projected_30d": 50, "target": 85, "on_track": False},
            "emotional_state": {"state": "stalled", "emoji": "anchor", "color": "#ef4444", "message": "Let's get started."},
            "streaks": {"current": 0, "best": 0},
        }

    def build_system_context(self, momentum_state: dict, twin_data: dict) -> str:
        """Build the system prompt context for the LLM with full student state."""
        vel = momentum_state["velocity"]
        orbit = momentum_state["future_orbit"]
        emo = momentum_state["emotional_state"]
        drag = momentum_state["drag_details"]
        corr = momentum_state["correction_force"]
        weak = twin_data.get("weak_topics", [])

        ctx = f"""STUDENT STATE SNAPSHOT:
- Momentum: {momentum_state['momentum_score']}/100 ({momentum_state['momentum_state']})
- Velocity: {vel['current']} problems/session (trend: {vel['trend']}, delta: {vel['delta']:+.1f})
- Behavioral Entropy: {momentum_state['entropy']:.2f} (lower is more focused)
- Emotional State: {emo['state']} — {emo['message']}
- Current Score Orbit: {orbit['current']:.1f}%
- 7-Day Projection: {orbit['projected_7d']:.1f}%
- 30-Day Projection: {orbit['projected_30d']:.1f}%
- Target Orbit: {orbit['target']}%
- On Track: {'Yes' if orbit['on_track'] else 'No'}
- Streak: {momentum_state['streaks']['current']} sessions
- Drag Detected: {drag['detected']} (severity: {drag['severity']})
"""
        if weak:
            ctx += f"- Weak Topics: {', '.join(w['topic'] for w in weak[:3])}\n"
        if corr.get("needed"):
            ctx += f"- Correction Needed: {corr['problems_needed']} problems in ~{corr['hours_needed']}h\n"

        return ctx
