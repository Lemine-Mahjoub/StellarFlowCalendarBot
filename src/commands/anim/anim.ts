import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  ComponentType,
} from "discord.js";
import buildCommand from "../../utils/commandBuilder.js";
import db from "../../data/firebase.js";
import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";

export const anim = buildCommand(
  new SlashCommandBuilder()
    .setName("anim")
    .setDescription("Affiche les animations à venir avec navigation"),

  async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();

    const snapshot = await getDocs(
      query(collection(db, "anim"), orderBy("dateDebut", "asc"))
    );

    const now = new Date();
    const validAnimations: any[] = [];
    let removedCount = 0;

    for (const docSnap of snapshot.docs) {
      const anim = docSnap.data();

      try {
        const rawDate = anim.dateFin;
        const rawHeure = anim.heureFin || "23:59";
        const heureFinCleaned = rawHeure.replace("h", ":");

        const dateFin =
          typeof rawDate === "string"
            ? new Date(rawDate + "T00:00:00")
            : rawDate.toDate();

        const [hour, minute] = heureFinCleaned.split(":").map(Number);
        const endDateTime = new Date(dateFin);
        endDateTime.setHours(hour, minute, 0, 0);

        if (isNaN(endDateTime.getTime())) continue;

        if (endDateTime < now) {
          await deleteDoc(doc(db, "anim", docSnap.id));
          removedCount++;
        } else {
          validAnimations.push(anim);
        }
      } catch (err) {
        console.error("Erreur parsing animation :", anim, err);
        continue;
      }
    }

    const animationsPerPage = 5;
    const maxPages = Math.ceil(validAnimations.length / animationsPerPage);
    let currentPage = 0;

    const generateEmbed = () => {
      const start = currentPage * animationsPerPage;
      const pageAnims = validAnimations.slice(start, start + animationsPerPage);

      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("📅 Planning des Animations")
        .setFooter({
          text: `Page ${currentPage + 1}/${Math.max(
            1,
            maxPages
          )} • Demandé par ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      if (pageAnims.length > 0) {
        for (const anim of pageAnims) {
          embed.addFields({
            name: `📌 ${anim.dateDebut}`,
            value: `⏰ **Heure :** ${anim.heureDebut}\n✨ **Animation :** ${anim.titre}\n📝 **Description :** ${anim.description}\n🔚 **Fin :** ${anim.dateFin} à ${anim.heureFin}`,
            inline: false,
          });
        }
      } else {
        embed.setDescription("❌ Aucune animation à venir sur cette page.");
      }

      if (removedCount > 0 && currentPage === 0) {
        embed.addFields({
          name: "🗑️ Animations supprimées",
          value: `✅ ${removedCount} animation(s) expirée(s) supprimée(s).`,
          inline: false,
        });
      }

      return embed;
    };

    const buildButtons = () =>
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("prev")
          .setLabel("◀️ Page précédente")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === 0),
        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("Page suivante ▶️")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage >= maxPages - 1)
      );

    const msg = await interaction.editReply({
      embeds: [generateEmbed()],
      components: [buildButtons()],
    });

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000,
    });

    collector.on("collect", async (btn) => {
      if (btn.user.id !== interaction.user.id) {
        return btn.reply({
          content: "❌ Tu ne peux pas utiliser ces boutons.",
          ephemeral: true,
        });
      }

      if (btn.customId === "prev") currentPage--;
      if (btn.customId === "next") currentPage++;

      await btn.update({
        embeds: [generateEmbed()],
        components: [buildButtons()],
      });
    });

    collector.on("end", async () => {
      await msg.edit({ components: [] }).catch(() => {});
    });
  }
);
