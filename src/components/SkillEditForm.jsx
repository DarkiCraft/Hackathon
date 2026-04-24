"use client";
import React, { useState } from "react";

export default function SkillEditForm({ node, onCancel, onSave }) {
  const [formData, setFormData] = useState({
    id: node.id,
    name: node.name,
    description: node.description || "",
    notes: node.notes || "",
    links: node.links || []
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

  const handleSubmit = async () => {
    try {
      const res = await fetch(
        `/api/update-skill/${node.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        }
      );

      const updated = await res.json();
      onSave(updated);

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <h2>Edit Skill</h2>

      <input
        value={formData.name}
        onChange={(e) => handleChange("name", e.target.value)}
        style={{ width: "100%", marginBottom: "6px" }}
      />

      <textarea
        value={formData.description}
        onChange={(e) => handleChange("description", e.target.value)}
        rows={3}
        style={{ width: "100%", marginBottom: "6px" }}
      />

      <textarea
        value={formData.notes}
        onChange={(e) => handleChange("notes", e.target.value)}
        rows={2}
        style={{ width: "100%", marginBottom: "6px" }}
      />

      <b>Links:</b>
      {formData.links.map((link, i) => (
        <div key={i} style={{ display: "flex", marginBottom: "4px" }}>
          <input
            value={link}
            onChange={(e) => updateLink(i, e.target.value)}
            style={{ flex: 1 }}
          />
          <button onClick={() => removeLink(i)}>x</button>
        </div>
      ))}

      <button onClick={addLink}>Add Link</button>

      <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
        <button onClick={handleSubmit}>Save</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </>
  );
}
