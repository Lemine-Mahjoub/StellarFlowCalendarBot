import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  AutocompleteInteraction,
  CacheType,
} from "discord.js";
import buildCommand from "../../utils/commandBuilder.js";
import db from "../../data/firebase.js";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";

export const deletebadge = buildCommand(
  new SlashCommandBuilder()
    .setName("deletebadge")
    .setDescription("Supprime un badge existant")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(
      (option) =>
        option
          .setName("titre")
          .setDescription("Le titre exact du badge à supprimer")
          .setRequired(true)
          .setAutocomplete(true) // 🔄 Autocomplétion activée
    ) as SlashCommandBuilder,

  async (interaction: any) => {
    const titre = interaction.options.getString("titre", true);
    await interaction.deferReply();

    try {
      const badgeQuery = query(
        collection(db, "badges"),
        where("titre", "==", titre)
      );
      const badgeSnapshot = await getDocs(badgeQuery);

      if (badgeSnapshot.empty) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(0xff0000)
              .setTitle("❌ Badge non trouvé")
              .setDescription(`Aucun badge nommé **${titre}** n'existe.`),
          ],
        });
      }

      const badgeDoc = badgeSnapshot.docs[0];
      await deleteDoc(doc(db, "badges", badgeDoc.id));

      const userBadgeQuery = query(
        collection(db, "userBadges"),
        where("badgeTitle", "==", titre)
      );
      const userBadgeSnapshot = await getDocs(userBadgeQuery);
      const deletePromises = userBadgeSnapshot.docs.map((docSnap) =>
        deleteDoc(doc(db, "userBadges", docSnap.id))
      );
      await Promise.all(deletePromises);

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle("✅ Badge supprimé")
            .setDescription(
              `Le badge **${titre}** et toutes ses attributions ont été supprimés.`
            )
            .setFooter({
              text: `Par ${interaction.user.tag}`,
              iconURL: interaction.user.displayAvatarURL(),
            }),
        ],
      });
    } catch (err) {
      console.error("Erreur suppression badge :", err);
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle("❌ Erreur")
            .setDescription(
              "Une erreur est survenue pendant la suppression du badge."
            ),
        ],
      });
    }
  },

  // 🔄 Fonction d'autocomplétion sur le champ `titre`
  async (interaction: any) => {
    if (
      interaction.commandName !== "deletebadge" ||
      interaction.options.getFocused(true).name !== "titre"
    )
      return;

    const input = interaction.options.getFocused().toLowerCase();
    const badgeSnapshot = await getDocs(collection(db, "badges"));

    const suggestions = badgeSnapshot.docs
      .map((doc) => doc.data().titre)
      .filter((titre) => titre.toLowerCase().includes(input))
      .slice(0, 25)
      .map((titre) => ({ name: titre, value: titre }));

    await interaction.respond(suggestions);
  }
);
