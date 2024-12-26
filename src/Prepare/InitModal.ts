import { ModalBuilder, ModalActionRowComponentBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle} from "discord.js"

export default function InitModal(name: string, id: string) {
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
