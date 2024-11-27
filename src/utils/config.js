export const CLIENT_CONFIG = {
  prefix: ".",
  printQRInTerminal: false,
  readIncommingMsg: true,
  usePairingCode: true,
  phoneNumber: "6287833764462",
  WAVersion: [2, 3000, 1017531287],
};

export const LIST_AI_MODEL = ["gpt-4o-mini"];
export const getAIModel = () => LIST_AI_MODEL[Math.floor(Math.random() * LIST_AI_MODEL.length)];

export const SYSTEM_CONFIG = {
  owner: ["6285852584161", "6285136635787"],
  openai: 'sk-OsMMq65tXdfOIlTUYtocSL7NCsmA7CerN77OkEv29dODg1EA',
  chats: {
    provider: "Nextway",
    model: getAIModel(),
    webSearch: false,
  },
};
