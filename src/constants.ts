import {
  Client,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  Message,
  TextChannel,
} from "discord.js";
import { loadCommands } from "./utils/commandLoader.js";

export const commands = loadCommands();

export const registerCommands = async (client: Client) => {
  client.on("ready", () => {
    console.log(`✅ Logged in as ${client.user?.tag}`);
  });

  // 🔄 Slash command handling
  client.on("interactionCreate", async (interaction) => {
    if (interaction.isAutocomplete()) {
      const command = commands.get(interaction.commandName);
      if (command?.autocomplete) {
        try {
          await command.autocomplete(interaction as AutocompleteInteraction);
        } catch (error) {
          console.error("❌ Erreur autocomplétion :", error);
        }
      }
      return;
    }

    if (interaction.isChatInputCommand()) {
      const command = commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction as ChatInputCommandInteraction);
      } catch (error) {
        console.error("❌ Erreur exécution :", error);
        const content =
          "❌ Une erreur s'est produite lors de l'exécution de cette commande.";
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content, ephemeral: true });
        } else {
          await interaction.reply({ content, ephemeral: true });
        }
      }
    }
  });

  // 💬 Réponse IA quand le bot est mentionné
};
