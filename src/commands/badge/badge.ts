import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from "discord.js";
import buildCommand from "../../utils/commandBuilder.js";
import db from "../../data/firebase.js";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

export const badge = buildCommand(
  new SlashCommandBuilder()
    .setName("badge")
    .setDescription("Affiche la liste des badges disponibles")
    .addStringOption((option) =>
      option
        .setName("categorie")
        .setDescription("Filtrer par catégorie de badge")
        .setRequired(false)
    ) as SlashCommandBuilder,

  async (interaction: any) => {
    const categoryFilter = interaction.options.getString("categorie");
    await interaction.deferReply();

    let q;
    if (categoryFilter) {
      q = query(
        collection(db, "badges"),
        where("category", "==", categoryFilter),
        orderBy("createdAt", "desc")
      );
    } else {
      q = query(collection(db, "badges"), orderBy("createdAt", "desc"));
    }

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle("🏅 Liste des Badges")
            .setDescription(
              categoryFilter
                ? `❌ Aucun badge trouvé dans la catégorie "${categoryFilter}".`
                : "❌ Aucun badge n'a encore été créé."
            )
            .setFooter({
              text: `Demandé par ${interaction.user.tag}`,
              iconURL: interaction.user.displayAvatarURL(),
            }),
        ],
      });
    }

    const badges = querySnapshot.docs;
    const badgesPerPage = 3;
    let currentPage = 0;
    const maxPages = Math.ceil(badges.length / badgesPerPage);

    const generatePageEmbeds = (pageNumber: number) => {
      const start = pageNumber * badgesPerPage;
      const end = Math.min(start + badgesPerPage, badges.length);
      const pageBadges = badges.slice(start, end);

      return pageBadges.map((doc, index) => {
        const badge = doc.data() as any;
        const imageUrl = badge.imageFileName
          ? `http://${process.env.IP}:${process.env.PORT}/assets/${badge.imageFileName}`
          : null;

        return new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle(`🏅 ${badge.titre}`)
          .addFields(
            {
              name: "📝 Description",
              value: badge.description || "Pas de description",
              inline: false,
            },
            {
              name: "📂 Catégorie",
              value: badge.category || "Non catégorisé",
              inline: true,
            },
            {
              name: "📅 Créé le",
              value: badge.createdAt?.toDate
                ? new Date(badge.createdAt.toDate()).toLocaleDateString()
                : "Date inconnue",
              inline: true,
            }
          )
          .setImage(imageUrl)
          .setFooter({
            text: `Page ${pageNumber + 1}/${maxPages} • Badge ${
              start + index + 1
            }/${badges.length}`,
            iconURL: interaction.user.displayAvatarURL(),
          });
      });
    };

    const createButtons = (page: number) => {
      return new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("previous")
          .setLabel("◀️ Page précédente")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("Page suivante ▶️")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page >= maxPages - 1)
      );
    };

    const initialMessage = await interaction.editReply({
      content: categoryFilter
        ? `🏅 Badges dans la catégorie "**${categoryFilter}**" :`
        : "🏅 Liste complète des badges :",
      embeds: generatePageEmbeds(currentPage),
      components: [createButtons(currentPage)],
    });

    const collector = initialMessage.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: (i: any) => i.user.id === interaction.user.id,
      time: 60000,
    });

    collector.on("collect", async (i: any) => {
      if (i.customId === "previous") {
        currentPage = Math.max(0, currentPage - 1);
      } else if (i.customId === "next") {
        currentPage = Math.min(maxPages - 1, currentPage + 1);
      }

      await i.update({
        embeds: generatePageEmbeds(currentPage),
        components: [createButtons(currentPage)],
      });
    });

    collector.on("end", () => {
      if (initialMessage.editable) {
        initialMessage.edit({ components: [] }).catch(console.error);
      }
    });
  }
);
