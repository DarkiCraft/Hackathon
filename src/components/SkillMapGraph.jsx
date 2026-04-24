"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

function sanitizeColor(color, fallback = "#8b5cf6") {
  if (typeof color !== "string") return fallback;
  const trimmed = color.trim();
  const isHex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed);
  const isRgb = /^rgba?\(([^)]+)\)$/.test(trimmed);
  const isHsl = /^hsla?\(([^)]+)\)$/.test(trimmed);
  return isHex || isRgb || isHsl ? trimmed : fallback;
}

function colorWithAlpha(color, alpha, fallback = "#8b5cf6") {
  const safe = sanitizeColor(color, fallback);
  if (safe.startsWith("#")) {
    const normalized = safe.length === 4
      ? `#${safe[1]}${safe[1]}${safe[2]}${safe[2]}${safe[3]}${safe[3]}`
      : safe;
    const r = parseInt(normalized.slice(1, 3), 16);
    const g = parseInt(normalized.slice(3, 5), 16);
    const b = parseInt(normalized.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return safe;
}

/**
 * Builds graph nodes and links from the SkillMap analysis result.
 *
 * Node color scheme:
 *   - Green  (#10b981) = known skill
 *   - Red    (#ef4444) = missing skill
 *   - Purple (#8b5cf6) = goal node (center)
 */
function buildGraphData(missingSkills, knownSkills) {
  const toNodeId = (skill, idx, prefix) => {
    if (skill?.id && String(skill.id).trim()) return String(skill.id);
    const slug = String(skill?.name || `${prefix}-${idx}`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return `${prefix}-${slug || idx}`;
  };

  const nodes = [];
  const links = [];

  // Goal node (central)
  nodes.push({
    id: "__goal__",
    name: "Your Goal",
    type: "goal",
    color: "#8b5cf6",
    size: 10,
  });

  // Known skill nodes
  knownSkills.forEach((skill, i) => {
    const knownId = toNodeId(skill, i, "known");
    nodes.push({
      id: knownId,
      name: skill.name,
      type: "known",
      color: "#10b981",
      size: 6,
    });
  });

  // Missing skill nodes + dependency chain links
  missingSkills.forEach((skill, i) => {
    const currentId = toNodeId(skill, i, "missing");
    nodes.push({
      id: currentId,
      name: skill.name,
      why: skill.why,
      type: "missing",
      color: "#ef4444",
      size: 7,
      order: skill.order || i + 1,
    });

    // Chain: each missing skill links to next prerequisite
    if (i < missingSkills.length - 1) {
      const nextId = toNodeId(missingSkills[i + 1], i + 1, "missing");
      links.push({
        source: currentId,
        target: nextId,
        color: "rgba(239,68,68,0.45)",
      });
    }
  });

  // Last missing skill links to goal
  if (missingSkills.length > 0) {
    links.push({
      source: toNodeId(missingSkills[missingSkills.length - 1], missingSkills.length - 1, "missing"),
      target: "__goal__",
      color: "rgba(139,92,246,0.5)",
    });
  }

  // Known skills link to goal
  knownSkills.forEach((skill, i) => {
    links.push({
      source: toNodeId(skill, i, "known"),
      target: "__goal__",
      color: "rgba(16,185,129,0.35)",
    });
  });

  return { nodes, links };
}

// Legend item
function LegendDot({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "13px", color: "var(--text-secondary)" }}>
      <div
        style={{
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
          boxShadow: `0 0 8px ${color}`,
        }}
      />
      {label}
    </div>
  );
}

export default function SkillMapGraph({ missingSkills = [], knownSkills = [] }) {
  const fgRef = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 440 });
  const [tooltip, setTooltip] = useState(null);

  const graphData = buildGraphData(missingSkills, knownSkills);

  // Observe container size
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: Math.min(entry.contentRect.width * 0.55, 520),
        });
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Zoom to fit after data load
  useEffect(() => {
    if (!fgRef.current) return;
    const t = setTimeout(() => {
      fgRef.current.zoomToFit(600, 40);
    }, 300);
    return () => clearTimeout(t);
  }, [graphData.nodes.length]);

  const handleNodeHover = useCallback((node) => {
    setTooltip(node || null);
  }, []);

  const handleNodeClick = useCallback(
    (node) => {
      if (!fgRef.current) return;
      fgRef.current.centerAt(node.x, node.y, 600);
      fgRef.current.zoom(3, 600);
    },
    []
  );

  const recenterGraph = useCallback(() => {
    if (!fgRef.current) return;
    fgRef.current.zoomToFit(600, 40);
  }, []);

  // Custom node painter
  const paintNode = useCallback((node, ctx, globalScale) => {
    // Prevent crashes if coordinates are not yet numbers (NaN, undefined, etc.)
    if (typeof node.x !== "number" || typeof node.y !== "number") return;

    const size = node.size || 6;
    const label = node.name;
    const fontSize = Math.max(10, 13 / globalScale);
    const safeColor = (() => {
      const c = typeof node.color === "string" ? node.color.trim() : "";
      const isHex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(c);
      const isRgb = /^rgba?\(([^)]+)\)$/.test(c);
      const isHsl = /^hsla?\(([^)]+)\)$/.test(c);
      return isHex || isRgb || isHsl ? c : "#8b5cf6";
    })();

    // Glow
    ctx.beginPath();
    ctx.arc(node.x, node.y, size + 4, 0, 2 * Math.PI);
    const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, size + 4);
    const glowColor = safeColor.startsWith("#")
      ? colorWithAlpha(safeColor, 0.33)
      : safeColor;
    glow.addColorStop(0, glowColor);
    glow.addColorStop(1, colorWithAlpha(safeColor, 0));
    ctx.fillStyle = glow;
    ctx.fill();

    // Node circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
    ctx.fillStyle = safeColor;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 1.2 / globalScale;
    ctx.stroke();

    // Label (only visible when zoomed in enough)
    if (globalScale > 0.7) {
      ctx.font = `600 ${fontSize}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      // Label background
      const textWidth = ctx.measureText(label).width;
      const bh = fontSize + 4;
      const bx = node.x - textWidth / 2 - 4;
      const by = node.y + size + 4;
      ctx.fillStyle = "rgba(10,15,30,0.75)";
      ctx.beginPath();
      ctx.roundRect(bx, by, textWidth + 8, bh, 3);
      ctx.fill();

      ctx.fillStyle = "#f1f5f9";
      ctx.fillText(label, node.x, node.y + size + 6);
    }
  }, []);

  return (
    <div>
      <div
        ref={containerRef}
        className="glass-card force-graph-wrapper"
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "0",
          background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 12,
            display: "flex",
            gap: "8px",
          }}
        >
          <div className="graph-soft-pill">Missing: {missingSkills.length}</div>
          <div className="graph-soft-pill">Known: {knownSkills.length}</div>
          <button className="graph-soft-pill" onClick={recenterGraph} style={{ cursor: "pointer" }}>
            Recenter
          </button>
        </div>

        {/* Tooltip */}
        {tooltip && tooltip.type === "missing" && (
          <div
            className="animate-fade-in"
            style={{
              position: "absolute",
              top: "16px",
              left: "16px",
              zIndex: 10,
              background: "#ffffff",
              border: "1px solid rgba(248,113,113,0.45)",
              borderRadius: "10px",
              padding: "12px 16px",
              maxWidth: "260px",
              pointerEvents: "none",
              boxShadow: "0 8px 24px rgba(15,23,42,0.12)",
            }}
          >
            <p style={{ fontSize: "13px", fontWeight: "700", color: "#b91c1c", marginBottom: "4px" }}>
              {tooltip.name}
            </p>
            {tooltip.why && (
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                {tooltip.why}
              </p>
            )}
          </div>
        )}

        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="transparent"
          nodeCanvasObject={paintNode}
          nodeCanvasObjectMode={() => "replace"}
          linkColor={(link) => link.color || "rgba(100,116,139,0.28)"}
          linkWidth={2}
          linkCurvature={0.09}
          linkDirectionalArrowLength={6}
          linkDirectionalArrowRelPos={1}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.004}
          linkDirectionalParticleWidth={2}
          linkDirectionalParticleColor={(link) => link.color || "#8b5cf6"}
          onNodeHover={handleNodeHover}
          onNodeClick={handleNodeClick}
          cooldownTime={2000}
          nodeRelSize={1}
        />
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "14px",
          flexWrap: "wrap",
          paddingLeft: "4px",
        }}
      >
        <LegendDot color="#ef4444" label="Missing skill" />
        <LegendDot color="#10b981" label="Known skill" />
        <LegendDot color="#8b5cf6" label="Your goal" />
        <span style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "auto" }}>
          Click a node to zoom - hover for details
        </span>
      </div>
    </div>
  );
}
