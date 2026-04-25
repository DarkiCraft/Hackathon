import skillsData from "@/data/skills.json";

const listeners = new Set();

const SKILL_MAP = new Map(
  skillsData.skills.map(s => [s.id, s])
);

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  listeners.forEach(l => l(getAllSkills()));
}

export function getAllSkills() {
  return Array.from(SKILL_MAP.values());
}

export function addSkillToKG(skill) {
  if (!skill?.id) return;

  SKILL_MAP.set(skill.id, {
    id: skill.id,
    label: skill.name,
    description: skill.description || "",
    needs: skill.needs || [],
    level: skill.level || 3,
  });

  emit(); // 🔥 notify graph
}