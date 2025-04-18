import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  CacheType,
} from "discord.js";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import db from "../../data/firebase.js";
import buildCommand from "../../utils/commandBuilder.js";

export const deletechallenge = buildCommand(
  new SlashCommandBuilder()
    .setName("deletechallenge")
    .setDescription("Supprime un challenge existant")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("nom")
        .setDescription("Nom du challenge à supprimer")
        .setRequired(true)
        .setAutocomplete(true)
    ) as SlashCommandBuilder,

  async (interaction: any) => {
    const nom = interaction.options.getString("nom", true);
    await interaction.deferReply();

    const snap = await getDocs(
      query(collection(db, "challenges"), where("nom", "==", nom))
    );

    if (snap.empty) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle("❌ Challenge non trouvé")
            .setDescription(`Aucun challenge nommé **${nom}** n'existe.`),
        ],
      });
    }

    const challengeId = snap.docs[0].id;
    await deleteDoc(doc(db, "challenges", challengeId));

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x00cc66)
          .setTitle("✅ Challenge supprimé")
          .setDescription(`Le challenge **${nom}** a bien été supprimé.`)
          .setFooter({
            text: `Par ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL(),
          }),
      ],
    });
  },

  async (interaction: any) => {
    if (
      interaction.commandName !== "deletechallenge" ||
      interaction.options.getFocused(true).name !== "nom"
    )
      return;

    const input = interaction.options.getFocused().toLowerCase();
    const snapshot = await getDocs(collection(db, "challenges"));

    const suggestions = snapshot.docs
      .map((doc) => doc.data().nom)
      .filter((nom) => nom.toLowerCase().includes(input))
      .slice(0, 25)
      .map((nom) => ({ name: nom, value: nom }));

    await interaction.respond(suggestions);
  }
);
