import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const filePath = path.join(process.cwd(), "data", "skills.json");

export async function POST(req) {
  try {
    const skill = await req.json();

    if (!skill?.id || !skill?.name) {
      return NextResponse.json({ error: "Invalid skill" }, { status: 400 });
    }

    // Read existing file
    const file = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(file);

    // 🔴 Deduplication (IMPORTANT)
    const exists = data.skills.find(
      s => s.label.toLowerCase() === skill.name.toLowerCase()
    );

    if (exists) {
      return NextResponse.json({ success: true, deduped: true });
    }

    // Convert to your schema
    const newSkill = {
      id: skill.id,
      label: skill.name,
      needs: skill.needs || [],
      level: skill.level || 3,
      domain: skill.domain || "external",
    };

    data.skills.push(newSkill);

    // Write back
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[save-skill]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}