const express = require("express");
const cors = require("cors");
const { getSkillDetails } = require("./skill-details.js");
const { addSkill } = require("./add-skills.js");
const { deleteSkill } = require("./delete-skills.js");
const { updateSkill } = require("./update-skills.js");

const app = express();
app.use(cors());
app.use(express.json());

const WIKIDATA_SEARCH_URL = "https://www.wikidata.org/w/api.php";
const skills = [
  {
    id: "Q9143",
    name: "Programming",
    description: "Designing software.",
    notes: "",
    links: ["https://www.wikidata.org/wiki/Q1"],
    color: "#4F46E5",
    relations: {
      subclasses: [{ id: "Q2", name: "JavaScript", color: "#FBBF24" }],
      parentclasses: [],
      associations: []
    }
  },
  {
    id: "Q2",
    name: "JavaScript",
    description: "JS language.",
    notes: "",
    links: ["https://www.wikidata.org/wiki/Q2"],
    color: "#4F46E5",
    relations: {
      subclasses: [],
      parentclasses: [{ id: "Q9143", name: "Programming", color: "#4F46E5" }],
      associations: []
    }
  }
];

app.get("/skills", (req, res) => {
  res.json(skills);
});

app.get("/search-skill", async (req, res) => {
  const { name } = req.query;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Missing name" });
  }

  try {
    console.log("Searching for:", name);

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

    // Debug check
    if (text.startsWith("<!DOCTYPE")) {
      console.error("Wikidata returned HTML instead of JSON");
      return res.status(500).json({ error: "Wikidata returned HTML" });
    }

    const data = JSON.parse(text);

    if (!data.search) return res.json([]);

    const results = data.search.map(item => ({
      qid: item.id,
      label: item.label,
      description: item.description || ""
    }));

    res.json(results);

  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

app.post("/add-skill", (req, res) => {
  const skill = req.body;

  const result = addSkill(skill, skills);

  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

app.get("/skill-details", async (req, res) => {
  const { qid } = req.query;

  if (!qid) return res.status(400).json({ error: "Missing qid" });

  try {
    const skill = await getSkillDetails(qid);
    res.json(skill);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch skill details" });
  }
});

app.delete("/delete-skill/:id", (req, res) => {
  const { id } = req.params;

  const result = deleteSkill(id, skills);

  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

app.put("/update-skill/:id", (req, res) => {
  const updatedSkill = req.body;

  const result = updateSkill(updatedSkill, skills);

  if (result.success) {
    res.json(result.skill);
  } else {
    res.status(400).json(result);
  }
});

app.listen(4000, () => {
  console.log("Server running on port 4000");
});