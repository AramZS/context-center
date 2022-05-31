---
layout: timeline
pagination:
    data: collections.timelines
    size: 1
    alias: timeline
permalink: "timeline/{{ timeline.timeline | slug }}/index.html"
eleventyComputed:
  title: "{{ timeline.timelineName }}"
  description: "{{ timeline.description }}"
---

