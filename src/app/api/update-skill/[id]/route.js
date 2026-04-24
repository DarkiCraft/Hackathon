import { NextResponse } from "next/server";
import { updateSkill } from "@/lib/update-skills";
import { skills } from "@/lib/skillsDb";

export async function PUT(request, { params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const updatedSkill = await request.json();

  const result = updateSkill(updatedSkill, skills);

  if (result.success) {
    return NextResponse.json(result.skill);
  } else {
    return NextResponse.json(result, { status: 400 });
  }
}
