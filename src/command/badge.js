import { db } from "../firebase.js";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export const badge = async (message) => {
    const q = query(collection(db, "badges"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        await message.channel.send({
            embeds: [{
                color: 0x0099ff,
                title: "🏅 Liste des Badges",
                description: "Voici la liste des badges disponibles",
                footer: {
                    text: "Demandé par " + message.author.tag,
                    icon_url: message.author.displayAvatarURL()
                },
                fields: querySnapshot.docs.map(doc => {
                    const badge = doc.data();
                    return {
                        name: `✨ ${badge.titre}`,
                        value: `📝 **Description:** ${badge.description}`,
                        inline: false
                    };
                })
            }]
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
