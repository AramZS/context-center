const utils = require("./build-tools/utilities");
const timelineSets = require("./build-tools/timeline-sets");

module.exports = function (eleventyConfig, pluginConfig) {
	eleventyConfig.addShortcode("humanizeDate", utils.humanizeDate);
	eleventyConfig.addShortcode(
		"isWrappedInParagraphTags",
		utils.isWrappedInParagraphTags
	);
	eleventyConfig.addShortcode("sentenceCase", utils.sentenceCase);
	const timelines = timelineSets(
		pluginConfig.timelinesInFolder,
		pluginConfig.domainName
	);
	console.log("timelines", timelines);
	eleventyConfig.addCollection("timelines", (collection) => {
		return timelines;
	});
	timelines.map((timelineObj) => {
		eleventyConfig.addCollection(timelineObj.timeline, (collection) => {
			return collection
				.getAll()
				.filter((item) => item.data.timeline === timelineObj.timeline);
		});
	});
	// console.log("eleventyConfig", eleventyConfig);
};
