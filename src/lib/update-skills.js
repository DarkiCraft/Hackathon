// update-skill.js

function updateSkill(updatedSkill, skillsArr) {
  try {
    if (!updatedSkill?.id) {
      return { success: false, message: "Missing skill id" };
    }

    const existing = skillsArr.find(s => s.id === updatedSkill.id);

    if (!existing) {
      return { success: false, message: "Skill not found" };
    }

    // 1️⃣ Update basic fields
    existing.name = updatedSkill.name || existing.name;
    existing.description = updatedSkill.description || "";
    existing.notes = updatedSkill.notes || "";
    existing.links = updatedSkill.links || [];

    // 2️⃣ OPTIONAL: Update relations (safe replace)
    if (updatedSkill.relations) {
      existing.relations = updatedSkill.relations;
    }

    return {
      success: true,
      message: "Skill updated",
      skill: existing
    };

  } catch (err) {
    console.error(err);
    return { success: false, message: "Update failed", error: err.message };
  }
}

export { updateSkill };
