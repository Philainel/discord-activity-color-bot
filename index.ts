import { PrismaClient } from "@prisma/client"
import Discord, { Client } from "discord.js"
import dotenv from "dotenv"
import Prepare from "./src/Prepare"
import Settings from "./src/Settings"
import App from "./src/types/App"
import XPCount from "./src/XPCount"

dotenv.config()

const app = new App(
	new Client({
		intents: [
			"GuildMessages",
			"Guilds"
		]
	}),
	new PrismaClient()
)

app.discord.on('ready', async () => {
	console.log("Bot started.")
	
	const commands = [
		Settings(app), Prepare(app), XPCount(app)
	].flat().map(command => command.toJSON());
	
	const rest = new Discord.REST({ version: '10' }).setToken(process.env.TOKEN || "");
	
	app.discord.guilds.cache.map(g => rest.put(Discord.Routes.applicationGuildCommands(process.env.clientId || "", g.id), { body: commands })
		.then((data: any) => console.log(`Successfully registered ${data.length} application commands.`))
		.catch(console.error)
	)
});

(async () => {
	await app.prisma.$connect()
	await app.discord.login(process.env.TOKEN)
})()