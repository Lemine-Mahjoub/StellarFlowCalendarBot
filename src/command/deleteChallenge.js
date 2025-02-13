import { db } from "../firebase.js";
import { collection, deleteDoc } from "firebase/firestore";

export const deleteChallenge = async (message, args) => {
    const nom = args.join(" ");
    const q = query(collection(db, "challenges"), where("nom", "==", nom));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => await deleteDoc(doc.ref));
    message.reply(`🗑️ Challenge **${nom}** supprimé.`);
}