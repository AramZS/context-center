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
		let tagIslugs = data.tags
			.filter((i) => i)
			.reduce((a, c) => {
				return `${a} fa-i-${c
					.replace(/[^\w\s$*_+~.()'"!\-:@]+/g, "")
					.replace(/[^A-Za-z0-9\s]/g, "")
					.trim()
					.replace(/\s+/g, "-")
					.toLowerCase()}`;
			}, "");
		let tagICslugs = data.tags
			.filter((i) => i)
			.reduce((a, c) => {
				return `${a} fa-ic-${c
					.replace(/[^\w\s$*_+~.()'"!\-:@]+/g, "")
					.replace(/[^A-Za-z0-9\s]/g, "")
					.trim()
					.replace(/\s+/g, "-")
					.toLowerCase()}`;
			}, "");
		let timelineIcon = h(
			"div",
			{
				class: `timeline-icon ${data.color} ${tagICslugs}`,
			},
			data?.faicon || tagIslugs
				? h("i", {
						class: `fas fa-${
							data.faicon ? data.faicon : "fa-i-basic"
						} ${tagIslugs}`,
						"aria-hidden": "true",
					})
				: null,
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
				h("time", { datetime: data.date }, data.humanReadableDate),
			),
			h(
				"h2",
				{},
				h(
					"a",
					{
						id: data.slug,
						href:
							location.protocol +
							"//" +
							location.host +
							data.page.url,
					},
					h("i", { class: "fas fa-link" }),
				),
				data.title,
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
							}),
						),
						h("span", { class: "caption" }, data.image.caption),
					)
				: null,
			data.isBasedOn && data.customLink
				? h(
						"a",
						{ target: "_blank", href: "data.customLink" },
						"Read the article",
					)
				: null,
			h("span", { class: "inner-description" }),
			data?.links.length
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
											link.linkText,
										),
										` ` + link.extraText,
									),
								);
							});
							return lis;
						})(),
					)
				: null,
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
		// Element functionality written in here
	}
}

customElements.define("timeline-item", TimelineItem);

function reflowEntries() {
	var entries = document.querySelectorAll(
		'.timeline-entry[aria-hidden="false"]',
	);
	for (var i = 0; i < entries.length; i++) {
		var entry = entries[i];
		entry.classList.remove("odd", "even", "first");
		if (i === 0) {
			entry.classList.add("first");
		}
		if (i % 2 === 0) {
			entry.classList.add("even");
		} else {
			entry.classList.add("odd");
		}
	}
}

function resetURLOnScroll() {
	// Step 1: Function to check if the URL is three path levels deep
	let path = window.location.pathname;
	// Remove leading and trailing slashes and split the path
	const segments = path.replace(/^\/|\/$/g, "").split("/");

	function isThreePathLevelsDeep() {
		return segments.length === 3;
	}

	// Step 2: Function to change the URL on scroll
	function changeUrlOnScroll() {
		if (isThreePathLevelsDeep()) {
			// Example of changing the URL, you can customize the path as needed
			const newPath = `/${segments[0]}/${segments[1]}/`;
			window.history.pushState({}, "", newPath);
			document.removeEventListener("DOMContentLoaded", changeUrlOnScroll);
		}
	}

	if (isThreePathLevelsDeep()) {
		console.log("On timeline item");
		// Attach the scroll event listener to the window
		window.addEventListener("scroll", changeUrlOnScroll);
	}
}

function singleItemPageFill() {
	/* We have JS! */
	console.log("onload trigger");
	var root = document.documentElement;
	root.classList.remove("no-js");

	let container = document.querySelector("section article.timeline");
	let homeItem = document.getElementById(window.timelineHomeItemSlug);
	container.prepend(...window.timelinePrepends);
	homeItem.scrollIntoView();
	container.append(...window.timelineAppends);
	homeItem.scrollIntoView();
	homeItem.querySelector(".timeline-description").style.border =
		"2px solid var(--border-base)";
	console.log("Build complete");
	reflowEntries();
	homeItem.scrollIntoView();
	// Clean up
	document.removeEventListener("DOMContentLoaded", singleItemPageFill);
	resetURLOnScroll();
}

let preload = () => {
	fetch(window.timelineAPI)
		.then((response) => response.json())
		.then((data) => {
			console.log(data);
			let homeItemFound = false;
			window.timelinePrepends = [];
			window.timelineAppends = [];
			const TimelineEl = customElements.get("timeline-item");
			data.items.forEach((item) => {
				console.log("process this data", item);
				let itemDOMObj = new TimelineEl(); // document.createElement("timeline-item");
				// itemDOMObj.setAttribute("data-buildobj", JSON.stringify(item));
				itemDOMObj.itembuild = item;
				if (item.slug == window.timelineHomeItemSlug) {
					homeItemFound = true;
				} else {
					if (!homeItemFound) {
						window.timelinePrepends.push(itemDOMObj);
					} else {
						window.timelineAppends.push(itemDOMObj);
					}
				}
			});
			console.log(document.readyState);
			if (document.readyState != "loading") {
				console.log("Document ready");
				singleItemPageFill();
			} else {
				document.addEventListener(
					"DOMContentLoaded",
					singleItemPageFill,
				);
			}
		});
};

window.timelineData = {};
preload();
