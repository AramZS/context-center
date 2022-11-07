const htmlToImage = require("html-to-image");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const buildItemImage = (item) => {
	console.log("Create Template Social Image Enters");
	const dom = new JSDOM(`<!DOCTYPE html><head>
	<link href="https://fonts.googleapis.com/css?family=Roboto+Slab|Hind+Vadodara:400,600" rel="stylesheet" type="text/css">
	</head><body></body>`);
	const window = dom.window;
	const document = window.document;
	const customElements = window.customElements;
	const HTMLElement = window.HTMLElement;
	function h(tag, attrs, ...children) {
		var el = document.createElement(tag);
		if (isPlainObject(attrs)) {
			for (let k in attrs) {
				if (typeof attrs[k] === "function")
					el.addEventListener(k, attrs[k]);
				else el.setAttribute(k, attrs[k]);
			}
		} else if (attrs) {
			children = [attrs].concat(children);
		}
		children = children.filter(Boolean);
		for (let child of children) el.append(child);
		return el;
	}

	function isPlainObject(v) {
		return v && typeof v === "object" && Object.prototype === v.__proto__;
	}

	class TimelineItem extends HTMLElement {
		elBuilder(data) {
			console.log("Set data ", data);
			this.setAttribute("data-tags", data.tags.join(","));
			let timelineIcon = h(
				"div",
				{
					class: `timeline-icon ${data.color}`,
				},
				data?.faicon
					? h("i", {
							class: `fas fa-${data.faicon}`,
							"aria-hidden": "true",
					  })
					: null
			);
			if (data.color) timelineIcon.classList.add(data.color);
			this.appendChild(timelineIcon);

			let timelineDescription = h(
				"div",
				{
					class: "timeline-description",
				},
				h(
					"span",
					{ class: "timestamp" },
					h("time", { datetime: data.date }, data.humanReadableDate)
				),
				h(
					"h2",
					{},
					h(
						"a",
						{ id: data.slug, href: data.slug },
						h("i", { class: "fas fa-link" })
					),
					data.title
				),
				data.image
					? h(
							"div",
							{ class: "captioned-image image-right" },
							h(
								data.image.link ? "a" : "span",
								{},
								h("img", {
									src: data.image.src,
									alt: data.image.alt,
								})
							),
							h("span", { class: "caption" }, data.image.caption)
					  )
					: null,
				data.isBasedOn && data.customLink
					? h(
							"a",
							{ target: "_blank", href: "data.customLink" },
							"Read the article"
					  )
					: null,
				h("span", { class: "inner-description" }),
				data.links && data.links.length
					? h(
							"ul",
							{},
							...(() => {
								let lis = [];
								data.links.forEach((link) => {
									lis.push(
										h(
											"li",
											{},
											h(
												"a",
												{
													href: link.href,
													target: "_blank",
												},
												link.linkText
											),
											` ` + link.extraText
										)
									);
								});
								return lis;
							})()
					  )
					: null
			);
			this.appendChild(timelineDescription);
			let innerContent = this.querySelector(".inner-description");
			innerContent.innerHTML = `${data.content}`;
		}
		set itembuild(data) {
			this.elBuilder(data);
		}
		constructor() {
			// Always call super first in constructor
			super();
			console.log("Custom Element Setup");
			this.setAttribute("aria-hidden", "false");
			this.classList.add("timeline-entry");
			this.classList.add("odd");
			this.attachShadow({ mode: "open" });
			// Element functionality written in here
		}
	}

	customElements.define("timeline-item", TimelineItem);

	const styleElement = () => {
		let style = document.createElement("style");

		style.textContent = `
/*! normalize.css v8.0.1 | MIT License | github.com/necolas/normalize.css */

/* Document
	========================================================================== */

/**
 * 1. Correct the line height in all browsers.
 * 2. Prevent adjustments of font size after orientation changes in iOS.
 */

	html {
	line-height: 1.15; /* 1 */
	-webkit-text-size-adjust: 100%; /* 2 */
	}

	/* Sections
		========================================================================== */

	/**
	 * Remove the margin in all browsers.
	 */

	body {
	margin: 0;
	}

	/**
	 * Render the main element consistently in IE.
	 */

	main {
	display: block;
	}


	h1 {
	font-size: 2em;
	margin: 0.67em 0;
	}

	/* Grouping content
		========================================================================== */

	/**
	 * 1. Add the correct box sizing in Firefox.
	 * 2. Show the overflow in Edge and IE.
	 */

	hr {
	box-sizing: content-box; /* 1 */
	height: 0; /* 1 */
	overflow: visible; /* 2 */
	}



	pre {
	font-family: monospace, monospace; /* 1 */
	font-size: 1em; /* 2 */
	}

	/* Text-level semantics
		========================================================================== */

	/**
	 * Remove the gray background on active links in IE 10.
	 */

	a {
	background-color: transparent;
	}

	/**
	 * 1. Remove the bottom border in Chrome 57-
	 * 2. Add the correct text decoration in Chrome, Edge, IE, Opera, and Safari.
	 */

	abbr[title] {
	border-bottom: none; /* 1 */
	text-decoration: underline; /* 2 */
	text-decoration: underline dotted; /* 2 */
	}

	/**
	 * Add the correct font weight in Chrome, Edge, and Safari.
	 */

	b,
	strong {
	font-weight: bolder;
	}

	code,
	kbd,
	samp {
	font-family: monospace, monospace; /* 1 */
	font-size: 1em; /* 2 */
	}

	/**
	 * Add the correct font size in all browsers.
	 */

	small {
	font-size: 80%;
	}

	sub,
	sup {
	font-size: 75%;
	line-height: 0;
	position: relative;
	vertical-align: baseline;
	}

	sub {
	bottom: -0.25em;
	}

	sup {
	top: -0.5em;
	}

	/* Embedded content
		========================================================================== */

	/**
	 * Remove the border on images inside links in IE 10.
	 */

	img {
	border-style: none;
	}

	/* Forms
		========================================================================== */

	/**
	 * 1. Change the font styles in all browsers.
	 * 2. Remove the margin in Firefox and Safari.
	 */

	button,
	input,
	optgroup,
	select,
	textarea {
	font-family: inherit; /* 1 */
	font-size: 100%; /* 1 */
	line-height: 1.15; /* 1 */
	margin: 0; /* 2 */
	}

	/**
	 * Show the overflow in IE.
	 * 1. Show the overflow in Edge.
	 */

	button,
	input {
	/* 1 */
	overflow: visible;
	}

	/**
	 * Remove the inheritance of text transform in Edge, Firefox, and IE.
	 * 1. Remove the inheritance of text transform in Firefox.
	 */

	button,
	select {
	/* 1 */
	text-transform: none;
	}

	/**
	 * Correct the inability to style clickable types in iOS and Safari.
	 */

	button,
	[type='button'],
	[type='reset'],
	[type='submit'] {
	-webkit-appearance: button;
	}

	/**
	 * Remove the inner border and padding in Firefox.
	 */

	button::-moz-focus-inner,
	[type='button']::-moz-focus-inner,
	[type='reset']::-moz-focus-inner,
	[type='submit']::-moz-focus-inner {
	border-style: none;
	padding: 0;
	}

	/**
	 * Restore the focus styles unset by the previous rule.
	 */

	button:-moz-focusring,
	[type='button']:-moz-focusring,
	[type='reset']:-moz-focusring,
	[type='submit']:-moz-focusring {
	outline: 1px dotted ButtonText;
	}

	/**
	 * Correct the padding in Firefox.
	 */

	fieldset {
	padding: 0.35em 0.75em 0.625em;
	}

	legend {
	box-sizing: border-box; /* 1 */
	color: inherit; /* 2 */
	display: table; /* 1 */
	max-width: 100%; /* 1 */
	padding: 0; /* 3 */
	white-space: normal; /* 1 */
	}

	/**
	 * Add the correct vertical alignment in Chrome, Firefox, and Opera.
	 */

	progress {
	vertical-align: baseline;
	}

	/**
	 * Remove the default vertical scrollbar in IE 10+.
	 */

	textarea {
	overflow: auto;
	}

	/**
	 * 1. Add the correct box sizing in IE 10.
	 * 2. Remove the padding in IE 10.
	 */

	[type='checkbox'],
	[type='radio'] {
	box-sizing: border-box; /* 1 */
	padding: 0; /* 2 */
	}

	/**
	 * Correct the cursor style of increment and decrement buttons in Chrome.
	 */

	[type='number']::-webkit-inner-spin-button,
	[type='number']::-webkit-outer-spin-button {
	height: auto;
	}

	/**
	 * 1. Correct the odd appearance in Chrome and Safari.
	 * 2. Correct the outline style in Safari.
	 */

	[type='search'] {
	-webkit-appearance: textfield; /* 1 */
	outline-offset: -2px; /* 2 */
	}

	/**
	 * Remove the inner padding in Chrome and Safari on macOS.
	 */

	[type='search']::-webkit-search-decoration {
	-webkit-appearance: none;
	}

	::-webkit-file-upload-button {
	-webkit-appearance: button; /* 1 */
	font: inherit; /* 2 */
	}

	/* Interactive
		========================================================================== */

	/*
	* Add the correct display in Edge, IE 10+, and Firefox.
	*/

	details {
	display: block;
	}

	/*
	* Add the correct display in all browsers.
	*/

	summary {
	display: list-item;
	}

	/* Misc
		========================================================================== */

	/**
	 * Add the correct display in IE 10+.
	 */

	template {
	display: none;
	}

	/**
	 * Add the correct display in IE 10.
	 */

	[hidden] {
	display: none;
	}

:root {
	--c2: #333;
	--c3: #1e1f20;
	--c4: #fff;
	--background-color: #121212;
	--base-font-color: var(--c4);
	--border-base: #FFFF00;
	--border-overlap: #040403;
	--back-fill: #E6E64C;
	--back-fill-overlap: #040403;
	--light-highlight: #63AEE6;
	--light-highlight-overlap: #000000;
	--accent: #E67C7A;
	--accent-overlap: #120B01;
	--dark-highlight: #326E99;
	--dark-highlight-overlap: #FFFFFF;
	--link-color: var(--light-highlight);
}
body {
	font-family: "Hind Vadodara", sans-serif;
}
timeline-item {
  display: block;
  position: relative;
  margin-top: 6px;
  color: #eee;
  font-family: "Hind Vadodara", sans-serif;
}
.timeline-icon.grey {
	background-color: #666666;
}
.timeline-icon {
	position: absolute;
	left: 50%;
	width: 40px;
	height: 40px;
	margin-left: -20px;
	border: 4px solid #cccccc;
	  border-top-color: rgb(204, 204, 204);
	  border-right-color: rgb(204, 204, 204);
	  border-bottom-color: rgb(204, 204, 204);
	  border-left-color: rgb(204, 204, 204);
	border-radius: 50%;
	box-shadow: 0px 1px 1px rgba(0, 0, 0, 0.3);
	text-align: center;
	vertical-align: middle;
	z-index: 2;
  }
  .timeline-description .timestamp {
	font-style: italic;
	font-size: 80%;
  }
  .timeline-description h2 {
	font-family: "Roboto Slab", serif;
	line-height: 110%;
	margin: 5px 0;
	-webkit-margin-before: 5px;
	-webkit-margin-after: 5px;
  }
  .fa-regular, .fa-solid, .far, .fas {
	font-family: "Font Awesome 6 Free";
  }
  .fa-solid, .fas {
	font-weight: 900;
  }
  .fa, .fa-brands, .fa-duotone, .fa-light, .fa-regular, .fa-solid, .fa-thin, .fab, .fad, .fal, .far, .fas, .fat {
	-moz-osx-font-smoothing: grayscale;
	-webkit-font-smoothing: antialiased;
	display: inline-block;
	display: var(--fa-display,inline-block);
	font-style: normal;
	font-variant: normal;
	line-height: 1;
	text-rendering: auto;
  }
  .timeline-description p, .timeline-description ul {
	margin: 5px 0 10px 0;
  }
  .timeline-entry.even .timeline-description::after {
	left: 100%;
	border-left-color: #ffffff;
  }
  .timeline-description::after {
	top: 20px;
	border: solid transparent;
	  border-top-width: medium;
	  border-right-width: medium;
	  border-bottom-width: medium;
	  border-left-color: transparent;
	  border-left-width: medium;
	content: " ";
	height: 0;
	width: 0;
	position: absolute;
	pointer-events: none;
	border-width: 10px;
	margin-top: -10px;
	z-index: 100;
  }
`;

		return styleElement;
	};

	const createTimelineItem = async (dataObj, cacheFilePath) => {
		const TimelineEl = customElements.get("timeline-item");
		let itemDOMObj = new TimelineEl();
		let item = dataObj;
		console.log("create timeline item social image with", dataObj);
		itemDOMObj.itembuild = item;
		document.body.append(styleElement());
		console.log("Social Image Item DOM El ready", itemDOMObj.innerHTML);
		htmlToImage
			.toPng(itemDOMObj)
			.then((dataUrl) => {
				const cacheFolder = path.join(
					__dirname,
					"../../",
					`/src/img/`,
					`${item.title}.png`
				);
				console.log("Social Image ready to write to ", cacheFolder);
				fs.writeFileSync(cacheFolder, dataUrl);
			})
			.catch((reason) => {
				console.log("Social image build failed for reason: ", reason);
			});
	};
	return createTimelineItem(item);
};

