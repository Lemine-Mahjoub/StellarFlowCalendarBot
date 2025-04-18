import { db } from "../firebase.js";
import { collection, addDoc } from "firebase/firestore";

// Add these validation functions at the top of the file
const isValidDate = (dateStr) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date);
};

export const addChallenge = async (message, args) => {
    try {
        // Date de début avec validation
        let dateDebut;
        let dateDebutValid = false;
        while (!dateDebutValid) {
            const dateDebutMsg = await message.channel.send({
                embeds: [{
                    color: 0x0099ff,
                    title: '📅 Date de début',
                    description: 'Veuillez entrer la date de début du challenge (format: YYYY-MM-DD)',
                    footer: {
                        text: 'Répondez dans la minute',
                        icon_url: message.author.displayAvatarURL()
                    }
                }]
            });

            const dateDebutResponse = await message.channel.awaitMessages({
                filter: m => m.author.id === message.author.id,
                max: 1,
                time: 60000
            });

            if (dateDebutResponse.size === 0) throw new Error('Temps écoulé');

            dateDebut = dateDebutResponse.first().content;
            if (!isValidDate(dateDebut)) {
                await message.channel.send({
                    embeds: [{
                        color: 0xff0000,
                        title: '❌ Format invalide',
                        description: 'Le format de la date est invalide. Veuillez utiliser le format YYYY-MM-DD (exemple: 2024-03-20)',
                    }]
                });
            } else {
                dateDebutValid = true;
            }
        }

        // Date de fin avec validation
        let dateFin;
        let dateFinValid = false;
        while (!dateFinValid) {
            const dateFinMsg = await message.channel.send({
                embeds: [{
                    color: 0x0099ff,
                    title: '📅 Date de fin',
                    description: 'Veuillez entrer la date de fin du challenge (format: YYYY-MM-DD)',
                    footer: {
                        text: 'Répondez dans la minute',
                        icon_url: message.author.displayAvatarURL()
                    }
                }]
            });

            const dateFinResponse = await message.channel.awaitMessages({
                filter: m => m.author.id === message.author.id,
                max: 1,
                time: 60000
            });

            if (dateFinResponse.size === 0) throw new Error('Temps écoulé');

            dateFin = dateFinResponse.first().content;
            if (!isValidDate(dateFin)) {
                await message.channel.send({
                    embeds: [{
                        color: 0xff0000,
                        title: '❌ Format invalide',
                        description: 'Le format de la date est invalide. Veuillez utiliser le format YYYY-MM-DD (exemple: 2024-03-20)',
                    }]
                });
            } else {
                dateFinValid = true;
            }
        }

        // Demande du nom
        const nomMsg = await message.channel.send({
            embeds: [{
                color: 0x0099ff,
                title: '📝 Nom du challenge',
                description: 'Veuillez entrer le nom du challenge',
                footer: {
                    text: 'Répondez dans la minute',
                    icon_url: message.author.displayAvatarURL()
                }
            }]
        });

        const nomFilter = m => m.author.id === message.author.id;
        const nomResponse = await message.channel.awaitMessages({ filter: nomFilter, max: 1, time: 60000 });
        if (nomResponse.size === 0) throw new Error('Temps écoulé');
        const nom = nomResponse.first().content;

        // Demande de la description
        const descMsg = await message.channel.send({
            embeds: [{
                color: 0x0099ff,
                title: '📝 Description',
                description: 'Veuillez entrer la description du challenge',
                footer: {
                    text: 'Répondez dans la minute',
                    icon_url: message.author.displayAvatarURL()
                }
            }]
        });

        const descFilter = m => m.author.id === message.author.id;
        const descResponse = await message.channel.awaitMessages({ filter: descFilter, max: 1, time: 60000 });
        if (descResponse.size === 0) throw new Error('Temps écoulé');
        const description = descResponse.first().content;

        // Demande de la récompense
        const recompenseMsg = await message.channel.send({
            embeds: [{
                color: 0x0099ff,
                title: '🏆 Récompense',
                description: 'Veuillez entrer la récompense du challenge',
                footer: {
                    text: 'Répondez dans la minute',
                    icon_url: message.author.displayAvatarURL()
                }
            }]
        });

        const recompenseFilter = m => m.author.id === message.author.id;
        const recompenseResponse = await message.channel.awaitMessages({ filter: recompenseFilter, max: 1, time: 60000 });
        if (recompenseResponse.size === 0) throw new Error('Temps écoulé');
        const recompense = recompenseResponse.first().content;

        // Affichage du résumé et demande de confirmation
        const confirmationMsg = await message.channel.send({
            embeds: [{
                color: 0x0099ff,
                title: '📋 Résumé du challenge',
                description: `**Nom:** ${nom}\n**Description:** ${description}\n**Date de début:** ${dateDebut}\n**Date de fin:** ${dateFin}\n**Récompense:** ${recompense}\n\nCliquez sur les boutons ci-dessous pour confirmer ou annuler`,
                footer: {
                    text: 'Vous avez 30 secondes pour répondre',
                    icon_url: message.author.displayAvatarURL()
                }
            }],
            components: [{
                type: 1,
                components: [
                    {
                        type: 2,
                        style: 3,
                        label: 'Valider',
                        custom_id: 'confirm',
                        emoji: '✅'
                    },
                    {
                        type: 2,
                        style: 4,
                        label: 'Annuler',
                        custom_id: 'cancel',
                        emoji: '❌'
                    }
                ]
            }]
        });

        const confirmFilter = (interaction) => interaction.user.id === message.author.id;
        try {
            const confirmation = await confirmationMsg.awaitMessageComponent({ filter: confirmFilter, time: 60000 });

            if (confirmation.customId === 'confirm') {
                await addDoc(collection(db, "challenges"), {
                    nom,
                    description,
                    dateDebut,
                    dateFin,
                    recompense,
                    createdAt: new Date(),
                    createdBy: message.author.id
                });

                await confirmation.update({
                    embeds: [{
                        color: 0x00ff00,
                        title: '✅ Challenge créé avec succès !',
                        description: `Le challenge **${nom}** a été ajouté à la base de données.`,
                        footer: {
                            text: 'Créé par ' + message.author.tag,
                            icon_url: message.author.displayAvatarURL()
                        },
                        timestamp: new Date()
                    }],
                    components: []
                });
            } else {
                await confirmation.update({
                    embeds: [{
                        color: 0xff0000,
                        title: '❌ Création annulée',
                        description: 'La création du challenge a été annulée.',
                        footer: {
                            text: 'Annulé par ' + message.author.tag,
                            icon_url: message.author.displayAvatarURL()
                        }
                    }],
                    components: []
                });
            }
        } catch (error) {
            await confirmationMsg.edit({
                embeds: [{
                    color: 0xff0000,
                    title: '❌ Temps écoulé',
                    description: 'Vous n\'avez pas répondu à temps.',
                    footer: {
                        text: 'Temps écoulé pour ' + message.author.tag,
                        icon_url: message.author.displayAvatarURL()
                    }
                }],
                components: []
            });
            throw new Error('Temps écoulé');
        }
    } catch (error) {
        await message.channel.send({
            embeds: [{
                color: 0xff0000,
                title: '❌ Erreur',
                description: 'Une erreur est survenue ou le temps de réponse est écoulé. Veuillez réessayer.',
                footer: {
                    text: 'Erreur pour ' + message.author.tag,
                    icon_url: message.author.displayAvatarURL()
                }
            }]
        });
    }
}