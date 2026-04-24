"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";

// Force graph requires window — disable SSR
const Graph = dynamic(() => import("@/components/Graph"), { ssr: false });

// SkillMap components (from skillmap-mvp branch)
import SkillMapInput from "@/components/SkillMapInput";
import SkillGapChain from "@/components/SkillGapChain";
const SkillMapGraph = dynamic(() => import("@/components/SkillMapGraph"), { ssr: false });
import LearningPlan from "@/components/LearningPlan";
import { addSkill } from "@/lib/skillStore";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("skillgraph_tab") || "graph";
    return "graph";
  });

  // SkillMap state
  const [results, setResults] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("skillmap_results");
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("skillmap_form");
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  // Persist State
  React.useEffect(() => {
    localStorage.setItem("skillgraph_tab", activeTab);
  }, [activeTab]);

  React.useEffect(() => {
    if (results) localStorage.setItem("skillmap_results", JSON.stringify(results));
    else localStorage.removeItem("skillmap_results");
  }, [results]);

  React.useEffect(() => {
    if (formData) localStorage.setItem("skillmap_form", JSON.stringify(formData));
    else localStorage.removeItem("skillmap_form");
  }, [formData]);

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

  const handleImportToGraph = () => {
    if (!results) return;
    const { missingSkills, knownSkills } = results;
    const goalTitle = formData?.goal || "My Goal";
    const goalId = `goal_${goalTitle.toLowerCase().replace(/\s+/g, "_")}`;
    let addedCount = 0;

    // 1. Add Goal Node
    const goalPayload = {
      id: goalId,
      name: `🎯 Goal: ${goalTitle}`,
      description: "Target goal for this analysis.",
      color: "#8b5cf6", // purple for goal
      relations: { parentclasses: [], subclasses: [], associations: [] }
    };
    if (addSkill(goalPayload).success) addedCount++;

    // 2. Add Known Skills (linked to Goal)
    knownSkills.forEach(skill => {
      const skillPayload = {
        id: `ai_${skill.name.toLowerCase().replace(/\s+/g, "_")}`,
        name: skill.name,
        description: "Skill you already know.",
        color: "#10b981", // green for known
        relations: { 
          parentclasses: [], 
          subclasses: [{ id: goalId, name: goalPayload.name }], 
          associations: [] 
        }
      };
      const res = addSkill(skillPayload);
      if (res.success) addedCount++;
    });

    // 3. Add Missing Skills
    missingSkills.forEach((skill, i) => {
      const skillId = `ai_${skill.name.toLowerCase().replace(/\s+/g, "_")}`;
      const skillPayload = {
        id: skillId,
        name: skill.name,
        description: skill.why,
        color: "#ef4444", // red for missing
        relations: { parentclasses: [], subclasses: [], associations: [] }
      };

      if (i < missingSkills.length - 1) {
        // Link to next missing skill
        skillPayload.relations.subclasses.push({
          id: `ai_${missingSkills[i + 1].name.toLowerCase().replace(/\s+/g, "_")}`,
          name: missingSkills[i + 1].name
        });
      } else {
        // Final missing skill links to Goal
        skillPayload.relations.subclasses.push({
          id: goalId,
          name: goalPayload.name
        });
      }

      const res = addSkill(skillPayload);
      if (res.success) addedCount++;
    });

    alert(`Successfully added ${addedCount} skills to your Skill Graph!`);
    setActiveTab("graph");
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
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px", gap: "12px" }}>
                <button
                  onClick={handleImportToGraph}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 12px rgba(16,185,129,0.3)"
                  }}
                >
                  📥 Add Missing Skills to Main Graph
                </button>
              </div>

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
