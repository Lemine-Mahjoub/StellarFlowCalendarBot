import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  GuildMember,
} from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import db from "../../data/firebase.js";
import { collection, query, where, getDocs } from "firebase/firestore";
import buildCommand from "../../utils/commandBuilder.js";

export const profil = buildCommand(
  () => {
    const command = new SlashCommandBuilder()
      .setName("profil")
      .setDescription(
        "Affiche le profil détaillé d'un utilisateur avec ses badges"
      )
      .addUserOption((option) =>
        option
          .setName("utilisateur")
          .setDescription("L'utilisateur dont afficher le profil")
          .setRequired(false)
      ) as SlashCommandBuilder;
    return command;
  },

  async (interaction: ChatInputCommandInteraction) => {
    const user = interaction.options.getUser("utilisateur") || interaction.user;
    const member = interaction.guild?.members.cache.get(user.id) as GuildMember;

    const userBadgesQuery = query(
      collection(db, "userBadges"),
      where("userId", "==", user.id)
    );
    const userBadgesSnapshot = await getDocs(userBadgesQuery);

    let badgesDetails: any[] = [];
    if (!userBadgesSnapshot.empty) {
      const badgePromises = userBadgesSnapshot.docs.map(async (doc) => {
        const badgeQuery = query(
          collection(db, "badges"),
          where("titre", "==", doc.data().badgeTitle)
        );
        const badgeDoc = await getDocs(badgeQuery);
        if (!badgeDoc.empty) {
          return badgeDoc.docs[0].data();
        }
        return null;
      });

      badgesDetails = (await Promise.all(badgePromises)).filter(
        (badge) => badge !== null
      );
    }

    if (badgesDetails.length > 0) {
      const badgesPerPage = 3;
      let currentPage = 0;
      const maxPages = Math.ceil(badgesDetails.length / badgesPerPage);

      const generatePageEmbeds = (page: number) => {
        const start = page * badgesPerPage;
        const end = Math.min(start + badgesPerPage, badgesDetails.length);
        const pageBadges = badgesDetails.slice(start, end);

        return pageBadges.map((badge, index) => {
          const imageUrl = badge.imageFileName
            ? `http://${process.env.IP}:${process.env.PORT}/assets/${badge.imageFileName}`
            : null;

          return new EmbedBuilder()
            .setColor(Math.floor(Math.random() * 0xffffff))
            .setTitle(`🏅 ${badge.titre}`)
            .addFields({
              name: "📝 Description",
              value: badge.description || "Pas de description",
              inline: false,
            })
            .setImage(imageUrl)
            .setFooter({
              text: `Page ${page + 1}/${maxPages} • Badge ${
                start + index + 1
              }/${badgesDetails.length}`,
              iconURL: user.displayAvatarURL(),
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

      const message = await interaction.reply({
        embeds: generatePageEmbeds(currentPage),
        components: [createButtons(currentPage)],
        fetchReply: true,
      });

      const collector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 60000,
        filter: (i) => i.user.id === interaction.user.id,
      });

      collector.on("collect", async (i) => {
        if (i.customId === "previous")
          currentPage = Math.max(0, currentPage - 1);
        if (i.customId === "next")
          currentPage = Math.min(maxPages - 1, currentPage + 1);

        await i.update({
          embeds: generatePageEmbeds(currentPage),
          components: [createButtons(currentPage)],
        });
      });

      collector.on("end", () => {
        if (!message.editable) return;
        message.edit({ components: [] }).catch(console.error);
      });
    } else {
      const profileEmbed = new EmbedBuilder()
        .setColor(Math.floor(Math.random() * 0xffffff))
        .setTitle(`Profil de ${user.username}`)
        .setThumbnail(user.displayAvatarURL({ forceStatic: false }))
        .addFields({ name: "Badges :", value: "Aucun badge", inline: false })
        .setTimestamp()
        .setFooter({ text: `ID: ${user.id}` });

      await interaction.reply({ embeds: [profileEmbed] });
    }
  }
);
