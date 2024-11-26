import { Client } from "@mengkodingan/ckptw";
import { CLIENT_CONFIG, SYSTEM_CONFIG } from "./utils/config.js";
import { AI } from "./modules/chats.js";

const bot = new Client(CLIENT_CONFIG);

bot.hears(/(.+)/gi, async (ctx) => {
  if (ctx.msg.key.fromMe) return;
  if (!ctx.msg.content) return;

  const body = ctx.msg.content;
  const sender = ctx.sender.decodedJid;

  if (!sender.startsWith(SYSTEM_CONFIG.owner)) return;

  const ai = await AI(body, sender);

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
});

bot.launch();
