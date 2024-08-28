const sentenceCase = function (str) {
	if (typeof str !== "string" || !str.length) {
		return str;
	}
	str = str.replace(/-/g, " ");
	return str[0].toUpperCase() + str.slice(1).toLowerCase();
};

const humanizeDate = function (date, short) {
	const d = new Date(date);
	if (!short) {
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

const isNotWrappedInParagraphTags = function (html) {
	if (typeof html !== "string") {
		return false;
	}
	return !(html.substring(0, 3) === "<p>");
};

module.exports = {
	sentenceCase,
	humanizeDate,
	isNotWrappedInParagraphTags,
};
