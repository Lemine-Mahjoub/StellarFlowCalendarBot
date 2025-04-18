import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import buildCommand from "../../utils/commandBuilder.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CommandEntry {
  name: string;
  arguments: string | null;
  description: string;
  permissions: string | null;
}

interface CommandsData {
  [category: string]: CommandEntry[];
}

// Load JSON file
const commandsFilePath = path.resolve(__dirname, "../../data/commands.json");
const commandsData: CommandsData = JSON.parse(
  fs.readFileSync(commandsFilePath, "utf8")
);

export const help = buildCommand(
  () => {
    const command = new SlashCommandBuilder()
      .setName("help")
      .setDescription("Affiche la liste des commandes disponibles");

    command.addStringOption((option) =>
      option
        .setName("category")
        .setDescription("Catégorie de commandes spécifique à afficher")
        .setRequired(false)
        .addChoices(
          { name: "Général", value: "general" },
          { name: "Profil", value: "profil" },
          { name: "Ticket", value: "ticket" },
          { name: "Annonces", value: "annonces" },
          { name: "Animation", value: "animation" },
          { name: "Challenge", value: "challenge" },
          { name: "Badge", value: "badge" }
        )
    );

    return command;
  },

  async (interaction: ChatInputCommandInteraction) => {
    const category = interaction.options.getString("category");

    if (category) {
      await showCategoryCommands(interaction, category);
    } else {
      await showAllCategories(interaction);
    }
  }
);

async function showAllCategories(interaction: ChatInputCommandInteraction) {
  const embed = new EmbedBuilder()
    .setTitle("📚 Guide des Commandes")
    .setDescription(
      "Voici les catégories de commandes disponibles. Utilisez `/help [catégorie]` pour plus de détails."
    )
    .setColor("#5865F2")
    .setTimestamp();

  for (const [category, commands] of Object.entries(commandsData)) {
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

    const commandList = commands.map((cmd) => cmd.name).join(", ");
    embed.addFields({
      name: `${getCategoryEmoji(category)} ${categoryName} (${
        commands.length
      })`,
      value: commandList || "Aucune commande disponible",
      inline: false,
    });
  }

  embed.setFooter({
    text: "Astuce: Utilisez /help [catégorie] pour voir les détails d'une catégorie spécifique",
  });

  await interaction.reply({ embeds: [embed] });
}

async function showCategoryCommands(
  interaction: ChatInputCommandInteraction,
  category: string
) {
  const commands = commandsData[category] || [];

  if (!commands || commands.length === 0) {
    await interaction.reply({
      content: `⚠️ Aucune commande trouvée dans la catégorie "${category}".`,
      ephemeral: true,
    });
    return;
  }

  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

  const embed = new EmbedBuilder()
    .setTitle(`${getCategoryEmoji(category)} Commandes ${categoryName}`)
    .setDescription(
      `Liste détaillée des commandes dans la catégorie ${categoryName}.`
    )
    .setColor(getCategoryColor(category))
    .setTimestamp();

  for (const cmd of commands) {
    const permissionInfo = cmd.permissions
      ? `\n**Permission requise**: ${cmd.permissions}`
      : "";
    const argumentsInfo = cmd.arguments
      ? `\n**Arguments**: ${cmd.arguments}`
      : "";

    embed.addFields({
      name: cmd.name,
      value: `${cmd.description}${argumentsInfo}${permissionInfo}`,
      inline: false,
    });
  }

  embed.setFooter({
    text: "Utilisez /help sans arguments pour voir toutes les catégories",
  });

  await interaction.reply({ embeds: [embed] });
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    general: "📋",
    profil: "👤",
    ticket: "🎫",
    annonces: "📢",
    animation: "🎮",
    challenge: "🏆",
    badge: "🥇",
  };

  return emojis[category] || "📌";
}

function getCategoryColor(category: string): number {
  const colors: Record<string, number> = {
    general: 0x5865f2,
    profil: 0x57f287,
    ticket: 0xfee75c,
    annonces: 0xeb459e,
    animation: 0xed4245,
    challenge: 0xf47b67,
    badge: 0x9b59b6,
  };

  return colors[category] || 0x5865f2;
}
