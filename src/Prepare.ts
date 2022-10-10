import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Guild, Interaction, MessageActionRowComponent, MessageActionRowComponentBuilder, ModalActionRowComponentBuilder, ModalBuilder, PermissionFlagsBits, SlashCommandBuilder, TextInputBuilder, TextInputStyle, User } from "discord.js";
import { start } from "repl";
import { DangerousEmbed, ErrorEmbed, InfoEmbed, SuccesfulEmbed } from "./presets";
import App from "./types/App";

export default (app: App) => {
	async function Init(DSguild: Guild, issuer: User) {
		try {
		} catch (err) {
			console.error(err)
			await (await DSguild.fetchOwner()).send("Seems like initialization failed, run /init on guild to run it again.")
		}
	}
	function InitModal(name: string, id: string) {
		return new ModalBuilder()
			.setTitle(`${name} initialization.`)
			.setCustomId(id)
			.setComponents(
				new ActionRowBuilder<ModalActionRowComponentBuilder>()
					.setComponents(
						new TextInputBuilder()
							.setCustomId(id + `:rolesMode`)
							.setLabel("Roles mode.")
							.setPlaceholder("Auto (default) / Manual")
							.setStyle(TextInputStyle.Short)
							.setMaxLength(6)
							.setRequired(false)
					),
				new ActionRowBuilder<ModalActionRowComponentBuilder>()
					.setComponents(
						new TextInputBuilder()
							.setCustomId(id + `:rolesCount`)
							.setLabel("Roles count.")
							.setPlaceholder("Number less (or equal) than 100 and higher than 1 (default: 50)")
							.setStyle(TextInputStyle.Short)
							.setMaxLength(3)
							.setRequired(false)
					),
				new ActionRowBuilder<ModalActionRowComponentBuilder>()
					.setComponents(
						new TextInputBuilder()
							.setCustomId(id + `:startRoleID`)
							.setLabel("Highest role.")
							.setPlaceholder("Role ID, after which Bot'll place activity roles (Bot integration role by default)")
							.setStyle(TextInputStyle.Short)
							.setMaxLength(18)
							.setRequired(false)
					),
				new ActionRowBuilder<ModalActionRowComponentBuilder>()
					.setComponents(
						new TextInputBuilder()
							.setCustomId(id + `:whitelistMode`)
							.setLabel("Channel whitelist mode.")
							.setPlaceholder("True / False (default)")
							.setStyle(TextInputStyle.Short)
							.setMaxLength(5)
							.setRequired(false)
					),
				new ActionRowBuilder<ModalActionRowComponentBuilder>()
					.setComponents(
						new TextInputBuilder()
							.setCustomId(id + `:calculation`)
							.setLabel("Calculation mode.")
							.setPlaceholder("1 (default) / 2 / 3")
							.setStyle(TextInputStyle.Short)
							.setMaxLength(1)
							.setRequired(false)
					)
			)
	}
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
	let slashCommandBuilder = new SlashCommandBuilder()
		.setName("init")
		.setDescription("Re-init bot on guild. It resets all bot's data!")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

	app.discord.on("guildCreate", async (guild: Guild) => {
		try {
			Init(guild, (await guild.fetchOwner()).user)
		}
		catch (err) { console.error() }
	})
	app.discord.on('interactionCreate', async (interaction: Interaction) => {
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
	})
	app.discord.on("interactionCreate", async (interaction: Interaction) => {
		try {
			if (!interaction.isButton() || !interaction.customId.startsWith('reinitbutton:') || !interaction.guildId) return
			// await interaction.reply({ ephemeral: true, embeds: [DangerousEmbed("Reinitialization has been started!")] })
			let DSguild = await app.discord.guilds.fetch(interaction.guildId)
			if (!DSguild) return
			let guild = await app.prisma.guild.findFirst({ where: { discord: DSguild.id } })
			if (guild) {
				await app.prisma.message.deleteMany({ where: { guildId: guild.id } })
				await app.prisma.member.deleteMany({ where: { guildDiscordID: DSguild.id } })
				await app.prisma.excludedChannel.deleteMany({ where: { guildId: guild.id } })
				await app.prisma.guild.delete({ where: { id: guild.id } })
			}
			await interaction.showModal(InitModal(DSguild.name, `init$${DSguild.id}^${interaction.user.id}`))
			// await Init(await app.discord.guilds.fetch(interaction.customId.split(':')[1]), interaction.user)
		} catch (err) {
			console.error(err)
		}
	})
	app.discord.on("interactionCreate", async (interaction: Interaction) => {
		if (!interaction.isModalSubmit() || !interaction.customId.startsWith("init$")) return
		await interaction.deferReply({ephemeral: true})
		let DSguildId = interaction.customId.split('$')[1].split('^')[0]
		let DSmemberId = interaction.customId.split('^')[1]
		let DSguild = await app.discord.guilds.fetch(DSguildId)
		let DSmember = await DSguild.members.fetch(DSmemberId)

		const rolesMode = (interaction.fields.getTextInputValue(`${interaction.customId}:rolesMode`) || "auto").toLowerCase()
		const rolesCount = parseInt(interaction.fields.getTextInputValue(`${interaction.customId}:rolesCount`) || "50")
		const startRole = await DSguild.roles.fetch(interaction.fields.getTextInputValue(`${interaction.customId}:startRoleID`)) || DSguild.roles.botRoleFor(await DSguild.members.fetchMe())
		let whitelistModeTmp = interaction.fields.getTextInputValue(`${interaction.customId}:whitelistMode`) || "false"
		const whitelistMode = whitelistModeTmp == "true" ? true : whitelistModeTmp == "false" ? false : null
		const calculation = parseInt(interaction.fields.getTextInputValue(`${interaction.customId}:calculation`) || "1")
		
		console.log(startRole?.managed, startRole?.id)

		let errorReport = ""
		if (rolesMode != "auto" && rolesMode != "manual") errorReport += `The "Role mode." field accepts only "auto" and "manual" values. You entered "${rolesMode}"\n.`
		if (rolesCount < 2 || rolesCount > 100 || Number.isNaN(rolesCount)) errorReport += `The "Roles count." field must be an integer greater than 1 and less or equal to 100. You entered "${rolesCount}".\n`
		if (whitelistMode == null) errorReport += `The "Whitelist mode." field accepts only "true" and "false". You entered "${whitelistMode}".\n`
		if (calculation < 1 || calculation > 3 || Number.isNaN(calculation)) errorReport += `The "Calculation." field must be an integer equal to 1, 2 or 3. You entered "${calculation}".`
		if (errorReport != "") {
			await interaction.editReply({embeds: [ErrorEmbed("Initialization failed!\n"+errorReport)]})
			return
		}
		await interaction.editReply({embeds:[SuccesfulEmbed("Initialization completed!")]})
	})
	return [slashCommandBuilder]
}