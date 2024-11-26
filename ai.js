import GPT4js from "gpt4js";
import fs from "fs/promises";

const options = {
  provider: "Nextway",
  model: "gpt-4o-mini",
  webSearch: true,
};

const provider = GPT4js.createProvider(options.provider);

export const Handler = async (message, history) => {
  const system = await fs.readFile("PROMPT.MD", "utf-8");
  const messages = [
    { role: "system", content: system },
    ...history,
    { role: "user", content: message },
  ];

  let text = await provider.chatCompletion(messages, options, (data) => data);
  let url;

  text = text || "";

  const mediaUrl = text.match(/!\[image\]\((.*?)\)/);
  url = mediaUrl ? mediaUrl[1] : null;

  text = text
    ?.replace(/【.*?】\(.*?\)|\[.*?\]\s*\(.*?\)|(?<!\!)\[.*?\]|\【.*?\】/g, "")
    .trim();

  text = text?.replace(
    /\{\s*"size"\s*:\s*".*?",\s*"prompt"\s*:\s*".*?"\s*\}/gs,
    ""
  );
  text = text?.replace(/\*\*/g, "*");

  if (url) {
    text = text?.split(/\n\n/)[1];
  }

  text = text.trim();

  return { url, text };
};

export const AI = async (message, history) => {
  let ai;
  try {
    ai = await Handler(message, history);
    return ai;
  } catch (error) {
    ai = await Handler(message, history);
    return ai;
  }
};
