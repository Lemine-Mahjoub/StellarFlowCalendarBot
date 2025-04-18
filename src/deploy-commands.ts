import { REST, Routes } from "discord.js";
import { config } from "dotenv";
import { loadCommands } from "./utils/commandLoader.js";

config();

const commands = loadCommands();

const commandData = Array.from(commands.values()).map((command) =>
  command.data.toJSON()
);

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN!);

(async () => {
  try {
    console.log("🚀 Déploiement des commandes...");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID!,
        process.env.GUILD_ID!
      ),
      { body: commandData }
    );

    console.log("✅ Commandes déployées avec succès");
  } catch (error) {
    console.error(error);
  }
})();
