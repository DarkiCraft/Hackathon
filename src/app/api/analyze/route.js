import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are SkillMap, an expert learning coach and curriculum designer. 
Your job is to analyze a learner's goal and current skills, then identify the exact prerequisite skills they are missing and generate a personalized, day-by-day learning plan.

You MUST return a single valid JSON object and nothing else ΓÇö no markdown fences, no commentary, just raw JSON.`;

function buildUserPrompt(goal, knownSkills, timeAvailable) {
  return `
A learner wants to achieve this goal: "${goal}"

They already know: "${knownSkills}"

Their available time: "${timeAvailable}"

Your tasks:
1. Identify 4-6 prerequisite skills that are MISSING (skills they need but don't have yet), ordered by dependency (most fundamental first).
2. List the skills they DO know (parsed from their input).
3. Generate a 7-day learning plan with one concrete task per day.

Return ONLY this exact JSON structure:
{
  "missingSkills": [
    {
      "id": "ms1",
      "name": "Skill Name",
      "why": "One sentence explaining why this skill is a prerequisite",
      "order": 1
    }
  ],
  "knownSkills": [
    {
      "id": "ks1",
      "name": "Skill Name"
    }
  ],
  "learningPlan": [
    {
      "day": 1,
      "skill": "Skill Name being practised",
      "task": "Specific, actionable task description (2-3 sentences)",
      "why": "Why this day's work matters",
      "resource": "Name of a free resource (YouTube channel, website, or book)"
    }
  ],
  "summary": "One paragraph explaining the skill gap and why this plan will close it"
}

Rules:
- missingSkills must have 4-6 items, ordered from most fundamental to most advanced
- knownSkills should accurately reflect what the learner already stated
- learningPlan must have exactly 7 items (days 1-7)
- All tasks must be achievable in the learner's stated time per day
- Resources must be real, free, and well-known
- Return ONLY valid JSON, no markdown, no extra text
`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { goal, knownSkills, timeAvailable } = body;

    if (!goal || !knownSkills || !timeAvailable) {
      return NextResponse.json(
        { error: "Missing required fields: goal, knownSkills, timeAvailable" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured. Add it to .env.local" },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    });

    const userPrompt = buildUserPrompt(goal, knownSkills, timeAvailable);
    const result = await model.generateContent(userPrompt);
    const text = result.response.text();

    // Parse and validate
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Attempt to strip accidental markdown fences
      const stripped = text.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
      parsed = JSON.parse(stripped);
    }

    // Basic validation
    if (!parsed.missingSkills || !parsed.learningPlan) {
      throw new Error("LLM returned unexpected structure");
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[/api/analyze] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate skill analysis" },
      { status: 500 }
    );
  }
}
