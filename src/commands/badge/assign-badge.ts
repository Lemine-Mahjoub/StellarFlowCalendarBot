import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  User,
} from "discord.js";
import buildCommand from "../../utils/commandBuilder.js";
import db from "../../data/firebase.js";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

export const assignbadge = buildCommand(
  new SlashCommandBuilder()
    .setName("assignbadge")
    .setDescription("Assigne un badge existant à un utilisateur")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("titre")
        .setDescription("Le titre exact du badge à assigner")
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("utilisateur")
        .setDescription("Utilisateur à qui attribuer le badge")
        .setRequired(true)
    ) as SlashCommandBuilder,

  async (interaction: ChatInputCommandInteraction) => {
    const badgeTitle = interaction.options.getString("titre", true);
    const user: User = interaction.options.getUser("utilisateur", true);
    await interaction.deferReply();

    try {
      // Vérifier que le badge existe
      const badgeQuery = query(
        collection(db, "badges"),
        where("titre", "==", badgeTitle)
      );
      const badgeSnapshot = await getDocs(badgeQuery);

      if (badgeSnapshot.empty) {
        throw new Error("Badge non trouvé.");
      }

      // Vérifier si l'utilisateur a déjà ce badge
      const userBadgeQuery = query(
        collection(db, "userBadges"),
        where("userId", "==", user.id),
        where("badgeTitle", "==", badgeTitle)
      );
      const userBadgeSnapshot = await getDocs(userBadgeQuery);

      if (!userBadgeSnapshot.empty) {
        throw new Error("L'utilisateur possède déjà ce badge.");
      }

      // Enregistrer l'attribution
      await addDoc(collection(db, "userBadges"), {
        userId: user.id,
        badgeTitle: badgeTitle,
        assignedAt: new Date(),
        assignedBy: interaction.user.id,
      });

      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle("✅ Badge assigné")
        .setDescription(
          `Le badge **${badgeTitle}** a été assigné à ${user.toString()}`
        )
        .setFooter({
          text: `Par ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      await interaction.editReply({ embeds: [embed] });
    } catch (error: any) {
      const errorEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("❌ Erreur")
        .setDescription(error.message)
        .setFooter({
          text: `Erreur par ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  }
);
