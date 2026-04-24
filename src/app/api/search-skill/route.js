import { NextResponse } from "next/server";

const ESCO_SEARCH_URL = "https://ec.europa.eu/esco/api/search";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Missing name" }, { status: 400 });
  }

  try {
    const url = `${ESCO_SEARCH_URL}?language=en&type=skill&text=${encodeURIComponent(
      name.trim()
    )}&limit=10`;

    const response = await fetch(url, {
      headers: {
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();

    if (!data._embedded || !data._embedded.results) return NextResponse.json([]);

    const results = data._embedded.results.map(item => ({
      qid: item.uri,
      label: item.title,
      description: item.description?.en?.literal || "ESCO Skill"
    }));

    return NextResponse.json(results);

  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
