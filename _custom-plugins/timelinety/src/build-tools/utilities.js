const sentenceCase = function (str) {
	if (typeof str !== "string" || !str.length) {
		return str;
	}
	str = str.replace(/-/g, " ");
	return str[0].toUpperCase() + str.slice(1).toLowerCase();
};

const humanizeDate = function (datetime, date) {
	const d = new Date(datetime || date);
	if (datetime) {
		return d.toLocaleString("en-US", {
			weekday: "short", // long, short, narrow
			day: "numeric", // numeric, 2-digit
			year: "numeric", // numeric, 2-digit
			month: "long", // numeric, 2-digit, long, short, narrow
			hour: "numeric", // numeric, 2-digit
			minute: "numeric", // numeric, 2-digit
		});
	}
	return d.toLocaleString("en-US", {
		weekday: "short", // long, short, narrow
		day: "numeric", // numeric, 2-digit
		year: "numeric", // numeric, 2-digit
		month: "long", // numeric, 2-digit, long, short, narrow
	});
};

const isWrappedInParagraphTags = function (html) {
	if (typeof html !== "string") {
		return false;
	}
	return html.substring(0, 3) === "<p>";
};

module.exports = {
	sentenceCase,
	humanizeDate,
	isWrappedInParagraphTags,
};
