import { db } from "../firebase.js";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export const anim = async (message) => {
    const q = query(collection(db, "animations"), orderBy("date"));
    const querySnapshot = await getDocs(q);
    let schedule = "📅 **Planning de la semaine**\n\n";
    querySnapshot.forEach(doc => {
        const { date, heure, nom } = doc.data();
        schedule += `📌 **${date}** - ⏰ ${heure} : ${nom}\n`;
    });
    message.reply(schedule || "Aucune animation prévue cette semaine.");
}
