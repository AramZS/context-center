module.exports = (document, HTMLElement) => {
	function isPlainObject(v) {
		return v && typeof v === "object" && Object.prototype === v.__proto__;
	}
	let h = (tag, attrs, ...children) => {
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
	};
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
	return TimelineItem;
};
