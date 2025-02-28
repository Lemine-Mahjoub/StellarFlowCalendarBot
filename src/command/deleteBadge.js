import { db } from "../firebase.js";
import { collection, deleteDoc, query, where, getDocs, updateDoc } from "firebase/firestore";
import { EmbedBuilder } from "discord.js";

export const deleteBadge = async (message, args) => {
    const titre = args.join(" ");
    const q = query(collection(db, "badges"), where("titre", "==", titre));
    const querySnapshot = await getDocs(q);

    const embed = new EmbedBuilder()
        .setColor(querySnapshot.empty ? "#ff0000" : "#00ff00")
        .setTitle("Suppression de badge");

    if (querySnapshot.empty) {
        embed.setDescription(`❌ Le badge **${titre}** n'a pas été trouvé.`);
    } else {
        // Supprimer le badge de tous les utilisateurs qui le possèdent
        const usersQuery = query(collection(db, "users"), where("badges", "array-contains", titre));
        const usersSnapshot = await getDocs(usersQuery);

        await Promise.all([
            // Supprimer le badge
            ...querySnapshot.docs.map(doc => deleteDoc(doc.ref)),
            // Retirer le badge des utilisateurs
            ...usersSnapshot.docs.map(doc =>
                updateDoc(doc.ref, {
                    badges: doc.data().badges.filter(badge => badge !== titre)
                })
            )
        ]);

        embed.setDescription(`🗑️ Le badge **${titre}** a été supprimé avec succès et retiré de ${usersSnapshot.size} utilisateur(s).`);
    }

    await message.reply({ embeds: [embed] });
}
