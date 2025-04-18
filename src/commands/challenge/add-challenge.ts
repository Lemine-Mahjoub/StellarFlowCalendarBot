import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { collection, addDoc } from "firebase/firestore";
import db from "../../data/firebase.js";
import buildCommand from "../../utils/commandBuilder.js";

function isValidDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(new Date(date).getTime());
}

export const addchallenge = buildCommand(
  new SlashCommandBuilder()
    .setName("addchallenge")
    .setDescription("Ajoute un nouveau challenge à la base de données")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option.setName("nom").setDescription("Nom du challenge").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("Description du challenge")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("datedebut")
        .setDescription("Date de début (YYYY-MM-DD)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("datefin")
        .setDescription("Date de fin (YYYY-MM-DD)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("recompense")
        .setDescription("Récompense attribuée")
        .setRequired(true)
    ) as SlashCommandBuilder,

  async (interaction: any) => {
    const nom = interaction.options.getString("nom", true);
    const description = interaction.options.getString("description", true);
    const dateDebut = interaction.options.getString("datedebut", true);
    const dateFin = interaction.options.getString("datefin", true);
    const recompense = interaction.options.getString("recompense", true);

    await interaction.deferReply({ ephemeral: true });

    // ✅ Validation des dates
    if (!isValidDate(dateDebut) || !isValidDate(dateFin)) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle("❌ Erreur de format de date")
            .setDescription(
              "Les dates doivent être au format `YYYY-MM-DD`.\nExemple : `2025-05-15`"
            ),
        ],
      });
    }

    // 🔄 Sauvegarde dans Firestore
    await addDoc(collection(db, "challenges"), {
      nom,
      description,
      dateDebut,
      dateFin,
      recompense,
      createdAt: new Date(),
      createdBy: interaction.user.id,
    });

    return interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x00cc66)
          .setTitle("✅ Challenge créé")
          .setDescription(`Le challenge **${nom}** a été enregistré.`)
          .addFields(
            { name: "📋 Description", value: description },
            { name: "📅 Début", value: dateDebut, inline: true },
            { name: "📅 Fin", value: dateFin, inline: true },
            { name: "🏆 Récompense", value: recompense, inline: false }
          )
          .setFooter({
            text: `Créé par ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setTimestamp(),
      ],
    });
  }
);
