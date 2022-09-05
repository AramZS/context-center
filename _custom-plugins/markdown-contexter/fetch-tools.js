// Using suggestion from the docs - https://www.npmjs.com/package/node-fetch#loading-and-configuring-the-module

const fetch = (...args) =>
	import("node-fetch").then(({ default: fetch }) => fetch(...args));

const ua =
	"facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)";

const getRequestHeaders = () => {
	return {
		cookie: "",
		"Accept-Language": "en-US,en;q=0.8",
		"User-Agent": ua,
	};
};

class HTTPResponseError extends Error {
	constructor(response, ...args) {
		super(
			`HTTP Error Response: ${response.status} ${response.statusText}`,
			...args
		);
		this.response = response;
	}
}

const checkStatus = (response, url) => {
	if (response.ok) {
		// response.status >= 200 && response.status < 300
		return response;
	} else {
		console.log(
			"HTTP response internals failed for " + url,
			response.internals
		);
		throw new HTTPResponseError(response);
	}
};

const fetchUrl = async (url, options = false, ua = true) => {
	let response = false;
	let finalOptions = options
		? options
		: {
				method: "get",
		  };
	if (ua) {
		finalOptions.header = ua === true ? ua : getRequestHeaders();
	}
	try {
		response = await fetch(url, finalOptions);
	} catch (e) {
		if (e.hasOwnProperty("response")) {
			console.error("Fetch Error in response", e.response.text());
		} else if (e.code == "ENOTFOUND") {
			console.error("URL Does Not Exist", e);
		}
		return false;
	}
	response = checkStatus(response, url);
	return response;
};

module.exports = fetchUrl;
