import { Client } from "@mengkodingan/ckptw";
import { CLIENT_CONFIG, SYSTEM_CONFIG } from "./utils/config.js";
import { AI } from "./modules/chats.js";

const bot = new Client(CLIENT_CONFIG);

bot.hears(/(.+)/gi, async (ctx) => {
  if (ctx.msg.key.fromMe) return;
  if (!ctx.msg.content) return;

  const tag = ctx.msg.content.startsWith("@" + CLIENT_CONFIG.phoneNumber);

  if (ctx.isGroup() && !tag) return;

  const body = ctx.msg.content.split("@" + CLIENT_CONFIG.phoneNumber)[1]?.trim() || ctx.msg.content;
  console.log("🚀 ~ bot.hears ~ body:", body)
  const sender = ctx.sender.decodedJid;
  const room = ctx.msg.key.remoteJid;

  if (!SYSTEM_CONFIG.owner.includes(sender.split("@")[0])) return;

  const ai = await AI(body, room + "//" + sender);

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
