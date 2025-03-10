import { db } from "../firebase.js";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import path from 'path';

export const badge = async (message) => {
    const q = query(collection(db, "badges"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        const badges = querySnapshot.docs;
        const badgesPerPage = 3;
        let currentPage = 0;
        const maxPages = Math.ceil(badges.length / badgesPerPage);

        // Fonction pour générer les embeds d'une page spécifique
        const generatePageEmbeds = (pageNumber) => {
            const start = pageNumber * badgesPerPage;
            const end = Math.min(start + badgesPerPage, badges.length);
            const pageBadges = badges.slice(start, end);

            return pageBadges.map(doc => {
                const badge = doc.data();
                const imageUrl = badge.imageFileName
                    ? `http://${process.env.IP}:${process.env.PORT}/assets/${badge.imageFileName}`
                    : null;

                return new EmbedBuilder()
                    .setColor(0x0099ff)
                    .setTitle(`🏅 ${badge.titre}`)
                    .addFields(
                        { name: "📝 Description", value: badge.description, inline: false },
                        { name: "📅 Créé le", value: new Date(badge.createdAt.toDate()).toLocaleDateString(), inline: true }
                    )
                    .setImage(imageUrl)
                    .setFooter({
                        text: `Page ${pageNumber + 1}/${maxPages} • Badge ${start + pageBadges.indexOf(doc) + 1}/${badges.length}`,
                        iconURL: message.author.displayAvatarURL()
                    });
            });
        };

        // Création des boutons
        const createButtons = (currentPage) => {
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('previous')
                        .setLabel('◀️ Page précédente')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === 0),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Page suivante ▶️')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage >= maxPages - 1)
                );
            return row;
        };

        // Envoi du message initial
        const msg = await message.channel.send({
            embeds: generatePageEmbeds(currentPage),
            components: [createButtons(currentPage)]
        });

        // Création du collecteur de boutons
        const collector = msg.createMessageComponentCollector({
            filter: i => i.user.id === message.author.id,
            time: 60000 // 1 minute
        });

        collector.on('collect', async interaction => {
            if (interaction.customId === 'previous') {
                currentPage = Math.max(0, currentPage - 1);
            } else if (interaction.customId === 'next') {
                currentPage = Math.min(maxPages - 1, currentPage + 1);
            }

            await interaction.update({
                embeds: generatePageEmbeds(currentPage),
                components: [createButtons(currentPage)]
            });
        });

        collector.on('end', () => {
            msg.edit({
                components: [] // Retire les boutons quand le temps est écoulé
            }).catch(console.error);
        });
    } else {
        await message.channel.send({
            embeds: [{
                color: 0x0099ff,
                title: "🏅 Liste des Badges",
                description: "❌ Aucun badge n'est disponible pour le moment.",
                footer: {
                    text: "Demandé par " + message.author.tag,
                    icon_url: message.author.displayAvatarURL()
                }
            }]
        });
    }
}
