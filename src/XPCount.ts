import { prisma } from "@prisma/client";
import { Message, VoiceChannel, VoiceState } from "discord.js";
import App from "./types/App";

export default (app: App) => {
	let registryTimeouts = {} as { [key: string]: number }
	let updateColorsTimeouts = {} as { [key: string]: number }

	function getActivityValue(x: number) {
		let r = x ** (10 ** -0.5)
		return r < 0 ? 0 : r > 1 ? 1 : r
	}

	app.discord.on("messageCreate", async (msg: Message) => {
		try {
			console.log(`Got message ${msg.id}`)
			// Getting guild
			if (!msg.guildId) return
			let guild = await app.prisma.guild.findFirst({ where: { discord: msg.guildId } })
			if (!guild) return
			// Setting key and check timeout for message registry
			let key = `${msg.guildId}:${msg.author.id}`
			if (registryTimeouts[key]) return
			// Getting member
			let member = await app.prisma.member.findFirst({ where: { discord: msg.member?.id, guildDiscordID: msg.guildId } })
			if (!member) member = await app.prisma.member.create({
				data: {
					discord: msg.author.id,
					guildDiscordID: msg.guildId,
					currentRole: guild.rolesIDs[0]
				}
			})

			// Setting timeout
			registryTimeouts[key] = Date.now()
			// Recording message
			await app.prisma.message.create({
				data: {
					memberId: member.id,
					guildId: guild.id,
					date: msg.createdAt,
				}
			})

			// Delete registry timeout
			setTimeout(() => {
				delete registryTimeouts[key]
			}, 5000)

			// Checking timeout for colors update and set it if needed
			let updateColorsKey = msg.guildId
			if (updateColorsTimeouts[updateColorsKey]) return
			updateColorsTimeouts[updateColorsKey] = Date.now()
			let messages = await app.prisma.message.findMany({
				where: {
					guildId: guild.id
				}
			})
			let DSguild = await app.discord.guilds.fetch(msg.guildId)
			let members = await app.prisma.member.findMany({ where: { guildDiscordID: msg.guildId } })
			console.log("RECALCULATING...")
			console.log("USER | ROLE ID | ROLE INDEX | ACTIVITY")
			members.map(async u => {
				try {
					if (!member || !guild) {
						// Hope this'll never fired...
						try { await (await app.discord.users.fetch("537689199739142144")).send("No member or guild in calculating activity!") } catch (err) { console.error(err) }
						return
					}
					let disMember = await (DSguild).members.fetch(u.discord)
					// Calculating vals
					let activity = getActivityValue(messages.filter(m => m.memberId == u.id).length / messages.length)
					let roleIndex = Math.round(activity * (guild.rolesCount - 1))
					let roleID = guild.rolesIDs[roleIndex]
					
					// Updating role and DB data
					if (!disMember.roles.cache.has(roleID)) {
						await disMember.roles.add(
							roleID,
							"Updating colors by activity"
						)
						await app.prisma.member.update({ where: { id: u.id }, data: { currentRole: roleID } })
					}
					guild.rolesIDs
						.filter(r => r != roleID && disMember.roles.cache.has(r))
						.map(async (r) => {
							try {
								await disMember.roles.remove(r, "Remove activity role due to activity recalculating")
							} catch (err) { console.error(err) }
						})
					console.log((await app.discord.users.fetch(u.discord)).username, roleID, roleIndex, activity)


				} catch (err) { console.error(err) }
			})
			setTimeout(() => {
				delete updateColorsTimeouts[updateColorsKey]
			}, 1000 * 60)
		} catch (err) {
			console.error(err)
		}
	})
	return []
}