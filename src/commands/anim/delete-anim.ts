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
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

export const deleteanim = buildCommand(
  new SlashCommandBuilder()
    .setName("deleteanim")
    .setDescription("Supprime une animation ou une occurrence spécifique")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(
      (option) =>
        option
          .setName("titre")
          .setDescription("Titre exact de l'animation")
          .setRequired(true)
          .setAutocomplete(true) // 🔄 Autocomplétion activée
    )
    .addStringOption((option) =>
      option
        .setName("date")
        .setDescription("Date de l'occurrence à supprimer (YYYY-MM-DD)")
        .setRequired(false)
    ) as SlashCommandBuilder,

  async (interaction: any) => {
    const titre = interaction.options.getString("titre", true);
    const date = interaction.options.getString("date");
    await interaction.deferReply();

    const baseQuery = [where("titre", "==", titre)];
    if (date) baseQuery.push(where("dateDebut", "==", date));

    const snapshot = await getDocs(query(collection(db, "anim"), ...baseQuery));

    if (snapshot.empty) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle("❌ Animation non trouvée")
            .setDescription(
              date
                ? `Aucune occurrence de **${titre}** à la date **${date}**.`
                : `Aucune animation **${titre}** trouvée.`
            ),
        ],
      });
    }

    const deleteOps = snapshot.docs.map((d) =>
      deleteDoc(doc(db, "anim", d.id))
    );
    await Promise.all(deleteOps);

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x00ff00)
          .setTitle("✅ Suppression effectuée")
          .setDescription(
            date
              ? `L'occurrence de **${titre}** à la date **${date}** a été supprimée.`
              : `Toutes les occurrences de **${titre}** ont été supprimées.`
          )
          .setFooter({
            text: `Par ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL(),
          }),
      ],
    });
  },

  // 🔄 Autocomplétion sur le titre d'animation
  async (interaction: AutocompleteInteraction<CacheType>) => {
    if (
      interaction.commandName !== "deleteanim" ||
      interaction.options.getFocused(true).name !== "titre"
    )
      return;

    const input = interaction.options.getFocused().toLowerCase();
    const animSnapshot = await getDocs(collection(db, "anim"));

    const uniqueTitles = [
      ...new Set(animSnapshot.docs.map((doc) => doc.data().titre)),
    ];

    const suggestions = uniqueTitles
      .filter((titre) => titre.toLowerCase().includes(input))
      .slice(0, 25)
      .map((titre) => ({ name: titre, value: titre }));

    await interaction.respond(suggestions);
  }
);
