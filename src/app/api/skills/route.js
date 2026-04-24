import { NextResponse } from "next/server";
import { skills } from "@/lib/skillsDb";

export async function GET() {
  return NextResponse.json(skills);
}
