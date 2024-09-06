const { readdirSync, readFileSync } = require("fs");
const path = require("path");
const matter = require("gray-matter");

const getDirectories = (source) =>
	readdirSync(source, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name);

const sortByDate = () => {
	if (alphabeticalSorts.includes(tagName)) {
		taggedPosts.sort((a, b) => {
			if (a.url > b.url) return -1;
			else if (a.url < b.url) return 1;
			else return 0;
		});
		taggedPosts.reverse();
	}
};

const getTimelines = (timelineFolder, domainName) => {
	// Map out the set of directories under the timeline folder and turn them
	// into useful objects.
	const directorySet = getDirectories(timelineFolder).map((timelineDir) => {
		const timelinePath = path.resolve(
			path.join(timelineFolder, `${timelineDir}`),
		);
		const timelineData = require(timelinePath + `/${timelineDir}.json`);
		const timelineTitle =
			timelineData.mainTitle || timelineData.title || timeline.name;
		const timelineEventFiles = readdirSync(timelinePath);
		let lastUpdated = 0;
		let firstUpdated = 0;
		const timelineFilesContents = timelineEventFiles.map((filePath) => {
			return readFileSync(
				path.resolve(
					path.join(
						`${timelineFolder}`,
						`${timelineDir}`,
						`${filePath}`,
					),
				),
			).toString();
		});
		let filterSet = [...timelineData.filters];
		lastUpdated = timelineFilesContents.reduce((prevValue, fileContent) => {
			try {
				const mdObject = matter(fileContent);
				//console.log("project data", mdObject.data);
				if (!mdObject.data || !mdObject.data.dateAdded) {
					return 0;
				}
				if (mdObject.data.hasOwnProperty("filters")) {
					filterSet = filterSet.concat(mdObject.data.filters);
				} else {
					filterSet = filterSet.concat(mdObject.data.tags);
				}
				const datetime = Date.parse(mdObject.data.dateAdded);
				if (prevValue > datetime) {
					return prevValue;
				} else {
					return datetime;
				}
			} catch (e) {
				console.log("Could not find date", e);
				return 0;
			}
		}, 0);
		firstUpdated = timelineFilesContents.reduce(
			(prevValue, fileContent) => {
				try {
					const mdObject = matter(fileContent);
					//console.log("project data", mdObject.data);
					if (!mdObject.data || !mdObject.data.dateAdded) {
						return 0;
					}
					if (mdObject.data.hasOwnProperty("filters")) {
						filterSet = filterSet.concat(mdObject.data.filters);
					} else {
						filterSet = filterSet.concat(mdObject.data.tags);
					}
					const datetime = Date.parse(mdObject.data.dateAdded);
					if (prevValue < datetime && prevValue > 0) {
						return prevValue;
					} else {
						return datetime;
					}
				} catch (e) {
					console.log("Could not find date", e);
					return 0;
				}
			},
			0,
		);
		const timelineDescription = timelineData.description
			? timelineData.description
			: `Building ${timelineTitle}`;

		if (timelineData.hasOwnProperty("doNotUseFilters")) {
			filterSet = filterSet.filter((el) => {
				return !timelineData.doNotUseFilters.includes(el);
			});
		}

		let finalObj = {
			title: timelineTitle,
			slug: timelineDir,
			timeline: timelineDir,
			timelineSlug: "timeline-" + timelineData.timeline,
			timelineUrl: timelineData.timeline,
			timelineName: timelineData.title
				? timelineData.title
				: timelineData.timeline,
			description: timelineDescription,
			url: (function () {
				// @TODO: This should inheret from plugin settings.
				return domainName + "/timeline/" + timelineDir;
			})(),
			count: timelineEventFiles.length - 1, // minus one for the timeline description json file.
			lastUpdatedPost: lastUpdated,
			firstUpdatedPost: firstUpdated,
			filters: [...new Set(filterSet)],
		};
		finalObj = { ...timelineData, ...finalObj };
		return finalObj;
	});

	directorySet.sort((a, b) => b.lastUpdatedPost - a.lastUpdatedPost);
	console.log("Timelines", directorySet);
	return directorySet;
};
module.exports = getTimelines;
