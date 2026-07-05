---
featureImage:
featureImageCaption:
layout: 'layouts/feed.html'
metaDesc: A sample paginated blog index with starter categories and tags.
pagination:
  data: collections.blog
  size: 10
paginationPrevText: 'Newer'
paginationNextText: 'Older'
paginationAnchor: '#post-list'
permalink: 'blog{% if pagination.pageNumber > 0 %}/page/{{ pagination.pageNumber }}{% endif %}/index.html'
title: 'News'

lede: |
  <p class="alt-lede">Stay up to date with the latest news, announcements, and developments across our business.</p>

---
