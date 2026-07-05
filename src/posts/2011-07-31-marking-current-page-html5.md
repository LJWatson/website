---
title: "Marking up the current page with HTML5 links"
date: 2011-07-31
postTags: ["HTML"]
postCategories: ["Code things"]
postSummary: "HTML5 changes how you should mark up the current page in navigation. Instead of using the `strong` element like in HTML4.01, the HTML5 spec recommends using a plain `a` element without an `href` attribute."
---

**Updated on 3rd July 2017:** this post is out of date, please read [Using the aria-current attribute](/using-the-aria-current-attribute/) instead.

When you’re browsing a website using its primary navigation, it’s helpful to know which page you’re on, and which pages you can go to. HTML5 makes it simple to do this, but the technique moves away from a common approach used in HTML4.01.

When you’re looking at a website’s navigation, the current page should be visually distinct from the other pages. When you’re using a [screen reader](https://www.nomensa.com/blog/2005/what-is-a-screen-reader/), the separation needs to be [programmatic](https://www.google.co.uk/search?q=programmatic&ie=utf-8&oe=utf-8&aq=t&rls=org.mozilla:en-GB:official&client=firefox-a&source=hp&channel=np) rather than visual.

A common technique used with HTML4.01 is to use the `strong` element to markup the current page:

```html
<ul>
  <li><a href="home.html">Home</a></li>
  <li><strong>About us</strong></li>
  <li><a href="contact.html">Contact us</a></li>
  … 
</ul>
```

This has the advantage of creating both the visual effect and the programmatic effect needed to differentiate the current page from the rest.

The [HTML5 specification](https://www.w3.org/TR/2011/WD-html5-20110525/text-level-semantics.html#the-strong-element) subtly changes the purpose of the `strong` element though. Instead of marking up content with strong emphasis, it should be used to markup content of strong importance. More on this (and other similar changes) within the HTML5 spec can be found on the [HTML5 Doctor](https://html5doctor.com/i-b-em-strong-element/) website.

This change in the specification probably doesn’t make it wrong to use the above technique, since it could be argued that the current page is something of strong importance. It is one of those potentially murky areas though, and besides, the HTML5 spec recommends a much cleaner approach instead.

> If the [a](https://www.w3.org/TR/2011/WD-html5-20110525/text-level-semantics.html#the-a-element) element has an [href](https://www.w3.org/TR/2011/WD-html5-20110525/links.html#attr-hyperlink-href) attribute, then it represents a [hyperlink](https://www.w3.org/TR/2011/WD-html5-20110525/links.html#hyperlink) (a hypertext anchor).
> 
> If the [a](https://www.w3.org/TR/2011/WD-html5-20110525/text-level-semantics.html#the-a-element) element has no [href](https://www.w3.org/TR/2011/WD-html5-20110525/semantics.html#attr-link-href) attribute, then the element represents a placeholder for where a link might otherwise have been placed, if it had been relevant.

In other words you can strip out all the usual attributes from the `a` element, to turn it into a placeholder instead:

```html
<ul>
  <li><a href="home.html">Home</a></li>
  <li><a>About us</a></li>
  <li><a href="contact.html">Contact us</a></li>
  …
</ul>
```

As far as the screen reader is concerned, the current page link is deactivated. This provides the separation needed to understand which page you’re on, and which pages you can go to. To create the same separation visually, you can apply a CSS class that gives the current page a different appearance from the other links within the navigation.
