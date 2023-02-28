const htmlToImage = require("node-html-to-image");
const path = require("path");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("graceful-fs");
const { minify } = require("csso");
const { humanizeDate } = require("./utilities");
const { slugger } = require("./slugger");

const imageSlugMaker = slugger;

const imageUrlMaker = (domainName, title) => {
	return {
		standard: `${domainName}/img/previews/${imageSlugMaker(
			title
		)}-600px.png`,
		tall: `${domainName}/img/previews/${imageSlugMaker(title)}-630px.png`,
	};
};

const handlebarsTemplate = () => {
	const cssText = timelineElementStyle();
	const htmlTemplate = `<!DOCTYPE html><head>
	<link href="https://fonts.googleapis.com/css?family=Roboto+Slab|Hind+Vadodara:400,600" rel="stylesheet" type="text/css">
	<style>
		${cssText}
	</style>
	<style>
	body {
	  width: 1200px;
	  height: {{genSize}};
		}
	</style>
	</head><body>[INNERCONTENT]</body>`;
	let hbContent = `<div class="timeline-entry odd" id="{{ titleslug }}" aria-hidden="false">
    <div class="timeline-icon {{ color }}">
        {{#if faicon }}
            <i class="fas fa-{{ faicon }}" aria-hidden="true"></i>
        {{/if }}
    </div>
    <div class="timeline-description">
        <span class="timestamp">
            <time datetime="{{ date }}">
                {{ humanData }}
            </time>
        </span>
        <h2><a id="{{ titleslug }}" href="#{{ titleslug }}"><i class="fas fa-link"></i></a>{{title}}</h2>
        {{#if image }}
            <div class="captioned-image image-right">
                {{#if image.link }}<a href="{{ image.link }}">{{/if }}
                <img src="{{ image.src }}" alt="{{ image.alt }}" />
                {{#if image.link }}</a>{{/if }}
                {{#if image.caption }}
                    <span class="caption">{{ image.caption }}</span>
                {{/if }}
            </div>
        {{/if }}
        {{#if isBasedOn }}
			{{#if customLink }}
            <a target="_blank" href="{{customLink}}">Read the article</a>
			{{/if }}
        {{/if }}
        {{#if timelineItemContent }}

        {{{ timelineItemContent }}}

        {{/if }}
        {{#if links }}
            <ul>
                {{#each links }}
                    <li>
                        <a href="{{ this.href }}" target="_blank">
						{{#if this.linkText }}{{ this.linkText }}
						{{else}} {{ this.href }}
						{{/if }}
						</a>&nbsp;
						{{#if this.extraText }}{{ this.extraText }}
						{{ else }} {{ "" }}
						{{/if }}
                    </li>
                {{/each }}
            </ul>
        {{/if }}
    </div>
</div>`;
	let htmlBlock = htmlTemplate.replace(/\[INNERCONTENT\]/, hbContent);
	return htmlBlock;
};

const prepareObject = function (dataObject, size, domainName) {
	let dataObj = {};
	if (dataObject.data) {
		dataObj = dataObject;
	} else {
		dataObj = { data: dataObject };
	}
	let cacheFile = path.join(
		__dirname,
		"../../../../",
		`/src/img/previews/`,
		`${imageSlugMaker(dataObject.title)}-${size}.png`
	);
	/**
	cacheFile = `./previews/${imageSlugMaker(
		sanitizeFilename(dataObject.title)
	)}-${size}.png`; */
	dataObj.data.titleslug = imageSlugMaker(
		dataObj.title || dataObj.data.title
	);
	dataObj.data.color = dataObj.data.color || "grey";
	dataObj.data.humanData = humanizeDate(dataObj.data.date);
	let finalObj = Object.assign(
		{
			timelineItemContent: dataObj.content || dataObj.data.content,
			genSize: size,
			output: cacheFile,
			timeout: 0,
		},
		dataObj.data
	);
	return finalObj;
};

