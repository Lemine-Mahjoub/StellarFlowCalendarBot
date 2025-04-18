import { db } from "../firebase.js";
import { collection, addDoc } from "firebase/firestore";

// Fonction de validation de date
const isValidDate = (dateStr) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date);
};

// Fonction de validation d'heure
const isValidTime = (timeStr) => {
    const regex = /^([0-1]?[0-9]|2[0-3])h[0-5][0-9]$/;
    return regex.test(timeStr);
};

export const addAnimation = async (message, args) => {
    try {
        // Date de début
        let dateDebut;
        let dateDebutValid = false;
        while (!dateDebutValid) {
            const dateDebutMsg = await message.channel.send({
                embeds: [{
                    color: 0x0099ff,
                    title: '📅 Date de début',
                    description: 'Veuillez entrer la date de début de l\'animation (format: YYYY-MM-DD)',
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

        // Heure de début
        let heureDebut;
        let heureDebutValid = false;
        while (!heureDebutValid) {
            const heureDebutMsg = await message.channel.send({
                embeds: [{
                    color: 0x0099ff,
                    title: '⏰ Heure de début',
                    description: 'Veuillez entrer l\'heure de début de l\'animation (format: HHhMM)',
                    footer: {
                        text: 'Répondez dans la minute',
                        icon_url: message.author.displayAvatarURL()
                    }
                }]
            });

            const heureDebutResponse = await message.channel.awaitMessages({
                filter: m => m.author.id === message.author.id,
                max: 1,
                time: 60000
            });

            if (heureDebutResponse.size === 0) throw new Error('Temps écoulé');

            heureDebut = heureDebutResponse.first().content;
            if (!isValidTime(heureDebut)) {
                await message.channel.send({
                    embeds: [{
                        color: 0xff0000,
                        title: '❌ Format invalide',
                        description: 'Le format de l\'heure est invalide. Veuillez utiliser le format HHhMM (exemple: 14h30)',
                    }]
                });
            } else {
                heureDebutValid = true;
            }
        }

        // Date de fin
        let dateFin;
        let dateFinValid = false;
        while (!dateFinValid) {
            const dateFinMsg = await message.channel.send({
                embeds: [{
                    color: 0x0099ff,
                    title: '📅 Date de fin',
                    description: 'Veuillez entrer la date de fin de l\'animation (format: YYYY-MM-DD)',
                    footer: {
                        text: 'Répondez dans la minute',
                        icon_url: message.author.displayAvatarURL()
                    }
                }]
            });

            const dateFinResponse = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 60000 });
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

        // Heure de fin
        let heureFin;
        let heureFinValid = false;
        while (!heureFinValid) {
            const heureFinMsg = await message.channel.send({
                embeds: [{
                    color: 0x0099ff,
                    title: '⏰ Heure de fin',
                    description: 'Veuillez entrer l\'heure de fin de l\'animation (format: HHhMM)',
                    footer: {
                        text: 'Répondez dans la minute',
                        icon_url: message.author.displayAvatarURL()
                    }
                }]
            });

            const heureFinResponse = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 60000 });
            if (heureFinResponse.size === 0) throw new Error('Temps écoulé');

            heureFin = heureFinResponse.first().content;
            if (!isValidTime(heureFin)) {
                await message.channel.send({
                    embeds: [{
                        color: 0xff0000,
                        title: '❌ Format invalide',
                        description: 'Le format de l\'heure est invalide. Veuillez utiliser le format HHhMM (exemple: 14h30)',
                    }]
                });
            } else {
                heureFinValid = true;
            }
        }

        // Titre
        const titreMsg = await message.channel.send({
            embeds: [{
                color: 0x0099ff,
                title: '📝 Titre de l\'animation',
                description: 'Veuillez entrer le titre de l\'animation',
                footer: {
                    text: 'Répondez dans la minute',
                    icon_url: message.author.displayAvatarURL()
                }
            }]
        });

        const titreFilter = m => m.author.id === message.author.id;
        const titreResponse = await message.channel.awaitMessages({ filter: titreFilter, max: 1, time: 60000 });
        if (titreResponse.size === 0) throw new Error('Temps écoulé');
        const titre = titreResponse.first().content;

        // Description
        const descMsg = await message.channel.send({
            embeds: [{
                color: 0x0099ff,
                title: '📝 Description',
                description: 'Veuillez entrer la description de l\'animation',
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

        // Résumé et confirmation
        const confirmationMsg = await message.channel.send({
            embeds: [{
                color: 0x0099ff,
                title: '📋 Résumé de l\'animation',
                description: `**Titre:** ${titre}\n**Description:** ${description}\n**Date de début:** ${dateDebut} à ${heureDebut}\n**Date de fin:** ${dateFin} à ${heureFin}`,
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
            const confirmation = await confirmationMsg.awaitMessageComponent({ filter: confirmFilter, time: 30000 });

            if (confirmation.customId === 'confirm') {
                await addDoc(collection(db, "anim"), {
                    titre,
                    description,
                    dateDebut,
                    heureDebut,
                    dateFin,
                    heureFin,
                    createdAt: new Date(),
                    createdBy: message.author.id
                });

                await confirmation.update({
                    embeds: [{
                        color: 0x00ff00,
                        title: '✅ Animation créée avec succès !',
                        description: `L'animation **${titre}** a été ajoutée à la base de données.`,
                        footer: {
                            text: 'Créée par ' + message.author.tag,
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
                        description: 'La création de l\'animation a été annulée.',
                        footer: {
                            text: 'Annulée par ' + message.author.tag,
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