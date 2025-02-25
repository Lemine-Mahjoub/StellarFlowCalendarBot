import { db } from "../firebase.js";
import { collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { EmbedBuilder } from "discord.js";

export const unassignBadge = async (message, args) => {
    try {
        // Vérifier si les arguments sont valides
        if (args.length < 2) {
            throw new Error('Arguments insuffisants');
        }

        // Récupérer l'utilisateur mentionné
        const user = message.mentions.users.first();
        if (!user) {
            throw new Error('Utilisateur non trouvé');
        }

        // Récupérer le titre du badge (tous les arguments sauf le dernier qui est la mention)
        const badgeTitle = args.slice(0, -1).join(' ');

        // Rechercher le badge dans la base de données
        const badgeQuery = query(collection(db, "badges"), where("titre", "==", badgeTitle));
        const badgeSnapshot = await getDocs(badgeQuery);

        if (badgeSnapshot.empty) {
            throw new Error('Badge non trouvé');
        }

        // Rechercher l'utilisateur dans la collection des utilisateurs
        const userQuery = query(collection(db, "users"), where("userId", "==", user.id));
        const userSnapshot = await getDocs(userQuery);

        const embed = new EmbedBuilder()
            .setTitle("Retrait de badge")
            .setTimestamp();

        if (userSnapshot.empty) {
            embed.setColor("#ff0000")
                .setDescription(`❌ L'utilisateur ${user.tag} n'a pas de badges.`);
        } else {
            const userDoc = userSnapshot.docs[0];
            const userData = userDoc.data();
            const badges = userData.badges || [];

            // Vérifier si l'utilisateur a le badge
            if (!badges.includes(badgeTitle)) {
                embed.setColor("#ff0000")
                    .setDescription(`❌ L'utilisateur ${user.tag} n'a pas le badge **${badgeTitle}**.`);
            } else {
                // Retirer le badge
                const updatedBadges = badges.filter(badge => badge !== badgeTitle);
                await updateDoc(userDoc.ref, { badges: updatedBadges });

                embed.setColor("#00ff00")
                    .setDescription(`✅ Le badge **${badgeTitle}** a été retiré de ${user.tag}.`);
            }
        }

        await message.reply({ embeds: [embed] });

    } catch (error) {
        const errorEmbed = new EmbedBuilder()
            .setColor("#ff0000")
            .setTitle("❌ Erreur")
            .setDescription(error.message === 'Arguments insuffisants'
                ? "Usage: !unassignbadge <titre du badge> @utilisateur"
                : error.message)
            .setFooter({
                text: message.author.tag,
                iconURL: message.author.displayAvatarURL()
            });

        await message.reply({ embeds: [errorEmbed] });
    }
};