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
  const [activeTab, setActiveTab] = useState("graph");

  // SkillMap state
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(null);

  // Load persisted state only on client after mount to avoid hydration mismatch
  React.useEffect(() => {
    try {
      const savedTab = localStorage.getItem("skillgraph_tab");
      const savedResults = localStorage.getItem("skillmap_results");
      const savedForm = localStorage.getItem("skillmap_form");

      if (savedTab) setActiveTab(savedTab);
      if (savedResults) setResults(JSON.parse(savedResults));
      if (savedForm) setFormData(JSON.parse(savedForm));
    } catch (e) {
      console.error("Failed to restore saved app state:", e);
    }
  }, []);

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

  const handleImportToGraph = async () => {
    if (!results) return;
    const { missingSkills, knownSkills } = results;
    const goalTitle = formData?.goal || "My Goal";
    const goalId = `goal_${goalTitle.toLowerCase().replace(/\s+/g, "_")}`;
    let addedCount = 0;

    setLoading(true); // Reuse loading state for the import process

    // Helper to fetch best ESCO match
    const getEscoMatch = async (name) => {
      try {
        const res = await fetch(`/api/search-skill?name=${encodeURIComponent(name)}`);
        const data = await res.json();
        if (data && data.length > 0) {
          const best = data[0];
          // Get full details for the best match
          const detailRes = await fetch(`/api/skill-details?qid=${encodeURIComponent(best.qid)}`);
          return await detailRes.json();
        }
      } catch (e) {
        console.error("ESCO lookup failed for:", name, e);
      }
      return null;
    };

    // 1. Add Goal Node
    const goalPayload = {
      id: goalId,
      name: `🎯 Goal: ${goalTitle}`,
      description: "Target goal for this analysis.",
      color: "#8b5cf6",
      relations: { parentclasses: [], subclasses: [], associations: [] }
    };
    if (addSkill(goalPayload).success) addedCount++;

    // 2. Add Known Skills 
    for (const skill of knownSkills) {
      const match = await getEscoMatch(skill.name);
      const skillPayload = {
        id: match?.id || `ai_${skill.name.toLowerCase().replace(/\s+/g, "_")}`,
        name: match?.name || skill.name,
        description: match?.description || "Skill you already know.",
        color: "#10b981",
        relations: match?.relations || { 
          parentclasses: [], 
          subclasses: [{ id: goalId, name: goalPayload.name }], 
          associations: [] 
        }
      };
      // Force link to goal if not already there
      if (!skillPayload.relations.subclasses.some(s => s.id === goalId)) {
        skillPayload.relations.subclasses.push({ id: goalId, name: goalPayload.name });
      }
      if (addSkill(skillPayload).success) addedCount++;
    }

    // 3. Add Missing Skills
    for (let i = 0; i < missingSkills.length; i++) {
      const skill = missingSkills[i];
      const match = await getEscoMatch(skill.name);
      
      const skillId = match?.id || `ai_${skill.name.toLowerCase().replace(/\s+/g, "_")}`;
      const skillPayload = {
        id: skillId,
        name: match?.name || skill.name,
        description: match?.description || skill.why,
        color: "#ef4444",
        relations: match?.relations || { parentclasses: [], subclasses: [], associations: [] }
      };

      // Determine next ID for connection
      let nextId = null;
      let nextName = null;
      if (i < missingSkills.length - 1) {
        // Link to next in chain (we'll assume the next one's ID pattern)
        const nextSkill = missingSkills[i+1];
        nextId = `ai_${nextSkill.name.toLowerCase().replace(/\s+/g, "_")}`;
        nextName = nextSkill.name;
      } else {
        // Last one links to goal
        nextId = goalId;
        nextName = goalPayload.name;
      }

      if (nextId && !skillPayload.relations.subclasses.some(s => s.id === nextId)) {
        skillPayload.relations.subclasses.push({ id: nextId, name: nextName });
      }

      const res = addSkill(skillPayload);
      if (res.success) addedCount++;
    }

    setLoading(false);
    alert(`Successfully imported and validated ${addedCount} nodes from ESCO!`);
    setActiveTab("graph");
  };

  const tabStyle = (tab) => ({
    padding: "16px 28px",
    border: "none",
    borderBottom: activeTab === tab ? "2px solid #8b5cf6" : "2px solid transparent",
    backgroundColor: "transparent",
    fontWeight: activeTab === tab ? "700" : "500",
    color: activeTab === tab ? "#0f172a" : "#64748b",
    cursor: "pointer",
    fontSize: "14px",
    letterSpacing: "0.02em",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: activeTab === tab ? "#eef2ff" : "transparent",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100vw", height: "100vh", backgroundColor: "#f8fafc", color: "#0f172a" }}>

      {/* ── NAV BAR ── */}
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
        backgroundColor: "rgba(255, 255, 255, 0.92)",
        backdropFilter: "blur(20px)",
        padding: "0 40px",
        height: "64px",
        flexShrink: 0,
        zIndex: 100,
        position: "sticky",
        top: 0
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "24px" }}>🧭</span>
          <span style={{ fontWeight: "900", fontSize: "20px", letterSpacing: "-0.02em", background: "linear-gradient(to right, #0f172a, #6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            SkillGraph
          </span>
        </div>

        <div style={{ display: "flex", gap: "8px", height: "100%" }}>
          <button style={tabStyle("graph")} onClick={() => setActiveTab("graph")}>
            <span>📊</span> Dashboard
          </button>
          <button style={tabStyle("skillmap")} onClick={() => setActiveTab("skillmap")}>
            <span>⚡</span> Gap Analyzer
          </button>
        </div>

        <div style={{ width: "120px" }} /> {/* Spacer */}
      </nav>

      {/* ── SKILL GRAPH TAB ── */}
      {activeTab === "graph" && (
        <div style={{ flex: 1, position: "relative" }}>
          <Graph />
        </div>
      )}

      {/* ── SKILL MAP (AI) TAB ── */}
      {activeTab === "skillmap" && (
        <div style={{ flex: 1, overflowY: "auto", backgroundColor: "#f8fafc", backgroundImage: "radial-gradient(circle at 50% -20%, #eef2ff, #f8fafc)" }}>
          <header style={{ textAlign: "center", padding: "80px 24px 60px", maxWidth: "800px", margin: "0 auto" }}>
            <h1 className="gradient-text" style={{ fontSize: "clamp(40px, 8vw, 72px)", fontWeight: "900", lineHeight: "1.1", marginBottom: "20px", letterSpacing: "-0.03em" }}>
              Skill Gap Analyzer
            </h1>
            <p style={{ color: "#475569", fontSize: "18px", lineHeight: "1.6", maxWidth: "600px", margin: "0 auto" }}>
              Tell us your goal and what you already know — we&apos;ll find the exact skills you&apos;re missing to bridge the gap.
            </p>
          </header>

          <section style={{ maxWidth: "700px", margin: "0 auto", padding: "0 24px 64px" }}>
            <div className="glass-card-strong" style={{ padding: "32px", border: "1px solid rgba(139, 92, 246, 0.2)" }}>
              <SkillMapInput onSubmit={handleAnalyze} loading={loading} hasResults={!!results} />
            </div>
          </section>

          {error && (
            <div style={{ maxWidth: "700px", margin: "0 auto 32px", padding: "0 24px" }}>
              <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "12px", padding: "16px 20px", color: "#b91c1c", display: "flex", gap: "12px", alignItems: "center" }}>
                <span style={{ fontSize: "20px" }}>⚠️</span>
                <span style={{ fontWeight: "500" }}>{error}</span>
              </div>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: "center", padding: "80px 24px", color: "#64748b" }}>
              <div className="animate-spin" style={{ fontSize: "48px", marginBottom: "24px", display: "inline-block" }}>⚙️</div>
              <p style={{ fontSize: "18px", fontWeight: "500", letterSpacing: "0.02em" }}>Analyzing your path with Gemini AI...</p>
            </div>
          )}

          {results && !loading && (
            <div className="animate-fade-in" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px 120px" }}>
              
              {/* Summary Hero */}
              <div className="glass-card" style={{ padding: "40px", marginBottom: "64px", position: "relative", overflow: "hidden", background: "#ffffff" }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: "4px", height: "100%", background: "var(--color-primary)" }} />
                <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "28px" }}>📝</span> The Analysis
                </h2>
                <p style={{ fontSize: "18px", lineHeight: "1.7", color: "#334155", fontWeight: "400" }}>
                  {results.summary}
                </p>
                
                <div style={{ display: "flex", justifyContent: "flex-start", marginTop: "32px" }}>
                  <button
                    onClick={handleImportToGraph}
                    className="btn-primary"
                    style={{ background: "linear-gradient(135deg, #238636 0%, #2ea043 100%)", boxShadow: "0 4px 20px rgba(46, 160, 67, 0.3)" }}
                  >
                    📥 Import Skills to Main Graph
                  </button>
                </div>
              </div>

              {/* Grid Section */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "64px" }}>
                
                {/* 1. Chain */}
                <section>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                    <span style={{ fontSize: "24px" }}>🔗</span>
                    <h2 className="section-title">Dependency Chain</h2>
                  </div>
                  <SkillGapChain
                    missingSkills={results.missingSkills || []}
                    knownSkills={results.knownSkills || []}
                  />
                </section>

                {/* 2. Graph */}
                <section>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                    <span style={{ fontSize: "24px" }}>🕸️</span>
                    <h2 className="section-title">Visual Map</h2>
                  </div>
                  <SkillMapGraph
                    missingSkills={results.missingSkills || []}
                    knownSkills={results.knownSkills || []}
                  />
                </section>

                {/* 3. Learning Plan */}
                <section>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                    <span style={{ fontSize: "24px" }}>📅</span>
                    <h2 className="section-title">7-Day Learning Plan</h2>
                  </div>
                  <LearningPlan days={results.learningPlan || []} />
                </section>
              </div>

              <div style={{ textAlign: "center", marginTop: "100px", paddingTop: "60px", borderTop: "1px solid rgba(15,23,42,0.08)" }}>
                <button
                  onClick={() => { setResults(null); setError(null); }}
                  style={{ background: "transparent", color: "#475569", border: "1px solid #cbd5e1", padding: "12px 32px", borderRadius: "99px", cursor: "pointer", fontWeight: "600", transition: "all 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#64748b"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#cbd5e1"}
                >
                  🔄 Reset and Try Another Goal
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
