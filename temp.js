import { Client } from "@mengkodingan/ckptw";
import { AI, clearUserHistory } from "./ai.js";

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

  if (body.toLowerCase() === "!clear") {
    await clearUserHistory(sender);
    await ctx.reply("Riwayat percakapan telah dihapus.");
    return;
  }

  const ai = await AI(body, sender);
  console.log("🚀 ~ bot.hears ~ ai:", ai)
  const po = async () => {
    if (ai.url) {
      if (ai.type == "sticker") {
        const rep = await ctx.reply({ ...{ [ai.type]: { url: ai.url } } });
        await ctx.reply(ai.text, { quoted: rep });
        return;
      }

      await ctx.reply({
        ...{ [ai.type]: { url: ai.url } },
        caption: ai.text,
      });
    } else {
      await ctx.reply(ai.text);
    }
  };

  try {
    await po();
  } catch (e) {
    await po();
  }
});

bot.launch();
