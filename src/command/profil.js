import { db } from "../firebase.js";
import { collection, query, where, getDocs } from "firebase/firestore";

export const profil = async (message) => {
    // Get the mentioned user or default to message author
    const user = message.mentions.users.first() || message.author;
    const member = message.guild.members.cache.get(user.id);

    const roles = member.roles.cache
        .filter(role => role.name !== '@everyone')
        .map(role => role.name)
        .join(', ');

    // Récupérer les badges de l'utilisateur
    const userBadgesQuery = query(
        collection(db, "userBadges"),
        where("userId", "==", user.id)
    );
    const userBadgesSnapshot = await getDocs(userBadgesQuery);

    // Créer la liste des badges
    const badges = userBadgesSnapshot.empty
        ? 'Aucun badge'
        : userBadgesSnapshot.docs.map(doc => `✨ ${doc.data().badgeTitle}`).join('\n');

    const profileEmbed = {
        color: Math.floor(Math.random() * 0xFFFFFF),
        title: `${user.username}'s Profile`,
        thumbnail: {
            url: user.displayAvatarURL({ dynamic: true })
        },
        fields: [
            {
                name: 'Roles :',
                value: roles || 'Aucun Roles',
                inline: false
            },
            {
                name: 'Badges :',
                value: badges,
                inline: false
            }
        ],
        timestamp: new Date(),
        footer: {
            text: `ID: ${user.id}`
        }
    };

    message.reply({ embeds: [profileEmbed] });
}