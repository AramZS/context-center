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
				/**				console.log(
					"timeline filtered",
					timelineObj.timeline,
					collectionFiltered.map((collection) => collection.template)
				); */
				const collectionEnhanced = collectionFiltered.map(
					(timelineItem) => {
						timelineItem.timelineData = timelineObj;
						return timelineItem;
					}
				);
				collectionEnhanced.sort((a, b) => {
					if (a.date > b.date) return -1;
					else if (a.date < b.date) return 1;
					else return 0;
				});
				// collectionFiltered.reverse();

				return collectionEnhanced;
			}
		);
	});
	console.log("send", eleventyConfig.addGlobalData);
	eleventyConfig.addGlobalData(
		"globalTimelines",
		timelines.reduce((previousValue, currentValue) => {
			//console.log("reduce", previousValue, currentValue);
			previousValue[currentValue.timeline] = currentValue;
			return previousValue;
		}, {})
	);
	/**
	eleventyConfig.addCollection("timeline-items", (collection) => {
		let collectionFiltered = collection.getAll().filter((item) => {
			if (item.data.timeline && !item.data.hasOwnProperty("count")) {
				return true;
			}
			return false;
		});
		collectionFiltered = collectionFiltered.map((timelineItem) => {
			timelineItem.timelineData = timelines.find((timelineObj) => {
				if (timelineObj.timeline === timelineItem.data.timeline) {
					return true;
				}
				return false;
			});
			return timelineItem;
		});
		collectionFiltered.sort((a, b) => {
			if (a.date > b.date) return -1;
			else if (a.date < b.date) return 1;
			else return 0;
		});
		// collectionFiltered.reverse();
		console.log("collectionFiltered", collectionFiltered);
		return collectionFiltered;
	}); */

	// console.log("eleventyConfig", eleventyConfig);
};
