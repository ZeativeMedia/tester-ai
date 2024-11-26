import fs from "fs/promises";
import GPT4js from "gpt4js";
import { SYSTEM_CONFIG } from "../utils/config.js";
import { delay } from "../utils/tools.js";
import { getHistory, saveHistory } from "./controls.js";

const opts = SYSTEM_CONFIG.chats;
const ai = GPT4js.createProvider(opts.provider);

export const handleMessage = async (message, userId) => {
  const history = await getHistory(userId);
  const systemPrompt = await fs.readFile("PROMPT.MD", "utf-8");
  const messages = [{ role: "system", content: systemPrompt }, ...history, { role: "user", content: message }];

  try {
    let original = "";
    let response = (await ai.chatCompletion(messages, opts)) || "";
    original = response;

    const mediaMatch = response?.match(/!\[image\]\((.*?)\)/);
    const url = mediaMatch ? mediaMatch[1] : null;
    response = response?.replace(/【.*?】\(.*?\)|\[.*?\]\s*\(.*?\)|(?<!\!)\[.*?\]|\【.*?\】/g, "").trim();

    response = response?.replace(/\{\s*"(size|prompt)"\s*:\s*".*?",\s*"(prompt|size)"\s*:\s*".*?"\s*\}/gs, "");

    response = response?.replace(/\*\*/g, "*");

    let type = response.split(/\$~~~~~~~~\$/)[1]?.trim() || "text";

    if (url) {
      response = response.split(/\n\n\n/)[1];
    }

    response = response.split(/\$~~~~~~~~\$/g)[0]?.trim();

    if (!response?.length) throw new Error("Empty response from AI");

    return { type, url, text: response, original };
  } catch (err) {
    console.error("AI handling error:", err.message);
    throw new Error("Retry");
  }
};

export const AI = async (message, userId) => {
  while (true) {
    try {
      const result = await handleMessage(message, userId);

      if (result.text) {
        await saveHistory(userId, "user", message);
        await saveHistory(userId, "assistant", result.original);
      }

      return result;
    } catch (err) {
      console.error("Retry due to error:", err.message);
      await delay(1000);
    }
  }
};
