import { db } from "../firebase.js";
import { collection, deleteDoc, query, where, getDocs } from "firebase/firestore";
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
        await Promise.all(querySnapshot.docs.map(doc => deleteDoc(doc.ref)));
        embed.setDescription(`🗑️ Le badge **${titre}** a été supprimé avec succès.`);
    }

    await message.reply({ embeds: [embed] });
}
