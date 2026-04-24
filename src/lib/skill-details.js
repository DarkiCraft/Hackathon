async function getSkillDetails(uri) {
  if (!uri) throw new Error("Missing URI for skill");

  try {
    const response = await fetch(
      `https://ec.europa.eu/esco/api/resource/skill?uri=${encodeURIComponent(uri)}&language=en`,
      {
        headers: {
          "Accept": "application/json"
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();

    const formatArray = (arr) => {
        if (!arr) return [];
        return arr.map(item => ({
            id: item.uri,
            name: item.title
        }));
    };

    let parents = [];
    if (data._links.broaderSkill) parents.push(...formatArray(data._links.broaderSkill));
    if (data._links.broaderHierarchyConcept) parents.push(...formatArray(data._links.broaderHierarchyConcept));

    let subs = [];
    if (data._links.narrowerSkill) subs.push(...formatArray(data._links.narrowerSkill));

    let assoc = [];
    if (data._links.isEssentialForOccupation) assoc.push(...formatArray(data._links.isEssentialForOccupation));
    if (data._links.isOptionalForOccupation) assoc.push(...formatArray(data._links.isOptionalForOccupation));

    return {
      id: data.uri,
      name: data.title,
      description: data.description?.en?.literal || "",
      relations: {
        parentclasses: parents,
        subclasses: subs,
        associations: assoc
      }
    };
  } catch (err) {
    console.error("ESCO Resource Fetch Error:", err);
    throw err;
  }
}

export { getSkillDetails };
