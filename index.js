const path = require("path");
const Discord = require("discord.js");
const core = require(path.resolve("modules", "core.js"));
const client = new Discord.Client();
client.commands = new Discord.Collection();
client.guildConfig = new Discord.Collection();
client.customCommands = new Discord.Collection();

client.once("ready", async () => {
	console.log("Bot is online!");
	console.log("Loading guild configs");
	await Promise.allSettled(
		[...client.guilds.cache.keys()].map((id) => {
			return core.guildConfig.load(client.guildConfig, id).catch((e) => {
				if (e.code === "MODULE_NOT_FOUND")
					core.guildConfig
						.new(id)
						.then(core.guildConfig.load(client.guildConfig, id))
						.catch((e) => console.log(e));
			});
		})
	);
	console.log("Guild configs loaded");
	console.log("Loading modules");
	await core.modules.load(client);
});

client.on("message", (msg) => {
	console.log(msg.content);
	if (msg.channel.type === "dm") return;

	const guildConfig = client.guildConfig.get(msg.guild.id);
	if (!msg.content.startsWith(guildConfig.prefix) || msg.author.bot) return;

	const args = msg.content.slice(guildConfig.prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	//TODO: && config DISABLE
	if (!client.commands.has(commandName)) {
		const guildCommands = client.customCommands.get(msg.guild.id);
		if (!Object.keys(guildCommands).includes(commandName)) return;
		return msg.channel.send(guildCommands[commandName]);
	}

	const command = client.commands.get(commandName);
	if (command.args && !args.length)
		return msg.reply("TODO: Expected number of args, display help");
	try {
		command.exec(msg, args);
	} catch (e) {
		console.log(e);
		return msg.reply(
			"there was an error while trying to run this command, check console for more info."
		);
	}
});

const { token } = require("./botToken.json");
client.login(token);
