import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are SkillMap, an expert learning coach and curriculum designer. 
Your job is to analyze a learner's goal and current skills, then identify the exact prerequisite skills they are missing and generate a personalized, day-by-day learning plan.

You MUST return a single valid JSON object and nothing else — no markdown fences, no commentary, just raw JSON.`;

function buildUserPrompt(goal, knownSkills, timeAvailable) {
  return `
Goal: "${goal}"
Known: "${knownSkills}"
Time: "${timeAvailable}"

Tasks:
1. Identify 4-6 MISSING prerequisite skills (ordered by dependency).
2. List KNOWN skills.
3. Generate a 7-day learning plan (one task per day).

JSON Structure:
{
  "missingSkills": [{ "id": "ms1", "name": "...", "why": "...", "order": 1 }],
  "knownSkills": [{ "id": "ks1", "name": "..." }],
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

    if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === "your_openrouter_api_key_here") {
      return NextResponse.json({ error: "OpenRouter API Key not configured" }, { status: 500 });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:3000", // Optional, for OpenRouter rankings
        "X-Title": "SkillGraph", // Optional
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(goal, knownSkills, timeAvailable) }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || `OpenRouter Error ${response.status}`);
    }

    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error("Empty response from OpenRouter");

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const stripped = text.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
      parsed = JSON.parse(stripped);
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
