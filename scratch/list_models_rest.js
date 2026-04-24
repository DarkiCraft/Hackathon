const fetch = require("node-fetch"); // Or use native fetch if on Node 18+
require("dotenv").config({ path: ".env.local" });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (!res.ok) {
      console.log("Error listing models:", data);
      return;
    }
    
    console.log("Available models:");
    data.models.forEach(m => {
      console.log(` - ${m.name} (${m.supportedGenerationMethods.join(", ")})`);
    });
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

listModels();
