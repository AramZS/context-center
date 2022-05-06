const pkg = require("./package.json");
const chalk = require("chalk");
const library = require("./src/index.js");

// Based on

// https://github.com/molly/static-timeline-generator
// https://github.com/molly/web3-is-going-great

const pluginDefaults = {
	domainName: "http://localhost:8080",
	includePaths: ["**/*.{scss,sass}", "!node_modules/**"],
	timelineOutFolder: "timelines",
	outDir: path.normalize(path.join(__dirname, "../../../", "docs")),
	timelinesInFolder: "/src/timelines/",
	customCSS: "assets/css/template-timeline.css",
};

module.exports = function (eleventyConfig, options) {
	const pluginConfig = Object.assign(pluginDefaults, options);
	eleventyConfig.addPassthroughCopy("./src/js", "timelines/js");
	eleventyConfig.addPassthroughCopy({ ".src/css": "timelines/css" });
	eleventyConfig.addLayoutAlias("timeline", "./src/layouts/timeline.njk");
	return library(eleventyConfig, options);
};

// Notes - Load other posts above and below
