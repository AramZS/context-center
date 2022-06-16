const { readdirSync, readFileSync } = require("fs");
const path = require("path");
const matter = require("gray-matter");

const getDirectories = (source) =>
	readdirSync(source, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name);

const getTimelines = (timelineFolder, domainName) => {
	// Map out the set of directories under the timeline folder and turn them
	// into useful objects.
	const directorySet = getDirectories(timelineFolder).map((timelineDir) => {
		const timelinePath = path.resolve(
			path.join(timelineFolder, `${timelineDir}`)
		);
		const timelineData = require(timelinePath + `/${timelineDir}.json`);
		const timelineTitle =
			timelineData.mainTitle || timelineData.title || timeline.name;
		const timelineEventFiles = readdirSync(timelinePath);
		let lastUpdated = 0;
		const timelineFilesContents = timelineEventFiles.map((filePath) => {
			return readFileSync(
				path.resolve(
					path.join(
						`${timelineFolder}`,
						`${timelineDir}`,
						`${filePath}`
					)
				)
			).toString();
		});
		lastUpdated = timelineFilesContents.reduce((prevValue, fileContent) => {
			try {
				const mdObject = matter(fileContent);
				//console.log("project data", mdObject.data);
				if (!mdObject.data || !mdObject.data.date) {
					return 0;
				}
				const datetime = Date.parse(mdObject.data.date);
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
		const timelineDescription = timelineData.description
			? timelineData.description
			: `Building ${timelineTitle}`;
		return {
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
				return domainName + "/timelines/" + timelineDir;
			})(),
			count: timelineEventFiles.length - 1, // minus one for the timeline description json file.
			lastUpdatedPost: lastUpdated,
		};
	});

	directorySet.sort((a, b) => b.lastUpdatedPost - a.lastUpdatedPost);
	console.log("Timelines", directorySet);
	return directorySet;
};
module.exports = getTimelines;
