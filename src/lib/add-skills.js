// add-skill.js

/**
 * Adds a skill to the provided skills array
 * @param {object} skill - Full skill object from frontend
 * @param {Array} skillsArr - Current array of stored skills
 * @returns {object} { success: boolean, message: string, skill?: object }
 */
function addSkill(skill, skillsArr) {
  try {
    console.log(skill);
    // 1️⃣ Validate required fields
    if (!skill?.id || !skill?.name) {
      return { success: false, message: "Invalid skill object" };
    }

    // 2️⃣ Check for duplicates
    if (skillsArr.find(s => s.id === skill.id)) {
      return { success: false, message: "Skill already exists" };
    }

    // 3️⃣ Ensure relations object exists (preserve all ESCO relations as metadata)
    skill.relations = skill.relations || {};
    skill.relations.parentclasses = skill.relations.parentclasses || [];
    skill.relations.subclasses = skill.relations.subclasses || [];
    skill.relations.associations = skill.relations.associations || [];

    console.log(skill);

    // 4️⃣ Update reverse relations (only for skills that exist in the array)

    // parent → add new skill as a subclass
    skill.relations.parentclasses.forEach(parent => {
      const parentSkill = skillsArr.find(s => s.id === parent.id);
      if (!parentSkill) return;
      if (!parentSkill.relations.subclasses.some(c => c.id === skill.id)) {
        parentSkill.relations.subclasses.push({ id: skill.id, name: skill.name });
      }
    });

    // subclass → add new skill as a parent
    skill.relations.subclasses.forEach(child => {
      const childSkill = skillsArr.find(s => s.id === child.id);
      if (!childSkill) return;
      if (!childSkill.relations.parentclasses.some(p => p.id === skill.id)) {
        childSkill.relations.parentclasses.push({ id: skill.id, name: skill.name });
      }
    });

    // associations ↔ associations
    skill.relations.associations.forEach(assoc => {
      const assocSkill = skillsArr.find(s => s.id === assoc.id);
      if (!assocSkill) return;
      if (!assocSkill.relations.associations.some(a => a.id === skill.id)) {
        assocSkill.relations.associations.push({ id: skill.id, name: skill.name });
      }
    });

    // 5️⃣ Add skill to array
    skillsArr.push(skill);

    console.log(skillsArr);

    return { success: true, message: "Skill Added", skill };
  } catch (err) {
    console.error(err);
    return { success: false, message: "Skill not Added", error: err.message };
  }
}

export { addSkill };