const testObj = function () {
	return {
		timeline: "monkeypox",
		title: "A looming deadline for tens of millions of Americans",
		description:
			"The GOP battles over a trillion-dollar stimulus deal. Ahead of the November election, President Trump guts a landmark environmental law. And, how to avoid a devastating potential kink in the vaccine supply chain.",
		tags: [
			"timeline",
			"Monkeypox",
			"Health",
			"Medicine",
			"Stimulus",
			"Markets",
		],
		date: "2020-06-22T16:00:00.100Z",
		categories: ["News"],
		filters: ["USA"],
		dateAdded: "2022-08-09T02:59:43.100Z",
		isBasedOn:
			"https://www.washingtonpost.com/podcasts/post-reports/a-looming-deadline-for-tens-of-millions-americans/",
		shortdate: false,
		color: "grey",
		content:
			'<script>window.contexterSetup=window.contexterSetup||function(){window.contexterSetupComplete=!0;class ContexterLink extends HTMLAnchorElement{constructor(){super()}connectedCallback(){this.setAttribute("target","_blank")}}customElements.define("contexter-link",ContexterLink,{extends:"a"}),customElements.define("contexter-inner",class extends HTMLElement{constructor(){super()}attributeChangedCallback(name,oldValue,newValue){}connectedCallback(){this.className="contexter-box__inner"}}),customElements.define("contexter-thumbnail",class extends HTMLElement{constructor(){super()}attributeChangedCallback(name,oldValue,newValue){}connectedCallback(){this.className="contexter-box__thumbnail"}}),customElements.define("contexter-byline",class extends HTMLElement{constructor(){super()}attributeChangedCallback(name,oldValue,newValue){}connectedCallback(){this.className="contexter-box__byline"}}),customElements.define("contexter-keywordset",class extends HTMLElement{constructor(){super()}attributeChangedCallback(name,oldValue,newValue){}connectedCallback(){this.className="contexter-box__keywordset"}}),customElements.define("contexter-linkset",class extends HTMLElement{constructor(){super()}attributeChangedCallback(name,oldValue,newValue){}connectedCallback(){this.className="contexter-box__linkset"}}),customElements.define("contexter-meta",class extends HTMLElement{constructor(){super()}attributeChangedCallback(name,oldValue,newValue){}connectedCallback(){this.className="contexter-box__meta"}}),customElements.define("contexter-summary",class extends HTMLElement{constructor(){super()}attributeChangedCallback(name,oldValue,newValue){}connectedCallback(){this.className="p-summary entry-summary"}}),customElements.define("contexter-box-head",class extends HTMLElement{constructor(){super()}connectedCallback(){this.className="contexter-box__head"}}),customElements.define("contexter-box-inner",class extends HTMLElement{constructor(){super()}connectedCallback(){}});class ContexterBox extends HTMLElement{constructor(){super(),this.first=!0,this.shadow=this.attachShadow({mode:"open"})}connectedCallback(){if(this.first){this.first=!1;var style=document.createElement("style"),lightDomStyle=(style.innerHTML=`:host {--background: #f5f6f7;--border: darkblue;--blue: #0000ee;--font-color: black;--inner-border: black;font-family: Franklin,Arial,Helvetica,sans-serif;font-size: 14px;background: var(--background);width: 600px;color: var(--font-color);min-height: 90px;display: block;padding: 8px;border: 1px solid var(--border);cursor: pointer;box-sizing: border-box;margin: 6px;contain: content;margin: 6px auto;}// can only select top-level nodes with slotted::slotted(*) {max-width: 100%;display:block;}::slotted([slot=thumbnail]) {max-width: 100%;display:block;}::slotted([slot=header]) {width: 100%;font-size: 1.25rem;font-weight: bold;display:block;margin-bottom: 6px;}::slotted([slot=author]) {max-width: 50%;font-size: 12px;display:inline-block;float: left;}::slotted([slot=time]) {max-width: 50%;font-size: 12px;display:inline-block;float: right;}::slotted([slot=summary]) {width: 100%;margin-top: 6px;padding: 10px 2px;border-top: 1px solid var(--inner-border);font-size: 15px;display:inline-block;margin-bottom: 6px;}contexter-meta {height: auto;margin-bottom: 4px;width: 100%;display: grid;position: relative;min-height: 16px;grid-template-columns: repeat(2, 1fr);}::slotted([slot=keywords]) {width: 80%;padding: 2px 4px;border-top: 1px solid var(--inner-border);font-size: 11px;display: block;float: right;font-style: italic;text-align: right;grid-column: 2/2;grid-row: 1;align-self: end;justify-self: end;}::slotted([slot=keywords]):empty {border-top: 0px solid var(--inner-border);}::slotted([slot=archive-link]) {font-size: 1em;display: inline;}::slotted([slot=archive-link])::after {content: "|";display: inline;color: var(--font-color);text-decoration: none;margin: 0 .5em;}::slotted([slot=read-link]) {font-size: 1em;display: inline;}contexter-linkset {width: 80%;padding: 2px 4px;font-size: 13px;float: left;font-weight: bold;grid-row: 1;grid-column: 1/2;align-self: end;justify-self: start;}/* Extra small devices (phones, 600px and down) */@media only screen and (max-width: 600px) {:host {width: 310px;}}/* Small devices (portrait tablets and large phones, 600px and up) */@media only screen and (min-width: 600px) {...}/* Medium devices (landscape tablets, 768px and up) */@media only screen and (min-width: 768px) {...}/* Large devices (laptops/desktops, 992px and up) */@media only screen and (min-width: 992px) {...}/* Extra large devices (large laptops and desktops, 1200px and up) */@media only screen and (min-width: 1200px) {...}@media (prefers-color-scheme: dark){:host {--background: #354150;--border: #1f2b37;--blue: #55b0ff;--font-color: #ffffff;--inner-border: #787a7c;background: var(--background);border: 1px solid var(--border)}}`,document.createElement("style"));lightDomStyle.innerHTML=`contexter-box {contain: content;}contexter-box .read-link {font-weight: bold;}contexter-box a {color: #0000ee;}contexter-box img {width: 100%;border: 0;padding: 0;margin: 0;}/* Extra small devices (phones, 600px and down) */@media only screen and (max-width: 600px) {...}/* Small devices (portrait tablets and large phones, 600px and up) */@media only screen and (min-width: 600px) {...}/* Medium devices (landscape tablets, 768px and up) */@media only screen and (min-width: 768px) {...}/* Large devices (laptops/desktops, 992px and up) */@media only screen and (min-width: 992px) {...}/* Extra large devices (large laptops and desktops, 1200px and up) */@media only screen and (min-width: 1200px) {...}@media (prefers-color-scheme: dark){contexter-box a {color: #55b0ff;}}`,this.appendChild(lightDomStyle),this.shadow.appendChild(style);const innerContainer=document.createElement("contexter-box-inner"),innerSlotThumbnail=(this.shadow.appendChild(innerContainer),document.createElement("slot")),innerSlotHeader=(innerSlotThumbnail.name="thumbnail",innerContainer.appendChild(innerSlotThumbnail),document.createElement("slot")),innerSlotAuthor=(innerSlotHeader.name="header",innerContainer.appendChild(innerSlotHeader),document.createElement("slot")),innerSlotTime=(innerSlotAuthor.name="author",innerContainer.appendChild(innerSlotAuthor),document.createElement("slot")),innerSlotSummary=(innerSlotTime.name="time",innerContainer.appendChild(innerSlotTime),document.createElement("slot")),metaContainer=(innerSlotSummary.name="summary",innerContainer.appendChild(innerSlotSummary),document.createElement("contexter-meta")),innerSlotInfo=(innerContainer.appendChild(metaContainer),document.createElement("slot")),linkContainer=(innerSlotInfo.name="keywords",metaContainer.appendChild(innerSlotInfo),document.createElement("contexter-linkset")),innerSlotArchiveLink=(metaContainer.appendChild(linkContainer),document.createElement("slot")),innerSlotReadLink=(innerSlotArchiveLink.name="archive-link",linkContainer.appendChild(innerSlotArchiveLink),document.createElement("slot"));innerSlotReadLink.name="read-link",linkContainer.appendChild(innerSlotReadLink),this.className="contexter-box",this.onclick=e=>{if(!e.target.className.includes("read-link")&&!e.target.className.includes("title-link")){const mainLinks=this.querySelectorAll("a.main-link");mainLinks[0].click()}}}}}customElements.define("contexter-box",ContexterBox)},window.contexterSetupComplete||window.contexterSetup();</script><contexter-box class="link-card h-entry hentry" itemscope="" itemtype="https://schema.org/CreativeWork"><contexter-thumbnail class="thumbnail" slot="thumbnail"></contexter-thumbnail><contexter-box-head slot="header" class="p-name entry-title" itemprop="headline"><contexter-box-head slot="header" class="p-name entry-title" itemprop="headline"><a is="contexter-link" href="https://www.washingtonpost.com/podcasts/post-reports/a-looming-deadline-for-tens-of-millions-americans/" itemprop="url">A looming deadline for tens of millions of Americans</a></contexter-box-head></contexter-box-head><time class="dt-published published" slot="time" itemprop="datePublished" datetime="2022-08-09T04:52:23.531Z">7/9/2022</time><contexter-summary class="p-summary entry-summary" itemprop="abstract" slot="summary"><p>The GOP battles over a trillion-dollar stimulus deal. Ahead of the November election, President Trump guts a landmark environmental law. And, how to avoid a devastating potential kink in the vaccine supply chain.</p></contexter-summary><contexter-keywordset itemprop="keywords" slot="keywords"></contexter-keywordset><a href="https://web.archive.org/web/20220809045234/https://www.washingtonpost.com/podcasts/post-reports/a-looming-deadline-for-tens-of-millions-americans/" is="contexter-link" target="_blank" rel="timemap" class="read-link archive-link" itemprop="archivedAt" slot="archive-link">Archived</a><a is="contexter-link" href="https://www.washingtonpost.com/podcasts/post-reports/a-looming-deadline-for-tens-of-millions-americans/" class="read-link main-link" itemprop="sameAs" slot="read-link">Read</a></contexter-box>\n',
		slug: "a-looming-deadline-for-tens-of-millions-of-americans",
	};
};

