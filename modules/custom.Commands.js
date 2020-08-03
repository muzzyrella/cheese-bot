const fs = require("fs");
const path = require("path");
module.exports = {
	name: "custom",
	args: true,
	description: "Adds custom commands for your server.",
	usage: "custom add|list|remove",
	onLoad(client) {
		return new Promise((res, rej) => {
			for (const id of [...client.guilds.cache.keys()]) {
				try {
					this.load(client, id);
				} catch (e) {
					if (e.code === "MODULE_NOT_FOUND") {
						fs.writeFileSync(
							path.resolve("guilds", `${id}`, "customCommands.json"),
							JSON.stringify({})
						);
						this.load(client, id);
					}
				}
				res(null);
				rej((e) => console.log(e));
			}
		});
	},
	load(client, id) {
		const guildCommands = require(path.resolve(
			"guilds",
			`${id}`,
			"customCommands.json"
		));
		client.customCommands.set(id, guildCommands);
	},
	add(msg, args, file) {
		const guildCommands = require(file);
		const command = args.shift().toLowerCase();
		if (guildCommands[command])
			return msg.reply("custom command already exists.");
		guildCommands[command] = args.join(" ");
		fs.writeFileSync(file, JSON.stringify(guildCommands));
		this.load(msg.client, msg.guild.id);
		return msg.react("✅");
	},
	async list(msg, file) {
		const guildCommands = require(file);
		if (!Object.entries(guildCommands).length)
			return msg.channel.send("No custom commands found for this server.");
		const msgList =
			Object.keys(guildCommands)
				.map((s) => s.toLowerCase())
				.sort()
				.join("\n") + "\n";
		let lastSplit = 0;
		while (lastSplit < msgList.length) {
			const slice = msgList.slice(lastSplit, lastSplit + 1990);
			const sliceSplit = slice.lastIndexOf("\n") + 1;
			await msg.author.createDM();
			msg.author.dmChannel.send("```\n" + slice.slice(0, sliceSplit) + "\n```");
			lastSplit += sliceSplit;
		}
		return msg.react("📬");
	},
	remove(msg, args, file) {
		const guildCommands = require(file);
		const command = args.shift().toLowerCase();
		if (!guildCommands[command])
			return msg.reply("this command doesn't exists");
		delete guildCommands[command];
		fs.writeFileSync(file, JSON.stringify(guildCommands));
		this.load(msg.client, msg.guild.id);
		return msg.react("✅");
	},
	exec(msg, args) {
		const cmd = args.shift().toLowerCase();
		const file = path.resolve(
			"guilds",
			`${msg.guild.id}`,
			"customCommands.json"
		);
		if (cmd === "list") return this.list(msg, file);
		if (cmd === "add" && args.length >= 2) return this.add(msg, args, file);
		if (cmd === "remove" && args.length >= 1)
			return this.remove(msg, args, file);
		return msg.reply(`${this.usage}`);
	},
};
