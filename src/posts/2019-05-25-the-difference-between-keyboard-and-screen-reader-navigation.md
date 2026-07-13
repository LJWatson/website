---
title: "The difference between keyboard and screen reader navigation"
date: 2019-05-25
postTags: ["Screen readers"]
postCategories: ["Web life"]
postSummary: "Screen reader users are often grouped with keyboard-only users, but this obscures how differently they actually navigate content. I'm going to explain the key distinction between keyboard and screen reader navigation."
---

[18/5000 한국어 번역](https://web-for-all.tistory.com/4)

People often include screen reader users in the much larger group of keyboard-only users. Whilst this is correct (most screen reader users don't use a mouse), it also creates a false impression of the way screen reader users navigate content.

To help explain this, I'm going to generalise and refer to the two following groups of people:

* Keyboard users: people who don't use a mouse but can see the content.
* Screen reader users: people who don't use a mouse and can't see the content.

This is a massive over-simplification of the different groups, but the ability to see the content or not is the crux of the difference in navigation.

## Keyboard navigation

Keyboard users navigate through content using a limited set of keyboard shortcuts:

* The tab key moves to the next focusable element (like a link, button, or form field) and scrolls it into view if it wasn't already contained within the viewport. The shift and tab keys together move to the previous focusable element.
* The space key scrolls the next chunk of content into view, and the shift and space keys together scroll the previous chunk of content into view. The pagedown and pageup keys do the same things respectively.
* The home key brings the top of the page into view, and the end key brings the bottom of the page into view.

This isn't a very refined way of navigating content, and it isn't without problems, but it generally works if you can see the content as it moves into view. That, of course, is where screen reader users come unstuck.

## Screen reader navigation

Apart from things like [live regions](/accessible-forms-with-aria-live-regions/), screen readers only speak the content they're focused on, and here we need to draw an important distinction: keyboard focus and [screen reader focus](/understanding-screen-reader-interaction-modes/) are not the same thing!

Keyboard focus is restricted to tabbing between focusable elements. If a screen reader user uses the tab key to navigate content, all they will hear is the name of each focusable element as it receives keyboard focus. What they won't hear is all the other content like text, headings, and images.

When using the tab key, keyboard focus and screen reader focus are synchronised with each other. The rest of the time, screen reader users have an enormous range of commands at their disposal for reading and navigating content independently of keyboard focus. The commands vary between screen readers, but they all have one thing in common: they're tied to different HTML elements. There are commands for moving screen reader focus between things like headings, images, paragraphs, sectioning elements, lists and listitems; for moving between tables, as well as the rows and columns inside them; for moving to specific types of form field, like checkboxes, radio buttons, text fields, or buttons; and many more commands besides.

You can see a screen reader in action in this [Smashing TV webinar](https://www.youtube.com/watch?v=OUDV1gqs9GA). It's a little long, but there's a [short extract](https://www.youtube.com/watch?v=iUCYPM6up9M&feature=youtu.be) available too.

Whether someone is a keyboard user or a screen reader user, the importance of HTML cannot be emphasised enough. Without well-formed HTML that uses the appropriate element for the purpose, screen reader navigation breaks down completely, and keyboard navigation is at a high risk of doing the same.
