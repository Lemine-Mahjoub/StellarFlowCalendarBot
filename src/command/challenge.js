import { db } from "../firebase.js";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export const challenge = async (message) => {
    const q = query(collection(db, "challenges"), orderBy("dateFin", "desc"));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        await message.channel.send({
            embeds: [{
                color: 0x0099ff,
                title: "📋 Liste des Challenges",
                description: "Voici les challenges en cours et à venir",
                footer: {
                    text: "Demandé par " + message.author.tag,
                    icon_url: message.author.displayAvatarURL()
                },
                fields: querySnapshot.docs.map(doc => {
                    const challenge = doc.data();
                    return {
                        name: `✨ ${challenge.nom}`,
                        value: `🎯 **Description:** ${challenge.description}\n⏳ **Période:** Du ${challenge.dateDebut} au ${challenge.dateFin}\n🏆 **Récompense:** ${challenge.recompense}`,
                        inline: false
                    };
                })
            }]
        });
    } else {
        await message.channel.send({
            embeds: [{
                color: 0x0099ff,
                title: "📋 Liste des Challenges",
                description: "❌ Aucun challenge n'est en cours pour le moment.",
                footer: {
                    text: "Demandé par " + message.author.tag,
                    icon_url: message.author.displayAvatarURL()
                }
            }]
        });
    }
}