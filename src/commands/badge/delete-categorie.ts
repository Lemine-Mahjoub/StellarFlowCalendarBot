import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  AutocompleteInteraction,
  CacheType,
} from "discord.js";
import db from "../../data/firebase.js";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import buildCommand from "../../utils/commandBuilder.js";

export const deletecategory = buildCommand(
  new SlashCommandBuilder()
    .setName("deletecategory")
    .setDescription("Supprime une catégorie si elle n'est pas utilisée")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(
      (option) =>
        option
          .setName("nom")
          .setDescription("Nom exact de la catégorie à supprimer")
          .setRequired(true)
          .setAutocomplete(true) // 🔄 Active l'autocomplétion
    ) as SlashCommandBuilder,

  async (interaction: any) => {
    const nom = interaction.options.getString("nom", true);
    await interaction.deferReply();

    const catSnap = await getDocs(
      query(collection(db, "categories"), where("name", "==", nom))
    );

    if (catSnap.empty) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle("❌ Catégorie introuvable")
            .setDescription(`Aucune catégorie nommée **${nom}** n'existe.`),
        ],
      });
    }

    const badgeSnap = await getDocs(
      query(collection(db, "badges"), where("category", "==", nom))
    );

    if (!badgeSnap.empty) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xffcc00)
            .setTitle("⚠️ Catégorie utilisée")
            .setDescription(
              `Impossible de supprimer **${nom}** car elle est utilisée dans ${badgeSnap.size} badge(s).`
            ),
        ],
      });
    }

    await deleteDoc(doc(db, "categories", catSnap.docs[0].id));

    return interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x00ff00)
          .setTitle("✅ Catégorie supprimée")
          .setDescription(`La catégorie **${nom}** a bien été supprimée.`),
      ],
    });
  },

  // 🔄 Autocomplete dynamique
  async (interaction: AutocompleteInteraction<CacheType>) => {
    if (
      interaction.commandName !== "deletecategory" ||
      interaction.options.getFocused(true).name !== "nom"
    )
      return;

    const input = interaction.options.getFocused().toLowerCase();
    const catSnapshot = await getDocs(collection(db, "categories"));

    const suggestions = catSnapshot.docs
      .map((doc) => doc.data().name)
      .filter((name) => name.toLowerCase().includes(input))
      .slice(0, 25)
      .map((name) => ({ name, value: name }));

    await interaction.respond(suggestions);
  }
);
