import { Client } from "@mengkodingan/ckptw";
import { AI } from "./ai.js";
import fs from "fs/promises";

const historyFile = "history.json";

const readHistory = async () => {
  try {
    const data = await fs.readFile(historyFile, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const saveHistory = async (history) => {
  await fs.writeFile(historyFile, JSON.stringify(history, null, 2));
}

const bot = new Client({
  prefix: "!",
  printQRInTerminal: false,
  readIncommingMsg: true,
  usePairingCode: true,
  phoneNumber: "6287833764462",
  WAVersion: [2, 3000, 1017531287],
});

bot.hears(/(.+)/ig, async (ctx) => {
  if (ctx.msg.key.fromMe) return;
  if (!ctx.msg.content) return;

  const userMessage = ctx.msg.content;
  const sender = ctx.sender.decodedJid;

  if (!sender.startsWith("6285136635787")) return;

  const history = await readHistory();
  const aiResponse = await AI(userMessage, history);

  const updatedHistory = [
    ...history,
    { role: "user", content: userMessage },
    { role: "assistant", content: aiResponse },
  ];

  await saveHistory(updatedHistory);

  await ctx.reply(aiResponse || 'Mohon coba lagi');
});

bot.launch();
