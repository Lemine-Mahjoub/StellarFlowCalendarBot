import { db } from "../firebase.js";
import { collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import { EmbedBuilder } from "discord.js";

export const deleteCategorie = async (interaction, args) => {
    // Vérifie si le nom de la catégorie est fourni
    if (args.length === 0) {
        return interaction.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle("❌ Erreur")
                    .setDescription("Vous devez spécifier le nom de la catégorie à supprimer.")
            ]
        });
    }

    const categoryName = args.join(" "); // On récupère le nom de la catégorie à supprimer

    // Recherche des badges associés à la catégorie
    const badgesQuery = query(collection(db, "badges"), where("category", "==", categoryName));
    const querySnapshot = await getDocs(badgesQuery);

    if (!querySnapshot.empty) {
        // Si des badges sont associés à cette catégorie, on empêche la suppression
        return interaction.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle("❌ Erreur")
                    .setDescription(`La catégorie **${categoryName}** est associée à des badges et ne peut pas être supprimée.`)
            ]
        });
    }

    // Si aucun badge n'est associé, on supprime la catégorie (en supposant que la catégorie soit dans une collection "categories")
    const categoryRef = doc(db, "categories", categoryName);
    try {
        await deleteDoc(categoryRef); // Suppression de la catégorie de la base de données
        interaction.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle("✅ Succès")
                    .setDescription(`La catégorie **${categoryName}** a été supprimée avec succès.`)
            ]
        });
    } catch (error) {
        console.error("Erreur lors de la suppression de la catégorie :", error);
        interaction.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle("❌ Erreur")
                    .setDescription("Une erreur s'est produite lors de la suppression de la catégorie.")
            ]
        });
    }
}
