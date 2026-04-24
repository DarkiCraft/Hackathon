"use client";
import React, { useState, useEffect } from "react";

export default function AddSkillDialog({ onClose, onSkillAdded, existingSkills = [] }) {

  const [step, setStep] = useState(1);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);

  const [skillDetails, setSkillDetails] = useState({
    id: "",
    name: "",
    description: "",
    relations: {
      parentclasses: [],
      subclasses: [],
      associations: []
    }
  });

  const [links, setLinks] = useState([]);
  const [notes, setNotes] = useState("");
  const [color, setColor] = useState("#4F46E5");

  const [searchLoading, setSearchLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // ── SEARCH ──────────────────────────────────────────────────────────────
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

  // ── LOAD ESCO DETAILS ────────────────────────────────────────────────────
  const loadSkillDetails = async () => {
    if (!selectedSkill) return;
    try {
      setDetailsLoading(true);
      const res = await fetch(
        `/api/skill-details?qid=${encodeURIComponent(selectedSkill.qid)}`
      );
      const data = await res.json();
      setSkillDetails({
        id: data.id || selectedSkill.qid,
        name: data.name || selectedSkill.label,
        description: data.description || "",
        relations: data.relations || {
          parentclasses: [],
          subclasses: [],
          associations: []
        }
      });
      setLinks([
        `https://esco.ec.europa.eu/en/classification/skill_en?uri=${encodeURIComponent(selectedSkill.qid)}`
      ]);
    } catch (err) {
      console.error(err);
      // fallback: still allow adding with basic info
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

  // ── LINKS ────────────────────────────────────────────────────────────────
  const addLink = () => setLinks([...links, ""]);
  const updateLink = (i, v) => {
    const u = [...links];
    u[i] = v;
    setLinks(u);
  };
  const removeLink = (i) => {
    if (i === 0) return;
    setLinks(links.filter((_, idx) => idx !== i));
  };

  // ── SUBMIT to parent (Graph handles localStorage) ────────────────────────
  const handleConfirm = () => {
    if (!skillDetails.id) {
      alert("Skill details not loaded yet.");
      return;
    }
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

  // ── UI ───────────────────────────────────────────────────────────────────
  const btnBase = {
    padding: "6px 14px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "600"
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", top: 0, left: 0,
        width: "100vw", height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex", justifyContent: "center", alignItems: "center",
        zIndex: 9999, backdropFilter: "blur(3px)"
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#fff",
          padding: "24px",
          borderRadius: "12px",
          width: "440px",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 10px 25px rgba(0,0,0,0.25)"
        }}
      >
        <h2 style={{ marginBottom: "8px" }}>Add New Skill</h2>
        <p style={{ marginBottom: "16px", color: "#6b7280", fontSize: "13px" }}>
          Step {step} / 2
        </p>

        {/* ── STEP 1: SEARCH ─────────────────────────────────────────── */}
        {step === 1 && (
          <>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <input
                type="text"
                placeholder="Search ESCO skill..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                style={{
                  flex: 1, padding: "8px",
                  border: "1px solid #d1d5db", borderRadius: "6px"
                }}
              />
              <button
                onClick={handleSearch}
                style={{ ...btnBase, backgroundColor: "#374151", color: "#fff" }}
              >
                Search
              </button>
            </div>

            {searchLoading && <p style={{ color: "#6b7280" }}>Searching ESCO...</p>}

            <div style={{ maxHeight: "280px", overflowY: "auto" }}>
              {results.map((item) => (
                <div
                  key={item.qid}
                  onClick={() => setSelectedSkill(item)}
                  style={{
                    padding: "10px", marginBottom: "6px", borderRadius: "6px",
                    border: selectedSkill?.qid === item.qid
                      ? "2px solid #4F46E5" : "1px solid #e5e7eb",
                    cursor: "pointer", backgroundColor: selectedSkill?.qid === item.qid ? "#f5f3ff" : "#fff"
                  }}
                >
                  <strong style={{ fontSize: "14px" }}>{item.label}</strong>
                  <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                    {item.description}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
              <button onClick={onClose} style={{ ...btnBase, backgroundColor: "#e5e7eb", color: "#374151" }}>
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!selectedSkill}
                style={{
                  ...btnBase,
                  backgroundColor: selectedSkill ? "#374151" : "#9ca3af",
                  color: "#fff",
                  cursor: selectedSkill ? "pointer" : "not-allowed"
                }}
              >
                Next →
              </button>
            </div>
          </>
        )}

        {/* ── STEP 2: REVIEW & CUSTOMISE ─────────────────────────────── */}
        {step === 2 && (
          detailsLoading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#6b7280" }}>
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>⏳</div>
              Loading skill details from ESCO...
            </div>
          ) : (
            <>
              <div style={{ marginBottom: "12px" }}>
                <p style={{ fontWeight: "700", fontSize: "16px" }}>{skillDetails.name}</p>
                <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>
                  {skillDetails.description}
                </p>
              </div>

              {/* Relations summary */}
              {skillDetails.relations.parentclasses.length > 0 && (
                <div style={{ marginBottom: "10px" }}>
                  <strong style={{ fontSize: "13px" }}>Parent skills:</strong>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>
                    {skillDetails.relations.parentclasses.map(p => p.name || p.id).join(", ")}
                  </div>
                </div>
              )}

              {skillDetails.relations.subclasses.length > 0 && (
                <div style={{ marginBottom: "10px" }}>
                  <strong style={{ fontSize: "13px" }}>Subskills:</strong>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>
                    {skillDetails.relations.subclasses.map(s => s.name || s.id).join(", ")}
                  </div>
                </div>
              )}

              {/* Links */}
              <p style={{ fontWeight: "600", fontSize: "13px", marginTop: "12px", marginBottom: "6px" }}>
                Links
              </p>
              {links.map((link, i) => (
                <div key={i} style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
                  <input
                    value={link}
                    disabled={i === 0}
                    onChange={(e) => updateLink(i, e.target.value)}
                    style={{
                      flex: 1, padding: "6px",
                      border: "1px solid #d1d5db", borderRadius: "4px",
                      fontSize: "12px",
                      backgroundColor: i === 0 ? "#f9fafb" : "#fff"
                    }}
                  />
                  {i !== 0 && (
                    <button onClick={() => removeLink(i)}
                      style={{ ...btnBase, backgroundColor: "#fee2e2", color: "#dc2626" }}>
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button onClick={addLink}
                style={{ ...btnBase, backgroundColor: "#f3f4f6", color: "#374151", marginBottom: "12px", fontSize: "12px" }}>
                + Add link
              </button>

              {/* Notes */}
              <p style={{ fontWeight: "600", fontSize: "13px", marginBottom: "6px" }}>Notes</p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Personal notes about this skill..."
                style={{
                  width: "100%", padding: "6px",
                  border: "1px solid #d1d5db", borderRadius: "4px",
                  fontSize: "13px", marginBottom: "12px", resize: "vertical"
                }}
              />

              {/* Color (only for root skills) */}
              {skillDetails.relations.parentclasses.length === 0 && (
                <div style={{ marginBottom: "12px" }}>
                  <p style={{ fontWeight: "600", fontSize: "13px", marginBottom: "4px" }}>Node Color</p>
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
                <button onClick={() => setStep(1)}
                  style={{ ...btnBase, backgroundColor: "#e5e7eb", color: "#374151" }}>
                  ← Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!skillDetails.id}
                  style={{
                    ...btnBase,
                    backgroundColor: skillDetails.id ? "#374151" : "#9ca3af",
                    color: "#fff",
                    cursor: skillDetails.id ? "pointer" : "not-allowed"
                  }}
                >
                  Add to Graph
                </button>
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}
