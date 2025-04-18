import { db } from "../firebase.js";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export const challenge = async (message) => {
    const q = query(collection(db, "challenges"), orderBy("dateFin", "desc"));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        // Filtrer les challenges non expirés
        const currentDate = new Date();
        const activeChallengeDocs = querySnapshot.docs.filter(doc => {
            const challenge = doc.data();
            const endDate = new Date(challenge.dateFin);
            return endDate >= currentDate;
        });

        if (activeChallengeDocs.length > 0) {
            await message.channel.send({
                embeds: [{
                    color: 0x0099ff,
                    title: "📋 Liste des Challenges",
                    description: "Voici les challenges en cours et à venir",
                    footer: {
                        text: "Demandé par " + message.author.tag,
                        icon_url: message.author.displayAvatarURL()
                    },
                    fields: activeChallengeDocs.map(doc => {
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
            // Si tous les challenges sont expirés
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