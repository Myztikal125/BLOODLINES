import fs from "fs";
import path from "path";

const OPENROUTER_API = "https://openrouter.ai/api/v1/chat/completions";

export async function researchRules(topic: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY");
  }

  const prompt = `
You are the BLOODLINES Researcher Assistant.

Role:
- Gather RPG system knowledge.
- Compare mechanics.
- Create structured research notes.

Rules:
- Do not modify engine code.
- Do not make final design decisions.
- Provide recommendations for the Lead Designer.

Research Topic:
${topic}

Return:
1. Summary
2. Existing RPG approaches
3. Strengths and weaknesses
4. Possible BLOODLINES implementation ideas
5. Questions for the Lead Designer
`;

  const response = await fetch(OPENROUTER_API, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "openrouter/auto",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  const data = await response.json();

  const result =
    data.choices?.[0]?.message?.content ||
    "No research returned.";

  const filename =
    topic.toLowerCase()
      .replace(/[^a-z0-9]+/g, "_") + ".md";

  const output =
    path.join("research", "rules", filename);

  fs.writeFileSync(output, result);

  console.log(`Research saved: ${output}`);
  return result;
}
