import { db } from "../firebase.js";
import { collection, deleteDoc, query, where, getDocs } from "firebase/firestore";

export const deleteAnimation = async (message, args) => {
    const nom = args.join(" ");
    const q = query(collection(db, "animations"), where("nom", "==", nom));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => await deleteDoc(doc.ref));
    message.reply(`🗑️ Animation **${nom}** supprimée.`);
}