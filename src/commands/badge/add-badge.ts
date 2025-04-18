import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
  PermissionFlagsBits,
  CacheType,
  AutocompleteInteraction,
} from "discord.js";
import buildCommand from "../../utils/commandBuilder.js";
import db from "../../data/firebase.js";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { saveImage } from "../../utils/imageHandler.js";

async function getCategories() {
  const catQuery = query(collection(db, "categories"));
  const catSnap = await getDocs(catQuery);
  return catSnap.docs.map((doc) => doc.data().name);
}

export const addbadge = buildCommand(
  () => {
    const command = new SlashCommandBuilder()
      .setName("addbadge")
      .setDescription("Crée un nouveau badge sans l'assigner")
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .addStringOption((option) =>
        option
          .setName("titre")
          .setDescription("Le titre du badge")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("description")
          .setDescription("La description du badge")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("categorie")
          .setDescription("La catégorie du badge")
          .setRequired(true)
          .setAutocomplete(true)
      )
      .addAttachmentOption((option) =>
        option.setName("image").setDescription("Image du badge (optionnelle)")
      );

    return command as SlashCommandBuilder;
  },

  async (interaction: ChatInputCommandInteraction) => {
    const titre = interaction.options.getString("titre", true);
    const description = interaction.options.getString("description", true);
    const categorie = interaction.options.getString("categorie", true);
    const imageAttachment = interaction.options.getAttachment("image");

    await interaction.deferReply();

    // Vérifie si la catégorie existe déjà
    const catQuery = query(
      collection(db, "categories"),
      where("name", "==", categorie)
    );
    const catSnap = await getDocs(catQuery);

    if (catSnap.empty) {
      await addDoc(collection(db, "categories"), {
        name: categorie,
        createdAt: new Date(),
        createdBy: interaction.user.id,
      });
    }

    let imageFileName: string | null = null;
    if (imageAttachment?.contentType?.startsWith("image/")) {
      imageFileName = await saveImage(imageAttachment.url);
    }

    await addDoc(collection(db, "badges"), {
      titre,
      description,
      category: categorie,
      imageFileName,
      createdAt: new Date(),
      createdBy: interaction.user.id,
    });

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle("✅ Badge créé avec succès")
      .addFields(
        { name: "🏅 Titre", value: titre },
        { name: "📝 Description", value: description },
        { name: "📂 Catégorie", value: categorie },
        {
          name: "🖼️ Image",
          value: imageFileName ? "Incluse ✅" : "Aucune ❌",
          inline: true,
        }
      )
      .setFooter({
        text: `Par ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      });

    await interaction.editReply({
      embeds: [embed],
      files: imageFileName
        ? [new AttachmentBuilder(`./src/assets/${imageFileName}`)]
        : [],
    });
  }
);

export async function autocomplete(
  interaction: AutocompleteInteraction<CacheType>
) {
  if (
    interaction.commandName !== "addbadge" ||
    interaction.options.getFocused(true).name !== "categorie"
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
