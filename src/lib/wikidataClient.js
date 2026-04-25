const WIKIDATA_SPARQL = "https://query.wikidata.org/sparql";

/**
 * Query Wikidata for a skill/topic and its prerequisites.
 * Uses P2283 (uses) and P4969 (derivative work) as prerequisite proxies.
 */
export async function searchWikidata(skillName) {
  const query = `
  SELECT ?item ?itemLabel ?prereq ?prereqLabel WHERE {
    ?item (rdfs:label|skos:altLabel) ?label.
    FILTER(LANG(?label) = "en")
    FILTER(CONTAINS(LCASE(?label), LCASE("${skillName}")))

    OPTIONAL { ?item wdt:P2283 ?prereq. }  # "uses"
    OPTIONAL { ?item wdt:P527 ?prereq. }   # "has part" (often useful)

    SERVICE wikibase:label {
      bd:serviceParam wikibase:language "en".
    }
  }
  LIMIT 10
`;

  try {
    const res = await fetch(
      `${WIKIDATA_SPARQL}?query=${encodeURIComponent(query)}&format=json`,
      { headers: { "Accept": "application/json" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const bindings = data?.results?.bindings;
    if (!bindings || bindings.length === 0) return null;

    const first = bindings[0];
    const itemId = first.item?.value?.split("/").pop(); // e.g. Q1234
    const name = first.itemLabel?.value || skillName;

    const prereqs = bindings
      .filter(b => b.prereq)
      .map(b => ({
        id: `wd_${b.prereq.value.split("/").pop()}`,
        name: b.prereqLabel?.value || b.prereq.value.split("/").pop(),
      }));

    return {
      source: "wikidata",
      uri: first.item?.value,
      id: `wd_${itemId}`,
      name,
      description: `Sourced from Wikidata (${itemId})`,
      needs: prereqs.map(p => p.id),
      needsLabels: prereqs,
      domain: "external",
      level: 3,
    };
  } catch (e) {
    console.error("[Wikidata] Error:", e);
    return null;
  }
}