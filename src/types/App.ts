import { PrismaClient } from "@prisma/client";
import { Client } from "discord.js";

export default class App {
	public readonly discord: Client
	public readonly prisma: PrismaClient

	constructor(discord: Client, prisma: PrismaClient) {
		this.discord = discord
		this.prisma = prisma
	}
}