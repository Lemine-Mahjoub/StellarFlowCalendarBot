import { db } from "../firebase.js";
import { collection, addDoc, getDocs, query } from "firebase/firestore";
import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js'; // Mise à jour des imports
import { saveImage } from '../utils/imageHandler.js';

export const addBadge = async (message, args) => {
    try {
        // Demander le titre du badge
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

        // Demander la description du badge
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

        // Demander la catégorie (via un dropdown)
        const categoriesQuery = query(collection(db, "categories"));
        const categoriesSnapshot = await getDocs(categoriesQuery);
        const categories = categoriesSnapshot.docs.map(doc => doc.data().name);

        const categorySelectMenu = new StringSelectMenuBuilder()
            .setCustomId('category_select')
            .setPlaceholder('Choisissez une catégorie')
            .addOptions([
                ...categories.map(category => ({ label: category, value: category })),
                { label: 'Créer une nouvelle catégorie', value: 'create_new' }
            ]);

        const categoryMsg = await message.channel.send({
            embeds: [{
                color: 0x0099ff,
                title: '📂 Catégorie',
                description: 'Veuillez choisir une catégorie pour le badge ou créer une nouvelle catégorie.',
                footer: {
                    text: 'Répondez dans la minute',
                    icon_url: message.author.displayAvatarURL()
                }
            }],
            components: [new ActionRowBuilder().addComponents(categorySelectMenu)]
        });

        // Attendre la sélection de l'utilisateur
        const categoryFilter = (i) => i.user.id === message.author.id && i.isSelectMenu();
        const categoryResponse = await categoryMsg.awaitMessageComponent({ filter: categoryFilter, time: 60000 });

        let category = categoryResponse.values[0];

        if (category === 'create_new') {
            // Si l'utilisateur veut créer une nouvelle catégorie
            const newCategoryMsg = await message.channel.send({
                embeds: [{
                    color: 0x0099ff,
                    title: '🆕 Nouvelle catégorie',
                    description: 'Veuillez entrer le nom de la nouvelle catégorie.',
                    footer: {
                        text: 'Répondez dans la minute',
                        icon_url: message.author.displayAvatarURL()
                    }
                }]
            });

            const newCategoryResponse = await message.channel.awaitMessages({ filter: titreFilter, max: 1, time: 60000 });
            if (newCategoryResponse.size === 0) throw new Error('Temps écoulé');
            category = newCategoryResponse.first().content;

            // Sauvegarder la nouvelle catégorie dans Firestore
            await addDoc(collection(db, "categories"), {
                name: category,
                createdAt: new Date(),
                createdBy: message.author.id
            });

            await message.channel.send({
                embeds: [{
                    color: 0x00ff00,
                    title: '✅ Catégorie créée',
                    description: `La catégorie **${category}** a été créée avec succès.`,
                    footer: {
                        text: 'Créée par ' + message.author.tag,
                        icon_url: message.author.displayAvatarURL()
                    }
                }]
            });
        }

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

        // Résumé et confirmation
        const confirmationMsg = await message.channel.send({
            embeds: [{
                color: 0x0099ff,
                title: '📋 Résumé du badge',
                description: `**Titre:** ${titre}\n**Description:** ${description}\n**Catégorie:** ${category}${imageFileName ? '\n**Image:** Incluse ✅' : '\n**Image:** Aucune ❌'}\n\nCliquez sur les boutons ci-dessous pour confirmer ou annuler`,
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
        const confirmation = await confirmationMsg.awaitMessageComponent({ filter: confirmFilter, time: 30000 });

        if (confirmation.customId === 'confirm') {
            await addDoc(collection(db, "badges"), {
                titre,
                description,
                category,
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
                }],
                components: []
            });
        }
    } catch (error) {
        console.error('Erreur : ', error);
        await message.reply({
            embeds: [{
                color: 0xff0000,
                title: '❌ Erreur',
                description: 'Une erreur s\'est produite pendant le processus de création du badge. Veuillez réessayer.',
            }]
        });
    }
};
