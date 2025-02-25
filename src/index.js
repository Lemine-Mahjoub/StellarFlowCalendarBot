import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import { commandes } from "./constant.js";
import { profil, semaine, challenge, addChallenge, deleteChallenge, addAnimation, deleteAnimation, anim, help, addBadge, deleteBadge, badge, assignBadge, unassignBadge } from "./command/index.js";
import { isAdmin } from "./lib.js";

dotenv.config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once("ready", () => {
    console.log(`✅ Connecté en tant que ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    const args = message.content.split(" ");
    const command = args.shift().toLowerCase();

    if (command === commandes.profil) {
        profil(message);
    }
    if (command === commandes.semaine) {
        semaine(message);
    }

    if (command === commandes.challenge) {
        challenge(message);
    }

    if (command === commandes.addChallenge && isAdmin(message)) {
        addChallenge(message, args);
    }

    if (command === commandes.deleteChallenge && isAdmin(message)) {
        deleteChallenge(message, args);
    }

    if (command === commandes.addAnim && isAdmin(message)) {
        addAnimation(message, args);
    }

    if (command === commandes.deleteAnim && isAdmin(message)) {
        deleteAnimation(message, args);
    }

    if (command === commandes.badge) {
        badge(message);
    }

    if (command === commandes.addBadge && isAdmin(message)) {
        addBadge(message, args);
    }

    if (command === commandes.deleteBadge && isAdmin(message)) {
        deleteBadge(message, args);
    }

    if (command === commandes.anim) {
        anim(message);
    }

    if (command === commandes.help) {
        help(message);
    }

    if (command === commandes.assignBadge && isAdmin(message)) {
        assignBadge(message, args);
    }

    if (command === commandes.unassignBadge && isAdmin(message)) {
        unassignBadge(message, args);
    }
});

client.login(process.env.DISCORD_TOKEN);