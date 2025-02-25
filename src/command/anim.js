import { db } from "../firebase.js";
import { collection, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore";

export const anim = async (message) => {
    const q = query(collection(db, "anim"), orderBy("dateDebut", "asc"));
    const querySnapshot = await getDocs(q);

    // Filtrer et supprimer les animations expirées
    const currentDate = new Date();
    const validDocs = [];

    for (const document of querySnapshot.docs) {
        const animation = document.data();
        const endDate = new Date(`${animation.dateFin} ${animation.heureFin}`);

        if (endDate < currentDate) {
            // Supprimer l'animation expirée
            await deleteDoc(doc(db, "anim", document.id));
        } else {
            validDocs.push(document);
        }
    }

    if (validDocs.length > 0) {
        await message.channel.send({
            embeds: [{
                color: 0x0099ff,
                title: "📅 Planning des Animations",
                description: "Voici les animations prévues",
                footer: {
                    text: "Demandé par " + message.author.tag,
                    icon_url: message.author.displayAvatarURL()
                },
                fields: validDocs.map(doc => {
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
