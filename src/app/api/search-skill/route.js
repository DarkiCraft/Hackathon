import { NextResponse } from "next/server";

const WIKIDATA_SEARCH_URL = "https://www.wikidata.org/w/api.php";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Missing name" }, { status: 400 });
  }

  try {
    const url = `${WIKIDATA_SEARCH_URL}?action=wbsearchentities&search=${encodeURIComponent(
      name.trim()
    )}&language=en&format=json&limit=5`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "SkillGraphApp/1.0",
        "Accept": "application/json"
      }
    });

    const text = await response.text();

    if (text.startsWith("<!DOCTYPE")) {
      console.error("Wikidata returned HTML instead of JSON");
      return NextResponse.json({ error: "Wikidata returned HTML" }, { status: 500 });
    }

    const data = JSON.parse(text);

    if (!data.search) return NextResponse.json([]);

    const results = data.search.map(item => ({
      qid: item.id,
      label: item.label,
      description: item.description || ""
    }));

    return NextResponse.json(results);

  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