const testImg = () => {
	console.log("Create Template Social Image Enters");
	const dom = new JSDOM(`<!DOCTYPE html><head>
	<link href="https://fonts.googleapis.com/css?family=Roboto+Slab|Hind+Vadodara:400,600" rel="stylesheet" type="text/css">
	</head><body></body>`);
	const window = dom.window;
	const document = window.document;
	const customElements = window.customElements;
	const HTMLElement = window.HTMLElement;
	function h(tag, attrs, ...children) {
		var el = document.createElement(tag);
		if (isPlainObject(attrs)) {
			for (let k in attrs) {
				if (typeof attrs[k] === "function")
					el.addEventListener(k, attrs[k]);
				else el.setAttribute(k, attrs[k]);
			}
		} else if (attrs) {
			children = [attrs].concat(children);
		}
		children = children.filter(Boolean);
		for (let child of children) el.append(child);
		return el;
	}

	function isPlainObject(v) {
		return v && typeof v === "object" && Object.prototype === v.__proto__;
	}

	htmlToImage
		.toPng(h("div", {}, h("p", {}, "Hello world")))
		.then((dataUrl) => {
			const cacheFolder = path.join(
				__dirname,
				"../../",
				`/src/img/`,
				`test.png`
			);
			console.log("Test Social Image ready to write to ", cacheFolder);
			fs.writeFileSync(cacheFolder, dataUrl);
		})
		.catch((reason) => {
			console.log("Test Social image build failed for reason: ", reason);
		});
};

module.exports = { buildItemImage, testImg };
