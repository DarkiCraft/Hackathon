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

function TaskCard({ entry, color, taskNumber, totalTasks }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article
      style={{
        background: "var(--bg-glass)",
        border: `1px solid var(--border-subtle)`,
        borderRadius: "14px",
        padding: "18px 20px",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
        backdropFilter: "blur(12px)",
        flex: 1,
        minWidth: 0,
      }}
      onClick={() => setExpanded((p) => !p)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.background = color.bg;
        e.currentTarget.style.borderColor = color.border;
        e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.25), 0 0 16px ${color.border}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.background = "var(--bg-glass)";
        e.currentTarget.style.borderColor = "var(--border-subtle)";
        e.currentTarget.style.boxShadow = "none";
      }}
      role="button"
    >
      {totalTasks > 1 && (
        <div style={{
          position: "absolute", top: "12px", right: "12px",
          fontSize: "10px", fontWeight: "800", color: color.text,
          background: color.bg, border: `1px solid ${color.border}`,
          borderRadius: "6px", padding: "2px 8px", letterSpacing: "0.06em"
        }}>
          Task {taskNumber}/{totalTasks}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{
            fontSize: "11px", fontWeight: "700", color: color.text,
            textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px"
          }}>
            {entry.skill}
          </h4>
          <p style={{
            fontSize: "15px", fontWeight: "600", color: "var(--text-primary)",
            lineHeight: "1.5", letterSpacing: "-0.01em"
          }}>
            {entry.task}
          </p>
        </div>
        <div style={{
          color: "var(--text-muted)", fontSize: "18px",
          transition: "transform 0.3s",
          transform: expanded ? "rotate(90deg)" : "none",
          flexShrink: 0, marginTop: "2px"
        }}>
          ›
        </div>
      </div>

      {expanded && (
        <div
          className="animate-fade-in"
          style={{ marginTop: "16px", paddingTop: "16px", borderTop: `1px solid var(--border-subtle)` }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ marginBottom: "12px" }}>
            <h5 style={{
              fontSize: "10px", fontWeight: "800", color: color.text,
              textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px"
            }}>
              Why This Matters
            </h5>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.7" }}>
              {entry.why}
            </p>
          </div>
          {entry.resource && (
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid var(--border-subtle)`,
              borderRadius: "10px", padding: "12px 14px",
              display: "flex", alignItems: "center", gap: "10px",
            }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px",
                background: color.bg, border: `1px solid ${color.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "14px", flexShrink: 0,
              }}>📚</div>
              <div>
                <h6 style={{
                  fontSize: "10px", fontWeight: "800", color: "var(--text-muted)",
                  textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px"
                }}>Resource</h6>
                <p style={{ fontSize: "13px", color: color.accent, fontWeight: "600" }}>
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

function DayGroup({ dayNumber, tasks }) {
  const color = DAY_COLORS[(dayNumber - 1) % DAY_COLORS.length];

  return (
    <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
      {/* Day badge */}
      <div style={{
        width: "60px", flexShrink: 0,
        display: "flex", flexDirection: "column", alignItems: "center",
        paddingTop: "18px",
      }}>
        <div style={{
          width: "52px", height: "52px", borderRadius: "14px",
          background: color.bg, border: `1px solid ${color.border}`,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <span style={{
            fontSize: "9px", fontWeight: "800", color: color.text,
            textTransform: "uppercase", letterSpacing: "0.06em"
          }}>Day</span>
          <span style={{
            fontSize: "22px", fontWeight: "900",
            color: "var(--text-primary)", lineHeight: 1
          }}>{dayNumber}</span>
        </div>

        {tasks.length > 1 && (
          <div style={{
            width: "2px", flex: 1, minHeight: "20px", marginTop: "8px",
            background: `linear-gradient(180deg, ${color.border}, transparent)`,
            borderRadius: "1px",
          }} />
        )}
      </div>

      {/* Task cards stacked vertically */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px", minWidth: 0 }}>
        {tasks.map((entry, i) => (
          <TaskCard
            key={i}
            entry={entry}
            color={color}
            taskNumber={i + 1}
            totalTasks={tasks.length}
          />
        ))}
      </div>
    </div>
  );
}

export default function LearningPlan({ days = [] }) {
  if (days.length === 0) {
    return (
      <div className="glass-card" style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
        No learning plan generated yet.
      </div>
    );
  }

  const grouped = days.reduce((acc, entry) => {
    if (!acc[entry.day]) acc[entry.day] = [];
    acc[entry.day].push(entry);
    return acc;
  }, {});

  const sortedDays = Object.keys(grouped).map(Number).sort((a, b) => a - b);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {sortedDays.map((dayNum) => (
        <DayGroup key={dayNum} dayNumber={dayNum} tasks={grouped[dayNum]} />
      ))}
    </div>
  );
}