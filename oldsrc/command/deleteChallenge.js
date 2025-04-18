import { db } from "../firebase.js";
import { collection, deleteDoc, query, where, getDocs } from "firebase/firestore";
import { EmbedBuilder } from "discord.js";

export const deleteChallenge = async (message, args) => {
    const nom = args.join(" ");
    const q = query(collection(db, "challenges"), where("nom", "==", nom));
    const querySnapshot = await getDocs(q);

    const embed = new EmbedBuilder()
        .setColor(querySnapshot.empty ? "#ff0000" : "#00ff00")
        .setTitle("Suppression de challenge");

    if (querySnapshot.empty) {
        embed.setDescription(`❌ Le challenge **${nom}** n'a pas été trouvé.`);
    } else {
        await Promise.all(querySnapshot.docs.map(doc => deleteDoc(doc.ref)));
        embed.setDescription(`🗑️ Le challenge **${nom}** a été supprimé avec succès.`);
    }

    await message.reply({ embeds: [embed] });
}