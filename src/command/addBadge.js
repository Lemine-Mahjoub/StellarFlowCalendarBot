import { db } from "../firebase.js";
import { collection, addDoc } from "firebase/firestore";
import { saveImage } from '../utils/imageHandler.js';

export const addBadge = async (message, args) => {
    try {
        const titreMsg = await message.channel.send({
            embeds: [{
                color: 0x0099ff,
                title: '🏅 Titre du badge',
                description: 'Veuillez entrer le titre du badge',
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

        // Demande de la description
        const descMsg = await message.channel.send({
            embeds: [{
                color: 0x0099ff,
                title: '📝 Description',
                description: 'Veuillez entrer la description du badge',
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

        // Demande de l'image (optionnelle)
        const imageMsg = await message.channel.send({
            embeds: [{
                color: 0x0099ff,
                title: '🖼️ Image du badge',
                description: 'Envoyez une image pour le badge (optionnel). Envoyez "skip" pour passer cette étape.',
                footer: {
                    text: 'Répondez dans la minute',
                    icon_url: message.author.displayAvatarURL()
                }
            }]
        });

        const imageFilter = m => m.author.id === message.author.id;
        const imageResponse = await message.channel.awaitMessages({ filter: imageFilter, max: 1, time: 60000 });
        if (imageResponse.size === 0) throw new Error('Temps écoulé');

        let imageFileName = null;
        if (imageResponse.first().content.toLowerCase() !== 'skip') {
            const attachment = imageResponse.first().attachments.first();
            if (attachment && attachment.contentType?.startsWith('image/')) {
                try {
                    imageFileName = await saveImage(attachment.url);
                    if (!imageFileName) {
                        await message.channel.send({
                            embeds: [{
                                color: 0xff0000,
                                title: '❌ Erreur',
                                description: 'L\'image n\'a pas pu être sauvegardée. Le badge sera créé sans image.',
                            }]
                        });
                    }
                } catch (error) {
                    console.error('Erreur lors de la sauvegarde de l\'image:', error);
                    await message.channel.send({
                        embeds: [{
                            color: 0xff0000,
                            title: '❌ Erreur',
                            description: 'L\'image n\'a pas pu être sauvegardée. Le badge sera créé sans image.',
                        }]
                    });
                }
            } else if (!attachment) {
                await message.channel.send({
                    embeds: [{
                        color: 0xff0000,
                        title: '❌ Erreur',
                        description: 'Aucune image n\'a été fournie. Le badge sera créé sans image.',
                    }]
                });
            }
        }

        // Affichage du résumé et demande de confirmation
        const confirmationMsg = await message.channel.send({
            embeds: [{
                color: 0x0099ff,
                title: '📋 Résumé du badge',
                description: `**Titre:** ${titre}\n**Description:** ${description}${imageFileName ? '\n**Image:** Incluse ✅' : '\n**Image:** Aucune ❌'}\n\nCliquez sur les boutons ci-dessous pour confirmer ou annuler`,
                image: imageFileName ? { url: `attachment://${imageFileName}` } : null,
                footer: {
                    text: 'Vous avez 30 secondes pour répondre',
                    icon_url: message.author.displayAvatarURL()
                }
            }],
            files: imageFileName ? [{
                attachment: `./src/assets/${imageFileName}`,
                name: imageFileName
            }] : [],
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
                await addDoc(collection(db, "badges"), {
                    titre,
                    description,
                    imageFileName,
                    createdAt: new Date(),
                    createdBy: message.author.id
                });

                await confirmation.update({
                    embeds: [{
                        color: 0x00ff00,
                        title: '✅ Badge créé avec succès !',
                        description: `Le badge **${titre}** a été ajouté à la base de données.`,
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
                        description: 'La création du badge a été annulée.',
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
