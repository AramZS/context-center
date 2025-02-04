const sentenceCase = function (str) {
	if (typeof str !== "string" || !str.length) {
		return str;
	}
	str = str.replace(/-/g, " ");
	return str[0].toUpperCase() + str.slice(1).toLowerCase();
};

const humanizeDate = function (date, short) {
	const d = new Date(date);
	if (
		date.length <= 12 ||
		d.getHours() === 0 ||
		d.getHours() === 24 - d.getTimezoneOffset() / 60
	) {
		short = true;
	}
	if (short) {
		d.setHours(1 + d.getHours() + d.getTimezoneOffset() / 60); // Adjust incoming dates from EST
		return d.toLocaleString("en-US", {
			weekday: "short", // long, short, narrow
			day: "numeric", // numeric, 2-digit
			year: "numeric", // numeric, 2-digit
			month: "long", // numeric, 2-digit, long, short, narrow
			timeZone: "EST",
		});
	} else {
		return d.toLocaleString("en-US", {
			weekday: "short", // long, short, narrow
			day: "numeric", // numeric, 2-digit
			year: "numeric", // numeric, 2-digit
			month: "long", // numeric, 2-digit, long, short, narrow
			hour: "numeric", // numeric, 2-digit
			minute: "numeric", // numeric, 2-digit
			timeZone: "EST",
		});
	}
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
