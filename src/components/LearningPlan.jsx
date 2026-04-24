"use client";

import React, { useState } from "react";

const DAY_COLORS = [
  { bg: "rgba(139,92,246,0.15)", border: "rgba(139,92,246,0.35)", text: "#a78bfa" },
  { bg: "rgba(6,182,212,0.12)",  border: "rgba(6,182,212,0.3)",   text: "#67e8f9" },
  { bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)",  text: "#6ee7b7" },
  { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)",  text: "#fcd34d" },
  { bg: "rgba(239,68,68,0.10)",  border: "rgba(239,68,68,0.28)",  text: "#fca5a5" },
  { bg: "rgba(139,92,246,0.15)", border: "rgba(139,92,246,0.35)", text: "#a78bfa" },
  { bg: "rgba(6,182,212,0.12)",  border: "rgba(6,182,212,0.3)",   text: "#67e8f9" },
];

function DayCard({ entry, index }) {
  const [expanded, setExpanded] = useState(false);
  const color = DAY_COLORS[index % DAY_COLORS.length];
  const delay = `${index * 0.06}s`;

  return (
    <article
      className="animate-fade-in-up"
      style={{
        animationDelay: delay,
        opacity: 0,
        animationFillMode: "forwards",
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(20px)",
        border: `1px solid rgba(255,255,255,0.06)`,
        borderRadius: "20px",
        padding: "24px",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
      }}
      onClick={() => setExpanded((p) => !p)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
        e.currentTarget.style.borderColor = color.border;
        e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.4), 0 0 20px ${color.bg}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
        e.currentTarget.style.boxShadow = "none";
      }}
      role="button"
    >
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        {/* Day Indicator */}
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "16px",
            background: color.bg,
            border: `1px solid ${color.border}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: `0 0 15px ${color.bg}`,
          }}
        >
          <span style={{ fontSize: "11px", fontWeight: "800", color: color.text, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Day
          </span>
          <span style={{ fontSize: "28px", fontWeight: "900", color: "#fff", lineHeight: 1 }}>
            {entry.day}
          </span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ fontSize: "13px", fontWeight: "700", color: color.text, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>
            {entry.skill}
          </h4>
          <p style={{ fontSize: "18px", fontWeight: "600", color: "#f0f6fc", lineHeight: "1.4", letterSpacing: "-0.01em" }}>
            {entry.task}
          </p>
        </div>
        
        <div style={{ color: "var(--text-muted)", fontSize: "24px", transition: "transform 0.3s", transform: expanded ? "rotate(90deg)" : "none" }}>
          ›
        </div>
      </div>

      {expanded && (
        <div
          className="animate-fade-in"
          style={{
            marginTop: "24px",
            paddingTop: "24px",
            borderTop: `1px solid rgba(255,255,255,0.08)`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ marginBottom: "20px" }}>
            <h5 style={{ fontSize: "12px", fontWeight: "800", color: color.text, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>💡</span> Why This Matters
            </h5>
            <p style={{ fontSize: "15px", color: "#8b949e", lineHeight: "1.7" }}>
              {entry.why}
            </p>
          </div>

          {entry.resource && (
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid rgba(255,255,255,0.1)`,
                borderRadius: "12px",
                padding: "16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div style={{ fontSize: "24px" }}>📚</div>
              <div>
                <h6 style={{ fontSize: "11px", fontWeight: "800", color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>Recommended Resource</h6>
                <p style={{ fontSize: "14px", color: color.text, fontWeight: "600" }}>{entry.resource}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export default function LearningPlan({ days = [] }) {
  const [view, setView] = useState("grid"); // 'grid' | 'list'

  if (days.length === 0) {
    return (
      <div
        className="glass-card"
        style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}
      >
        No learning plan generated yet.
      </div>
    );
  }

  return (
    <div>
      {/* View toggle */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px", gap: "8px" }}>
        {["grid", "list"].map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              background: view === v ? "var(--bg-glass-strong)" : "var(--bg-surface)",
              border: `1px solid ${view === v ? "var(--border-accent)" : "var(--border-subtle)"}`,
              borderRadius: "8px",
              padding: "6px 14px",
              fontSize: "12px",
              fontWeight: "600",
              color: view === v ? "var(--color-primary-light)" : "var(--text-muted)",
              cursor: "pointer",
              fontFamily: "inherit",
              textTransform: "capitalize",
            }}
          >
            {v === "grid" ? "Γè₧ Grid" : "Γÿ░ List"}
          </button>
        ))}
      </div>

      <div
        style={
          view === "grid"
            ? {
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "16px",
              }
            : {
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }
        }
      >
        {days.map((entry, i) => (
          <DayCard key={entry.day} entry={entry} index={i} />
        ))}
      </div>
    </div>
  );
}
