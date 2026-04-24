/**
 * localStorage-based skill store.
 * All reads/writes go through these helpers so the rest of the app never
 * touches localStorage directly.
 */

const KEY = "skillgraph_skills";

export function loadSkills() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveSkills(skills) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(skills));
}

export function addSkill(skill) {
  const skills = loadSkills();

  if (!skill?.id || !skill?.name) {
    return { success: false, message: "Invalid skill object" };
  }
  if (skills.find(s => s.id === skill.id)) {
    return { success: false, message: "Skill already exists" };
  }

  // Ensure relations shape
  skill.relations = skill.relations || {};
  skill.relations.parentclasses = skill.relations.parentclasses || [];
  skill.relations.subclasses    = skill.relations.subclasses    || [];
  skill.relations.associations  = skill.relations.associations  || [];

  // Reverse-relation sync (only for skills already in store)
  skill.relations.parentclasses.forEach(parent => {
    const p = skills.find(s => s.id === parent.id);
    if (!p) return;
    if (!p.relations.subclasses.some(c => c.id === skill.id)) {
      p.relations.subclasses.push({ id: skill.id, name: skill.name });
    }
  });
  skill.relations.subclasses.forEach(child => {
    const c = skills.find(s => s.id === child.id);
    if (!c) return;
    if (!c.relations.parentclasses.some(p => p.id === skill.id)) {
      c.relations.parentclasses.push({ id: skill.id, name: skill.name });
    }
  });
  skill.relations.associations.forEach(assoc => {
    const a = skills.find(s => s.id === assoc.id);
    if (!a) return;
    if (!a.relations.associations.some(x => x.id === skill.id)) {
      a.relations.associations.push({ id: skill.id, name: skill.name });
    }
  });

  skills.push(skill);
  saveSkills(skills);
  return { success: true, skill };
}

export function deleteSkill(id) {
  const skills = loadSkills();
  const index = skills.findIndex(s => s.id === id);
  if (index === -1) return { success: false, message: "Skill not found" };

  // Remove reverse refs
  skills.forEach(s => {
    s.relations.parentclasses  = (s.relations.parentclasses  || []).filter(p => p.id !== id);
    s.relations.subclasses     = (s.relations.subclasses     || []).filter(c => c.id !== id);
    s.relations.associations   = (s.relations.associations   || []).filter(a => a.id !== id);
  });

  const [removed] = skills.splice(index, 1);
  saveSkills(skills);
  return { success: true, skill: removed };
}

export function updateSkill(id, updates) {
  const skills = loadSkills();
  const index = skills.findIndex(s => s.id === id);
  if (index === -1) return { success: false, message: "Skill not found" };
  skills[index] = { ...skills[index], ...updates };
  saveSkills(skills);
  return { success: true, skill: skills[index] };
}
