"use client";
import React, { useState } from "react";
import SkillDetails from "./SkillDetails";
import SkillEditForm from "./SkillEditForm";

export default function NodeDialog({ node, onClose, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);

  if (!node) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        backdropFilter: "blur(3px)"
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "rgba(255,255,255,0.9)",
          padding: "20px",
          borderRadius: "10px",
          width: "420px",
          maxHeight: "80vh",
          overflowY: "auto"
        }}
      >
        {isEditing ? (
          <SkillEditForm
            node={node}
            onCancel={() => setIsEditing(false)}
            onSave={onUpdate}
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
