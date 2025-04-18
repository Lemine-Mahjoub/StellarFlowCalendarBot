import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  ChannelType,
  EmbedBuilder,
  TextChannel,
  AttachmentBuilder,
  PermissionFlagsBits,
} from "discord.js";
import buildCommand from "../../utils/commandBuilder.js";

export const annonce = buildCommand(
  new SlashCommandBuilder()
    .setName("annonce")
    .setDescription(
      "Publie une annonce formatée dans ce salon ou un salon spécifique"
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("titre")
        .setDescription("Titre de l’annonce")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("Contenu de l’annonce")
        .setRequired(true)
    )
    .addAttachmentOption((option) =>
      option
        .setName("image")
        .setDescription("Image à joindre à l’annonce (optionnelle)")
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Salon où publier l’annonce (optionnel)")
        .addChannelTypes(ChannelType.GuildText)
    ) as SlashCommandBuilder,

  async (interaction: any) => {
    const titre = interaction.options.getString("titre", true);
    const description = interaction.options.getString("description", true);
    const image = interaction.options.getAttachment("image");
    const targetChannel = interaction.options.getChannel(
      "channel"
    ) as TextChannel;

    const channel = targetChannel || interaction.channel;

    if (!channel || !channel.isTextBased()) {
      return interaction.reply({
        content: "❌ Le salon spécifié n'est pas valide.",
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setColor(0x00aaff)
      .setTitle(`📢 ${titre}`)
      .setDescription(description)
      .setFooter({
        text: `Annonce par ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    const options: any = { embeds: [embed] };

    if (image && image.contentType?.startsWith("image/")) {
      const imageName = image.name ?? "annonce.png";
      const file = new AttachmentBuilder(image.url, { name: imageName });
      embed.setImage(`attachment://${imageName}`);
      options.files = [file];
    }

    await channel.send(options);

    await interaction.reply({
      content: `✅ Annonce publiée dans <#${channel.id}>`,
      ephemeral: true,
    });
  }
);
