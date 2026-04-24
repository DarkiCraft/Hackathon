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
  const nodes = [];
  const links = [];
  const nodeIds = new Set();

  const toNodeId = (skill, idx, prefix) => {
    if (skill?.id && String(skill.id).trim()) return String(skill.id);
    const slug = String(skill?.name || `${prefix}-${idx}`)
      .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return `${prefix}-${slug || idx}`;
  };

  // Goal node
  nodes.push({ id: "__goal__", name: "Your Goal", type: "goal", color: "#8b5cf6", size: 12 });
  nodeIds.add("__goal__");

  // Add all known skill nodes
  knownSkills.forEach((skill, i) => {
    const id = toNodeId(skill, i, "known");
    if (!nodeIds.has(id)) {
      nodes.push({ id, name: skill.name, type: "known", color: "#10b981", size: 7 });
      nodeIds.add(id);
    }
  });

  // Add all missing skill nodes
  const sortedMissing = [...missingSkills].sort((a, b) => (a.order || 0) - (b.order || 0));
  sortedMissing.forEach((skill, i) => {
    const id = toNodeId(skill, i, "missing");
    if (!nodeIds.has(id)) {
      nodes.push({ id, name: skill.name, why: skill.why, type: "missing", color: "#ef4444", size: 8, order: skill.order || i + 1 });
      nodeIds.add(id);
    }
  });

  // Build a name→id lookup for edge resolution
  const nameToId = {};
  nodes.forEach(n => { nameToId[n.name?.toLowerCase()] = n.id; });

  // ── EDGES FROM KG needs[] ──────────────────────────────────────
  // Each skill carries its needs array from the KG via the API response
  const allSkills = [...knownSkills, ...sortedMissing];
  allSkills.forEach((skill, i) => {
    const prefix = knownSkills.includes(skill) ? "known" : "missing";
    const sourceId = toNodeId(skill, i, prefix);

    (skill.needs || []).forEach(prereqId => {
      // prereqId could be a KG id string like "color_theory"
      // Try to find it in our current node set
      const targetId = prereqId;
      if (nodeIds.has(targetId)) {
        links.push({
          source: targetId,   // prerequisite points TO the skill that needs it
          target: sourceId,
          color: "rgba(148,163,184,0.35)",
        });
      }
    });
  });

  // ── FINAL CONNECTIONS TO GOAL ──────────────────────────────────
  // The highest-order missing skills (no other missing skill depends on them) → goal
  const missingIdsPointedTo = new Set(
    links.filter(l => sortedMissing.some(s => s.id === l.target))
         .map(l => l.target)
  );
  sortedMissing.forEach((skill) => {
    const isLeaf = !links.some(l => l.source === skill.id &&
      sortedMissing.some(s => s.id === l.target));
    if (isLeaf) {
      links.push({ source: skill.id, target: "__goal__", color: "#8b5cf6" });
    }
  });

  // Known skills connect to the deepest missing prerequisite they unlock
  // (or goal if no missing skills)
  const deepestMissingId = sortedMissing.length > 0 ? sortedMissing[0].id : "__goal__";
  knownSkills.forEach((skill, i) => {
    const id = toNodeId(skill, i, "known");
    // Only connect if not already connected via needs[]
    const alreadyConnected = links.some(l => l.source === id || l.target === id);
    if (!alreadyConnected) {
      links.push({ source: id, target: deepestMissingId, color: "#10b981" });
    }
  });

  return { nodes, links };
}
// Legend item
function LegendDot({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--text-muted)" }}>
      <div
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
          boxShadow: `0 0 10px ${color}`,
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

    // Outer glow
    ctx.beginPath();
    ctx.arc(node.x, node.y, size + 6, 0, 2 * Math.PI);
    const glow = ctx.createRadialGradient(node.x, node.y, size * 0.5, node.x, node.y, size + 6);
    glow.addColorStop(0, colorWithAlpha(safeColor, 0.25));
    glow.addColorStop(1, colorWithAlpha(safeColor, 0));
    ctx.fillStyle = glow;
    ctx.fill();

    // Node circle with gradient
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
    const nodeGrad = ctx.createRadialGradient(node.x - 1, node.y - 1, 0, node.x, node.y, size);
    nodeGrad.addColorStop(0, colorWithAlpha(safeColor, 1));
    nodeGrad.addColorStop(1, colorWithAlpha(safeColor, 0.7));
    ctx.fillStyle = nodeGrad;
    ctx.fill();

    // Inner highlight
    ctx.beginPath();
    ctx.arc(node.x - 1, node.y - 1, size * 0.4, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fill();

    // Label
    if (globalScale > 0.7) {
      ctx.font = `600 ${fontSize}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      const textWidth = ctx.measureText(label).width;
      const bh = fontSize + 6;
      const bx = node.x - textWidth / 2 - 5;
      const by = node.y + size + 5;
      ctx.fillStyle = "rgba(10,10,15,0.85)";
      ctx.beginPath();
      ctx.roundRect(bx, by, textWidth + 10, bh, 4);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 0.6 / globalScale;
      ctx.stroke();

      ctx.fillStyle = "#e2e8f0";
      ctx.fillText(label, node.x, node.y + size + 7);
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
              background: "rgba(10, 10, 15, 0.92)",
              border: "1px solid rgba(248,113,113,0.3)",
              borderRadius: "12px",
              padding: "14px 18px",
              maxWidth: "260px",
              pointerEvents: "none",
              boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
              backdropFilter: "blur(12px)",
            }}
          >
            <p style={{ fontSize: "13px", fontWeight: "700", color: "#fca5a5", marginBottom: "6px" }}>
              {tooltip.name}
            </p>
            {tooltip.why && (
              <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.5" }}>
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
          linkColor={(link) => link.color || "rgba(100,116,139,0.2)"}
          linkWidth={1.5}
          linkCurvature={0.09}
          linkDirectionalArrowLength={6}
          linkDirectionalArrowRelPos={1}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.004}
          linkDirectionalParticleWidth={2}
          linkDirectionalParticleColor={() => "#8b5cf6"}
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
        <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "auto", opacity: 0.7 }}>
          Click a node to zoom · hover for details
        </span>
      </div>
    </div>
  );
}
