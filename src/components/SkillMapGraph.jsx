"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

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

  // Goal node (central)
  nodes.push({
    id: "__goal__",
    name: "🎯 Your Goal",
    type: "goal",
    color: "#8b5cf6",
    size: 10,
  });

  // Known skill nodes
  knownSkills.forEach((skill) => {
    nodes.push({
      id: skill.id,
      name: skill.name,
      type: "known",
      color: "#10b981",
      size: 6,
    });
  });

  // Missing skill nodes + dependency chain links
  missingSkills.forEach((skill, i) => {
    nodes.push({
      id: skill.id,
      name: skill.name,
      why: skill.why,
      type: "missing",
      color: "#ef4444",
      size: 7,
      order: skill.order || i + 1,
    });

    // Chain: each missing skill → the next one in the prerequisite chain
    if (i < missingSkills.length - 1) {
      links.push({
        source: skill.id,
        target: missingSkills[i + 1].id,
        color: "rgba(239,68,68,0.45)",
      });
    }
  });

  // Last missing skill → goal
  if (missingSkills.length > 0) {
    links.push({
      source: missingSkills[missingSkills.length - 1].id,
      target: "__goal__",
      color: "rgba(139,92,246,0.5)",
    });
  }

  // Known skills → goal
  knownSkills.forEach((skill) => {
    links.push({
      source: skill.id,
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

  // Custom node painter
  const paintNode = useCallback((node, ctx, globalScale) => {
    const size = node.size || 6;
    const label = node.name;
    const fontSize = Math.max(10, 13 / globalScale);

    // Glow
    ctx.beginPath();
    ctx.arc(node.x, node.y, size + 4, 0, 2 * Math.PI);
    const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, size + 4);
    glow.addColorStop(0, node.color + "55");
    glow.addColorStop(1, node.color + "00");
    ctx.fillStyle = glow;
    ctx.fill();

    // Node circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
    ctx.fillStyle = node.color;
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
          background: "rgba(10,15,30,0.6)",
        }}
      >
        {/* Tooltip */}
        {tooltip && tooltip.type === "missing" && (
          <div
            className="animate-fade-in"
            style={{
              position: "absolute",
              top: "16px",
              left: "16px",
              zIndex: 10,
              background: "rgba(10,15,30,0.9)",
              border: "1px solid rgba(239,68,68,0.4)",
              borderRadius: "10px",
              padding: "12px 16px",
              maxWidth: "260px",
              pointerEvents: "none",
            }}
          >
            <p style={{ fontSize: "13px", fontWeight: "700", color: "#fca5a5", marginBottom: "4px" }}>
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
          linkColor={(link) => link.color || "rgba(255,255,255,0.15)"}
          linkWidth={1.5}
          linkDirectionalArrowLength={6}
          linkDirectionalArrowRelPos={1}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.004}
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
          Click a node to zoom · Hover for details
        </span>
      </div>
    </div>
  );
}
