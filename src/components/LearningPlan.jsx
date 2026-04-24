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
        background: "var(--bg-glass)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${color.border}`,
        borderRadius: "16px",
        padding: "24px",
        cursor: "pointer",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        position: "relative",
        overflow: "hidden",
      }}
      onClick={() => setExpanded((p) => !p)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.3)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
      }}
      role="button"
      aria-expanded={expanded}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && setExpanded((p) => !p)}
    >
      {/* Decorative top line */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: color.text,
          opacity: 0.6,
        }}
      />

      {/* Day badge + skill */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "12px" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: color.bg,
            border: `1px solid ${color.border}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: "10px", fontWeight: "700", color, letterSpacing: "0.04em", textTransform: "uppercase", color: color.text }}>
            Day
          </span>
          <span style={{ fontSize: "20px", fontWeight: "900", color: color.text, lineHeight: 1 }}>
            {entry.day}
          </span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: "11px",
              fontWeight: "600",
              color: color.text,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "4px",
            }}
          >
            {entry.skill}
          </p>
          <p
            style={{
              fontSize: "15px",
              fontWeight: "600",
              color: "var(--text-primary)",
              lineHeight: "1.4",
              letterSpacing: "-0.01em",
            }}
          >
            {entry.task}
          </p>
        </div>
      </div>

      {/* Expand indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "12px",
          color: "var(--text-muted)",
        }}
      >
        <span style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.2s", display: "inline-block" }}>
          ›
        </span>
        {expanded ? "Hide details" : "See why & resources"}
      </div>

      {/* Expanded content */}
      {expanded && (
        <div
          className="animate-fade-in"
          style={{
            marginTop: "16px",
            paddingTop: "16px",
            borderTop: `1px solid ${color.border}`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Why */}
          <div style={{ marginBottom: "14px" }}>
            <p
              style={{
                fontSize: "11px",
                fontWeight: "700",
                color: color.text,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "6px",
              }}
            >
              💡 Why This Matters
            </p>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.65" }}>
              {entry.why}
            </p>
          </div>

          {/* Resource */}
          {entry.resource && (
            <div
              style={{
                background: color.bg,
                border: `1px solid ${color.border}`,
                borderRadius: "8px",
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "16px" }}>📚</span>
              <div>
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: color.text,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "2px",
                  }}
                >
                  Free Resource
                </p>
                <p style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: "500" }}>
                  {entry.resource}
                </p>
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
            {v === "grid" ? "⊞ Grid" : "☰ List"}
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
