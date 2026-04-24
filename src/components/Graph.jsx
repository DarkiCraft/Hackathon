"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import ForceGraph2D from "react-force-graph-2d";
import ForceGraph3D from "react-force-graph-3d";
import SkillNode from "./SkillNode";
import NodeDialog from "./NodeDialog";
import AddSkillDialog from "./AddSkillDialog";

export default function Graph({ skills }) {
  const fgRef = useRef();

  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [hoverNode, setHoverNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [is3D, setIs3D] = useState(false);

  const GraphComponent = is3D ? ForceGraph3D : ForceGraph2D;

  // build graph from skills(array)
  useEffect(() => {
    if (!skills || skills.length === 0) return;

    const nodes = skills.map(
      (skill) =>
        new SkillNode({
          id: skill.id,
          name: skill.name,
          description: skill.description || "",
          notes: skill.notes || "",
          links: skill.links || [],
          relations: skill.relations || {},
          color: skill.color || "#4F46E5"
        })
    );

    const links = [];

    nodes.forEach((node) => {
      node.relations.subclasses?.forEach((sub) => {
        links.push({
          source: node.id,
          target: sub.id,
          color: "#FF4500",
          width: 2
        });
      });

      node.relations.associations?.forEach((assoc) => {
        links.push({
          source: node.id,
          target: assoc.id,
          color: "#1E90FF",
          width: 2
        });
      });
    });

    setGraphData({ nodes, links });
  }, [skills]);

  // focus node (different for 2D vs 3D)
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
    console.log("NODE:", node);
    setSelectedNode(node);
  };

  const nodeColor = (node) =>
    node === hoverNode ? "#374151" : node.color || "#4F46E5";

  const handleSkillAdded = (newSkill) => {
    setGraphData((prev) => ({
      nodes: [...prev.nodes, new SkillNode(newSkill)],
      links: [...prev.links]
    }));
  };

  useEffect(() => {
    if (!fgRef.current) return;

    setTimeout(() => {
      fgRef.current.zoomToFit(1000);
    }, 100);
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
        onNodeClick={handleNodeClick}
        onNodeHover={setHoverNode}
        nodeRelSize={6}
      />

      {/* TOGGLE BUTTON */}
      <button
        onClick={() => setIs3D((prev) => !prev)}
        style={{
          position: "absolute",
          bottom: "80px",
          right: "20px",
          width: "50px",
          height: "50px",
          padding: "10px",
          borderRadius: "50%",
          backgroundColor: "#ffffff",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 5px 15px rgba(0,0,0,0.3)"
        }}
      >
        {is3D ? "2D" : "3D"}
      </button>

      {/* ADD BUTTON */}
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
          boxShadow: "0 5px 15px rgba(0,0,0,0.3)"
        }}
      >
        +
      </button>

      {/* NODE DETAILS */}
      {selectedNode && (
        <NodeDialog
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onDelete={(id) => {
            setGraphData(prev => ({
              ...prev,
              nodes: prev.nodes.filter(n => n.id !== id)
            }));
          }}
          onUpdate={(updatedNode) => {
            setGraphData(prev => ({
              ...prev,
              nodes: prev.nodes.map(n =>
                n.id === updatedNode.id ? updatedNode : n
              )
            }));
          }}
        />
      )}

      {/* ADD SKILL */}
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
