const contexter = require("link-contexter");
const fs = require("fs");
var path = require("path");
var slugify = require("slugify");
var sanitizeFilename = require("sanitize-filename");
var imageHandler = require("./image-handler");

const urlRegex =
	/^([\t\- ]*)*(?<main>(\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))(?=\n|\r)$)+)/gim;

module.exports = (eleventyConfig, userOptions) => {
	let options = {
		name: "markdown-contexter",
		extension: "md",
		cachePath: "_contexterCache",
		publicImagePath: "assets/images/contexter",
		publicPath: "timegate",
		domain: "http://localhost:8080",
		buildArchive: true,
		existingRenderer: function () {},
		...userOptions,
	};

	const cacheFolder = path.join(
		__dirname,
		"../../",
		`/${options.cachePath}/`
	);

	options.cacheFolder = cacheFolder;

	const completeAllPromiseArray = [];

	console.log("markdown-contexter-go");
	eleventyConfig.addPassthroughCopy({
		[`${options.cachePath}/images`]: options.publicImagePath,
	});
	eleventyConfig.addGlobalData("contexterSettings", options);

	const cacheFilePath = (pageFilePath, searchKey, notJson = false) => {
		const cacheFolder = path.join(
			__dirname,
			"../../",
			`/${options.cachePath}/`,
			pageFilePath
		);
		let cacheFile = cacheFolder + searchKey;
		if (!notJson) {
			cacheFile = cacheFile + ".json";
		}
		// console.log('cacheFile: ', cacheFile)
		return { cacheFolder, cacheFile };
	};

	const reMarkdown = (inputContent, data) => {
		let promiseContext = new Promise((resolve, reject) => {
			setTimeout(() => {
				// console.log("Initiating Promise Resolution Process");
				resolve(true);
			}, 30);
		});
		completeAllPromiseArray.push(promiseContext);
		// const urls = urlRegex.exec(inputContent); // .exec(inputContent);
		let matchArray = [];
		let urlsArray = [];
		let counter = 0;
		while ((matchArray = urlRegex.exec(inputContent)) != null) {
			// console.log("Found URLs", matchArray.groups.main, matchArray[0]);
			urlsArray.push({
				url: matchArray.groups.main,
				replace: matchArray[0],
			});
			counter++;
		}
		if (urlsArray.length) {
			urlsArray.forEach((urlObj) => {
				const link = urlObj.url;
				// console.log("inputContent Process: ", link);
				// console.log("inputContent treated", inputContent);
				const fileName = sanitizeFilename(
					slugify(contexter.sanitizeLink(link)).replace(/\./g, "")
				);
				const { cacheFolder, cacheFile } = cacheFilePath("", fileName);
				let imageCheck = false;
				// @TODO: this should just write the file, processing it and adding local images and archive links should happen at the point of building the collection I think? Especially since the collection can take an async function. Also... needs something for audio and youtube right?
				try {
					fs.accessSync(cacheFile, fs.constants.F_OK);
					const contextString = fs.readFileSync(cacheFile).toString();
					// Rebuild conditions?
					// Mby https://attacomsian.com/blog/nodejs-get-file-last-modified-date
					const contextData = JSON.parse(contextString);
					// Markdown system reads tabs as code blocks no matter what.
					let htmlEmbed = contextData.htmlEmbed.replace(
						/\t|^\s+|\n|\r/gim,
						""
					);
					const localImageObj = imageHandler.imageCheck(
						contextData,
						fileName,
						cacheFilePath,
						completeAllPromiseArray
					);
					if (localImageObj) {
						const { localImageName, originalImage, imageName } =
							localImageObj;
						imageCheck = true;
						//console.log(
						//	"Local Cached Image",
						//	`${options.domain}/${options.publicImagePath}/${fileName}/${imageName}`
						// );
						let image = originalImage;
						htmlEmbed = htmlEmbed.replace(
							image,
							`${options.domain}/${options.publicImagePath}/${fileName}/${imageName}`
						);
					}
					if (
						options.buildArchive &&
						!contextData.data.archivedData.link &&
						!contextData.data.twitterObj // Because we build pages with the Twitter Object when it is available.
					) {
						htmlEmbed = htmlEmbed.replace(
							`</contexter-box>`,
							`<a href="${options.domain}/${options.publicPath}/${contextData.sanitizedLink}" is="contexter-link" target="_blank" class="read-link archive-link" itemprop="archivedAt" rel="timemap" slot="archive-link">Archived</a></contexter-box>`
						);
					}
					if (contextData.data.twitterObj) {
						htmlEmbed = htmlEmbed.replace(
							/<script async src"https:\/\/platform\.twitter\.com\/widgets\.js" charset="utf-8"><\/script>/g,
							""
						);
					}
					// console.log("contextData", contextData);
					// const contextData = JSON.parse(contextString);
					if (htmlEmbed) {
						inputContent = inputContent.replace(
							urlObj.replace,
							htmlEmbed
						);
					}
				} catch (e) {
					try {
						if (imageCheck) {
							console.log("Image issue possibly", e);
						}
						console.log("Contextualizing link: ", link);
						inputContent = inputContent.replace(
							urlObj.replace,
							`<p><a href="${link}" target="_blank">${link}</a></p>`
						);
						let pContext = contexter.context(link);
						// completeAllPromiseArray.push(pContext);
						// No file yet
						console.log(
							"Cached link " + cacheFile + " to repo not ready"
						);
						pContext
							.then((r) => {
								const fileWritePromise = new Promise(
									(resolve, reject) => {
										console.log("Context ready", r.linkId);
										// No file yet
										console.log(
											"Cached link for " +
												cacheFile +
												" ready to write."
										);
										try {
											console.log(
												"Writing data for: ",
												link
											);
											fs.mkdirSync(cacheFolder, {
												recursive: true,
											});
											imageHandler
												.handleImageFromObject(
													r,
													fileName,
													cacheFilePath
												)
												.then((localImageFileName) => {
													console.log(
														"handleImageFromObject result ",
														localImageFileName
													);
													if (localImageFileName) {
														r.localImage = `/${options.publicImagePath}/${fileName}/${localImageFileName}`;
														// console.log('write data to file', cacheFile)

														fs.writeFileSync(
															cacheFile,
															JSON.stringify(r)
														);
														resolve(cacheFile);
													}
												})
												.catch((e) => {
													console.log(
														"Image handling failed",
														e
													);
													reject(e);
												});
										} catch (e) {
											console.log(
												"writing to cache failed:",
												e
											);
											reject(e);
										}
										setTimeout(() => {
											console.log(
												"Request timed out for ",
												cacheFile
											);
											reject("Timeout error");
										}, 6000);
									}
								);
								completeAllPromiseArray.push(fileWritePromise);
							})
							.catch((e) => {
								console.log(
									"Context adding promise failed on ",
									link,
									e
								);
							});
					} catch (e) {
						console.log("Contexter Process Failed: ", e);
					}
				}
			});
		}
		// 2nd argument sets env
		return options.existingRenderer.render(inputContent, data);
	};
	const compiler = (inputContent, inputPath) => {
		// console.log("msc", inputContent, inputPath);
		let remark = false;
		if (
			inputContent &&
			inputPath &&
			inputPath.endsWith(`.${options.extension}`)
		) {
			// console.log("CONTENT REPLACEx", arguments, this);
			remark = true;
		}
		// https://github.com/11ty/eleventy/issues/2217
		return function (data) {
			// console.log("msc compile", data);
			// options.md.set(data);
			if (
				(remark && data.layout && /post/.test(data.layout)) ||
				/fwd/.test(data.layout) ||
				/topic/.test(data.layout)
			) {
				// console.log("msc compile");

				const rmResult = reMarkdown(inputContent, data);
				return rmResult;
			}
			// console.log("msc data");
			// console.dir(this.global);
			// You can also access the default `markdown-it` renderer here:
			return this.defaultRenderer(data);
		};
	};
	eleventyConfig.addExtension(options.extension, {
		read: true,
		compile: compiler,
	});
	const buildArchiveFileList = () => {
		const directoryPath = options.cachePath;
		const files = [];
		//passsing directoryPath and callback function
		try {
			const filesSet = fs.readdirSync(directoryPath);
			//listing all files using forEach
			filesSet.forEach(function (file) {
				// Do whatever you want to do with the file

				if (/\.json$/.test(file)) {
					// console.log("archivesFile", file);
					files.push(file);
				}
			});
		} catch (err) {
			return console.log("Unable to scan directory: " + err);
		}
		return files;
	};
	let archiveFilesList = [];
	if (options.buildArchive) {
		eleventyConfig.addCollection("archives", async (collection) => {
			try {
				await Promise.all(completeAllPromiseArray).catch((err) => {
					console.log("Error in building archives collect: ", err);
				});
			} catch (e) {
				console.log(
					"Could not complete all promises from Contexter",
					e
				);
			}
			console.log("Archives Collection ");
			archiveFilesList = buildArchiveFileList();
			const archives = [];
			archiveFilesList.forEach((cacheFile) => {
				const fileContents = fs
					.readFileSync(options.cachePath + "/" + cacheFile)
					.toString();
				// Rebuild conditions?
				// Mby https://attacomsian.com/blog/nodejs-get-file-last-modified-date
				const contextData = JSON.parse(fileContents);
				if (contextData) {
					try {
						if (
							!contextData.data.archivedData.link &&
							!contextData.data.twitterObj
						) {
							contextData.htmlEmbed =
								contextData.htmlEmbed.replace(
									`</contexter-box>`,
									`<a href="${options.domain}/${options.publicPath}/${contextData.sanitizedLink}" is="contexter-link" target="_blank" class="read-link archive-link" itemprop="archivedAt" slot="archive-link">Archived</a></contexter-box>`
								);
						}
						archives.push(contextData);
					} catch (e) {
						console.log(
							"Failed to assure clean data",
							contextData.sanitizedLink,
							contextData.data.finalizedMeta,
							e
						);
					}
				}
			});

			return archives;
		});
	}
	/**
	eleventyConfig.addTransform(
		"async-contexter",
		async function (content, outputPath) {
			// console.log("markdown-contexter-transform-hooked");
			if (outputPath && outputPath.endsWith(".md")) {
				console.log("CONTENT REPLACE");
				content.replace(
					"https://twitter.com/Chronotope/status/1402628536121319424",
					"https://twitter.com/Chronotope/status/1402628536121319424?ab=123"
				);
			}
			return content;
		}
	);
*/
};
