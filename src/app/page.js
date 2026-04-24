"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import SkillMapInput from "@/components/SkillMapInput";
import SkillGapChain from "@/components/SkillGapChain";
import LearningPlan from "@/components/LearningPlan";

// Force graph requires window — disable SSR
const SkillMapGraph = dynamic(() => import("@/components/SkillMapGraph"), { ssr: false });

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="animate-fade-in" style={{ padding: "0 0 80px" }}>
      {/* Summary skeleton */}
      <div className="glass-card" style={{ padding: "28px", marginBottom: "32px" }}>
        <div className="skeleton" style={{ height: "16px", width: "60%", marginBottom: "12px" }} />
        <div className="skeleton" style={{ height: "16px", width: "90%", marginBottom: "8px" }} />
        <div className="skeleton" style={{ height: "16px", width: "75%", marginBottom: "8px" }} />
        <div className="skeleton" style={{ height: "16px", width: "50%" }} />
      </div>
      {/* Chain skeleton */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "32px", flexWrap: "wrap" }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="skeleton"
            style={{ height: "72px", flex: "1 1 140px", minWidth: "120px" }}
          />
        ))}
      </div>
      {/* Cards skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton" style={{ height: "180px" }} />
        ))}
      </div>
    </div>
  );
}

// ─── Error Banner ─────────────────────────────────────────────────────────────
function ErrorBanner({ message, onDismiss }) {
  return (
    <div
      className="animate-fade-in-up glass-card"
      style={{
        border: "1px solid rgba(239,68,68,0.4)",
        background: "rgba(239,68,68,0.08)",
        padding: "20px 24px",
        marginBottom: "32px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
      }}
    >
      <span style={{ fontSize: "22px" }}>⚠️</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: "600", color: "#fca5a5", marginBottom: "2px" }}>
          Something went wrong
        </p>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>{message}</p>
      </div>
      <button
        onClick={onDismiss}
        style={{
          background: "none",
          border: "none",
          color: "var(--text-muted)",
          cursor: "pointer",
          fontSize: "20px",
          lineHeight: 1,
        }}
        aria-label="Dismiss error"
      >
        ×
      </button>
    </div>
  );
}

// ─── Results Summary Banner ───────────────────────────────────────────────────
function SummaryBanner({ summary, goal }) {
  return (
    <div
      className="glass-card-strong animate-fade-in-up"
      style={{ padding: "28px 32px", marginBottom: "40px" }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, var(--color-primary), var(--color-cyan))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "22px",
            flexShrink: 0,
          }}
        >
          🗺️
        </div>
        <div>
          <p
            style={{
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-primary-light)",
              marginBottom: "6px",
            }}
          >
            Your SkillMap for
          </p>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "var(--text-primary)",
              marginBottom: "12px",
              letterSpacing: "-0.02em",
            }}
          >
            {goal}
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px", lineHeight: "1.7" }}>
            {summary}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ icon, title, subtitle, badge }) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
        <span style={{ fontSize: "22px" }}>{icon}</span>
        <h2 className="section-title">{title}</h2>
        {badge && <span className={`badge badge-${badge.type}`}>{badge.label}</span>}
      </div>
      {subtitle && (
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginLeft: "32px" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(null);

  const handleSubmit = async ({ goal, knownSkills, timeAvailable }) => {
    setLoading(true);
    setError(null);
    setResults(null);
    setFormData({ goal, knownSkills, timeAvailable });

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, knownSkills, timeAvailable }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate skill map");
      }

      setResults(data);

      // Scroll to results smoothly
      setTimeout(() => {
        document.getElementById("skillmap-results")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setError(null);
    setFormData(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main
      style={{
        position: "relative",
        zIndex: 1,
        minHeight: "100vh",
      }}
    >
      {/* ── HERO ─────────────────────────────────────────── */}
      <header
        style={{
          textAlign: "center",
          padding: "80px 24px 56px",
          maxWidth: "760px",
          margin: "0 auto",
        }}
      >
        {/* Logo mark */}
        <div
          className="animate-fade-in-up"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            background: "rgba(139,92,246,0.12)",
            border: "1px solid rgba(139,92,246,0.3)",
            borderRadius: "999px",
            padding: "6px 18px 6px 10px",
            marginBottom: "32px",
          }}
        >
          <span
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--color-primary), var(--color-cyan))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
            }}
          >
            🧭
          </span>
          <span
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "var(--color-primary-light)",
              letterSpacing: "0.04em",
            }}
          >
            AI-Powered Learning
          </span>
        </div>

        <h1
          className="gradient-text animate-fade-in-up stagger-1"
          style={{
            fontSize: "clamp(40px, 7vw, 68px)",
            fontWeight: "900",
            letterSpacing: "-0.04em",
            lineHeight: "1.05",
            marginBottom: "20px",
          }}
        >
          SkillMap
        </h1>

        <p
          className="animate-fade-in-up stagger-2"
          style={{
            fontSize: "clamp(16px, 2.5vw, 20px)",
            color: "var(--text-secondary)",
            lineHeight: "1.65",
            maxWidth: "560px",
            margin: "0 auto 16px",
          }}
        >
          You have a goal. You have some skills. We find the{" "}
          <span style={{ color: "var(--color-primary-light)", fontWeight: "600" }}>
            exact gap
          </span>{" "}
          between them — and build your{" "}
          <span style={{ color: "var(--color-cyan-light)", fontWeight: "600" }}>
            personalized plan
          </span>{" "}
          to close it.
        </p>

        {/* Stat pills */}
        <div
          className="animate-fade-in-up stagger-3"
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: "28px",
          }}
        >
          {[
            { icon: "🔍", label: "4-6 Missing Skills Identified" },
            { icon: "📅", label: "7-Day Learning Plan" },
            { icon: "🔗", label: "Free Resources Included" },
          ].map(({ icon, label }) => (
            <div
              key={label}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "999px",
                padding: "6px 14px",
                fontSize: "13px",
                color: "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {icon} {label}
            </div>
          ))}
        </div>
      </header>

      {/* ── INPUT FORM ───────────────────────────────────── */}
      <section style={{ maxWidth: "680px", margin: "0 auto", padding: "0 24px 64px" }}>
        <SkillMapInput onSubmit={handleSubmit} loading={loading} hasResults={!!results} />
      </section>

      {/* ── RESULTS ──────────────────────────────────────── */}
      <section
        id="skillmap-results"
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 24px 80px",
        }}
      >
        {/* Error */}
        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

        {/* Loading */}
        {loading && <LoadingSkeleton />}

        {/* Results */}
        {results && !loading && (
          <div>
            {/* Summary */}
            {results.summary && (
              <SummaryBanner summary={results.summary} goal={formData?.goal} />
            )}

            {/* Skill Gap Chain */}
            <div style={{ marginBottom: "56px" }}>
              <SectionHeader
                icon="🔗"
                title="Your Skill Gap Chain"
                subtitle="Skills you need to learn, in order of dependency — start from the left"
                badge={{ type: "missing", label: `${results.missingSkills?.length || 0} Missing` }}
              />
              <SkillGapChain
                missingSkills={results.missingSkills || []}
                knownSkills={results.knownSkills || []}
              />
            </div>

            {/* Skill Graph */}
            <div style={{ marginBottom: "56px" }}>
              <SectionHeader
                icon="🕸️"
                title="Skill Dependency Graph"
                subtitle="Interactive visualization — green nodes are known skills, red are missing"
              />
              <SkillMapGraph
                missingSkills={results.missingSkills || []}
                knownSkills={results.knownSkills || []}
              />
            </div>

            {/* Learning Plan */}
            <div style={{ marginBottom: "48px" }}>
              <SectionHeader
                icon="📅"
                title="Your 7-Day Learning Plan"
                subtitle={`Tailored for ${formData?.timeAvailable || "your schedule"} — one focused task per day`}
                badge={{ type: "purple", label: "7 Days" }}
              />
              <LearningPlan days={results.learningPlan || []} />
            </div>

            {/* Reset CTA */}
            <div style={{ textAlign: "center", paddingTop: "16px" }}>
              <button
                onClick={handleReset}
                className="btn-primary"
                id="skillmap-reset-btn"
                style={{ background: "var(--bg-glass-strong)", boxShadow: "none" }}
              >
                🔄 Analyze a New Goal
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
