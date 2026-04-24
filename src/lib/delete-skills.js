// delete-skill.js

function deleteSkill(skillId, skillsArr) {
  try {
    if (!skillId) {
      return { success: false, message: "Missing skill id" };
    }

    const index = skillsArr.findIndex(s => s.id === skillId);

    if (index === -1) {
      return { success: false, message: "Skill not found" };
    }

    // 1️⃣ Remove skill
    const removedSkill = skillsArr.splice(index, 1)[0];

    // 2️⃣ Remove references from all other skills
    skillsArr.forEach(skill => {
      skill.relations.parentclasses =
        (skill.relations.parentclasses || []).filter(p => p.id !== skillId);

      skill.relations.subclasses =
        (skill.relations.subclasses || []).filter(c => c.id !== skillId);

      skill.relations.associations =
        (skill.relations.associations || []).filter(a => a.id !== skillId);
    });

    return {
      success: true,
      message: "Skill deleted",
      skill: removedSkill
    };

  } catch (err) {
    console.error(err);
    return { success: false, message: "Delete failed", error: err.message };
  }
}

export { deleteSkill };