const timelineElementStyle = (doc) => {
	// let style = doc.createElement("style");

	//style.type = "text/css";
	// style.setAttribute("type", "text/css");

	const cssOne = fs.readFileSync(
		"./_custom-plugins/timelinety/src/css/normalize.css",
		{
			encoding: "utf8",
			flag: "r",
		}
	);
	const cssTwo = fs.readFileSync(
		"./_custom-plugins/timelinety/src/css/main.css",
		{
			encoding: "utf8",
			flag: "r",
		}
	);

	const cssThree = fs.readFileSync(
		"./_custom-plugins/timelinety/src/css/image.css",
		{
			encoding: "utf8",
			flag: "r",
		}
	);

	let cssText = cssOne + "\n\n" + cssTwo + "\n\n" + cssThree;
	const minifiedCss = minify(cssText).css;

	// style.appendChild(doc.createTextNode(minifiedCss));

	// style.innerText = cssText;

	// return style;
	return cssText;
};

function generateSomeImages(imageSet) {
	return new Promise((resolve, reject) => {
		console.log(`Image sub array of ${imageSet.length} ready to process`);
		const imagesToCreate = [];
		imageSet.forEach((imgObject) => {
			if (fs.existsSync(imgObject.output) && process.env.RECREATE_IMGS) {
				// Only create the images that don't already exist.
				console.log("File already exists", imgObject.output);
			} else {
				imagesToCreate.push(imgObject);
			}
		});
		if (imagesToCreate.length === 0) {
			console.log("No images needed to be created for this chunk");
			resolve(true);
		} else {
			htmlToImage({
				html: handlebarsTemplate(),
				content: imagesToCreate,
				puppeteerArgs: { timeout: 0 },
			})
				.then(() => {
					console.log("The images were created successfully!");
					resolve(true);
				})
				.catch((error) => {
					console.log(
						"The images were not created successfully!",
						error
					);
					reject(error);
				});
		}
	});
}

