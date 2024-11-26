import path from "path";
import fs from "fs/promises";
import GPT4js from "gpt4js";

const options = {
  provider: "Nextway",
  model: "gpt-4o-mini",
  webSearch: true,
};

const provider = GPT4js.createProvider(options.provider);

class ChatHistoryManager {
  constructor(maxHistoryLength = 10) {
    this.historyFile = path.join(process.cwd(), "chat_history.json");
    this.maxHistoryLength = maxHistoryLength;
  }

  async initializeHistoryFile() {
    try {
      await fs.access(this.historyFile);
    } catch {
      await fs.writeFile(this.historyFile, JSON.stringify({}), "utf-8");
    }
  }

  async getHistory(userId) {
    await this.initializeHistoryFile();

    try {
      const data = await fs.readFile(this.historyFile, "utf-8");
      const histories = JSON.parse(data);

      return histories[userId] || [];
    } catch (error) {
      console.error("Error reading history:", error);
      return [];
    }
  }

  async saveMessage(userId, role, content) {
    await this.initializeHistoryFile();

    try {
      const data = await fs.readFile(this.historyFile, "utf-8");
      const histories = JSON.parse(data);

      // Initialize user history if not exists
      if (!histories[userId]) {
        histories[userId] = [];
      }

      // Add new message
      histories[userId].push({ role, content });

      // Trim history to max length
      if (histories[userId].length > this.maxHistoryLength) {
        histories[userId] = histories[userId].slice(-this.maxHistoryLength);
      }

      // Save updated histories
      await fs.writeFile(this.historyFile, JSON.stringify(histories), "utf-8");
    } catch (error) {
      console.error("Error saving message:", error);
    }
  }

  async clearHistory(userId) {
    await this.initializeHistoryFile();

    try {
      const data = await fs.readFile(this.historyFile, "utf-8");
      const histories = JSON.parse(data);

      // Remove user's history
      delete histories[userId];

      // Save updated histories
      await fs.writeFile(this.historyFile, JSON.stringify(histories), "utf-8");
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  }
}

const chatHistory = new ChatHistoryManager();

export const Handler = async (message, userId) => {
  const history = await chatHistory.getHistory(userId);

  const system = await fs.readFile("PROMPT.MD", "utf-8");
  const messages = [
    { role: "system", content: system },
    ...history,
    { role: "user", content: message },
  ];

  await chatHistory.saveMessage(userId, "user", message);

  let text = await provider.chatCompletion(messages, options, (data) => data);
  let url = "";

  text = text || "";

  const mediaUrl = text.match(/!\[image\]\((.*?)\)/);
  url = mediaUrl ? mediaUrl[1] : null;

  text = text
    ?.replace(/【.*?】\(.*?\)|\[.*?\]\s*\(.*?\)|(?<!\!)\[.*?\]|\【.*?\】/g, "")
    .trim();

  text = text?.replace(
    /\{\s*"(size|prompt)"\s*:\s*".*?",\s*"(prompt|size)"\s*:\s*".*?"\s*\}/gs,
    ""
  );

  text = text?.replace(/\*\*/g, "*");

  let type = text.split(/\$~~~~~~~~\$/)[1]?.trim() || "text";

  if (url) {
    text = text?.split(/!\[image\]\((.*?)\)/)[0]?.trim();
    text = text.split(/\!\n\n\n/)[1];
  }

  text = text.split(/\$~~~~~~~~\$/g)[0]?.trim();

  if (!text?.length) throw new Error("re-try");

  await chatHistory.saveMessage(userId, "assistant", text);

  return { url, text, type };
};

export const AI = async (message, userId) => {
  while (true) {
    try {
      return await Handler(message, userId);
    } catch (error) {
      console.error("Retrying due to error:", error.message);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
};

export const clearUserHistory = async (userId) => {
  await chatHistory.clearHistory(userId);
};
