import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import buildCommand from "../../utils/commandBuilder.js";
import db from "../../data/firebase.js";
import { collection, addDoc, DocumentReference } from "firebase/firestore";
import { addDays, addMonths, addYears, format, isBefore } from "date-fns";

export const addanim = buildCommand(
  new SlashCommandBuilder()
    .setName("addanim")
    .setDescription("Crée une animation (unique ou récurrente)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("titre")
        .setDescription("Titre de l'animation")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("Description de l'animation")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("datedebut")
        .setDescription("Date de début (YYYY-MM-DD)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("heuredebut")
        .setDescription("Heure de début (HHhMM)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("datefin")
        .setDescription("Date de fin (YYYY-MM-DD)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("heurefin")
        .setDescription("Heure de fin (HHhMM)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("frequence")
        .setDescription("Fréquence de répétition")
        .addChoices(
          { name: "Hebdomadaire", value: "hebdomadaire" },
          { name: "Mensuelle", value: "mensuelle" },
          { name: "Annuelle", value: "annuelle" }
        )
        .setRequired(false)
    ) as SlashCommandBuilder,

  async (interaction: ChatInputCommandInteraction) => {
    const titre = interaction.options.getString("titre", true);
    const description = interaction.options.getString("description", true);
    const dateDebut = interaction.options.getString("datedebut", true);
    const heureDebut = interaction.options.getString("heuredebut", true);
    const dateFin = interaction.options.getString("datefin", true);
    const heureFin = interaction.options.getString("heurefin", true);
    const frequence = interaction.options.getString("frequence");

    const now = new Date();
    const start = new Date(dateDebut + "T00:00:00");
    const end = new Date(dateFin + "T00:00:00");

    await interaction.deferReply();

    const animations: Promise<DocumentReference>[] = [];

    const addOccurrence = async (d1: Date, d2: Date) => {
      const dateDebutStr = format(d1, "yyyy-MM-dd");
      const dateFinStr = format(d2, "yyyy-MM-dd");

      animations.push(
        addDoc(collection(db, "anim"), {
          titre,
          description,
          dateDebut: dateDebutStr,
          heureDebut,
          dateFin: dateFinStr,
          heureFin,
          recurrence: frequence || null,
          createdAt: new Date(),
          createdBy: interaction.user.id,
        })
      );
    };

    if (!frequence) {
      await addOccurrence(start, end);
    } else {
      let current = new Date(start);
      const oneYearLater = new Date(now);
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

      while (isBefore(current, oneYearLater)) {
        let currentFin = new Date(end);
        let next: Date = current; // Initialize with current to avoid "used before assigned" error

        switch (frequence) {
          case "hebdomadaire":
            next = addDays(current, 7);
            currentFin = addDays(currentFin, 7);
            break;
          case "mensuelle":
            next = addMonths(current, 1);
            currentFin = addMonths(currentFin, 1);
            break;
          case "annuelle":
            next = addYears(current, 1);
            currentFin = addYears(currentFin, 1);
            break;
        }

        await addOccurrence(current, currentFin);
        current = next;
      }
    }

    await Promise.all(animations);

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x00ff00)
          .setTitle("✅ Animation(s) enregistrée(s)")
          .setDescription(
            frequence
              ? `L'animation **${titre}** a été enregistrée avec la fréquence **${frequence}** sur un an.`
              : `L'animation **${titre}** a été enregistrée.`
          )
          .setFooter({
            text: `Ajoutée par ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL(),
          }),
      ],
    });
  }
);
