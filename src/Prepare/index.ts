import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Guild, Interaction, MessageActionRowComponentBuilder, PermissionFlagsBits, SlashCommandBuilder, TextInputStyle, User } from "discord.js";
import { DangerousEmbed, ErrorEmbed, SuccesfulEmbed } from "../presets";
import App from "../types/App";
import ButtonHandler from "./ButtonHandler";
import CommandHandler from "./CommandHandler";
import InitModal from "./InitModal";
import ModalHandler from "./ModalHandler";

export default (app: App) => {
	async function Init(DSguild: Guild, issuer: User) {
		try {
		} catch (err) {
			console.error(err)
			await (await DSguild.fetchOwner()).send("Seems like initialization failed, run /init on guild to run it again.")
		}
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
	app.discord.on('interactionCreate', CommandHandler(app))
	app.discord.on("interactionCreate", ButtonHandler(app))
	app.discord.on("interactionCreate", ModalHandler(app))
	return [slashCommandBuilder]
}
