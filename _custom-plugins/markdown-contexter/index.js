const contexter = require("link-contexter");
const fs = require("fs");
var path = require("path");
var slugify = require("slugify");
var sanitizeFilename = require("sanitize-filename");
var imageHandler = require("./image-handler");

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
		`/${options.cachePath}/`,
	);

	options.cacheFolder = cacheFolder;

	const completeAllPromiseArray = [];

	console.log("markdown-contexter-go");
	eleventyConfig.addPassthroughCopy({
		[`${options.cachePath}/images`]: options.publicImagePath,
	});

	const filenameMaker = (link) =>
		sanitizeFilename(
			slugify(contexter.sanitizeLink(link)).replace(/\./g, ""),
		);

	eleventyConfig.filenameMaker = filenameMaker;

	eleventyConfig.addGlobalData("contexterSettings", options);

	const cacheFilePath = (pageFilePath, searchKey, notJson = false) => {
		const cacheFolder = path.join(
			__dirname,
			"../../",
			`/${options.cachePath}/`,
			pageFilePath,
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
		// console.log("Running reMarkdown for ", data.title);
		// completeAllPromiseArray.push(promiseContext);
		// const urls = urlRegex.exec(inputContent); // .exec(inputContent);
		// Had a runaway regex problem here. See: https://www.regular-expressions.info/catastrophic.html and https://javascript.info/regexp-catastrophic-backtracking for details. It was caused by a rogue space at the end of a line. Hopefully this fixed it and broke nothing else.
		const urlRegex =
			/^([\t\- ]*)*(?<main>(\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’])))+)/gim;
		let matchArray = [];
		let urlsArray = [];
		matchArray = inputContent.matchAll(urlRegex);
		let counter = 0;
		for (const match of matchArray) {
			/** console.log(
				"Found URL index ",
				urlRegex.lastIndex,
				match.groups.main,
				match[0]
			); */
			urlsArray.push({
				url: match.groups.main,
				replace: match[0],
			});
			counter++;
		}
		//console.log("URLs found to process ", urlsArray);
		const backoffFileObj = cacheFilePath("", "backoff");
		const backoffList = backoffFileObj.cacheFile;
		try {
			fs.accessSync(backoffList, fs.constants.F_OK);
		} catch (e) {
			fs.writeFileSync(
				backoffList,
				JSON.stringify({ list: [], lastCheck: {} }),
			);
		}

		let backoffObj = JSON.parse(fs.readFileSync(backoffList));

		if (urlsArray.length) {
			urlsArray.forEach((urlObj) => {
				//console.log("Starting to deal with urlObj ", urlObj);
				const link = urlObj.url;
				let timeoutID;
				let timeoutForRequest = new Promise((resolve, reject) => {
					let backoffFunction = () => {
						console.log("Failure to deal with urlObj ", urlObj.url);
						let backoffObj = JSON.parse(
							fs.readFileSync(backoffList),
						);
						if (backoffObj?.list.includes(urlObj.url)) {
							console.log("Backoff process failed");
							reject(new Error("Backoff process failed"));
						} else {
							backoffObj.list.push(urlObj.url);
							backoffObj.lastCheck[urlObj.url] =
								new Date().toString();
							fs.writeFileSync(
								backoffList,
								JSON.stringify(backoffObj),
							);
							reject(new Error("Backing off"));
						}
						// throw new Error("Timed out after 30s");
					};
					timeoutID = setTimeout(backoffFunction, 60000);
				});
				// console.log("inputContent Process: ", link);
				// console.log("inputContent treated", inputContent);
				const fileName = filenameMaker(link);
				const { cacheFolder, cacheFile } = cacheFilePath("", fileName);
				let imageCheck = false;
				// @TODO: this should just write the file, processing it and adding local images and archive links should happen at the point of building the collection I think? Especially since the collection can take an async function. Also... needs something for audio and youtube right?
				try {
					fs.accessSync(cacheFile, fs.constants.F_OK);
					const contextString = fs.readFileSync(cacheFile).toString();
					// Rebuild conditions?
					// Mby https://attacomsian.com/blog/nodejs-get-file-last-modified-date
					let contextData = {};
					try {
						contextData = JSON.parse(contextString);
					} catch (e) {
						throw new Error("Could not parse cacheFile");
					}
					// Markdown system reads tabs as code blocks no matter what.
					let htmlEmbed = contextData.htmlEmbed.replace(
						/\t|^\s+|\n|\r/gim,
						"",
					);
					const localImageObj = imageHandler.imageCheck(
						contextData,
						fileName,
						cacheFilePath,
						completeAllPromiseArray,
					);
					// console.log("Image checked", localImageObj);
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
							`${options.domain}/${options.publicImagePath}/${fileName}/${imageName}`,
						);
					}
					if (
						options.buildArchive &&
						!contextData.data.archivedData.link &&
						!contextData.data.twitterObj // Because we build pages with the Twitter Object when it is available.
					) {
						htmlEmbed = htmlEmbed.replace(
							`</contexter-box>`,
							`<a href="${options.domain}/${options.publicPath}/${contextData.sanitizedLink}" is="contexter-link" target="_blank" class="read-link archive-link" itemprop="archivedAt" rel="timemap" slot="archive-link">Archived</a></contexter-box>`,
						);
					}
					if (contextData.data.twitterObj) {
						htmlEmbed = htmlEmbed.replace(
							/<script async src"https:\/\/platform\.twitter\.com\/widgets\.js" charset="utf-8"><\/script>/g,
							"",
						);
					}
					// console.log("contextData", contextData);
					// const contextData = JSON.parse(contextString);
					if (htmlEmbed) {
						inputContent = inputContent.replace(
							urlObj.replace,
							htmlEmbed,
						);
						// console.log("Link replaced with context: ", link);
					}
					try {
						const index = backoffObj.list.indexOf(link);
						if (index > -1) {
							// only splice array when item is found
							backoffObj.list.splice(index, 1); // 2nd parameter means remove one item only
						}
						delete backoffObj.lastCheck[link];
						clearTimeout(timeoutID);
					} catch (e) {
						console.log(
							"Backoff list removal failed for link ",
							link,
						);
					}
					return;
				} catch (e) {
					try {
						if (imageCheck) {
							console.log("Image issue possibly", e);
						}
						// console.log("Contextualizing link: ", link);
						inputContent = inputContent.replace(
							urlObj.replace,
							`<p><a href="${link}" target="_blank">${link}</a></p>`,
						);
						if (
							process.env.ELEVENTY_RUN_MODE == "build" &&
							!process.env.hasOwnProperty("BUILD_CONTEXT")
						) {
							console.log(
								"Do not attempt to build context for link: ",
								link,
							);
							return;
						} else {
							console.log("Contextualizing link: ", link);
						}
						if (backoffObj?.list.includes(link)) {
							const dateDiff =
								Date.now() -
								Date.parse(backoffObj.lastCheck[link]);
							if (dateDiff < 1.21e9) {
								console.log(
									"Backing off link: ",
									link,
									" with date diff of ",
									dateDiff,
								);
								// It has been less than 14 days since the last check
								return;
							}
						} else {
							backoffObj.list.push(link);
							backoffObj.lastCheck[link] = new Date().toString();
						}
						let pContext = contexter.context(link);
						let requestWithTimeout = (promises) => {
							return Promise.race(promises);
						};
						/*
						timeoutForRequest.then((resolution) => {
							if (resolution) {
								console.log(
									"Request timed out for ",
									link,
									resolution,
								);
								return;
							}
						});
						*/
						// completeAllPromiseArray.push(pContext);
						// No file yet
						console.log(
							"Cached link " + cacheFile + " to repo not ready",
						);
						// Set a timeout that breaks out of this function
						// if the request takes too long
						try {
							requestWithTimeout([pContext, timeoutForRequest])
								.then((r) => {
									const fileWritePromise = new Promise(
										(resolve, reject) => {
											console.log(
												"Context ready",
												r.linkId,
											);
											// No file yet
											console.log(
												"Cached link for " +
													cacheFile +
													" ready to write.",
											);
											try {
												console.log(
													"Writing data for: ",
													link,
												);
												fs.mkdirSync(cacheFolder, {
													recursive: true,
												});
												imageHandler
													.handleImageFromObject(
														r,
														fileName,
														cacheFilePath,
													)
													.then(
														(
															localImageFileName,
														) => {
															console.log(
																"handleImageFromObject result ",
																localImageFileName,
															);
															if (
																localImageFileName
															) {
																r.localImage = `/${options.publicImagePath}/${fileName}/${localImageFileName}`;
																// console.log('write data to file', cacheFile)
															}
															fs.writeFileSync(
																cacheFile,
																JSON.stringify(
																	r,
																),
															);
															resolve(cacheFile);
														},
													)
													.catch((e) => {
														console.log(
															"Image handling failed",
															e,
														);
														reject(e);
													});
											} catch (e) {
												console.log(
													"writing to cache failed:",
													e,
												);
												reject(e);
											}
											setTimeout(() => {
												console.log(
													"Request timed out for ",
													cacheFile,
												);
												reject(
													new Error(
														"Archiving request timeout error for " +
															cacheFile +
															" from ",
														link,
													),
												);
											}, 15000);
										},
									).catch((e) => {
										console.log(
											"Context inner adding promise failed on ",
											link,
											e,
										);
										return;
									});
									completeAllPromiseArray.push(
										fileWritePromise,
									);
									return;
								})
								.catch((e) => {
									console.log(
										"Context adding promise failed on ",
										link,
										e,
									);
									clearTimeout(timeoutID);
								});
						} catch (e) {
							console.log(
								"Context outer adding promise failed on ",
								link,
								e,
							);
							clearTimeout(timeoutID);
							return;
						}
					} catch (e) {
						console.log("Contexter Process Failed: ", e);
						clearTimeout(timeoutID);
						return;
					}
				}
				clearTimeout(timeoutID);
				return;
			});
			fs.writeFileSync(backoffList, JSON.stringify(backoffObj));
		}
		// console.log("Input content ready to return");
		const renderResult = options.existingRenderer.render(
			inputContent,
			data,
		);
		// console.log("Input content processing result for ", data.title);
		// 2nd argument sets env
		return renderResult;
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
			try {
				if (
					(remark && data.layout && /post/.test(data.layout)) ||
					/fwd/.test(data.layout) ||
					/topic/.test(data.layout) ||
					/timeline-standalone-item/.test(data.layout)
				) {
					// console.log("msc compile");
					console.log("RUN MODE == ", process.env.ELEVENTY_RUN_MODE);

					const rmResult = reMarkdown(inputContent, data);
					// console.log("Processed with reMarkdown function complete");
					return rmResult;
				}
			} catch (e) {
				console.log("markdown-contexter reMarkdown failed", e);
			}
			// console.log("msc data");
			// console.dir(this.global);
			// You can also access the default `markdown-it` renderer here:
			try {
				return this.defaultRenderer(data);
			} catch (e) {
				console.log(
					"Default render process has failed, this is bad ",
					e,
				);
			}
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
				let results = await Promise.all(completeAllPromiseArray);
				const invalidResults = results.filter((result) => {
					if (result instanceof Error) {
						return result;
					}
				});
				console.log("Invalid Results Count: ", invalidResults.length);
			} catch (e) {
				console.log(
					"Could not complete all promises from Contexter",
					e,
				);
			}
			console.log("Archives Collection ");
			archiveFilesList = buildArchiveFileList();
			const archives = [];
			archiveFilesList.forEach((cacheFile) => {
				if (cacheFile == "backoff.json") {
					return;
				}
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
									`<a href="${options.domain}/${options.publicPath}/${contextData.sanitizedLink}" is="contexter-link" target="_blank" class="read-link archive-link" itemprop="archivedAt" slot="archive-link">Archived</a></contexter-box>`,
								);
						}
						archives.push(contextData);
					} catch (e) {
						console.log(
							"Failed to assure clean data",
							contextData.sanitizedLink,
							contextData.data.finalizedMeta,
							e,
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
