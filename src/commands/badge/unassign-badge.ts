import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    AutocompleteInteraction,
    EmbedBuilder,
    PermissionFlagsBits,
    User,
    CacheType,
  } from "discord.js";
  import buildCommand from "../../utils/commandBuilder.js";
  import db from "../../data/firebase.js";
  import {
    collection,
    query,
    where,
    getDocs,
    deleteDoc,
    doc,
  } from "firebase/firestore";

  export const unassignbadge = buildCommand(
    new SlashCommandBuilder()
      .setName("unassignbadge")
      .setDescription("Retire un badge attribué à un utilisateur")
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .addStringOption((option) =>
        option
          .setName("titre")
          .setDescription("Le titre exact du badge à retirer")
          .setRequired(true)
          .setAutocomplete(true)
      )
      .addUserOption((option) =>
        option
          .setName("utilisateur")
          .setDescription("Utilisateur à qui retirer le badge")
          .setRequired(true)
      ) as SlashCommandBuilder,

    // 🔧 Execution de la commande
    async (interaction: ChatInputCommandInteraction) => {
      const badgeTitle = interaction.options.getString("titre", true);
      const user: User = interaction.options.getUser("utilisateur", true);
      await interaction.deferReply();

      try {
        const userBadgeQuery = query(
          collection(db, "userBadges"),
          where("userId", "==", user.id),
          where("badgeTitle", "==", badgeTitle)
        );
        const userBadgeSnapshot = await getDocs(userBadgeQuery);

        if (userBadgeSnapshot.empty) {
          throw new Error("Ce badge n'est pas attribué à cet utilisateur.");
        }

        const badgeDoc = userBadgeSnapshot.docs[0];
        await deleteDoc(doc(db, "userBadges", badgeDoc.id));

        const embed = new EmbedBuilder()
          .setColor(0xff9900)
          .setTitle("✅ Badge retiré")
          .setDescription(
            `Le badge **${badgeTitle}** a été retiré à ${user.toString()}`
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
    },

    // 🔁 Autocomplétion des badges attribués
    async (interaction: AutocompleteInteraction<CacheType>) => {
      if (
        interaction.commandName !== "unassignbadge" ||
        interaction.options.getFocused(true).name !== "titre"
      )
        return;

      const input = interaction.options.getFocused().toLowerCase();
      const badgeSnap = await getDocs(collection(db, "badges"));

      const suggestions = badgeSnap.docs
        .map((doc) => doc.data().titre)
        .filter((titre) => titre.toLowerCase().includes(input))
        .slice(0, 25)
        .map((titre) => ({ name: titre, value: titre }));

      await interaction.respond(suggestions);
    }
  );
