import { Client, GatewayIntentBits, Message } from "discord.js";
import "dotenv/config";
import { registerCommands } from "./constants.js";
import axios from "axios";
import { splitMessage } from "./utils/splitMessage.js";
import express from "express";
import path from "path";

// Express server
const app = express();
const port = process.env.PORT || 2002;

app.use(express.json());

// Health check
app.get("/health", (_, res) => {
  res.status(200).send("OK");
});

// Static assets
app.use("/assets", express.static(path.join(process.cwd(), "src", "assets")));

// Start server
app.listen(port, () => {
  console.log(`🚀 Serveur Express lancé sur le port ${port}`);
});

// Discord bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Register slash commands
registerCommands(client);

// Login bot
client.login(process.env.TOKEN);

// Message listener
client.on("messageCreate", async (message: Message) => {
  // Ignore les messages du bot lui-même
  if (message.author.bot) return;

  const allowedChannelId = "1357632829856551075";

  // Vérifie si le message est dans le bon canal
  if (message.channel.id !== allowedChannelId) return;

  // Vérifie si le bot est mentionné
  const isMentioned = message.mentions.has(client.user!);

  if (!isMentioned) return;

  const question = message.content.replace(`<@${client.user?.id}>`, "").trim();

  if (!question) {
    return message.reply("❓ Pose-moi une question après la mention !");
  }

  try {
    const response = await axios.post("http://217.154.22.61:4005/ask", {
      question,
    });

    const answer = response.data?.response || "🤖 Je n'ai pas compris la question.";
    const replyChunks = splitMessage(answer, 2000);

    for (const chunk of replyChunks) {
      await message.reply(chunk);
    }
  } catch (error: any) {
    console.error("❌ Erreur API :", error.message);
    await message.reply("⚠️ Une erreur est survenue en interrogeant l'IA.");
  }
});
