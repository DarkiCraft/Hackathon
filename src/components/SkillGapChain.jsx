"use client";

import React, { useState } from "react";

// Arrow connector between chain nodes
function ChainArrow() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexShrink: 0,
        color: "var(--color-primary)",
        opacity: 0.6,
        fontSize: "20px",
        padding: "0 4px",
      }}
      aria-hidden="true"
    >
      ΓåÆ
    </div>
  );
}

// Individual missing skill card in the chain
function MissingSkillCard({ skill, index, isActive, onClick }) {
  return (
    <button
      onClick={() => onClick(skill)}
      aria-label={`Missing skill: ${skill.name}`}
      className={`animate-fade-in-up stagger-${Math.min(index + 1, 7)}`}
      style={{
        position: "relative",
        background: isActive
          ? "rgba(239,68,68,0.18)"
          : "rgba(239,68,68,0.08)",
        border: isActive
          ? "1px solid rgba(239,68,68,0.6)"
          : "1px solid rgba(239,68,68,0.25)",
        borderRadius: "12px",
        padding: "14px 16px",
        cursor: "pointer",
        textAlign: "left",
        flexShrink: 0,
        minWidth: "130px",
        maxWidth: "180px",
        transition: "all 0.2s ease",
        fontFamily: "inherit",
        transform: isActive ? "translateY(-3px)" : "none",
        boxShadow: isActive ? "0 8px 24px rgba(239,68,68,0.25)" : "none",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "rgba(239,68,68,0.14)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "rgba(239,68,68,0.08)";
          e.currentTarget.style.transform = "none";
        }
      }}
    >
      {/* Order badge */}
      <div
        style={{
          position: "absolute",
          top: "-10px",
          left: "12px",
          width: "22px",
          height: "22px",
          borderRadius: "50%",
          background: "rgba(239,68,68,0.9)",
          color: "#fff",
          fontSize: "11px",
          fontWeight: "700",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {index + 1}
      </div>

      <p
        style={{
          fontSize: "13px",
          fontWeight: "700",
          color: "#fca5a5",
          marginBottom: "4px",
          marginTop: "4px",
          lineHeight: "1.3",
        }}
      >
        {skill.name}
      </p>
      <p
        style={{
          fontSize: "11px",
          color: "rgba(252,165,165,0.6)",
          lineHeight: "1.4",
        }}
      >
        Tap for details
      </p>
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
        background: "rgba(16,185,129,0.1)",
        border: "1px solid rgba(16,185,129,0.25)",
        borderRadius: "999px",
        padding: "6px 14px",
        fontSize: "13px",
        fontWeight: "500",
        color: "#6ee7b7",
      }}
    >
      <span style={{ fontSize: "10px" }}>Γ£ô</span>
      {skill.name}
    </div>
  );
}

// Detail panel for a selected skill
function SkillDetailPanel({ skill, onClose }) {
  if (!skill) return null;
  return (
    <div
      className="glass-card animate-fade-in-up"
      style={{
        marginTop: "20px",
        padding: "24px",
        border: "1px solid rgba(239,68,68,0.3)",
        background: "rgba(239,68,68,0.06)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <span className="badge badge-missing" style={{ marginBottom: "10px" }}>
            Missing Skill #{skill.order}
          </span>
          <h3
            style={{
              fontSize: "18px",
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
            fontSize: "22px",
            lineHeight: 1,
            padding: "0 0 0 12px",
          }}
        >
          ├ù
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
          padding: "28px 24px",
          overflowX: "auto",
          marginBottom: "16px",
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
              background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.2))",
              border: "1px solid rgba(139,92,246,0.4)",
              borderRadius: "12px",
              padding: "14px 20px",
              flexShrink: 0,
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "11px", color: "var(--color-primary-light)", fontWeight: "700", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Your Goal
            </p>
            <p style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)" }}>
              ≡ƒÄ» Achievement
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
        <div style={{ marginTop: "20px" }}>
          <p
            style={{
              fontSize: "12px",
              fontWeight: "600",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "10px",
            }}
          >
            Γ£à Skills You Already Have
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
