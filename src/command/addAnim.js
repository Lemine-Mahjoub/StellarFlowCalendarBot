import { db } from "../firebase.js";
import { collection, addDoc } from "firebase/firestore";

export const addAnimation = async (message, args) => {
    const [date, heure, ...nom] = args;

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
        return message.reply("❌ Format de date invalide. Utilisez le format YYYY-MM-DD (ex: 2024-03-25)");
    }

    // Validate if it's a real date
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
        return message.reply("❌ Date invalide");
    }

    // Validate time format (HHhMM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3])h[0-5][0-9]$/;
    if (!timeRegex.test(heure)) {
        return message.reply("❌ Format d'heure invalide. Utilisez le format HHhMM (ex: 14h30)");
    }

    // Validate that we have a name
    if (nom.length === 0) {
        return message.reply("❌ Veuillez spécifier un nom pour l'animation");
    }

    try {
        await addDoc(collection(db, "animations"), {
            date,
            heure,
            nom: nom.join(" ")
        });
        message.reply(`✅ Animation **${nom.join(" ")}** ajoutée pour le ${date} à ${heure} !`);
    } catch (error) {
        console.error("Error adding animation:", error);
        message.reply("❌ Une erreur est survenue lors de l'ajout de l'animation");
    }
}