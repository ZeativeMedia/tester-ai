import GPT4js from "gpt4js";
import fs from "fs/promises";

const provider = GPT4js.createProvider("Nextway");

const options = {
  provider: "Nextway",
  model: "gpt-4o-mini",
  webSearch: true
};

export const AI = async (userMessage, history) => {
  try {
    const systemPrompt = await fs.readFile("PROMPT.MD", "utf-8");
    const messages = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: userMessage },
    ];

    const text = await provider.chatCompletion(
      messages,
      options,
      (data) => data
    );
    return text || "";
  } catch (error) {
    console.error("Error:", error);
    return "Maaf, ada kesalahan pada sistem AI.";
  }
};
