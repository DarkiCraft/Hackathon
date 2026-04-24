import { NextResponse } from "next/server";
import { deleteSkill } from "@/lib/delete-skills";
import { skills } from "@/lib/skillsDb";

export async function DELETE(request, { params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const result = deleteSkill(id, skills);

  if (result.success) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result, { status: 400 });
  }
}
