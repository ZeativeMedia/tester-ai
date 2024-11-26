import { Client } from "@mengkodingan/ckptw";
import { AI } from "./ai.js";

const bot = new Client({
  prefix: "!",
  printQRInTerminal: false,
  readIncommingMsg: true,
  usePairingCode: true,
  phoneNumber: "6287833764462",
  WAVersion: [2, 3000, 1017531287],
});

bot.hears(/(.+)/gi, async (ctx) => {
  if (ctx.msg.key.fromMe) return;
  if (!ctx.msg.content) return;

  const body = ctx.msg.content;
  const sender = ctx.sender.decodedJid;

  if (!sender.startsWith("6285136635787")) return;

  const ai = await AI(body, []);

  if (ai.url) {
    await ctx.reply({
      image: { url: ai.url },
      caption: ai.text,
    });
  } else {
    await ctx.reply(ai.text);
  }
});

bot.launch();
