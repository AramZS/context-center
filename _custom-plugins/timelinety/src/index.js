const utils = require("./build-tools/utilities");
const timelineSets = require("./build-tools/timeline-sets");

module.exports = function (eleventyConfig, pluginConfig) {
	eleventyConfig.addShortcode("humanizeDate", utils.humanizeDate);
	eleventyConfig.addShortcode(
		"isNotWrappedInParagraphTags",
		utils.isNotWrappedInParagraphTags
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
		eleventyConfig.addCollection(
			"timeline-" + timelineObj.timeline,
			(collection) => {
				const collectionFiltered = collection
					.getAll()
					.filter(
						(item) => item.data.timeline === timelineObj.timeline
					);
				console.log(
					"timeline filtered",
					timelineObj.timeline,
					collectionFiltered.map((collection) => collection.template)
				);
				return collectionFiltered;
			}
		);
	});
	// console.log("eleventyConfig", eleventyConfig);
};
