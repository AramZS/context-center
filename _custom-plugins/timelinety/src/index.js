const utils = require("./build-tools/utilities");
const timelineSets = require("./build-tools/timeline-sets");
const imageTool = require("./build-tools/timeline-social-image");
const htmlToImage = require("node-html-to-image");

module.exports = function (eleventyConfig, pluginConfig) {
	const timelineImages = [];
	eleventyConfig.addShortcode("humanizeDate", utils.humanizeDate);
	eleventyConfig.addShortcode(
		"isNotWrappedInParagraphTags",
		utils.isNotWrappedInParagraphTags
	);
	// imageTool.testImg();
	eleventyConfig.addFilter("createTemplateImage", function (itemObj) {
		console.log("Create Template Social Image Starts");
		//imageTool.buildItemImage(itemObj, "600px");
		//imageTool.buildItemImage(itemObj, "630px");
		timelineImages.push(imageTool.prepareObject(itemObj, "600px"));
		timelineImages.push(imageTool.prepareObject(itemObj, "630px"));
		console.log("Template Social Image ", itemObj);
		console.log("Create Template Social Image Ends");
		return "";
	});
	eleventyConfig.addShortcode("sentenceCase", utils.sentenceCase);
	eleventyConfig.addFilter("setAttribute", function (dictionary, key, value) {
		dictionary[key] = value;
		return dictionary;
	});
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
			if (currentValue?.timeline) {
				previousValue[currentValue.timeline] = currentValue;
			}
			return previousValue;
		}, {})
	);

	eleventyConfig.on("eleventy.after", () => {
		console.log("Image object ready to process", timelineImages);
		htmlToImage({
			html: imageTool.handlebarsTemplate(),
			content: timelineImages,
		}).then(() => console.log("The images were created successfully!"));
	});
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
