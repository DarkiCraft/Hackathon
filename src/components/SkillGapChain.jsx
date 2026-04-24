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
      className={`animate-fade-in-up stagger-${Math.min(index + 1, 7)}`}
      style={{
        position: "relative",
        background: isActive
          ? "rgba(239, 68, 68, 0.2)"
          : "rgba(255, 255, 255, 0.04)",
        border: isActive
          ? "1px solid rgba(239, 68, 68, 0.5)"
          : "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "16px",
        padding: "16px 20px",
        cursor: "pointer",
        textAlign: "left",
        flexShrink: 0,
        minWidth: "160px",
        maxWidth: "220px",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        fontFamily: "inherit",
        boxShadow: isActive ? "0 10px 30px rgba(239, 68, 68, 0.25)" : "none",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
          e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.3)";
          e.currentTarget.style.transform = "translateY(-4px)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
          e.currentTarget.style.transform = "none";
        }
      }}
    >
      <div
        style={{
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          background: "var(--color-danger)",
          color: "#fff",
          fontSize: "11px",
          fontWeight: "800",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "12px",
          boxShadow: "0 0 10px rgba(239, 68, 68, 0.5)"
        }}
      >
        {index + 1}
      </div>

      <h5
        style={{
          fontSize: "15px",
          fontWeight: "700",
          color: isActive ? "#fff" : "#fca5a5",
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
