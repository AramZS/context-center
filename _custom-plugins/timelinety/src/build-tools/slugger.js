const slugify = require("slugify");
var sanitizeFilename = require("sanitize-filename");

const slugger = (aString) => {
	return slugify(sanitizeFilename(aString), {
		remove: /[*+~.(),'"!:@—]/g,
		lower: true,
	});
};

module.exports = {
	slugger,
};
