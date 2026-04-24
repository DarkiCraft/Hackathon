"use client";
import React, { useState } from "react";

/**
 * Modernised SkillDetails.
 * Displays node info with a high-end dark theme.
 */
export default function SkillDetails({ node, onEdit, onDelete, onClose }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const { parentclasses = [], subclasses = [], associations = [] } =
    node.relations || {};

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
      {/* Title */}
      <h2 style={{ fontSize: "28px", fontWeight: "900", color: "#f0f6fc", marginBottom: "16px", letterSpacing: "-0.02em" }}>
        {node.name}
      </h2>

      {/* Description */}
      {detailSection("Description", node.description)}

      {/* Notes */}
      {node.notes && detailSection("Notes", node.notes)}

      {/* Links */}
      {node.links?.length > 0 && detailSection("Resources", (
        <div style={{ display: "grid", gap: "8px" }}>
          {node.links.map((link, i) => (
            <a 
              key={i} 
              href={link} 
              target="_blank" 
              rel="noreferrer"
              style={{ color: "#58a6ff", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
              onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
            >
              <span>🔗</span> <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{link}</span>
            </a>
          ))}
        </div>
      ))}

      {/* Hierarchy Summary */}
      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "16px", padding: "20px", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "32px" }}>
        <h4 style={{ fontSize: "12px", fontWeight: "800", color: "#fff", textTransform: "uppercase", marginBottom: "12px" }}>ONTOLOGY</h4>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <p style={{ fontSize: "11px", color: "#8b949e", fontWeight: "700", marginBottom: "4px" }}>PARENTS</p>
            <div style={{ fontSize: "13px" }}>{parentclasses.length > 0 ? parentclasses.map(p => p.name).join(", ") : "None"}</div>
          </div>
          <div>
            <p style={{ fontSize: "11px", color: "#8b949e", fontWeight: "700", marginBottom: "4px" }}>CHILDREN</p>
            <div style={{ fontSize: "13px" }}>{subclasses.length > 0 ? subclasses.map(s => s.name).join(", ") : "None"}</div>
          </div>
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
