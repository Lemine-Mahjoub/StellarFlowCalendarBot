import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";
import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import db from "../../data/firebase.js";
import buildCommand from "../../utils/commandBuilder.js";

export const challenge = buildCommand(
  new SlashCommandBuilder()
    .setName("challenge")
    .setDescription("Affiche la liste des challenges en cours et à venir"),

  async (interaction: any) => {
    await interaction.deferReply();

    const now = new Date();
    const snapshot = await getDocs(
      query(collection(db, "challenges"), orderBy("dateFin", "asc"))
    );

    if (snapshot.empty) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xff9900)
            .setTitle("📋 Aucun challenge trouvé")
            .setDescription(
              "Il n'y a actuellement aucun challenge enregistré."
            ),
        ],
      });
    }

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("📋 Challenges en cours / à venir")
      .setTimestamp();

    const validChallenges = [];
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const endDate = new Date(data.dateFin);
      if (endDate < now) {
        await deleteDoc(doc(db, "challenges", docSnap.id));
        continue;
      }
      validChallenges.push(data);
      embed.addFields({
        name: `🏆 ${data.nom}`,
        value: `📅 **${data.dateDebut}** → **${data.dateFin}**\n📝 ${data.description}\n🎁 Récompense : ${data.recompense}`,
        inline: false,
      });
    }

    if (validChallenges.length === 0) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xff9900)
            .setTitle("📋 Aucun challenge à venir")
            .setDescription(
              "Tous les challenges ont expiré et ont été supprimés."
            ),
        ],
      });
    }

    await interaction.editReply({ embeds: [embed] });
  }
);
