import { db } from "../firebase.js";
import { collection, getDocs, query, where } from "firebase/firestore";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";

export const semaine = async (message) => {
    // Fonction pour générer les heures de la journée
    const generateTimeSlots = () => {
        let slots = [];
        for (let i = 1; i <= 24; i++) {
            // Convertit 24 en 0 pour afficher "00h00" à la fin
            const hour = i === 24 ? 0 : i;
            slots.push(`${hour.toString().padStart(2, '0')}h00`);
        }
        return slots;
    };

    // Fonction pour formater la date
    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    // Fonction pour créer l'embed d'un jour
    const createDayEmbed = async (date) => {
        const timeSlots = generateTimeSlots();
        const formattedDate = formatDate(date);

        // Récupérer les animations du jour
        const q = query(collection(db, "anim"),
            where("dateDebut", "<=", formattedDate),
            where("dateFin", ">=", formattedDate)
        );
        const querySnapshot = await getDocs(q);

        let description = '';
        timeSlots.forEach(timeSlot => {
            description += `**${timeSlot}**\n`;

            // Vérifier les animations pour ce créneau
            querySnapshot.forEach(doc => {
                const anim = doc.data();
                const heureDebut = anim.heureDebut;
                const heureFin = anim.heureFin;
                const timeSlotHour = parseInt(timeSlot.split('h')[0]);

                const animHeureDebut = parseInt(heureDebut.split('h')[0]);
                const animHeureFin = parseInt(heureFin.split('h')[0]);

                if (timeSlotHour >= animHeureDebut && timeSlotHour <= animHeureFin) {
                    description += `> 🎮 **${anim.titre}**\n> ${anim.description}\n`;
                }
            });
            description += '\n';
        });

        return new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(`📅 Planning du ${formattedDate}`)
            .setDescription(description)
            .setFooter({
                text: `Demandé par ${message.author.tag}`,
                iconURL: message.author.displayAvatarURL()
            });
    };

    // Créer les boutons de navigation
    const createNavigationButtons = () => {
        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('previous')
                    .setLabel('◀️ Jour précédent')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('Jour suivant ▶️')
                    .setStyle(ButtonStyle.Primary)
            );
    };

    // Date initiale (aujourd'hui)
    let currentDate = new Date();
    const embed = await createDayEmbed(currentDate);
    const buttons = createNavigationButtons();

    const response = await message.reply({
        embeds: [embed],
        components: [buttons]
    });

    // Collecter les interactions avec les boutons
    const collector = response.createMessageComponentCollector({
        filter: i => i.user.id === message.author.id,
        time: 300000 // 5 minutes
    });

    collector.on('collect', async i => {
        if (i.customId === 'previous') {
            currentDate.setDate(currentDate.getDate() - 1);
        } else if (i.customId === 'next') {
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const newEmbed = await createDayEmbed(currentDate);
        await i.update({ embeds: [newEmbed], components: [buttons] });
    });

    collector.on('end', () => {
        response.edit({ components: [] });
    });
};

