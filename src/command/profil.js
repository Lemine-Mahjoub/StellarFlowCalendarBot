

export const profil = (message) => {
    const roles = message.member.roles.cache
            .filter(role => role.name !== '@everyone')
            .map(role => role.name)
            .join(', ');

        const profileEmbed = {
            color: Math.floor(Math.random() * 0xFFFFFF),
            title: `${message.author.username}'s Profile`,
            thumbnail: {
                url: message.author.displayAvatarURL({ dynamic: true })
            },
            fields: [
                {
                    name: 'Roles :',
                    value: roles || 'Aucun Roles',
                }
            ],
            timestamp: new Date(),
        footer: {
            text: `ID: ${message.author.id}`
        }
    };
    message.reply({ embeds: [profileEmbed] });
}