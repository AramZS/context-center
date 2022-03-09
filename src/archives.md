---
layout: archives
eleventyExcludeFromCollections: true
pagination:
    data: collections.archives
    size: 1
    alias: archive
permalink: "timegate/{{ archive.sanitizedLink }}/index.html"
eleventyComputed:
    title: "{{ archive.data.finalizedMeta.title }}"
    description: "{{ archive.data.finalizedMeta.description }}"
	modified: "Last Modified"
---
