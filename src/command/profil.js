import { db } from "../firebase.js";
import { collection, query, where, getDocs } from "firebase/firestore";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import path from 'path';

export const profil = async (message) => {
    const user = message.mentions.users.first() || message.author;
    const member = message.guild.members.cache.get(user.id);

    // Récupérer les badges de l'utilisateur
    const userBadgesQuery = query(
        collection(db, "userBadges"),
        where("userId", "==", user.id)
    );
    const userBadgesSnapshot = await getDocs(userBadgesQuery);

    // Récupérer les détails complets des badges
    let badgesDetails = [];
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
        badgesDetails = (await Promise.all(badgePromises)).filter(badge => badge !== null);
    }

    if (badgesDetails.length > 0) {
        const badgesPerPage = 3;
        let currentPage = 0;
        const maxPages = Math.ceil(badgesDetails.length / badgesPerPage);

        // Fonction pour générer les embeds d'une page spécifique
        const generatePageEmbeds = (pageNumber) => {
            const start = pageNumber * badgesPerPage;
            const end = Math.min(start + badgesPerPage, badgesDetails.length);
            const pageBadges = badgesDetails.slice(start, end);

            const baseEmbed = new EmbedBuilder()
                .setColor(Math.floor(Math.random() * 0xFFFFFF))
                .setTitle(`Profil de ${user.username}`)
                .setThumbnail(user.displayAvatarURL({ dynamic: true }));

            return pageBadges.map((badge, index) => {
                const imageUrl = badge.imageFileName
                    ? `http://${process.env.IP}:${process.env.PORT}/assets/${badge.imageFileName}`
                    : null;

                return new EmbedBuilder()
                    .setColor(baseEmbed.data.color)
                    .setTitle(`🏅 ${badge.titre}`)
                    .addFields(
                        { name: "📝 Description", value: badge.description || "Pas de description", inline: false }
                    )
                    .setImage(imageUrl)
                    .setFooter({
                        text: `Page ${pageNumber + 1}/${maxPages} • Badge ${start + index + 1}/${badgesDetails.length}`,
                        iconURL: user.displayAvatarURL()
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
        const msg = await message.reply({
            embeds: generatePageEmbeds(currentPage),
            components: [createButtons(currentPage)]
        });

        // Création du collecteur de boutons
        const collector = msg.createMessageComponentCollector({
            filter: i => i.user.id === message.author.id,
            time: 60000
        });

        collector.on('collect', async i => {
            if (i.customId === 'previous') {
                currentPage = Math.max(0, currentPage - 1);
            } else if (i.customId === 'next') {
                currentPage = Math.min(maxPages - 1, currentPage + 1);
            }

            await i.update({
                embeds: generatePageEmbeds(currentPage),
                components: [createButtons(currentPage)]
            });
        });

        collector.on('end', () => {
            msg.edit({
                components: []
            }).catch(console.error);
        });
    } else {
        const profileEmbed = new EmbedBuilder()
            .setColor(Math.floor(Math.random() * 0xFFFFFF))
            .setTitle(`Profil de ${user.username}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields({ name: 'Badges :', value: 'Aucun badge', inline: false })
            .setTimestamp()
            .setFooter({ text: `ID: ${user.id}` });

        message.reply({ embeds: [profileEmbed] });
    }
}