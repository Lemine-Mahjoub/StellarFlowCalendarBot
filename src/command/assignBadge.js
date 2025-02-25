import { db } from "../firebase.js";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { EmbedBuilder } from "discord.js";

export const assignBadge = async (message, args) => {
    try {
        // Vérifier si les arguments sont présents
        if (args.length < 2) {
            throw new Error('Arguments manquants');
        }

        // Récupérer l'utilisateur mentionné
        const user = message.mentions.users.first();
        if (!user) {
            throw new Error('Utilisateur non trouvé');
        }

        // Récupérer le titre du badge (tout sauf le dernier argument qui est la mention)
        const badgeTitle = args.slice(0, -1).join(' ');

        // Vérifier si le badge existe
        const badgeQuery = query(collection(db, "badges"), where("titre", "==", badgeTitle));
        const badgeSnapshot = await getDocs(badgeQuery);

        if (badgeSnapshot.empty) {
            throw new Error('Badge non trouvé');
        }

        // Vérifier si l'utilisateur a déjà ce badge
        const userBadgeQuery = query(
            collection(db, "userBadges"),
            where("userId", "==", user.id),
            where("badgeTitle", "==", badgeTitle)
        );
        const userBadgeSnapshot = await getDocs(userBadgeQuery);

        if (!userBadgeSnapshot.empty) {
            throw new Error('L\'utilisateur possède déjà ce badge');
        }

        // Assigner le badge à l'utilisateur
        await addDoc(collection(db, "userBadges"), {
            userId: user.id,
            badgeTitle: badgeTitle,
            assignedAt: new Date(),
            assignedBy: message.author.id
        });

        // Créer l'embed de confirmation
        const embed = new EmbedBuilder()
            .setColor("#00ff00")
            .setTitle("✅ Badge assigné")
            .setDescription(`Le badge **${badgeTitle}** a été assigné à ${user.toString()} avec succès !`)
            .setFooter({
                text: `Assigné par ${message.author.tag}`,
                iconURL: message.author.displayAvatarURL()
            })
            .setTimestamp();

        await message.reply({ embeds: [embed] });

    } catch (error) {
        const errorEmbed = new EmbedBuilder()
            .setColor("#ff0000")
            .setTitle("❌ Erreur")
            .setDescription(error.message === 'Arguments manquants'
                ? "Usage: !assignBadge <titre du badge> @utilisateur"
                : error.message)
            .setFooter({
                text: `Erreur pour ${message.author.tag}`,
                iconURL: message.author.displayAvatarURL()
            });

        await message.reply({ embeds: [errorEmbed] });
    }
};
