import skillsData from "@/data/skills.json";

// Build a lookup map: id → skill
const SKILL_MAP = Object.fromEntries(
  skillsData.skills.map((s) => [s.id, s])
);

/**
 * Fuzzy-match a plain text skill name to a skill id in the graph.
 * e.g. "react hooks" → "react_hooks"
 */
export function matchSkillId(name) {
  if (!name) return null;
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, "_");

  // Exact match first
  if (SKILL_MAP[normalized]) return normalized;

  // Partial match — find any skill whose id or label contains the query
  const query = name.toLowerCase();
  const match = skillsData.skills.find(
    (s) =>
      s.label.toLowerCase().includes(query) ||
      query.includes(s.label.toLowerCase()) ||
      s.id.includes(normalized)
  );
  return match?.id || null;
}

/**
 * BFS from a set of target skill ids, collecting all prerequisite skill ids.
 * Returns only the ones NOT in knownIds.
 *
 * @param {string[]} targetIds  - skills the user wants to reach
 * @param {string[]} knownIds   - skills the user already has
 * @returns {{ missing: object[], path: string[] }}
 */
export function getPrereqs(targetIds, knownIds = []) {
  const knownSet = new Set(knownIds);
  const visited = new Set();
  const missing = [];
  const queue = [...targetIds];

  while (queue.length > 0) {
    const currentId = queue.shift();
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const skill = SKILL_MAP[currentId];
    if (!skill) continue;

    // If not known, it's a gap
    if (!knownSet.has(currentId)) {
      missing.push(skill);
    }

    // Add its prerequisites to the queue
    for (const prereqId of skill.needs || []) {
      if (!visited.has(prereqId)) {
        queue.push(prereqId);
      }
    }
  }

  // Sort by level so order=1 is the deepest prerequisite
  missing.sort((a, b) => a.level - b.level);

  return {
    missing,
    // Full traversal path including known (useful for graph rendering)
    fullPath: [...visited].map((id) => SKILL_MAP[id]).filter(Boolean),
  };
}

export function getSkillById(id) {
  return SKILL_MAP[id] || null;
}

export function getAllSkills() {
  return skillsData.skills;
}