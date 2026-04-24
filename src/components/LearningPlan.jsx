"use client";

import React, { useState } from "react";

const DAY_COLORS = [
  { bg: "rgba(139, 92, 246, 0.08)", border: "rgba(139, 92, 246, 0.25)", text: "#c084fc", accent: "#a78bfa" },
  { bg: "rgba(6, 182, 212, 0.08)", border: "rgba(6, 182, 212, 0.25)", text: "#22d3ee", accent: "#67e8f9" },
  { bg: "rgba(16, 185, 129, 0.08)", border: "rgba(16, 185, 129, 0.25)", text: "#34d399", accent: "#6ee7b7" },
  { bg: "rgba(245, 158, 11, 0.08)", border: "rgba(245, 158, 11, 0.25)", text: "#fbbf24", accent: "#fcd34d" },
  { bg: "rgba(244, 63, 94, 0.08)", border: "rgba(244, 63, 94, 0.25)", text: "#fb7185", accent: "#fda4af" },
  { bg: "rgba(99, 102, 241, 0.08)", border: "rgba(99, 102, 241, 0.25)", text: "#818cf8", accent: "#a5b4fc" },
  { bg: "rgba(34, 211, 238, 0.08)", border: "rgba(34, 211, 238, 0.25)", text: "#22d3ee", accent: "#67e8f9" },
];

function DayCard({ entry, index }) {
  const [expanded, setExpanded] = useState(false);
  const color = DAY_COLORS[index % DAY_COLORS.length];
  const delay = `${index * 0.07}s`;

  return (
    <article
      className="animate-fade-in-up"
      style={{
        animationDelay: delay,
        opacity: 0,
        animationFillMode: "forwards",
        background: "var(--bg-glass)",
        border: `1px solid var(--border-subtle)`,
        borderRadius: "18px",
        padding: "22px 24px",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
        backdropFilter: "blur(12px)",
      }}
      onClick={() => setExpanded((p) => !p)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.background = color.bg;
        e.currentTarget.style.borderColor = color.border;
        e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.3), 0 0 20px ${color.border}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.background = "var(--bg-glass)";
        e.currentTarget.style.borderColor = "var(--border-subtle)";
        e.currentTarget.style.boxShadow = "none";
      }}
      role="button"
    >
      <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
        {/* Day Indicator */}
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "14px",
            background: color.bg,
            border: `1px solid ${color.border}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: "10px", fontWeight: "800", color: color.text, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Day
          </span>
          <span style={{ fontSize: "24px", fontWeight: "900", color: "var(--text-primary)", lineHeight: 1 }}>
            {entry.day}
          </span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ fontSize: "12px", fontWeight: "700", color: color.text, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
            {entry.skill}
          </h4>
          <p style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-primary)", lineHeight: "1.4", letterSpacing: "-0.01em" }}>
            {entry.task}
          </p>
        </div>
        
        <div style={{ color: "var(--text-muted)", fontSize: "20px", transition: "transform 0.3s", transform: expanded ? "rotate(90deg)" : "none", flexShrink: 0 }}>
          ›
        </div>
      </div>

      {expanded && (
        <div
          className="animate-fade-in"
          style={{
            marginTop: "20px",
            paddingTop: "20px",
            borderTop: `1px solid var(--border-subtle)`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ marginBottom: "16px" }}>
            <h5 style={{ fontSize: "11px", fontWeight: "800", color: color.text, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
              Why This Matters
            </h5>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.7" }}>
              {entry.why}
            </p>
          </div>

          {entry.resource && (
            <div
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: `1px solid var(--border-subtle)`,
                borderRadius: "12px",
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div style={{
                width: "36px", height: "36px", borderRadius: "10px",
                background: color.bg, border: `1px solid ${color.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "16px", flexShrink: 0,
              }}>📚</div>
              <div>
                <h6 style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }}>Recommended Resource</h6>
                <p style={{ fontSize: "13px", color: color.accent, fontWeight: "600" }}>{entry.resource}</p>
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
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px", gap: "6px" }}>
        {["grid", "list"].map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              background: view === v ? "rgba(139, 92, 246, 0.1)" : "transparent",
              border: `1px solid ${view === v ? "var(--border-accent)" : "var(--border-subtle)"}`,
              borderRadius: "8px",
              padding: "6px 14px",
              fontSize: "12px",
              fontWeight: "600",
              color: view === v ? "var(--color-primary-light)" : "var(--text-muted)",
              cursor: "pointer",
              fontFamily: "inherit",
              textTransform: "capitalize",
              transition: "all 0.2s",
            }}
          >
            {v === "grid" ? "⊞ Grid" : "☰ List"}
          </button>
        ))}
      </div>

      <div
        style={
          view === "grid"
            ? {
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "14px",
              }
            : {
                display: "flex",
                flexDirection: "column",
                gap: "10px",
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
