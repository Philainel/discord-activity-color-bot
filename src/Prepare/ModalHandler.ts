import { Interaction } from "discord.js"
import { ErrorEmbed, SuccesfulEmbed } from "../presets"
import App from "../types/App"

export default (app: App) => async (interaction: Interaction) => {
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
}
