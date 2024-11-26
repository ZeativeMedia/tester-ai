import fs from "fs/promises";
import path from "path";

const historyFile = path.join(process.cwd(), "./store/history.json");

export const initFile = async () => {
  await fs.mkdir(path.dirname(historyFile), { recursive: true });
  try {
    await fs.access(historyFile);
  } catch {
    await fs.writeFile(historyFile, JSON.stringify({}), "utf-8");
  }
};

export const getHistory = async (userId) => {
  await initFile();
  try {
    const data = await fs.readFile(historyFile, "utf-8");
    const histories = JSON.parse(data);
    return histories[userId] || [];
  } catch (err) {
    console.error("Read history error:", err);
    return [];
  }
};

export const saveHistory = async (userId, role, content, maxLength = 10) => {
  await initFile();
  try {
    const data = await fs.readFile(historyFile, "utf-8");
    const histories = JSON.parse(data);
    histories[userId] = (histories[userId] || [])
      .concat({ role, content })
      .slice(-maxLength);
    await fs.writeFile(historyFile, JSON.stringify(histories), "utf-8");
  } catch (err) {
    console.error("Save history error:", err);
  }
};

export const clearHistory = async (userId) => {
  await initFile();
  try {
    const data = await fs.readFile(historyFile, "utf-8");
    const histories = JSON.parse(data);
    delete histories[userId];
    await fs.writeFile(historyFile, JSON.stringify(histories), "utf-8");
  } catch (err) {
    console.error("Clear history error:", err);
  }
};
