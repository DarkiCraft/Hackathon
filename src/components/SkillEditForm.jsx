"use client";
import React, { useState } from "react";

/**
 * Modernised SkillEditForm.
 * Uses the same Dark Theme inputs as the analyzer.
 */
export default function SkillEditForm({ node, onCancel, onSave }) {
  const [formData, setFormData] = useState({
    id: node.id,
    name: node.name,
    description: node.description || "",
    notes: node.notes || "",
    links: node.links || [],
    relations: node.relations || { parentclasses: [], subclasses: [], associations: [] }
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateLink = (index, value) => {
    const updated = [...formData.links];
    updated[index] = value;
    setFormData(prev => ({ ...prev, links: updated }));
  };

  const addLink = () => {
    setFormData(prev => ({
      ...prev,
      links: [...prev.links, ""]
    }));
  };

  const removeLink = (index) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
  };

  const sectionLabel = {
    fontSize: "11px",
    fontWeight: "800",
    color: "#8b949e",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "8px",
    display: "block",
    marginTop: "20px"
  };

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#f0f6fc", marginBottom: "24px" }}>Edit Skill</h2>

      <div style={{ marginBottom: "20px" }}>
        <label style={sectionLabel}>Skill Name</label>
        <input
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className="skillmap-input"
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={sectionLabel}>Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={3}
          className="skillmap-textarea"
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={sectionLabel}>Personal Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          rows={2}
          className="skillmap-textarea"
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={sectionLabel}>Resources (Links)</label>
        <div style={{ display: "grid", gap: "8px" }}>
          {formData.links.map((link, i) => (
            <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                value={link}
                onChange={(e) => updateLink(i, e.target.value)}
                className="skillmap-input"
                style={{ flex: 1, padding: "8px 12px", fontSize: "13px" }}
              />
              <button 
                onClick={() => removeLink(i)}
                style={{ background: "rgba(239, 68, 68, 0.1)", border: "none", color: "#f85149", padding: "8px", borderRadius: "8px", cursor: "pointer" }}
              >
                ×
              </button>
            </div>
          ))}
          <button 
            onClick={addLink}
            style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.2)", color: "#c9d1d9", padding: "8px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}
          >
            + Add New Link
          </button>
        </div>
      </div>

      <footer style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "40px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <button onClick={() => onSave(formData)} className="btn-primary">Save Changes</button>
        <button onClick={onCancel} style={{ background: "transparent", border: "1px solid #30363d", color: "#8b949e", padding: "10px 24px", borderRadius: "99px", cursor: "pointer", fontWeight: "600" }}>Cancel</button>
      </footer>
    </div>
  );
}
