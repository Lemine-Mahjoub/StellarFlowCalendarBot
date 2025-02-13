import { db } from "../firebase.js";
import { collection, getDocs, query, where } from "firebase/firestore";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";

export const semaine = async (message) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const week = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(today);
        day.setDate(today.getDate() + i);
        week.push(day.toISOString().split("T")[0]); // Format YYYY-MM-DD
    }

    let currentDayIndex = 0;
    await sendDayAnimation(message, week, currentDayIndex);
};

const sendDayAnimation = async (message, week, index) => {
    console.log(week[index])
    const currentDate = week[index];
    const q = query(collection(db, "animations"), where("date", "==", currentDate));
    const snapshot = await getDocs(q);
    const animationsList = snapshot.docs.map(doc => doc.data()).sort((a, b) => a.heure.localeCompare(b.heure));

    let animations = animationsList.length
        ? animationsList.map(({ heure, nom }) => `**${heure}** - ${nom}`).join("\n")
        : "Aucune animation prévue pour ce jour.";

    const embed = new EmbedBuilder()
        .setTitle(`Animations du ${currentDate}`)
        .setDescription(animations)
        .setColor("#0099ff");

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`prev_day_${index}`)
                .setLabel("⬅️ Jour précédent")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(index === 0),
            new ButtonBuilder()
                .setCustomId(`next_day_${index}`)
                .setLabel("➡️ Jour suivant")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(index === week.length - 1)
        );

    const sentMessage = await message.reply({ embeds: [embed], components: [row] });

    const filter = (interaction) => interaction.user.id === message.author.id;
    const collector = sentMessage.createMessageComponentCollector({ filter, time: 60000 });

    collector.on("collect", async (interaction) => {
        let newIndex = index;
        if (interaction.customId.startsWith("prev_day")) {
            newIndex = Math.max(0, index - 1);
        } else if (interaction.customId.startsWith("next_day")) {
            newIndex = Math.min(week.length - 1, index + 1);
        }

        await interaction.deferUpdate();
        await sendDayAnimation(message, week, newIndex);
    });
};
