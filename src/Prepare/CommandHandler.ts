import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Interaction, MessageActionRowComponentBuilder } from "discord.js";
import { DangerousEmbed } from "../presets";
import App from "../types/App";

function ActionRow(label: string, id: string, disabled: boolean) {
	return new ActionRowBuilder<MessageActionRowComponentBuilder>()
		.addComponents(
			new ButtonBuilder()
				.setCustomId(id)
				.setDisabled(disabled)
				.setStyle(ButtonStyle.Danger)
				.setLabel(label)
		)
}
export default (app: App) => async (interaction: Interaction) => {
	try {
		if (!interaction.isCommand() || interaction.commandName != "init" || !interaction.guildId) return
		let guild = app.discord.guilds.cache.get(interaction.guildId)
		if (!guild) return
		let timeout = 5
		let id = "reinitbutton:" + interaction.guildId + ':' + interaction.user.id
		await interaction.deferReply({ ephemeral: true })
		await interaction.editReply({
			embeds: [DangerousEmbed(
				"This will wipe all data!\nYou can change some settings without reinitialization with /settings"
			)],
			components: [
				ActionRow(`Reinit (${timeout})`, id, true)
			]
		})
		let updateButton = async () => {
			timeout -= 1
			if (timeout > 0) {
				await interaction.editReply({ components: [ActionRow(`Reinit (${timeout})`, id, true)] })
				setTimeout(updateButton, 1000)

			}
			else {
				await interaction.editReply({ components: [ActionRow(`Reinit`, id, false)] })
				setTimeout(async () => { await interaction.editReply({ components: [ActionRow(`Reinit (expired)`, id, true)] }) }, 20 * 1000)
			}
		}
		setTimeout(updateButton, 1000)
		return
	} catch (err) {
		console.error(err)
	}
}
