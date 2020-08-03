const fs = require("fs");
const path = require("path");

module.exports = {
	guildConfig: {
		load(gc, id) {
			return new Promise((res, rej) => {
				const gcf = require(path.resolve("guilds", `${id}`, "config.json"));
				gc.set(id, gcf);
				res(() => {
					console.log(`Guild ${id} config loaded.`);
					return gcf;
				});
				rej((e) => e);
			});
		},
		new(id) {
			return new Promise((res, rej) => {
				fs.mkdirSync(path.resolve("guilds", `${id}`), { recursive: true });
				fs.writeFileSync(
					path.resolve("guilds", `${id}`, "config.json"),
					JSON.stringify({
						prefix: "&",
						adminPrefix: "c&",
						disable: [],
					})
				);
				res(() => {
					console.log(`Generated config file for guild ${id}.`);
					return id;
				});
				rej((e) => e);
			});
		},
		async edit(id, key, newValue) {
			const gcf = require(path.resolve("guilds", `${id}`, "config.json"));
			gcf[key] = newValue;
			fs.writeFile(
				path.resolve("guilds", `${id}`, "config.json"),
				JSON.stringify(gc),
				(e) => (e ? e : null)
			);
		},
	},
	modules: {
		load(client) {
			return new Promise((res, rej) => {
				const files = fs
					.readdirSync(path.resolve("modules"))
					.filter((f) => f.endsWith(".js") && !f.startsWith("core"));
				files.forEach(async (f) => {
					const cf = require(path.resolve("modules", `${f}`));
					if (cf.onLoad) await cf.onLoad(client);
					client.commands.set(cf.name, cf);
				});
				res(console.log(`Loaded ${files.length} modules`));
				rej(console.log(e));
			});
		},
	},
	customCommands: {
		load(cc, id) {
			return new Promise((res, rej) => {
				const ccf = require(path.resolve(
					"guilds",
					`${id}`,
					"customCommands.json"
				));
				cc.set(id, ccf);
			});
		},
	},
};
