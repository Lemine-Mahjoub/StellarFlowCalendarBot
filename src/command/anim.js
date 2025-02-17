import { db } from "../firebase.js";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export const anim = async (message) => {
    const q = query(collection(db, "anim"), orderBy("dateDebut", "asc"));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        await message.channel.send({
            embeds: [{
                color: 0x0099ff,
                title: "📅 Planning des Animations",
                description: "Voici les animations prévues",
                footer: {
                    text: "Demandé par " + message.author.tag,
                    icon_url: message.author.displayAvatarURL()
                },
                fields: querySnapshot.docs.map(doc => {
                    const animation = doc.data();
                    return {
                        name: `📌 ${animation.dateDebut}`,
                        value: `⏰ **Heure:** ${animation.heureDebut}\n✨ **Animation:** ${animation.titre}\n📝 **Description:** ${animation.description}\n🔚 **Fin:** ${animation.dateFin} à ${animation.heureFin}`,
                        inline: false
                    };
                })
            }]
        });
    } else {
        await message.channel.send({
            embeds: [{
                color: 0x0099ff,
                title: "📅 Planning des Animations",
                description: "❌ Aucune animation n'est prévue pour le moment.",
                footer: {
                    text: "Demandé par " + message.author.tag,
                    icon_url: message.author.displayAvatarURL()
                }
            }]
        });
    }
}
