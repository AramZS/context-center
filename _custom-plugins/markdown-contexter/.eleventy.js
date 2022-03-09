const pkg = require("./package.json");
const chalk = require("chalk");
const library = require("./index.js");

module.exports = {
	initArguments: {},
	configFunction: function (eleventyConfig, options = {}) {
		library(eleventyConfig, options);
	},
};
