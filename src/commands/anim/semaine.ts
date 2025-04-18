import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  PermissionFlagsBits,
} from "discord.js";
import db from "../../data/firebase.js";
import { collection, getDocs, query, where } from "firebase/firestore";
import buildCommand from "../../utils/commandBuilder.js";

function generateTimeSlots() {
  return Array.from(
    { length: 24 },
    (_, i) => `${i.toString().padStart(2, "0")}h00`
  );
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

async function createDayEmbed(date: Date, username: string, avatar: string) {
  const timeSlots = generateTimeSlots();
  const formattedDate = formatDate(date);

  const q = query(
    collection(db, "anim"),
    where("dateDebut", "<=", formattedDate),
    where("dateFin", ">=", formattedDate)
  );

  const snapshot = await getDocs(q);

  let description = "";

  for (const timeSlot of timeSlots) {
    description += `**${timeSlot}**\n`;

    const slotHour = parseInt(timeSlot.split("h")[0]);

    snapshot.forEach((doc) => {
      const anim = doc.data();
      const heureDebut = parseInt(anim.heureDebut.replace("h", ""));
      const heureFin = parseInt(anim.heureFin.replace("h", ""));

      if (slotHour >= heureDebut && slotHour <= heureFin) {
        description += `> 🎮 **${anim.titre}**\n> ${anim.description}\n`;
      }
    });

    description += "\n";
  }

  return new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(`📅 Planning du ${formattedDate}`)
    .setDescription(description || "Aucune animation prévue pour ce jour.")
    .setFooter({ text: `Demandé par ${username}`, iconURL: avatar });
}

export const semaine = buildCommand(
  new SlashCommandBuilder()
    .setName("semaine")
    .setDescription(
      "Affiche le planning jour par jour de la semaine avec navigation"
    ),

  async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();

    let currentDate = new Date();

    const embed = await createDayEmbed(
      currentDate,
      interaction.user.tag,
      interaction.user.displayAvatarURL()
    );

    const navigationButtons = () =>
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("previous")
          .setLabel("◀️ Jour précédent")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("Jour suivant ▶️")
          .setStyle(ButtonStyle.Primary)
      );

    const msg = await interaction.editReply({
      embeds: [embed],
      components: [navigationButtons()],
    });

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 300000, // 5 minutes
    });

    collector.on("collect", async (btn) => {
      if (btn.user.id !== interaction.user.id) {
        return btn.reply({
          content: "❌ Tu ne peux pas contrôler ce planning.",
          ephemeral: true,
        });
      }

      if (btn.customId === "previous") {
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (btn.customId === "next") {
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const updatedEmbed = await createDayEmbed(
        currentDate,
        interaction.user.tag,
        interaction.user.displayAvatarURL()
      );

      await btn.update({
        embeds: [updatedEmbed],
        components: [navigationButtons()],
      });
    });

    collector.on("end", async () => {
      await msg.edit({ components: [] }).catch(() => {});
    });
  }
);
