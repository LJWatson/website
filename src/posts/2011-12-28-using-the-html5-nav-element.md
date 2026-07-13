---
title: "Using the HTML5 `nav` element"
date: 2011-12-28
postTags: ["HTML"]
postCategories: ["Code things"]
postSummary: "HTML5's `nav` element helps mark up navigational sections on a page, making it easier for screen reader users to identify and navigate to key content blocks semantically."
---

HTML5 introduces the [nav element](https://dev.w3.org/html5/spec/the-nav-element.html#the-nav-element) for marking up sections of a page that contain navigational links. Used wisely the `nav` element is a big help to [screen reader](https://en.wikipedia.org/wiki/Screen_reader) users, as well as a step forward in semantic meaning.

## HTML4 navigation

With HTML4, a typical navigation block might look like this:

```html
<div>
  <ul>
    <li><a href=”home.html”>Home</a></li>
    <li><a href=”about.html”>About us</a></li>
    …
  </ul>
</div>
```

Using a screen reader it would be possible to move through a page that uses this approach, and access the navigation without difficulty. One strategy might be to use your screen reader’s shortcut key for moving from one `div` on the page to the next.

The drawback is that to a screen reader, one `div` looks pretty much like another. There isn’t any semantic information that a screen reader can use to inform you about the purpose of the content you’re dealing with.

This is where the `nav` element comes in. Here’s what the HTML5 specification says about the `nav` element:

> "The [nav](https://dev.w3.org/html5/spec/the-nav-element.html#the-nav-element) element [represents](https://dev.w3.org/html5/spec/rendering.html#represents) a section of a page that links to other pages or to parts within the page: a section with navigation links."

## HTML5 navigation

So the same navigation block in HTML5 might look like this:

```html
<nav>
  <ul>
    <li><a href=”home.html”>Home</a></li>
    <li><a href=”about.html”>About us</a></li>
    …
  </ul>
</nav>
```

The `nav` element makes it possible for screen readers (and other user agents) to identify the purpose of the content. [NVDA 2011.3](https://www.nvda-project.org/) already does this. It won’t be long before other screen readers also support the `nav` element, but in the meantime you can use ARIA landmark roles.

## HTML5 navigation with ARIA

Adding the [ARIA navigation role](https://www.w3.org/TR/wai-aria/roles#navigation) to the `nav` element is a useful [belt and braces](https://www.phrases.org.uk/meanings/61250.html) technique.

```html
<nav role=”navigation”>
  <ul>
    <li><a href=”home.html”>Home</a></li>
    <li><a href=”about.html”>About us</a></li>
    …
  </ul>
</nav>
```

## When to use the HTML5 `nav` element

Use the `nav` element wisely. The HTML5 specification isn’t too prescriptive, but instead offers the following guidance:

> "Not all groups of links on a page need to be in a [nav](https://dev.w3.org/html5/spec/the-nav-element.html#the-nav-element) element – the element is primarily Intended for sections that consist of major navigation blocks."

Using the `nav` element too often will rapidly reduce the benefit to screen reader users. In the same way that one `div` looks like another to a screen reader, so does one `nav` element to the next. Using the `nav` element to mark up just one or two key navigation blocks helps keep those sections semantically distinct from the rest of the page.

To highlight this, the HTML5 specification gives the following example:

> "… it is common for footers to have a short list of links to various pages of a site, such as the terms of service, the home page, and a copyright page. The [footer](https://dev.w3.org/html5/spec/the-footer-element.html#the-footer-element) element alone is sufficient for such cases; while a [nav](https://dev.w3.org/html5/spec/the-nav-element.html#the-nav-element) element can be used in such cases, it is usually unnecessary."

Use the `nav` element to mark up the primary (site) navigation block. If a secondary (page) navigation block is needed, use the `nav` element here as well.

Otherwise, it’s your judgement call as to when you use the `nav` element. Just remember that screen reader users will benefit most when the `nav` element is used lightly, and that doing this won’t have a negative impact on other people either.
