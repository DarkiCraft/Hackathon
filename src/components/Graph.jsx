"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import SkillNode from "./SkillNode";
import NodeDialog from "./NodeDialog";
import AddSkillDialog from "./AddSkillDialog";
import { loadSkills, addSkill, deleteSkill, updateSkill } from "@/lib/skillStore";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });
const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), { ssr: false });

function buildGraphData(skills) {
  const nodes = skills.map(
    (skill) =>
      new SkillNode({
        id: skill.id,
        name: skill.name,
        description: skill.description || "",
        notes: skill.notes || "",
        links: skill.links || [],
        relations: skill.relations || {},
        color: skill.color || "#4F46E5",
      })
  );

  const nodeIds = new Set(nodes.map((n) => n.id));
  const links = [];

  nodes.forEach((node) => {
    node.relations.subclasses?.forEach((sub) => {
      if (!nodeIds.has(sub.id)) return;
      links.push({ source: node.id, target: sub.id, color: "#FF4500", width: 2 });
    });
    node.relations.associations?.forEach((assoc) => {
      if (!nodeIds.has(assoc.id)) return;
      links.push({ source: node.id, target: assoc.id, color: "#1E90FF", width: 2 });
    });
  });

  return { nodes, links };
}

export default function Graph() {
  const fgRef = useRef();

  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [hoverNode, setHoverNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [is3D, setIs3D] = useState(false);

  const GraphComponent = is3D ? ForceGraph3D : ForceGraph2D;

  // Load from localStorage on mount
  useEffect(() => {
    const skills = loadSkills();
    setGraphData(buildGraphData(skills));
  }, []);

  // Focus camera
  const focusNode = useCallback(
    (node) => {
      if (!node || !fgRef.current) return;
      if (is3D) {
        const distance = 120;
        const distRatio =
          1 + distance / Math.hypot(node.x || 1, node.y || 1, node.z || 1);
        fgRef.current.cameraPosition(
          { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
          node,
          1000
        );
      } else {
        fgRef.current.centerAt(node.x, node.y, 1000);
        fgRef.current.zoom(4, 1000);
      }
    },
    [is3D]
  );

  const handleNodeClick = (node) => {
    focusNode(node);
    setSelectedNode(node);
  };

  const nodeColor = (node) =>
    node === hoverNode ? "#374151" : node.color || "#4F46E5";

  // ADD — save to localStorage then rebuild graph
  const handleSkillAdded = (skillPayload) => {
    const result = addSkill(skillPayload);
    if (!result.success) {
      alert(result.message || "Failed to add skill");
      return;
    }
    const skills = loadSkills();
    setGraphData(buildGraphData(skills));
    setShowAddDialog(false);
  };

  // DELETE — remove from localStorage then rebuild graph
  const handleDelete = (id) => {
    const result = deleteSkill(id);
    if (!result.success) {
      alert(result.message || "Delete failed");
      return;
    }
    const skills = loadSkills();
    setGraphData(buildGraphData(skills));
    setSelectedNode(null);
  };

  // UPDATE — save to localStorage then rebuild graph
  const handleUpdate = (updatedNode) => {
    const result = updateSkill(updatedNode.id, updatedNode);
    if (!result.success) {
      alert(result.message || "Update failed");
      return;
    }
    const skills = loadSkills();
    setGraphData(buildGraphData(skills));
    setSelectedNode(null);
  };

  useEffect(() => {
    if (!fgRef.current) return;
    setTimeout(() => fgRef.current.zoomToFit?.(1000), 100);
  }, [is3D]);

  return (
    <div className="w-full h-full relative bg-white">
      <GraphComponent
        ref={fgRef}
        graphData={graphData}
        nodeLabel="name"
        nodeColor={nodeColor}
        linkColor={(link) => link.color}
        linkWidth={(link) => link.width}
        linkDirectionalArrowLength={6}
        linkDirectionalArrowRelPos={1}
        linkDirectionalParticles={1}
        linkDirectionalParticleSpeed={0.005}
        onNodeClick={handleNodeClick}
        onNodeHover={setHoverNode}
        nodeRelSize={6}
      />

      {/* TOGGLE 2D/3D */}
      <button
        onClick={() => setIs3D((prev) => !prev)}
        style={{
          position: "absolute",
          bottom: "80px",
          right: "20px",
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          backgroundColor: "#ffffff",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
          fontWeight: "bold",
        }}
      >
        {is3D ? "2D" : "3D"}
      </button>

      {/* ADD SKILL */}
      <button
        onClick={() => setShowAddDialog(true)}
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          backgroundColor: "#ffffff",
          color: "#000000",
          fontSize: "28px",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
        }}
      >
        +
      </button>

      {/* NODE DETAILS DIALOG */}
      {selectedNode && (
        <NodeDialog
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      )}

      {/* ADD SKILL DIALOG */}
      {showAddDialog && (
        <AddSkillDialog
          onClose={() => setShowAddDialog(false)}
          onSkillAdded={handleSkillAdded}
          existingSkills={graphData.nodes}
        />
      )}
    </div>
  );
}
