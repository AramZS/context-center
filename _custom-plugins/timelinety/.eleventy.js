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
	pluginConfig.jsPath = pluginConfig.domainName + "/assets/timelines/js";
	pluginConfig.cssPath = pluginConfig.domainName + "/assets/timelines/css";
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
	pluginConfig.pluginLayoutPath = pluginLayoutPath;
	const localJs = path.join(__dirname, "/src/js");
	const jsPassthru = {};
	jsPassthru[localJs] = "assets/timelines/js";
	eleventyConfig.addPassthroughCopy(jsPassthru);
	const localCss = path.join(__dirname, "/src/css");
	const cssPassthru = {};
	cssPassthru[localCss] = "assets/timelines/css";
	eleventyConfig.addPassthroughCopy(cssPassthru);
	eleventyConfig.addLayoutAlias(
		"timeline",
		path.join(pluginLayoutPath, "timeline.njk")
	);
	eleventyConfig.addLayoutAlias(
		"timeline-standalone-item",
		path.join(pluginLayoutPath, "timeline-standalone-item.njk")
	);
	eleventyConfig.addLayoutAlias(
		"timeline-base",
		path.join(pluginLayoutPath, "timeline-base.njk")
	);
	eleventyConfig.addLayoutAlias(
		"timeline-head",
		path.join(pluginLayoutPath, "head.njk")
	);
	eleventyConfig.addLayoutAlias(
		"timeline-json",
		path.join(pluginLayoutPath, "json/timeline.njk")
	);
	eleventyConfig.addGlobalData("timelinesConfig", pluginConfig);
	eleventyConfig.addFilter("makeISODate", function (value) {
		return new Date(value).toISOString();
	});
	return library(eleventyConfig, pluginConfig);
};

// Notes - Load other posts above and below
