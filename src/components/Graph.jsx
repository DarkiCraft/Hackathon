"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import SkillNode from "./SkillNode";
import NodeDialog from "./NodeDialog";
import AddSkillDialog from "./AddSkillDialog";
import { loadSkills, addSkill, deleteSkill, updateSkill } from "@/lib/skillStore";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });
const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), { ssr: false });

function sanitizeColor(color, fallback = "#8b5cf6") {
  if (typeof color !== "string") return fallback;
  const trimmed = color.trim();
  const isHex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed);
  const isRgb = /^rgba?\(([^)]+)\)$/.test(trimmed);
  const isHsl = /^hsla?\(([^)]+)\)$/.test(trimmed);
  return isHex || isRgb || isHsl ? trimmed : fallback;
}

function hexToRgba(hex, alpha) {
  const safeHex = sanitizeColor(hex);
  if (!safeHex.startsWith("#")) return `rgba(99, 102, 241, ${alpha})`;
  const normalized = safeHex.length === 4
    ? `#${safeHex[1]}${safeHex[1]}${safeHex[2]}${safeHex[2]}${safeHex[3]}${safeHex[3]}`
    : safeHex;
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

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
        color: sanitizeColor(skill.color, "#4F46E5"),
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
  const containerRef = useRef();

  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [hoverNode, setHoverNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [is3D, setIs3D] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dimensions, setDimensions] = useState({ width: 1200, height: 700 });

  const GraphComponent = is3D ? ForceGraph3D : ForceGraph2D;

  // Load from localStorage on mount
  useEffect(() => {
    const skills = loadSkills();
    setGraphData(buildGraphData(skills));
  }, []);

  // Keep graph sized to container
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
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
    sanitizeColor(node === hoverNode ? "#c4b5fd" : node.color, "#8b5cf6");

  const getConnectedCount = useCallback(
    (nodeId) =>
      graphData.links.reduce(
        (count, link) =>
          count + (link.source?.id === nodeId || link.source === nodeId || link.target?.id === nodeId || link.target === nodeId ? 1 : 0),
        0
      ),
    [graphData.links]
  );

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
    const timer = setTimeout(() => fgRef.current.zoomToFit?.(1000, 60), 100);
    return () => clearTimeout(timer);
  }, [is3D, graphData.nodes.length]);

  const handleFocusBySearch = useCallback(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return;
    const found = graphData.nodes.find((node) => node.name.toLowerCase().includes(term));
    if (!found) {
      alert("No matching node found.");
      return;
    }
    focusNode(found);
    setSelectedNode(found);
  }, [focusNode, graphData.nodes, searchTerm]);

  const renderNode2D = useCallback((node, ctx, globalScale) => {
    if (typeof node.x !== "number" || typeof node.y !== "number") return;
    const radius = node === hoverNode ? 9 : 7;
    const fontSize = Math.max(10, 12 / globalScale);
    const label = node.name;
    const baseColor = sanitizeColor(node.color, "#8b5cf6");

    ctx.beginPath();
    ctx.arc(node.x, node.y, radius + 6, 0, 2 * Math.PI);
    const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius + 6);
    glow.addColorStop(0, hexToRgba(baseColor, 0.42));
    glow.addColorStop(1, hexToRgba(baseColor, 0));
    ctx.fillStyle = glow;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = nodeColor(node);
    ctx.fill();
    ctx.strokeStyle = "rgba(15,23,42,0.22)";
    ctx.lineWidth = 1.1 / globalScale;
    ctx.stroke();

    if (globalScale > 1.3) {
      ctx.font = `600 ${fontSize}px Inter, sans-serif`;
      const textWidth = ctx.measureText(label).width;
      const x = node.x - textWidth / 2 - 5;
      const y = node.y + radius + 4;
      const boxHeight = fontSize + 6;

      ctx.fillStyle = "rgba(255,255,255,0.96)";
      ctx.beginPath();
      ctx.roundRect(x, y, textWidth + 10, boxHeight, 6);
      ctx.fill();
      ctx.strokeStyle = "rgba(148,163,184,0.35)";
      ctx.lineWidth = 1 / globalScale;
      ctx.stroke();

      ctx.fillStyle = "#0f172a";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(label, node.x, y + 3);
    }
  }, [hoverNode]);

  const filteredMatches = graphData.nodes.filter((n) =>
    searchTerm.trim() ? n.name.toLowerCase().includes(searchTerm.trim().toLowerCase()) : false
  );

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden"
      style={{ background: "radial-gradient(circle at 20% 10%, #eef2ff 0%, #f8fafc 52%, #ffffff 100%)" }}
    >
      <GraphComponent
        ref={fgRef}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="transparent"
        nodeLabel="name"
        nodeColor={nodeColor}
        {...(!is3D ? { nodeCanvasObject: renderNode2D, nodeCanvasObjectMode: () => "replace" } : {})}
        linkColor={(link) => link.color}
        linkWidth={(link) => link.width}
        linkCurvature={0.08}
        linkDirectionalParticleWidth={2}
        linkDirectionalArrowLength={6}
        linkDirectionalArrowRelPos={1}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
        onNodeClick={handleNodeClick}
        onNodeHover={setHoverNode}
        nodeRelSize={5}
        cooldownTime={1200}
      />

      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          width: "360px",
          maxWidth: "calc(100% - 40px)",
          background: "rgba(255, 255, 255, 0.95)",
          border: "1px solid rgba(148, 163, 184, 0.3)",
          borderRadius: "18px",
          backdropFilter: "blur(14px)",
          padding: "16px",
          boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
          zIndex: 20,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div>
            <h3 style={{ color: "#0f172a", fontWeight: 700, fontSize: "16px", marginBottom: "2px" }}>Knowledge Graph</h3>
            <p style={{ color: "#64748b", fontSize: "12px" }}>Explore, connect, and grow your skill network</p>
          </div>
          <button
            onClick={() => fgRef.current?.zoomToFit?.(800, 60)}
            style={{
              background: "#ffffff",
              border: "1px solid rgba(148, 163, 184, 0.45)",
              color: "#0f172a",
              borderRadius: "999px",
              padding: "6px 10px",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            Fit
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "12px" }}>
          <div className="graph-stat-tile"><strong>{graphData.nodes.length}</strong><span>Nodes</span></div>
          <div className="graph-stat-tile"><strong>{graphData.links.length}</strong><span>Links</span></div>
          <div className="graph-stat-tile"><strong>{is3D ? "3D" : "2D"}</strong><span>Mode</span></div>
        </div>
        <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFocusBySearch()}
            placeholder="Find node by name..."
            className="skillmap-input"
            style={{ padding: "10px 12px", fontSize: "13px" }}
          />
          <button onClick={handleFocusBySearch} className="graph-action-btn">Go</button>
        </div>
        {searchTerm && (
          <p style={{ color: "#64748b", fontSize: "12px", marginBottom: "8px" }}>
            {filteredMatches.length > 0 ? `${filteredMatches.length} match(es)` : "No matches"}
          </p>
        )}
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => setIs3D((prev) => !prev)} className="graph-action-btn">
            {is3D ? "Switch to 2D" : "Switch to 3D"}
          </button>
          <button onClick={() => setShowAddDialog(true)} className="graph-action-btn graph-action-btn-primary">
            Add Skill
          </button>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: "20px",
          top: "20px",
          background: "rgba(255, 255, 255, 0.96)",
          border: "1px solid rgba(148, 163, 184, 0.35)",
          borderRadius: "14px",
          padding: "10px 12px",
          zIndex: 20,
          color: "#334155",
          fontSize: "12px",
          maxWidth: "240px",
        }}
      >
        <p style={{ marginBottom: "4px", fontWeight: 600 }}>Flow tips</p>
        <p>Drag to pan, scroll to zoom, click a node to open full details.</p>
      </div>

      {hoverNode && (
        <div
          className="animate-fade-in"
          style={{
            position: "absolute",
            left: "20px",
            bottom: "20px",
            zIndex: 20,
            width: "320px",
            maxWidth: "calc(100% - 40px)",
            background: "rgba(255, 255, 255, 0.96)",
            border: "1px solid rgba(129, 140, 248, 0.45)",
            borderRadius: "14px",
            padding: "12px",
            backdropFilter: "blur(10px)",
          }}
        >
          <p style={{ color: "#0f172a", fontWeight: 700, marginBottom: "4px" }}>{hoverNode.name}</p>
          <p style={{ color: "#64748b", fontSize: "12px", marginBottom: "8px" }}>
            {hoverNode.description || "No description available yet."}
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#334155", fontSize: "12px" }}>
            <span>Connections: {getConnectedCount(hoverNode.id)}</span>
            <span>ID: {String(hoverNode.id).slice(0, 18)}</span>
          </div>
        </div>
      )}

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
