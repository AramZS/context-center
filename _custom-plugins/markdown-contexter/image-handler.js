const fetchUrl = require("./fetch-tools");
var sanitizeFilename = require("sanitize-filename");
const fs = require("fs");
var path = require("path");
var slugify = require("slugify");

const generateImageFilename = function (imageUrl, cacheFile, cacheFilePath) {
	const imageFileNameArray = imageUrl.split("/");
	const imageFileName = imageFileNameArray[imageFileNameArray.length - 1];
	const imageFile = imageFileName.split("?")[0];
	console.log(
		"Image file pieces",
		imageFileNameArray,
		imageFileName,
		imageFile
	);
	const fileObj = cacheFilePath("images/" + cacheFile + "/", imageFile, true);
	const imageCacheFolder = fileObj.cacheFolder;
	const imageCacheFile = fileObj.cacheFile;
	fileObj.imageFileName = imageFile;
	console.log("File Path Generation", imageCacheFolder, imageCacheFile);
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
						// @TODO: This is NOT a web ready URL.
						const localImage = await getImageAndWriteLocally(
							imageUrl,
							fileObj.cacheFile
						);
						mediaObj.local_url = localImage;
						// mediaObj.local_url = false;
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
		const fileObj = generateImageFilename(image, cacheFile, cacheFilePath);
		const imageCacheFolder = fileObj.cacheFolder;
		const imageCacheFile = fileObj.cacheFile;
		console.log(
			"File Path Generation",
			imageCacheFolder,
			imageCacheFile,
			fileObj.imageFileName
		);
		try {
			fs.accessSync(imageCacheFile, fs.constants.F_OK);
			return {
				localImageName: imageCacheFile,
				originalImage: image,
				imageName: fileObj.imageFileName,
			};
		} catch (e) {
			const imageResult = handleImageFromObject(
				response,
				cacheFile,
				cacheFilePath
			);
			promiseArray.push(imageResult);
			return false;
		}
	} else if (r.twitterObj && r.twitterObj.length) {
		try {
			const twitterObjResult = pullImageFromTwitter(
				twitterObj,
				cacheFile,
				cacheFilePath
			);
			//@TODO Process the Twitter Object usefully?
			return false;
		} catch (e) {
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
			console.log("Image found ", image);
			const imageFileNameArray = image.split("/");
			const imageFileName =
				imageFileNameArray[imageFileNameArray.length - 1];
			const imageFile = imageFileName.split("?")[0];
			console.log(
				"Image file pieces",
				imageFileNameArray,
				imageFileName,
				imageFile
			);
			const fileObj = cacheFilePath(
				"images/" + cacheFile + "/",
				imageFile,
				true
			);
			const imageCacheFolder = fileObj.cacheFolder;
			const imageCacheFile = fileObj.cacheFile;
			console.log(
				"File Path Generation",
				imageCacheFolder,
				imageCacheFile
			);
			try {
				fs.accessSync(imageCacheFile, fs.constants.F_OK);
				return imageFile;
			} catch (e) {
				fs.mkdirSync(imageCacheFolder, {
					recursive: true,
				});
				console.log("Writing Image to ", imageCacheFile);
				console.log("Image file being written: ", image);
				try {
					const imageFile = await getImageAndWriteLocally(
						image,
						imageCacheFile
					);
					return imageFile;
				} catch (e) {
					return false;
				}
			}
		} else {
			return false;
		}
	}
};

const getImageAndWriteLocally = async (url, imageCacheFile) => {
	const responseImage = await fetchUrl(url);
	if (responseImage) {
		const buffer = await responseImage.buffer();
		fs.writeFileSync(imageCacheFile, buffer);
		return imageCacheFile;
	} else {
		return false;
	}
};

module.exports = { imageCheck, handleImageFromObject };
