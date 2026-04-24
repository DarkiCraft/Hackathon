"use client";
import React, { useState } from "react";
import SkillDetails from "./SkillDetails";
import SkillEditForm from "./SkillEditForm";

/**
 * Modernised NodeDialog overlay.
 * Uses a dark theme and backdrop blur.
 */
export default function NodeDialog({ node, onClose, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);

  if (!node) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        backgroundColor: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(12px)",
        display: "flex", justifyContent: "center", alignItems: "center",
        zIndex: 10000,
        padding: "20px"
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-in-up"
        style={{
          backgroundColor: "#0d1117",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "28px",
          width: "100%",
          maxWidth: "480px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
          padding: "32px",
          position: "relative"
        }}
      >
        {isEditing ? (
          <SkillEditForm
            node={node}
            onCancel={() => setIsEditing(false)}
            onSave={(updates) => {
              onUpdate(updates);
              setIsEditing(false);
            }}
          />
        ) : (
          <SkillDetails
            node={node}
            onEdit={() => setIsEditing(true)}
            onDelete={onDelete}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}
