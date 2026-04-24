"use client";

import React, { useState } from "react";

// Animated arrow connector between chain nodes
function ChainArrow() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexShrink: 0,
        padding: "0 2px",
      }}
      aria-hidden="true"
    >
      <svg width="32" height="16" viewBox="0 0 32 16" fill="none">
        <line x1="0" y1="8" x2="24" y2="8" stroke="rgba(139,92,246,0.35)" strokeWidth="1.5" strokeDasharray="4 3" />
        <polygon points="24,4 32,8 24,12" fill="rgba(139,92,246,0.5)" />
      </svg>
    </div>
  );
}

// Individual missing skill card in the chain
function MissingSkillCard({ skill, index, isActive, onClick }) {
  return (
    <button
      onClick={() => onClick(skill)}
      className={`animate-fade-in-up stagger-${Math.min(index + 1, 7)}`}
      style={{
        position: "relative",
        background: isActive
          ? "rgba(239, 68, 68, 0.12)"
          : "rgba(255, 255, 255, 0.03)",
        border: isActive
          ? "1px solid rgba(248, 113, 113, 0.5)"
          : "1px solid var(--border-subtle)",
        borderRadius: "16px",
        padding: "18px 20px",
        cursor: "pointer",
        textAlign: "left",
        flexShrink: 0,
        minWidth: "160px",
        maxWidth: "220px",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        fontFamily: "inherit",
        boxShadow: isActive ? "0 8px 32px rgba(239, 68, 68, 0.15), 0 0 20px rgba(239,68,68,0.08)" : "0 4px 16px rgba(0,0,0,0.2)",
        backdropFilter: "blur(8px)",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
          e.currentTarget.style.borderColor = "rgba(248, 113, 113, 0.4)";
          e.currentTarget.style.transform = "translateY(-4px)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
          e.currentTarget.style.borderColor = "var(--border-subtle)";
          e.currentTarget.style.transform = "none";
        }
      }}
    >
      <div
        style={{
          width: "26px",
          height: "26px",
          borderRadius: "8px",
          background: "linear-gradient(135deg, #ef4444, #dc2626)",
          color: "#fff",
          fontSize: "11px",
          fontWeight: "800",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "12px",
          boxShadow: "0 0 16px rgba(239, 68, 68, 0.35)"
        }}
      >
        {index + 1}
      </div>

      <h5
        style={{
          fontSize: "14px",
          fontWeight: "700",
          color: isActive ? "#fca5a5" : "#f87171",
          lineHeight: "1.3",
        }}
      >
        {skill.name}
      </h5>
    </button>
  );
}

// Known skill pill
function KnownSkillPill({ skill, index }) {
  return (
    <div
      className={`animate-fade-in stagger-${Math.min(index + 1, 7)}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        background: "rgba(16,185,129,0.08)",
        border: "1px solid rgba(16,185,129,0.2)",
        borderRadius: "999px",
        padding: "6px 14px",
        fontSize: "13px",
        fontWeight: "500",
        color: "#6ee7b7",
      }}
    >
      <span style={{ fontSize: "10px", color: "#34d399" }}>✓</span>
      {skill.name}
    </div>
  );
}

// Detail panel for a selected skill
function SkillDetailPanel({ skill, onClose }) {
  if (!skill) return null;
  return (
    <div
      className="animate-fade-in-up"
      style={{
        marginTop: "16px",
        padding: "24px",
        border: "1px solid rgba(239,68,68,0.2)",
        background: "rgba(239, 68, 68, 0.06)",
        borderRadius: "16px",
        backdropFilter: "blur(12px)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <span className="badge badge-missing" style={{ marginBottom: "10px" }}>
            Missing Skill #{skill.order}
          </span>
          <h3
            style={{
              fontSize: "17px",
              fontWeight: "700",
              color: "#fca5a5",
              marginBottom: "10px",
              letterSpacing: "-0.01em",
            }}
          >
            {skill.name}
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.7" }}>
            <strong style={{ color: "var(--text-primary)" }}>Why this matters: </strong>
            {skill.why}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close detail panel"
          style={{
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            fontSize: "20px",
            lineHeight: 1,
            padding: "0 0 0 12px",
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default function SkillGapChain({ missingSkills = [], knownSkills = [] }) {
  const [activeSkill, setActiveSkill] = useState(null);

  const handleCardClick = (skill) => {
    setActiveSkill((prev) => (prev?.id === skill.id ? null : skill));
  };

  if (missingSkills.length === 0) {
    return (
      <div
        className="glass-card"
        style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}
      >
        No missing skills identified. You may already be ready!
      </div>
    );
  }

  return (
    <div>
      {/* Chain row */}
      <div
        className="glass-card"
        style={{
          padding: "24px",
          overflowX: "auto",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            minWidth: "max-content",
          }}
        >
          {missingSkills.map((skill, i) => (
            <React.Fragment key={skill.id}>
              <MissingSkillCard
                skill={skill}
                index={i}
                isActive={activeSkill?.id === skill.id}
                onClick={handleCardClick}
              />
              {i < missingSkills.length - 1 && <ChainArrow />}
            </React.Fragment>
          ))}

          {/* Arrow to goal */}
          <ChainArrow />

          {/* Goal node */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(6,182,212,0.1))",
              border: "1px solid rgba(139,92,246,0.25)",
              borderRadius: "14px",
              padding: "16px 22px",
              flexShrink: 0,
              textAlign: "center",
              boxShadow: "0 0 24px rgba(139,92,246,0.08)",
            }}
          >
            <p style={{ fontSize: "10px", color: "var(--color-primary-light)", fontWeight: "800", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Your Goal
            </p>
            <p style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)" }}>
              🎯 Achievement
            </p>
          </div>
        </div>
      </div>

      {/* Detail panel */}
      {activeSkill && (
        <SkillDetailPanel skill={activeSkill} onClose={() => setActiveSkill(null)} />
      )}

      {/* Known skills */}
      {knownSkills.length > 0 && (
        <div style={{ marginTop: "16px" }}>
          <p
            style={{
              fontSize: "11px",
              fontWeight: "700",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "10px",
            }}
          >
            Skills You Already Have
          </p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {knownSkills.map((skill, i) => (
              <KnownSkillPill key={skill.id} skill={skill} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
