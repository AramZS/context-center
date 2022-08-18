function show(el) {
	el.style.display = "block";
	el.setAttribute("aria-hidden", false);
}

function hide(el) {
	el.style.display = "none";
	el.setAttribute("aria-hidden", true);
}

function uncheckAll() {
	var checkedBoxes = document.querySelectorAll(
		'input[type="checkbox"]:checked'
	);
	var activeFilters = [];
	checkedBoxes.forEach(function (filter) {
		filter.checked = false;
	});
	var entries = document.getElementsByClassName("timeline-entry");
	for (var i = 0; i < entries.length; i++) {
		hide(entries[i]);
	}
}

function hideUnchecked() {
	/* Uncheck the "all" box if one of the filter boxes is unchecked */
	var allBoxes = document.querySelectorAll(
		'input[type="checkbox"][name="filter"]'
	);
	var checkedBoxes = document.querySelectorAll(
		'input[type="checkbox"][name="filter"]:checked'
	);
	if (checkedBoxes.length < allBoxes.length) {
		document.querySelector('input[type="checkbox"]#all').checked = false;
	} else {
		document.querySelector('input[type="checkbox"]#all').checked = true;
	}

	var activeFilters = [];
	checkedBoxes.forEach(function (filter) {
		activeFilters.push(filter.id);
	});

	var entries = document.getElementsByClassName("timeline-entry");
	for (var i = 0; i < entries.length; i++) {
		var entry = entries[i];
		var tags = [];
		try {
			tags = entry.dataset.tags
				.split(",")
				.filter((tag) => tag.length > 0);
		} catch {
			// Pass
		}
		if (tags.length && !isItemInTags(tags, activeFilters)) {
			hide(entry);
		} else {
			show(entry);
		}
	}

	reflowEntries();
}

function checkAll() {
	var checkboxes = document.querySelectorAll(
		'input[type="checkbox"][name="filter"]'
	);
	checkboxes.forEach(function (box) {
		box.checked = true;
	});
	var entries = document.getElementsByClassName("timeline-entry");
	for (var i = 0; i < entries.length; i++) {
		show(entries[i]);
	}
	reflowEntries();
}

function isItemInTags(tags, visibleTags) {
	return visibleTags.some(function (id) {
		return tags.indexOf(id) >= 0;
	});
}

function reflowEntries() {
	var entries = document.querySelectorAll(
		'.timeline-entry[aria-hidden="false"]'
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

function onload() {
	/* We have JS! */
	var root = document.documentElement;
	root.classList.remove("no-js");

	/* Listen for filter changes */
	document
		.querySelectorAll('input[type="checkbox"][name="filter"]')
		.forEach(function (box) {
			box.addEventListener("click", hideUnchecked);
		});
	document
		.querySelector('input[type="checkbox"]#all')
		.addEventListener("click", checkAll);

	document.querySelector("button#none").addEventListener("click", uncheckAll);

	/* Flow entries */
	reflowEntries();

	// Clean up
	document.removeEventListener("DOMContentLoaded", onload);
}

if (document.readyState != "loading") {
	onload();
} else {
	document.addEventListener("DOMContentLoaded", onload);
}
