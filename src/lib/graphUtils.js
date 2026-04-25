import { skillExistsByName } from "@/lib/skillGraph";

/**
 * Collect ALL nodes from API result into a single graph list
 */
export function extractAllGraphNodes(results) {
  const nodes = new Map();

  // 1. known skills
  for (const s of results.knownSkills || []) {
    nodes.set(s.id || s.name, {
      id: s.id,
      name: s.name,
      source: s.source || "known",
    });
  }

  // 2. missing skills
  for (const s of results.missingSkills || []) {
    nodes.set(s.id || s.name, {
      id: s.id,
      name: s.name,
      source: "missing",
    });
  }

  // 3. learning plan (skills often appear only here)
  for (const p of results.learningPlan || []) {
    const key = p.skill;

    if (!nodes.has(key)) {
      nodes.set(key, {
        id: key,
        name: key,
        source: "plan",
      });
    }
  }

  return Array.from(nodes.values());
}

/**
 * Find nodes that exist in graph output but NOT in KG
 */
export function findMissingKGNodes(results) {
  const allNodes = extractAllGraphNodes(results);

  return allNodes.filter(node => !skillExistsByName(node.name));
}