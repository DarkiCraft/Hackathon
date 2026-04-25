const ESCO_BASE = "https://esco.ec.europa.eu/api";

/**
 * Search ESCO for a skill by free text.
 * Returns the best match with its prerequisites (broaderRelation).
 */
export async function searchEsco(skillName) {
  try {
    const searchRes = await fetch(
      `${ESCO_BASE}/search?language=en&type=skill&text=${encodeURIComponent(skillName)}&limit=3`,
      { headers: { "Accept": "application/json" } }
    );
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const results = searchData?._embedded?.results;
    if (!results || results.length === 0) return null;

    // Take best match
    const best = results[0];
    const conceptUri = best.uri;

    // Fetch full concept details to get broaderRelations (prerequisites)
    const detailRes = await fetch(
      `${ESCO_BASE}/resource/skill?uri=${encodeURIComponent(conceptUri)}&language=en`,
      { headers: { "Accept": "application/json" } }
    );
    if (!detailRes.ok) return null;
    const detail = await detailRes.json();

    const broader = (detail?._links?.broaderRelation || []).map(r => ({
      uri: r.uri,
      name: r.title || r.uri.split("/").pop(),
    }));

    return {
      source: "esco",
      uri: conceptUri,
      id: `esco_${conceptUri.split("/").pop()}`,
      name: detail.preferredLabel?.en || best.title,
      description: detail.description?.en?.literal || "",
      needs: broader.map(b => `esco_${b.uri.split("/").pop()}`),
      edgeType: "broader",
      needsLabels: broader,
      domain: "external",
      level: 3, // default mid-level, user can adjust
    };
  } catch (e) {
    console.error("[ESCO] Error:", e);
    return null;
  }
}