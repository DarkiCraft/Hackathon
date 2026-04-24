import { NextResponse } from "next/server";
import { matchSkillId, getPrereqs, getSkillById } from "@/lib/skillGraph";

const SYSTEM_PROMPT = `You are SkillMap, an expert learning coach.
Given a list of skill gaps (already identified by a knowledge graph), your job is to:
1. Explain WHY each missing skill matters for the goal (1 sentence each).
2. Generate a personalized day-by-day learning plan calibrated to the time available.
You MUST return a single valid JSON object and nothing else — no markdown fences, no commentary.`;

function buildUserPrompt(goal, knownSkillLabels, missingSkillLabels, timeAvailable) {
  return `
Goal: "${goal}"
Known Skills: ${knownSkillLabels.join(", ")}
Missing Skills (in learning order, first = deepest prerequisite): ${missingSkillLabels.join(", ")}
Time Available Per Day: "${timeAvailable}"

Tasks:
1. For each missing skill, write a 1-sentence "why" explaining its importance for the goal.
2. Generate a 7-day learning plan calibrated to "${timeAvailable}" per day:
   - Days 1-2: Review/reinforce the KNOWN skills as foundation (name them directly).
   - Days 3-7: Cover missing skills in the order given, one per day.
   - SHORT time (≤30 min): one micro-task per day (one video, one article, one exercise).
   - MEDIUM time (1-2 hrs): 2-3 steps per day (read + practice + mini exercise).
   - LONG time (3+ hrs): deep hands-on work (build something, full tutorial chapter).
   - Every task must state how long it takes. Resource must be a specific, free, real link or title.
3. Write a 2-sentence summary.

IMPORTANT: Tasks must match "${timeAvailable}" — a 30-min and 3-hour learner get completely different tasks.

Return ONLY:
{
  "missingSkills": [{ "id": "...", "name": "...", "why": "...", "order": 1 }],
  "knownSkills": [{ "id": "...", "name": "..." }],
  "learningPlan": [{ "day": 1, "skill": "...", "task": "...", "why": "...", "resource": "..." }],
  "summary": "..."
}
`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { goal, knownSkills, timeAvailable } = body;

    if (!goal || !knownSkills || !timeAvailable) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ── STEP 1: Match user's known skills to KG ids ──────────────
    const knownRaw = knownSkills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const knownIds = knownRaw
      .map((name) => matchSkillId(name))
      .filter(Boolean);

    // ── STEP 2: Match goal to KG target skill(s) ─────────────────
    const goalId = matchSkillId(goal);

    let missingFromKG = [];
    let knownSkillObjects = knownIds.map((id) => {
  const s = getSkillById(id);
  return { id, name: s?.label || id, needs: s?.needs || [] };
});

    if (goalId) {
      // We found the goal in the KG — run BFS
      const { missing } = getPrereqs([goalId], knownIds);
      missingFromKG = missing.map((s, i) => ({
        id: s.id,
        name: s.label,
        needs: s.needs,
        order: i + 1,
        why: "", // AI will fill this in
      }));
    }
    // If goal not in KG, missingFromKG stays empty — AI will identify gaps itself

    const knownLabels = knownSkillObjects.map((s) => s.name);
    const missingLabels = missingFromKG.map((s) => s.name);

    // ── STEP 3: AI enriches with "why" + learning plan ────────────
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: "OpenRouter API Key not configured" }, { status: 500 });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "X-Title": "SkillGraph",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: buildUserPrompt(goal, knownLabels, missingLabels, timeAvailable),
          },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || `OpenRouter Error ${response.status}`);

    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error("Empty response from AI");

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const stripped = text.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
      parsed = JSON.parse(stripped);
    }

    // ── STEP 4: Merge KG structure with AI enrichment ─────────────
    // If KG found missing skills, use KG ordering but inject AI's "why"
    if (missingFromKG.length > 0) {
      const aiMissingMap = Object.fromEntries(
        (parsed.missingSkills || []).map((s) => [
          s.name?.toLowerCase(),
          s,
        ])
      );
      parsed.missingSkills = missingFromKG.map((kgSkill) => ({
        ...kgSkill,
        why:
          aiMissingMap[kgSkill.name.toLowerCase()]?.why ||
          `Required prerequisite for ${goal}.`,
      }));
    }

    // Always use the matched known skills from KG (not AI's guess)
    if (knownSkillObjects.length > 0) {
      parsed.knownSkills = knownSkillObjects;
    }

    if (!parsed.missingSkills || !parsed.learningPlan) {
      throw new Error("Invalid AI response structure");
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[/api/analyze] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}