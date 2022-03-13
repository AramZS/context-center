---
layout: tags
templateName: tag
eleventyExcludeFromCollections: true
pagination:
    data: collections.topicsPages
    size: 1
    alias: paged
permalink: "topics/{% if paged.number > 1 %}{{ paged.number }}/{% endif %}index.html"
eleventyComputed:
    title: "Topics {% if paged.number > 1 %} | Page {{paged.number}}{% endif %}"
    description: "Topics with Context"
---
