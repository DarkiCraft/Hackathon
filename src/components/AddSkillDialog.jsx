"use client";
import React, { useState, useEffect } from "react";

/**
 * Modernised AddSkillDialog with Dark Theme & Glassmorphism.
 * Matches the SkillGraph premium aesthetic.
 */
export default function AddSkillDialog({ onClose, onSkillAdded, existingSkills = [] }) {
  const [step, setStep] = useState(1);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);

  const [skillDetails, setSkillDetails] = useState({
    id: "",
    name: "",
    description: "",
    relations: { parentclasses: [], subclasses: [], associations: [] }
  });

  const [links, setLinks] = useState([]);
  const [notes, setNotes] = useState("");
  const [color, setColor] = useState("#8b5cf6");

  const [searchLoading, setSearchLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    try {
      setSearchLoading(true);
      const res = await fetch(`/api/search-skill?name=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const loadSkillDetails = async () => {
    if (!selectedSkill) return;
    try {
      setDetailsLoading(true);
      const res = await fetch(`/api/skill-details?qid=${encodeURIComponent(selectedSkill.qid)}`);
      const data = await res.json();
      setSkillDetails({
        id: data.id || selectedSkill.qid,
        name: data.name || selectedSkill.label,
        description: data.description || "",
        relations: data.relations || { parentclasses: [], subclasses: [], associations: [] }
      });
      setLinks([`https://esco.ec.europa.eu/en/classification/skill_en?uri=${encodeURIComponent(selectedSkill.qid)}`]);
    } catch (err) {
      console.error(err);
      setSkillDetails({
        id: selectedSkill.qid,
        name: selectedSkill.label,
        description: selectedSkill.description || "",
        relations: { parentclasses: [], subclasses: [], associations: [] }
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    if (step === 2) loadSkillDetails();
  }, [step]);

  const handleConfirm = () => {
    if (!skillDetails.id) return;
    if (existingSkills.find(s => s.id === skillDetails.id)) {
      alert("This skill is already in your graph.");
      return;
    }
    onSkillAdded({
      id: skillDetails.id,
      name: skillDetails.name,
      description: skillDetails.description,
      notes,
      links,
      color,
      relations: skillDetails.relations
    });
  };

  const overlayStyle = {
    position: "fixed", inset: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    backdropFilter: "blur(8px)",
    display: "flex", justifyContent: "center", alignItems: "center",
    zIndex: 10000,
    padding: "20px"
  };

  const modalStyle = {
    width: "100%", maxWidth: "500px",
    background: "#0d1117",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "24px",
    padding: "32px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
    position: "relative"
  };

  const sectionLabel = {
    fontSize: "12px",
    fontWeight: "800",
    color: "#8b949e",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "8px",
    display: "block"
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()} className="animate-fade-in-up">
        
        {/* Header */}
        <header style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#f0f6fc", marginBottom: "4px" }}>Add Skill</h2>
          <p style={{ fontSize: "14px", color: "#8b949e" }}>Step {step} of 2 ΓÇö {step === 1 ? "Select from ESCO" : "Review details"}</p>
        </header>

        {step === 1 ? (
          <div className="animate-fade-in">
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <input
                type="text"
                placeholder="Search ESCO skills (e.g. Python, Design...)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="skillmap-input"
                style={{ flex: 1 }}
              />
              <button onClick={handleSearch} className="btn-primary" style={{ padding: "0 20px", borderRadius: "12px" }}>
                Search
              </button>
            </div>

            {searchLoading && <div style={{ textAlign: "center", color: "#8b949e", padding: "20px" }}>Searching...</div>}

            <div style={{ display: "grid", gap: "10px", maxHeight: "300px", overflowY: "auto", paddingRight: "4px" }}>
              {results.map((item) => (
                <button
                  key={item.qid}
                  onClick={() => setSelectedSkill(item)}
                  style={{
                    padding: "16px", borderRadius: "16px", textAlign: "left",
                    background: selectedSkill?.qid === item.qid ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${selectedSkill?.qid === item.qid ? "#8b5cf6" : "rgba(255,255,255,0.1)"}`,
                    cursor: "pointer", transition: "all 0.2s"
                  }}
                >
                  <strong style={{ display: "block", color: "#f0f6fc", fontSize: "15px", marginBottom: "4px" }}>{item.label}</strong>
                  <span style={{ fontSize: "13px", color: "#8b949e", lineHeight: "1.4" }}>{item.description}</span>
                </button>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "32px" }}>
              <button onClick={onClose} style={{ background: "transparent", border: "1px solid #30363d", color: "#c9d1d9", padding: "10px 24px", borderRadius: "99px", cursor: "pointer", fontWeight: "600" }}>Cancel</button>
              <button 
                onClick={() => setStep(2)} 
                disabled={!selectedSkill}
                className="btn-primary"
              >
                Next Step ΓÜ¬
              </button>
            </div>
          </div>
        ) : (
          detailsLoading ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div className="animate-spin" style={{ fontSize: "32px", marginBottom: "12px" }}>⚙️</div>
              <p style={{ color: "#8b949e" }}>Fetching ESCO Metadata...</p>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#f0f6fc", marginBottom: "8px" }}>{skillDetails.name}</h3>
                <p style={{ fontSize: "14px", color: "#8b949e", lineHeight: "1.5" }}>{skillDetails.description}</p>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={sectionLabel}>Notes</label>
                <textarea 
                  className="skillmap-textarea" 
                  rows={3} 
                  placeholder="Personal notes..." 
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "32px" }}>
                <button onClick={() => setStep(1)} style={{ background: "transparent", border: "1px solid #30363d", color: "#c9d1d9", padding: "10px 24px", borderRadius: "99px", cursor: "pointer", fontWeight: "600" }}>ΓÜÖ Back</button>
                <button onClick={handleConfirm} className="btn-primary">Add to Graph Γ£ô</button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
