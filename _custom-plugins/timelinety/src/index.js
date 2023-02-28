const utils = require("./build-tools/utilities");
const timelineSets = require("./build-tools/timeline-sets");
const imageTool = require("./build-tools/timeline-social-image");
const htmlToImage = require("node-html-to-image");
const { slugger } = require("./build-tools/slugger");

module.exports = function (eleventyConfig, pluginConfig) {
	const timelineImages = [];
	eleventyConfig.addShortcode("humanizeDate", utils.humanizeDate);
	eleventyConfig.addShortcode(
		"isNotWrappedInParagraphTags",
		utils.isNotWrappedInParagraphTags
	);
	eleventyConfig.addFilter("timelineSlugify", function (text) {
		return slugger(text);
	});
	// eleventyConfig.ignores.add(path.join(`/src/img/previews/*`));
	// imageTool.testImg();
	eleventyConfig.addFilter("createTemplateImage", function (itemObj) {
		//console.log("Create Template Social Image Object Starts");
		//imageTool.buildItemImage(itemObj, "600px");
		//imageTool.buildItemImage(itemObj, "630px");
		timelineImages.push(
			imageTool.prepareObject(itemObj, "600px", pluginConfig.domainName)
		);
		timelineImages.push(
			imageTool.prepareObject(itemObj, "630px", pluginConfig.domainName)
		);
		//console.log("Template Social Image ", itemObj);
		//console.log("Create Template Social Image Object Ends");
		return "";
	});
	eleventyConfig.addFilter("socialImageSlug", (title, size) => {
		console.log("Social Image Title", title);
		let slugs = imageTool.imageUrlMaker(pluginConfig.domainName, title);
		return slugs[size];
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
						timelineItem.permalink = slugger(timelineObj.title);
						timelineItem.timelineData.slug = slugger(
							timelineItem.timelineData.slug
						);
						timelineItem.timelineData.permalink =
							timelineItem.permalink;
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
	let ranOnce = false;
	eleventyConfig.on("eleventy.after", async () => {
		if (ranOnce) {
			console.log("Do not need to re-run image gen");
			return;
		}
		console.log(`Image array of ${timelineImages.length} ready to process`);
		let processFinished = imageTool.queueImagesProcess(timelineImages);
		ranOnce = true;
		return processFinished.then(() =>
			console.log("Image generation process complete")
		);
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
