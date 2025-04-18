import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  TextBasedChannel,
} from "discord.js";
import buildCommand from "../../utils/commandBuilder.js";

const questionnaires = [
  `
Bonjour,
Merci à toi d'avoir ouvert ce ticket, tu peux aussi prendre tes rôles obligatoires (4 exactement ^^) dans <#1329103524348432474>
Ci-dessous je vais te faire parvenir un questionnaire. Il peut paraître un peu long, mais il est vraiment fait pour apprendre à te connaître. Après, on n’aura plus de questions promis 😄
Merci d'avance,`,
  `
**Présentation de toi :**
Prénom ou Pseudo :
Âge :
Quelle est ton activité principale ?
Quelles sont tes passions ?

**Activité physique et objectifs de bien-être :**
Quel est ton niveau actuel d'activité physique ? (sédentaire, modéré, très actif)
Quels sont tes objectifs en matière de bien-être ? (perte de poids, gain musculaire, amélioration de la condition physique, mieux-être mental, etc.)
As-tu des habitudes sportives régulières ? Si oui, lesquelles ?
Comment te sens-tu généralement après une activité physique ou un entraînement ?

**Bien-être mental et émotions :**
Te sens-tu à l'aise avec tes propres émotions ?
Est-ce que l'anxiété te gagne souvent au quotidien ?
As-tu déjà expérimenté des techniques de relaxation ou de méditation ?
Quel rôle joue l'aspect mental dans ton parcours de bien-être ? (confiance en soi, gestion du stress, etc.)
Quelle place accordes-tu à la gestion du stress dans ton quotidien ?

**Alimentation et santé :**
Comment gères-tu ton alimentation ? Suis-tu un régime particulier ou cherches-tu à améliorer tes habitudes alimentaires ?
Quelles sont les principales difficultés que tu rencontres en matière de gestion du poids ?
Es-tu à l’aise avec ton corps tel qu’il est aujourd’hui ?`,
  `**Philosophie et opinions :**
Selon toi, dans une discussion, faut-il privilégier la vérité avant les susceptibilités de chacun ?
Quelle est ta vision des mouvements féministes ou de l'égalité des genres ?

**Interactions avec les autres :**
Es-tu à l'aise pour échanger en vocal avec les autres ?
Quel emoji représenterait le mieux ton humeur actuelle ?

**Défis personnels et santé mentale :**
As-tu déjà rencontré des défis ou obstacles dans ton parcours de santé et de bien-être ? Si oui, lesquels ?
As-tu déjà été diagnostiqué(e) ou as-tu ressenti des difficultés liées à des troubles comme le TDAH, le trouble borderline, les TCA, ou d'autres troubles similaires ? Si oui, lesquels ?
Qu’est-ce qui te motive à atteindre tes objectifs de bien-être et de forme physique ?

N'hésite pas à copier-coller les paragraphes pour répondre aux questions, ça sera plus simple et rapide ! Merci à toi pour ta patience 💖`,
];

export const questionnaire = buildCommand(
  new SlashCommandBuilder()
    .setName("questionnaire")
    .setDescription("Envoie le questionnaire de bienvenue en 3 parties")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply({ content: questionnaires[0], ephemeral: false });

    const channel = interaction.channel;

    if (!channel?.isTextBased()) return;

    const textChannel = channel as any;

    for (let i = 1; i < questionnaires.length; i++) {
      await textChannel.send({ content: questionnaires[i] });
    }
  }
);
