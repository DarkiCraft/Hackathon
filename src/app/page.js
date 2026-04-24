"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";

// Force graph requires window — disable SSR
const Graph = dynamic(() => import("@/components/Graph"), { ssr: false });

// SkillMap components (from skillmap-mvp branch)
import SkillMapInput from "@/components/SkillMapInput";
import SkillGapChain from "@/components/SkillGapChain";
import SkillMapGraph from "@/components/SkillMapGraph";
import LearningPlan from "@/components/LearningPlan";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("graph");

  // SkillMap state
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(null);

  const handleAnalyze = async ({ goal, knownSkills, timeAvailable }) => {
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
      if (!res.ok) throw new Error(data.error || "Failed to generate skill map");
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const tabStyle = (tab) => ({
    padding: "10px 24px",
    border: "none",
    borderBottom: activeTab === tab ? "3px solid #4F46E5" : "3px solid transparent",
    backgroundColor: "transparent",
    fontWeight: activeTab === tab ? "700" : "500",
    color: activeTab === tab ? "#4F46E5" : "#6b7280",
    cursor: "pointer",
    fontSize: "15px",
    transition: "all 0.15s",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100vw", height: "100vh" }}>

      {/* ── NAV BAR ── */}
      <nav style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        borderBottom: "1px solid #e5e7eb",
        backgroundColor: "#fff",
        padding: "0 24px",
        flexShrink: 0,
      }}>
        <span style={{ fontWeight: "800", fontSize: "18px", color: "#1f2937", marginRight: "24px" }}>
          🧭 SkillGraph
        </span>
        <button style={tabStyle("graph")} onClick={() => setActiveTab("graph")}>
          Skill Graph
        </button>
        <button style={tabStyle("skillmap")} onClick={() => setActiveTab("skillmap")}>
          Skill Gap Analyzer
        </button>
      </nav>

      {/* ── SKILL GRAPH TAB ── */}
      {activeTab === "graph" && (
        <div style={{ flex: 1 }}>
          <Graph />
        </div>
      )}

      {/* ── SKILL MAP (AI) TAB ── */}
      {activeTab === "skillmap" && (
        <div style={{ flex: 1, overflowY: "auto", backgroundColor: "#0a0f1e" }}>
          <header style={{ textAlign: "center", padding: "64px 24px 40px", maxWidth: "700px", margin: "0 auto" }}>
            <h1 style={{ fontSize: "clamp(32px,6vw,56px)", fontWeight: "900", color: "#f1f5f9", marginBottom: "12px" }}>
              Skill Gap Analyzer
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "16px", lineHeight: "1.6" }}>
              Tell us your goal and what you already know — we&apos;ll find the exact skills you&apos;re missing.
            </p>
          </header>

          <section style={{ maxWidth: "660px", margin: "0 auto", padding: "0 24px 48px" }}>
            <SkillMapInput onSubmit={handleAnalyze} loading={loading} hasResults={!!results} />
          </section>

          {error && (
            <div style={{ maxWidth: "660px", margin: "0 auto 24px", padding: "0 24px" }}>
              <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "8px", padding: "12px 16px", color: "#dc2626" }}>
                ⚠️ {error}
              </div>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
              Analyzing your skill gap...
            </div>
          )}

          {results && !loading && (
            <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px 80px" }}>
              {results.summary && (
                <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "20px", marginBottom: "40px", color: "#e2e8f0" }}>
                  <strong>Summary:</strong> {results.summary}
                </div>
              )}

              <h2 style={{ color: "#f1f5f9", marginBottom: "16px" }}>🔗 Skill Gap Chain</h2>
              <SkillGapChain
                missingSkills={results.missingSkills || []}
                knownSkills={results.knownSkills || []}
              />

              <h2 style={{ color: "#f1f5f9", margin: "40px 0 16px" }}>🕸️ Dependency Graph</h2>
              <SkillMapGraph
                missingSkills={results.missingSkills || []}
                knownSkills={results.knownSkills || []}
              />

              <h2 style={{ color: "#f1f5f9", margin: "40px 0 16px" }}>📅 7-Day Learning Plan</h2>
              <LearningPlan days={results.learningPlan || []} />

              <div style={{ textAlign: "center", marginTop: "32px" }}>
                <button
                  onClick={() => { setResults(null); setError(null); }}
                  style={{ padding: "10px 24px", backgroundColor: "rgba(255,255,255,0.1)", color: "#f1f5f9", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
                >
                  🔄 Analyze Another Goal
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
