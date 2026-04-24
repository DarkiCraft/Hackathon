"use client";
import React from "react";

export default function SkillDetails({ node, onEdit, onDelete, onClose }) {
  const handleDelete = () => {
    const confirmDelete = window.confirm("Delete this skill?");
    if (confirmDelete) onDelete(node.id);
  };

  const { parentclasses = [], subclasses = [], associations = [] } =
    node.relations || {};

  return (
    <>
      <h2>{node.name}</h2>

      <p>{node.description}</p>

      {node.color && <p><b>Color:</b> {node.color || "#4F46E5"}</p>}

      {node.notes && <p><b>Notes:</b> {node.notes}</p>}

      {/* LINKS */}
      {node.links?.length > 0 && (
        <>
          <b>Links:</b>
          {node.links.map((link, i) => (
            <div key={i}>
              <a href={link} target="_blank" rel="noreferrer">
                {link}
              </a>
            </div>
          ))}
        </>
      )}

      {/* RELATIONS */}
      <div
        style={{
          maxHeight: "150px",
          overflowY: "auto",
          border: "2px inset #ddd",
          padding: "8px",
          borderRadius: "6px",
          marginTop: "10px",
          background: "#eee",
        }}
      >

        <b>Relations</b>

        <div>
          <p><b>Parents:</b></p>
        
          {parentclasses.length > 0 ? (
            parentclasses.map(p => (
              <div key={p.id}>{p.name || p.id}</div>
            ))
          ) : (
            <div>-</div>
          )}
        </div>

        <div>
          <p><b>Subclasses:</b></p>

          {subclasses.length > 0 ? (
            subclasses.map(p => (
              <div key={p.id}>{p.name || p.id}</div>
            ))
          ) : (
            <div>-</div>
          )}
        </div>

        <div>
          <p><b>Associations:</b></p>
          {associations.map((a, i) => (
            <div key={i}>
              {a.name || a.id}
              {a.type && (
                <span style={{ marginLeft: "6px", color: "#6b7280" }}>
                  ({a.type})
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ACTIONS */}
      <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
        <button onClick={onEdit}>Edit</button>

        <button
          onClick={handleDelete}
          style={{
              padding:"6px 12px",
              backgroundColor:"#374151",
              border:"none",
              borderRadius:"4px",
              color: "white"}}
        >
          Delete
        </button>

        <button onClick={onClose}
        style={{marginRight:"5px",
              padding:"6px 12px",
              backgroundColor:"#ccc",
              border:"none",
              borderRadius:"4px"}}
        >
        Close
        </button>
      </div>
    </>
  );
}
