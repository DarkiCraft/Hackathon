import { NextResponse } from "next/server";
import { deleteSkill } from "@/lib/delete-skills";
import { skills } from "@/lib/skillsDb";

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, message: "Missing id" }, { status: 400 });
  }

  const result = deleteSkill(id, skills);

  if (result.success) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result, { status: 400 });
  }
}
