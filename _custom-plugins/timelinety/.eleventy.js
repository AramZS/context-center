const pkg = require("./package.json");
const chalk = require("chalk");
const library = require("./src/index.js");
const path = require("path");
const fs = require("fs");

// Based on

// https://github.com/molly/static-timeline-generator
// https://github.com/molly/web3-is-going-great

const pluginDefaults = {
	domainName: "http://localhost:8080",
	timelineOutFolder: "timelines",
	outDir: path.normalize(path.join(__dirname, "../../../", "docs")),
	// escape from the layout folder
	layoutFolderDepth: "../../",
	timelinesInFolder: "/src/timelines/",
	customCSS: "assets/css/template-timeline.css",
};

module.exports = function (eleventyConfig, options) {
	const pluginConfig = Object.assign(pluginDefaults, options);
	pluginConfig.jsPath = pluginConfig.domainName + "/timelines/js";
	pluginConfig.cssPath = pluginConfig.domainName + "/timelines/css";
	const dirs = __dirname.split(process.cwd());
	const pluginLayoutPath = path.join(
		pluginConfig.layoutFolderDepth,
		//"./",
		dirs[1],
		"src",
		"layouts"
	);
	console.log(
		"Activate Timelinety",
		pluginConfig,
		path.join(__dirname, "/src/js"),
		process.cwd(),
		dirs,
		pluginLayoutPath
		// fs.statSync(path.join(pluginLayoutPath, "timeline-item.njk"))
	);
	eleventyConfig.addPassthroughCopy(
		path.join(__dirname, "/src/js"),
		"timelines/js"
	);
	eleventyConfig.addPassthroughCopy(
		path.join(__dirname, "/src/css"),
		"timelines/css"
	);
	eleventyConfig.addLayoutAlias(
		"timeline",
		path.join(pluginLayoutPath, "timeline.njk")
	);
	eleventyConfig.addLayoutAlias(
		"timeline-item",
		path.join(pluginLayoutPath, "timeline-item.njk")
	);
	eleventyConfig.addLayoutAlias(
		"timeline-head",
		path.join(pluginLayoutPath, "head.njk")
	);
	eleventyConfig.addGlobalData("timelinesConfig", pluginConfig);
	return library(eleventyConfig, pluginConfig);
};

// Notes - Load other posts above and below
