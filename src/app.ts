import { Client, GatewayIntentBits, Message } from "discord.js";
import "dotenv/config";
import { registerCommands } from "./constants.js";
import axios from "axios";
import { splitMessage } from "./utils/splitMessage.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

registerCommands(client);

client.login(process.env.TOKEN);

client.on("messageCreate", async (message: Message) => {
  if (message.author.bot) return;

  const allowedChannelId = "1357632829856551075";
  const isAdmin = message.member?.permissions?.has("Administrator");

  if (message.channel.id !== allowedChannelId && !isAdmin) return;

  const question = message.content.replace(`<@${client.user?.id}>`, "").trim();

  if (!question) {
    return message.reply("❓ Pose-moi une question après la mention !");
  }
  try {
    const res = await axios.post("http://217.154.22.61:4005/ask", {
      question,
    });

    const reply = res.data?.response || "🤖 Je n'ai pas compris la question.";
    const replyChunks = splitMessage(reply, 2000);

    for (const chunk of replyChunks) {
      await message.reply(chunk);
    }
  } catch (err: any) {
    console.error("❌ Erreur lors de l'appel à l'API IA :", err.message);
    await message.reply("⚠️ Une erreur est survenue en interrogeant l'IA.");
  }
});
