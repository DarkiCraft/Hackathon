import { NextResponse } from "next/server";
import { addSkill } from "@/lib/add-skills";
import { skills } from "@/lib/skillsDb";

export async function POST(request) {
  const body = await request.json();
  const result = addSkill(body, skills);

  if (result.success) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result, { status: 400 });
  }
}
