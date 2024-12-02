const fetchUrl = require("./fetch-tools");
var sanitizeFilename = require("sanitize-filename");
const fs = require("fs");
var path = require("path");
var slugify = require("slugify");

const generateImageFilename = function (imageUrl, cacheFile, cacheFilePath) {
	const imageFileNameArray = imageUrl.split("/");
	const imageFileName = imageFileNameArray[imageFileNameArray.length - 1];
	const imageFile = imageFileName.split("?")[0];
	const fileObj = cacheFilePath("images/" + cacheFile + "/", imageFile, true);
	const imageCacheFolder = fileObj.cacheFolder;
	const imageCacheFile = fileObj.cacheFile;
	fileObj.imageFileName = imageFile;
	return fileObj;
};

const pullImageFromTwitter = async (twitterObj, cacheFile, cacheFilePath) => {
	const twitterObjAdjustedPromises = twitterObj.map(async (tweetObj) => {
		if (
			tweetObj &&
			tweetObj.data &&
			tweetObj.data.attachments &&
			tweetObj.data.attachments.media_keys
		) {
			const tweetObjAdjustedMedia =
				tweetObj.data.attachments.media_keys.map(async (mediaObj) => {
					if (!mediaObj?.url) {
						if (mediaObj?.type === "photo") {
							console.log(
								"Twitter object does not have URL, no image url available",
								mediaObj
							);
						}
						return false;
					}
					const imageUrl = mediaObj.url;
					const fileObj = generateImageFilename(
						imageUrl,
						cacheFile,
						cacheFilePath
					);
					try {
						fs.accessSync(fileObj.cacheFile, fs.constants.F_OK);
						mediaObj.local_url = fileObj.cacheFile;
						return mediaObj;
					} catch (e) {
						if (fs.existsSync(fileObj.cacheFolder)) {
							console.log(
								"Folder for twitter images exists",
								fileObj.cacheFolder
							);
						} else {
							console.log(
								"Make dir for twitter images",
								fileObj.cacheFolder
							);
							fs.mkdirSync(fileObj.cacheFolder, {
								recursive: true,
							});
						}
						try {
							// @TODO: This is NOT a web ready URL.
							const localImage = await getImageAndWriteLocally(
								imageUrl,
								fileObj.cacheFile
							);
							mediaObj.local_url = localImage;
							// mediaObj.local_url = false;
						} catch (e) {
							console.log(
								"Tweet media obj enrichment failed ",
								e
							);
						}
						return mediaObj;
					}
				});
			const mediaObjs = await Promise.all(tweetObjAdjustedMedia);
			tweetObj.data.attachments.media_keys = mediaObjs;
			return tweetObj;
		}
	});
	const twitterObjAdjusted = await Promise.all(twitterObjAdjustedPromises);
	return twitterObjAdjusted;
};

const imageCheck = (response, cacheFile, cacheFilePath, promiseArray) => {
	const r = response.data;
	if (
		r.finalizedMeta &&
		r.finalizedMeta.image &&
		r.finalizedMeta.image.length
	) {
		let image = "";
		if (Array.isArray(r.finalizedMeta.image)) {
			image = r.finalizedMeta.image[0];
		} else {
			image = r.finalizedMeta.image;
		}
		if (!image) {
			return false;
		}
		const fileObj = generateImageFilename(image, cacheFile, cacheFilePath);
		const imageCacheFolder = fileObj.cacheFolder;
		const imageCacheFile = fileObj.cacheFile;
		try {
			fs.accessSync(imageCacheFile, fs.constants.F_OK);
			return {
				localImageName: imageCacheFile,
				originalImage: image,
				imageName: fileObj.imageFileName,
			};
		} catch (e) {
			try {
				const imageResult = handleImageFromObject(
					response,
					cacheFile,
					cacheFilePath
				);
				imageResult.catch((e) => {
					console.log("Image retrieve failed ", e);
				});
				promiseArray.push(imageResult);
			} catch (e) {
				console.log("Image could not be retrieved", e);
			}
			return false;
		}
	} else if (r.twitterObj && r.twitterObj.length) {
		try {
			const twitterObjResult = pullImageFromTwitter(
				r.twitterObj,
				cacheFile,
				cacheFilePath
			);
			//@TODO Process the Twitter Object usefully?
			return false;
		} catch (e) {
			console.log("Twitter Image Object failure ", e, r.twitterObj);
			return false;
		}
	} else {
		return false;
	}
};

const handleImageFromObject = async (response, cacheFile, cacheFilePath) => {
	if (response) {
		const r = response.data;
		if (
			r.finalizedMeta &&
			r.finalizedMeta.image &&
			r.finalizedMeta.image.length
		) {
			let image = "";
			if (Array.isArray(r.finalizedMeta.image)) {
				image = r.finalizedMeta.image[0];
			} else {
				image = r.finalizedMeta.image;
			}
			const imageFileNameArray = image.split("/");
			const imageFileName =
				imageFileNameArray[imageFileNameArray.length - 1];
			const imageFile = imageFileName.split("?")[0];
			const fileObj = cacheFilePath(
				"images/" + cacheFile + "/",
				imageFile,
				true
			);
			const imageCacheFolder = fileObj.cacheFolder;
			const imageCacheFile = fileObj.cacheFile;
			try {
				fs.accessSync(imageCacheFile, fs.constants.F_OK);
				return imageFile;
			} catch (e) {
				if (fs.existsSync(imageCacheFolder)) {
					// console.log("Folder for images exists", imageCacheFolder);
				} else {
					console.log("Make dir for images", imageCacheFolder);
					fs.mkdirSync(imageCacheFolder, {
						recursive: true,
					});
				}
			}
			// console.log("Writing Image to ", imageCacheFile);
			// console.log("Image file being written: ", image);
			try {
				const imageFile = await getImageAndWriteLocally(
					image,
					imageCacheFile
				);
				return imageFile;
			} catch (e) {
				console.log("Image file for page failed ", e);
				return false;
			}
		} else {
			return false;
		}
	}
};

const getImageAndWriteLocally = (url, imageCacheFile) => {
	return false;
	return new Promise((resolve, reject) => {
		fetchUrl(url)
			.then((responseImage) => {
				// console.log(url, " retrieved");
				if (responseImage) {
					responseImage.buffer().then((buffer) => {
						fs.writeFileSync(imageCacheFile, buffer);
						resolve(imageCacheFile);
					});
				} else {
					reject(false);
				}
			})
			.catch((error) => {
				console.log(
					"Image write failed in getImageAndWriteLocally ",
					error
				);
				reject(false);
			});
		/**
		 *
		try {
			responseImage = await fetchUrl(url);
		} catch (e) {
			console.log("Image fetch failed ", e);
		}
		try {
			if (responseImage) {
				const buffer = await responseImage.buffer();
				fs.writeFileSync(imageCacheFile, buffer);
				return imageCacheFile;
			} else {
				return false;
			}
		} catch (e) {
			console.log("Image write failed ", e);
			return false;
		}

		 */
	});
};

module.exports = { imageCheck, handleImageFromObject };
