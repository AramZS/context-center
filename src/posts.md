---
layout: tags
templateName: tag
eleventyExcludeFromCollections: true
pagination:
    data: collections.postsPages
    size: 1
    alias: paged
permalink: "posts/{% if paged.number > 1 %}{{ paged.number }}/{% endif %}index.html"
eleventyComputed:
    title: "All Posts{% if paged.number > 1 %} | Page {{paged.number}}{% endif %}"
    description: "Posts"
---
