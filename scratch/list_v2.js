const { GoogleGenAI } = require("@google/genai");
require("dotenv").config({ path: ".env.local" });

async function list() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.list();
    console.log("Models found:");
    response.models.forEach(m => console.log(` - ${m.name}`));
  } catch (err) {
    console.error("Error listing models:", err);
  }
}

list();
