import Discord, { ActionRowBuilder, Interaction, ModalActionRowComponent, ModalActionRowComponentBuilder, PermissionFlagsBits, SlashCommandBuilder, SlashCommandChannelOption, SlashCommandSubcommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js"
import { ErrorEmbed, SuccesfulEmbed } from "./presets"
import App from "./types/App"

export default (app: App) => {
	let slashCommandBuilder = new SlashCommandBuilder()
		.setName("settings")
		.setDescription("Manage bot settings")
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
		.addSubcommand((s: SlashCommandSubcommandBuilder) => s
			.setName("channel")
			.setDescription("Include/exclude channel from registry.")
			.addChannelOption((o: SlashCommandChannelOption) => o
				.setName("channel")
				.setRequired(false)
				.setDescription("Channel to include/exclude.")
			)
		)

	app.discord.on("interactionCreate", async (interaction: Interaction) => {
		try {
			if (!interaction.isChatInputCommand() || !interaction.guildId) return
			if (interaction.commandName == "settings") {
				let subcmd = interaction.options.getSubcommand()
				let guild = await app.prisma.guild.findFirst({
					where: { discord: interaction.guildId }
				})
				await interaction.deferReply({ ephemeral: true })
				if (!guild) {
					await interaction.editReply({ embeds: [ErrorEmbed("Guild initialization not completed.")] })
					return
				}
				if (subcmd = "channel") {
					let channel = await app.prisma.excludedChannel.findFirst({
						where: { discord: interaction.channelId }
					})
					if (channel) {
						await app.prisma.excludedChannel.delete({ where: {id: channel.id} })
						await interaction.editReply({ embeds: [SuccesfulEmbed(`<#${interaction.channelId}> has deleted from exception list and uses default settings.\n*Note: Activity registration **${guild.whitelistMode ? 'disabled' : 'enabled'}** in every channel by default.*`)] })
					} else {
						await app.prisma.excludedChannel.create({
							data: {
								discord: interaction.channelId,
								guildId: guild.id
							}
						})
						await interaction.editReply({ embeds: [SuccesfulEmbed(`Activity registration **${guild.whitelistMode ? 'enabled' : 'disabled'}** in <#${interaction.channelId}>.\n*Note: Activity registration **${guild.whitelistMode ? 'disabled' : 'enabled'}** in every channel by default.*`)] })
					}
					return
				}
				return
			}
		} catch (err) {
			console.error(err)
		}
	})


	return [slashCommandBuilder]
}