import { matchSkillId, getSkillById, getPrereqs } from "@/lib/skillGraph";
import { searchEsco } from "@/lib/escoClient";
import { searchWikidata } from "@/lib/wikidataClient";
import { skillExistsByName } from "@/lib/skillGraph";

// ─────────────────────────────────────────────
// helpers
// ─────────────────────────────────────────────

function normalize(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function mergeSkills(esco, wikidata, fallbackName) {
  const name =
    (esco?.name?.length || 0) >= (wikidata?.name?.length || 0)
      ? esco.name
      : wikidata.name || fallbackName;

  const allNeeds = [...(esco.needs || []), ...(wikidata.needs || [])];
  const allLabels = [...(esco.needsLabels || []), ...(wikidata.needsLabels || [])];

  const seen = new Set();
  const mergedNeeds = [];
  const mergedLabels = [];

  allNeeds.forEach((id, i) => {
    const label = allLabels[i];
    const key = normalize(label?.name || id);

    if (!seen.has(key)) {
      seen.add(key);
      mergedNeeds.push(id);
      if (label) mergedLabels.push(label);
    }
  });

  const cleanId = name.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 50);

  return {
    id: `merged_${cleanId}`,
    name,
    description: esco?.description || wikidata?.description || "",
    needs: mergedNeeds,
    needsLabels: mergedLabels,
    domain: "external",
    level: 3,
    sources: ["esco", "wikidata"],
  };
}

// ─────────────────────────────────────────────
// resolve single skill
// ─────────────────────────────────────────────

export async function resolveSkill(skillName) {
  const kgId = matchSkillId(skillName);

  // KG HIT
  if (kgId) {
    const skill = getSkillById(kgId);
    return {
      source: "kg",
      skill: { ...skill, name: skill.label },
      isNew: false,
      needsApproval: false,
      confidence: 1.0,
    };
  }

  // external fetch
  const [escoResult, wdResult] = await Promise.all([
    searchEsco(skillName),
    searchWikidata(skillName),
  ]);

  const best = escoResult || wdResult;

  // LLM fallback
  if (!best) {
    return {
      source: "llm",
      skill: {
        id: `llm_${skillName.toLowerCase().replace(/\s+/g, "_")}`,
        name: skillName,
      },
      isNew: true,
      needsApproval: true, // 🔥 IMPORTANT FIX
      confidence: 0.4,
    };
  }

  const merged =
    escoResult && wdResult
      ? mergeSkills(escoResult, wdResult, skillName)
      : best;

  const exists = skillExistsByName(merged.name);

  return {
    source: escoResult && wdResult
      ? "merged"
      : escoResult
      ? "esco"
      : "wikidata",
    skill: merged,
    isNew: !exists,
    needsApproval: !exists,
    confidence: escoResult && wdResult ? 0.95 : escoResult ? 0.9 : 0.7,
  };
}

// ─────────────────────────────────────────────
// GAP ANALYSIS (FIXED VERSION)
// ─────────────────────────────────────────────

export async function resolveGapAnalysis(goal, knownSkillNames) {
  const goalResolution = await resolveSkill(goal);

  const knownResolved = [];
  const pendingSkills = [];

  const seen = new Set();

  function pushPending(r) {
    const key = r.skill?.id || r.skill?.name;
    if (!key || seen.has(key)) return;

    seen.add(key);

    if (r.isNew && r.needsApproval) {
      pendingSkills.push(r);
    }
  }

  // resolve known skills
  const resolutions = await Promise.all(
    knownSkillNames.map(resolveSkill)
  );

  // add known skills + pending detection
  for (const r of resolutions) {
    knownResolved.push({
      ...r.skill,
      source: r.source,
      confidence: r.confidence,
    });

    pushPending(r);
  }

  // IMPORTANT: ALWAYS include goal as candidate
  pushPending(goalResolution);

  return {
    goalResolution,
    knownResolved,
    pendingSkills,
    missingFromKG: [], // simplified (you removed BFS earlier)
    needsLLM: goalResolution.source === "llm",
  };
}