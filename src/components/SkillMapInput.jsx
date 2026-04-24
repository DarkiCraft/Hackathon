"use client";

import React, { useState } from "react";

const EXAMPLES = [
  {
    goal: "Character Design",
    knownSkills: "I've tried coloring digital art a bit",
    timeAvailable: "15 min/day",
  },
  {
    goal: "Web Development",
    knownSkills: "I know basic HTML",
    timeAvailable: "1 hour/day",
  },
  {
    goal: "Music Production",
    knownSkills: "I can play some piano chords",
    timeAvailable: "30 min/day",
  },
];

export default function SkillMapInput({ onSubmit, loading, hasResults }) {
  const [goal, setGoal] = useState("");
  const [knownSkills, setKnownSkills] = useState("");
  const [timeAvailable, setTimeAvailable] = useState("");
  const [focused, setFocused] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!goal.trim() || !knownSkills.trim() || !timeAvailable.trim()) return;
    onSubmit({ goal, knownSkills, timeAvailable });
  };

  const applyExample = (ex) => {
    setGoal(ex.goal);
    setKnownSkills(ex.knownSkills);
    setTimeAvailable(ex.timeAvailable);
  };

  const isValid = goal.trim() && knownSkills.trim() && timeAvailable.trim();

  return (
    <div
      className="glass-card-strong animate-fade-in-up stagger-4"
      style={{ padding: "36px" }}
    >
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h2
          style={{
            fontSize: "18px",
            fontWeight: "700",
            color: "var(--text-primary)",
            marginBottom: "6px",
            letterSpacing: "-0.01em",
          }}
        >
          Tell us about your learning goal
        </h2>
        <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
          Be specific — the more detail you give, the better your SkillMap.
        </p>
      </div>

      <form onSubmit={handleSubmit} id="skillmap-form">
        {/* Goal field */}
        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="goal-input"
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: focused === "goal" ? "var(--color-primary-light)" : "var(--text-secondary)",
              marginBottom: "8px",
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              transition: "color 0.2s",
            }}
          >
            🎯 Your Goal
          </label>
          <input
            id="goal-input"
            type="text"
            className="skillmap-input"
            placeholder='e.g. "Character Design", "Machine Learning", "Guitar"'
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onFocus={() => setFocused("goal")}
            onBlur={() => setFocused(null)}
            disabled={loading}
            autoComplete="off"
          />
        </div>

        {/* Known skills field */}
        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="known-skills-input"
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: focused === "known" ? "var(--color-primary-light)" : "var(--text-secondary)",
              marginBottom: "8px",
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              transition: "color 0.2s",
            }}
          >
            ✅ What You Already Know
          </label>
          <textarea
            id="known-skills-input"
            className="skillmap-textarea"
            placeholder='e.g. "I can do basic coloring and I know some Photoshop shortcuts"'
            value={knownSkills}
            onChange={(e) => setKnownSkills(e.target.value)}
            onFocus={() => setFocused("known")}
            onBlur={() => setFocused(null)}
            rows={3}
            disabled={loading}
          />
        </div>

        {/* Time field */}
        <div style={{ marginBottom: "28px" }}>
          <label
            htmlFor="time-input"
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: focused === "time" ? "var(--color-primary-light)" : "var(--text-secondary)",
              marginBottom: "8px",
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              transition: "color 0.2s",
            }}
          >
            ⏱️ Time Available Per Day
          </label>
          <input
            id="time-input"
            type="text"
            className="skillmap-input"
            placeholder='e.g. "15 min/day", "1 hour", "30 minutes on weekdays"'
            value={timeAvailable}
            onChange={(e) => setTimeAvailable(e.target.value)}
            onFocus={() => setFocused("time")}
            onBlur={() => setFocused(null)}
            disabled={loading}
            autoComplete="off"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          id="skillmap-submit-btn"
          className="btn-primary"
          disabled={!isValid || loading}
          style={{ width: "100%", fontSize: "16px", padding: "16px" }}
        >
          {loading ? (
            <>
              <span
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff",
                  display: "inline-block",
                }}
                className="animate-spin"
              />
              Analyzing your skill gap...
            </>
          ) : (
            <>🧭 Generate My SkillMap</>
          )}
        </button>
      </form>

      {/* Example pills */}
      {!hasResults && (
        <div style={{ marginTop: "20px" }}>
          <p
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
              marginBottom: "10px",
              textAlign: "center",
            }}
          >
            Try an example:
          </p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
            {EXAMPLES.map((ex) => (
              <button
                key={ex.goal}
                onClick={() => applyExample(ex)}
                disabled={loading}
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "999px",
                  padding: "5px 14px",
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-primary)";
                  e.currentTarget.style.color = "var(--color-primary-light)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-subtle)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                {ex.goal}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
