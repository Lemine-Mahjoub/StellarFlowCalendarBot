import { db } from "../firebase.js";
import { collection, addDoc } from "firebase/firestore";

export const addChallenge = async (message, args) => {
    const [dateDebut, dateFin, ...desc] = args;
    const nom = desc.splice(0, 1).join(" ");
    const description = desc.join(" ");
    const recompense = "Badge spécial";
    await addDoc(collection(db, "challenges"), { nom, description, dateDebut, dateFin, recompense });
    message.reply(`✅ Challenge **${nom}** ajouté !`);
}