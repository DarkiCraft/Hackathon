/**
 * Fetch related skills for a topic from Wikidata via SPARQL.
 * Example: fetchRelatedSkills("React") → ["JavaScript", "Node.js", "HTML"]
 */
export async function fetchRelatedSkills(topicLabel) {
  const query = `
    SELECT ?skillLabel WHERE {
      ?topic rdfs:label "${topicLabel}"@en.
      ?topic wdt:P2283 ?skill.   # P2283 = "uses"
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    } LIMIT 10
  `;
  const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  const data = await res.json();
  return data.results.bindings.map(b => b.skillLabel.value);
}