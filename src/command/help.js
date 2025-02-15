import { helpMessage, stellarFlowIcon } from "../constant.js";

export const help = async (message) => {
    await message.channel.send({
        embeds: [{
            color: 0x0099ff,
            title: helpMessage.title,
            description: helpMessage.description,
            footer: {
                text: "Demande par " + message.author.tag,
                icon_url: message.author.displayAvatarURL()
            },
            fields: helpMessage.commands.map(command => ({
                name: command.name,
                value: `Usage: ${command.usage}\nDescription: ${command.description}`,
                inline: false
            })),
            thumbnail: {
                url: stellarFlowIcon
            }
        }]
    });
}