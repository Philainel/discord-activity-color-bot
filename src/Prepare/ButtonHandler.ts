import { Interaction } from "discord.js";
import App from "../types/App";
import InitModal from "./InitModal";

export default (app: App) => async (interaction: Interaction) => {
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
}
