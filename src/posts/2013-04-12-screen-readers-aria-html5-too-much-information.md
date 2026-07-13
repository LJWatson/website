---
title: "Screen readers, ARIA & HTML5 (too much information)"
date: 2013-04-12
postTags: ["ARIA", "HTML", "Screen readers"]
postCategories: ["Code things"]
postSummary: "Most screen readers now support ARIA and HTML5, making it easy to inadvertently overload users with too much information by applying roles incorrectly."
---

Most current screen readers support [ARIA](https://www.w3.org/TR/wai-aria/) to one extent or another, and many now support some features of [HTML5](https://www.w3.org/TR/2011/WD-html5-20110525/) as well. With ARIA and HTML5 making increasing amounts of semantic data available to screen reader users, it’s really easy to inadvertently overload people with too much information.

Let's take an example that crops up from time to time:

```html
<nav>  
  <ul role="navigation">  
    <li><a href="home.html">Home</a></li>  
    <li><a href="about.html">About us</a></li>  
    <li><a href="contact.html">Contact us</a></li> 
    ...
  </ul>
</nav>
```

This approach is problematic for two reasons: It breaks the intended relationship between ARIA and HTML, and it offers a poor experience for screen reader users.

## ARIA HTML5 relationship

Here's how the ARIA specification defines the navigation landmark role:

> A collection of navigational elements (usually links) for navigating the document or related documents.

At first glance this seems to suggest that the `navigation` role can be applied to the `ul` element, because it's a collection of navigational links. It actually causes a conflict though. The `ul` element already has an ARIA role of "list", and it's treated as a list by other accessibility APIs.

Here's how the HTML5 specification defines the `nav` element:

> The nav element represents a section of a page that links to other pages or to parts within the page: a section with navigation links.

The `nav` element was purpose built to contain a number of navigational elements. This makes it a much closer fit for the ARIA `navigation` role than the `ul` element. In fact the ARIA `navigation` role maps directly to the HTML5 `nav` element.

## Screen reader experience

When the `navigation` role is applied to the `ul` element it creates extra verbosity for screen readers that support both ARIA and HTML. For example NVDA announces "Navigation landmark" when it encounters the start of the `nav`, then again when it encounters the `navigation` role. Jaws does the same thing with a slightly different announcement ("Navigation region"), and it also announces the end of each region. It announces "Navigation region end" when it encounters the `/ul`, then again when it encounters the closing tag.

Things are further complicated by the conflicting roles: The native `list` role and the applied `navigation` role of the `ul`. NVDA announces "Navigation landmark, List of 3 items". It does this in Firefox because the accessibility API concatonates the two roles, but in Internet Explorer it has to go into the DOM to create the same effect. Jaws appears to ignore the accessibility APIs entirely. In Firefox it fails to announce the list, although it does preface each list item with "Bullet". In Internet Explorer it does neither, effectively ignoring the list semantics altogether.

The upshot is that the `navigation` role should be applied to the `nav` element. This represents the relationship between ARIA and HTML5 correctly, prevents the loss of the list semantics, and reduces screen reader verbosity to a manageable level.

```html
<nav role="navigation">  
  <ul>  
    <li><a href="home.html">Home</a></li>  
    <li><a href="about.html">About us</a></li>  
    <li><a href="contact.html">Contact us</a></li>  
    ...
  </ul>  
</nav>
```