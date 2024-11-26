import { Client } from "@mengkodingan/ckptw";
import { AI } from "./ai.js";
import fs from "fs/promises";
import https from "https";
import axios from "axios";

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
};

const bot = new Client({
  prefix: "!",
  printQRInTerminal: false,
  readIncommingMsg: true,
  usePairingCode: true,
  phoneNumber: "6287833764462",
  WAVersion: [2, 3000, 1017531287],
});

function extractUrlAndContent(input) {
  try {
    const urlMatch = input.match(/!\[image\]\((.*?)\)/); // Cari URL gambar

    const url = urlMatch ? urlMatch[1] : null;
    const content = input?.split(/\n\n/)[1]?.trim();

    return { url, content };
  } catch (e) {
    return false;
  }
}

bot.hears(/(.+)/gi, async (ctx) => {
  if (ctx.msg.key.fromMe) return;
  if (!ctx.msg.content) return;

  const userMessage = ctx.msg.content;
  const sender = ctx.sender.decodedJid;

  if (!sender.startsWith("6285136635787")) return;

  // const history = await readHistory();

  const updatedHistory = [
    // ...history,
    { role: "user", content: userMessage },
    // { role: "assistant", content: aiResponse },
  ];

  try {
    const aiResponse = await AI(userMessage, updatedHistory);

    const media = extractUrlAndContent(aiResponse);

    if (media.url) {
      await ctx.reply({
        image: { url: media.url },
        caption: media.content,
      });
    } else {
      await ctx.reply(aiResponse);
    }
  } catch (e) {
    const aiResponse = await AI(userMessage, updatedHistory);
    const media = extractUrlAndContent(aiResponse);

    if (media) {
      await ctx.reply({
        image: { url: media.url },
        caption: media.content,
      });
    } else {
      await ctx.reply(aiResponse);
    }
  }

  // await saveHistory(updatedHistory)
});

bot.launch();
