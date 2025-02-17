import { db } from "../firebase.js";
import { collection, deleteDoc, query, where, getDocs } from "firebase/firestore";
import { EmbedBuilder } from "discord.js";

export const deleteAnimation = async (message, args) => {
    const nom = args.join(" ");
    const q = query(collection(db, "anim"), where("titre", "==", nom));
    const querySnapshot = await getDocs(q);

    const embed = new EmbedBuilder()
        .setColor(querySnapshot.empty ? "#ff0000" : "#00ff00")
        .setTitle("Suppression d'animation");

    if (querySnapshot.empty) {
        embed.setDescription(`❌ L'animation **${nom}** n'a pas été trouvée.`);
    } else {
        await Promise.all(querySnapshot.docs.map(doc => deleteDoc(doc.ref)));
        embed.setDescription(`🗑️ L'animation **${nom}** a été supprimée avec succès.`);
    }

    await message.reply({ embeds: [embed] });
}