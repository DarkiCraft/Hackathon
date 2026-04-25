"use client";
import React, { useState } from "react";

/**
 * Modernised SkillDetails.
 * Updated to handle: { id, label, needs, level, domain }
 */
export default function SkillDetails({ node, onEdit, onDelete, onClose }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // Helper for consistent section styling
  const detailSection = (title, content, color) => (
    <div style={{ marginBottom: "20px" }}>
      <h4 style={{ fontSize: "11px", fontWeight: "800", color: "#8b949e", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
        {title}
      </h4>
      <div style={{ fontSize: "15px", color: color || "#c9d1d9", lineHeight: "1.6" }}>
        {content}
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* Header with Domain Tag */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div>
          <h2 style={{ fontSize: "28px", fontWeight: "900", color: "#f0f6fc", margin: 0, letterSpacing: "-0.02em" }}>
            {node.label}
          </h2>
          <span style={{ fontSize: "12px", color: "#58a6ff", fontWeight: "700", textTransform: "uppercase" }}>
            {node.domain}
          </span>
        </div>
        <div style={{ background: "rgba(88, 166, 255, 0.1)", border: "1px solid #58a6ff", color: "#58a6ff", padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>
          LVL {node.level}
        </div>
      </div>

      {/* Description / Metadata */}
      {detailSection("Node ID", <code style={{ fontSize: "13px", color: "#79c0ff" }}>{node.id}</code>)}
      
      {/* Requirements / Dependencies */}
      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "16px", padding: "20px", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "32px" }}>
        <h4 style={{ fontSize: "12px", fontWeight: "800", color: "#fff", textTransform: "uppercase", marginBottom: "12px" }}>Dependencies</h4>
        
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {node.needs && node.needs.length > 0 ? (
            node.needs.map((need) => (
              <span 
                key={need} 
                style={{ 
                  background: "#30363d", 
                  color: "#c9d1d9", 
                  padding: "4px 10px", 
                  borderRadius: "6px", 
                  fontSize: "12px",
                  border: "1px solid rgba(255,255,255,0.1)"
                }}
              >
                {need}
              </span>
            ))
          ) : (
            <span style={{ fontSize: "13px", color: "#8b949e" }}>No requirements listed.</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <footer style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "24px" }}>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={onEdit} className="btn-primary" style={{ padding: "8px 20px" }}>Edit</button>
          
          {confirmingDelete ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button onClick={() => onDelete(node.id)} style={{ background: "#da3633", border: "none", color: "#fff", padding: "8px 16px", borderRadius: "99px", cursor: "pointer", fontWeight: "600" }}>Confirm Delete</button>
              <button onClick={() => setConfirmingDelete(false)} style={{ background: "transparent", border: "1px solid #30363d", color: "#8b949e", padding: "8px 16px", borderRadius: "99px", cursor: "pointer" }}>Cancel</button>
            </div>
          ) : (
            <button 
              onClick={() => setConfirmingDelete(true)} 
              style={{ background: "transparent", border: "1px solid #da3633", color: "#f85149", padding: "8px 16px", borderRadius: "99px", cursor: "pointer", fontWeight: "600" }}
            >
              Delete
            </button>
          )}
        </div>

        <button onClick={onClose} style={{ background: "transparent", border: "1px solid #30363d", color: "#8b949e", padding: "8px 16px", borderRadius: "99px", cursor: "pointer" }}>Close</button>
      </footer>
    </div>
  );
}