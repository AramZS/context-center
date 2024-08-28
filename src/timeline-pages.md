---
layout: timeline-extended
pagination:
    data: collections.timelines
    size: 1
    alias: timeline
permalink: "timeline/{{ timeline.timelineUrl | slugify }}/index.html"
eleventyComputed:
  title: "{{ timeline.title }}"
  description: "{{ timeline.description }}"
  timelineSlug: "{{ timeline.timelineSlug }}"
---

