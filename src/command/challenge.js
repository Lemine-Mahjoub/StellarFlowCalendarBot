import { db } from "../firebase.js";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

export const challenge = async (message) => {
    const q = query(collection(db, "challenges"), orderBy("dateFin", "desc"), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const { nom, description, dateFin, recompense } = querySnapshot.docs[0].data();
        message.reply(`✨ **Challenge en cours :** ${nom}\n🎯 ${description}\n⏳ Fin : ${dateFin}\n🏆 Récompense : ${recompense}`);
    } else {
        message.reply("Aucun challenge en cours.");
    }
}