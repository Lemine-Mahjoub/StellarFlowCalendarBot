import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import db from "../../data/firebase.js";
import buildCommand from "../../utils/commandBuilder.js";

export const createcategory = buildCommand(
  new SlashCommandBuilder()
    .setName("createcategory")
    .setDescription("Crée une nouvelle catégorie de badges")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("nom")
        .setDescription("Nom de la catégorie à créer")
        .setRequired(true)
    ) as SlashCommandBuilder,

  async (interaction: any) => {
    const nom = interaction.options.getString("nom", true);
    await interaction.deferReply();

    const existing = await getDocs(
      query(collection(db, "categories"), where("name", "==", nom))
    );

    if (!existing.empty) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xffcc00)
            .setTitle("⚠️ Catégorie déjà existante")
            .setDescription(`La catégorie **${nom}** existe déjà.`),
        ],
      });
    }

    await addDoc(collection(db, "categories"), {
      name: nom,
      createdAt: new Date(),
      createdBy: interaction.user.id,
    });

    return interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x00ff00)
          .setTitle("✅ Catégorie créée")
          .setDescription(
            `La catégorie **${nom}** a été enregistrée avec succès.`
          )
          .setFooter({
            text: `Créée par ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL(),
          }),
      ],
    });
  }
);