function chunkUpArray(inputArray) {
	const perChunk = 25; // items per chunk

	const result = inputArray.reduce((resultArray, item, index) => {
		const chunkIndex = Math.floor(index / perChunk);

		if (!resultArray[chunkIndex]) {
			resultArray[chunkIndex] = []; // start a new chunk
		}

		resultArray[chunkIndex].push(item);

		return resultArray;
	}, []);
	console.log("Chunk count ", result.length);
	return result;
}

const queueImagesProcess = (timelineImages) => {
	console.log(`Image array of ${timelineImages.length} ready to process`);
	//console.log(timelineImages);
	let chunks = chunkUpArray(timelineImages);
	let firstChunk = chunks.shift();
	try {
		let finalPromise = new Promise((resolve, reject) => {
			let finalStep = Promise.resolve();
			let promiseChain = chunks.reduce(
				(prev, cur) =>
					prev.then(() => {
						return generateSomeImages(cur);
					}),
				generateSomeImages(firstChunk)
			);
			return promiseChain
				.then(() => {
					console.log("Chain complete");
					resolve(true);
				})
				.catch((e) => {
					console.log("Promise catch error in-chain ", e);
					reject(false);
				});
		});
		return finalPromise;
	} catch (e) {
		console.log("Promise resolution failed", e);
		return false;
	}
};

module.exports = {
	handlebarsTemplate,
	prepareObject,
	queueImagesProcess,
	imageUrlMaker,
};
