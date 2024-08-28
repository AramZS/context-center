---
layout: timeline-json
pagination:
    data: collections.timelines
    size: 1
    alias: timeline
permalink: "timeline/{{ timeline.timelineUrl | slugify }}/index.json"
eleventyComputed:
  title: "{{ timeline.title }}"
  description: "{{ timeline.description }}"
  timelineSlug: "{{ timeline.timelineSlug }}"
---

