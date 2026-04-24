const fetch = global.fetch;

// Your property grouping
const RELATION_TYPES = {
  parentclasses: ["P279", "P31", "P361"],
  subclasses: ["P527"], // + reverse P279 handled separately
  associations: ["P2283", "P277", "P366", "P2578", "P737", "P738"]
};

async function queryWikidata(sparql) {
  const response = await fetch("https://query.wikidata.org/sparql", {
    method: "POST",
    headers: {
      "Content-Type": "application/sparql-query",
      "Accept": "application/json",
      "User-Agent": "SkillGraph/1.0"
    },
    body: sparql
  });

  if (!response.ok) {
    throw new Error(`Wikidata HTTP error: ${response.status}`);
  }

  const data = await response.json();
  return data.results.bindings;
}

// Standard formatter (for parents & subclasses)
function formatResults(results) {
  return results
    .map(r => ({
      id: r.item.value.split("/").pop(),
      name: r.itemLabel.value
    }))
    .filter(r => !/^Q\d+$/.test(r.name));
}

// 🔥 NEW: formatter with property type
function formatAssociations(results) {
  return results
    .map(r => ({
      id: r.item.value.split("/").pop(),
      name: r.itemLabel.value,
      type: r.prop.value.split("/").pop() // <-- P value
    }))
    .filter(r => !/^Q\d+$/.test(r.name));
}

async function getSkillDetails(qid) {
  if (!qid) throw new Error("Missing QID");

  // 1️⃣ Entity fetch
  const entityRes = await fetch(
    `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`
  );
  const entityData = await entityRes.json();
  const entity = entityData.entities[qid];

  if (!entity) throw new Error("Entity not found");

  const label = entity.labels?.en?.value || "";
  const description = entity.descriptions?.en?.value || "";

  // 2️⃣ Parent classes (P279, P31, P361)
  const parentQuery = `
  SELECT ?item ?itemLabel WHERE {
    wd:${qid} ?p ?item .
    VALUES ?p { ${RELATION_TYPES.parentclasses.map(p => `wdt:${p}`).join(" ")} }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  }`;

  // 3️⃣ Subclasses (reverse P279 + P31 + P527)
  const childQuery = `
  SELECT ?item ?itemLabel WHERE {
    {
      ?item wdt:P279 wd:${qid} .
    }
    UNION
    {
      ?item wdt:P31 wd:${qid} .
    }
    UNION
    {
      wd:${qid} wdt:P527 ?item .
    }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  }`;

  // 4️⃣ Associations (WITH PROPERTY TYPE)
  const associationQuery = `
  SELECT ?item ?itemLabel ?prop WHERE {
    wd:${qid} ?p ?item .
    VALUES ?p { ${RELATION_TYPES.associations.map(p => `wdt:${p}`).join(" ")} }
    ?prop wikibase:directClaim ?p .
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  }`;

  // 5️⃣ Run all queries
  const [parents, children, associations] = await Promise.all([
    queryWikidata(parentQuery),
    queryWikidata(childQuery),
    queryWikidata(associationQuery)
  ]);

  // 6️⃣ Return structured object
  return {
    id: qid,
    name: label,
    description,
    relations: {
      parentclasses: formatResults(parents),
      subclasses: formatResults(children),
      associations: formatAssociations(associations) // 🔥 includes type
    }
  };
}

export { getSkillDetails };
