import { NextResponse } from "next/server";
import { getSkillDetails } from "@/lib/skill-details";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const qid = searchParams.get("qid");

  if (!qid) return NextResponse.json({ error: "Missing qid" }, { status: 400 });

  try {
    const skill = await getSkillDetails(qid);
    return NextResponse.json(skill);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch skill details" }, { status: 500 });
  }
}
