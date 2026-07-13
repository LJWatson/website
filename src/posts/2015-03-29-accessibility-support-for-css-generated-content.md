---
title: "Accessibility support for CSS generated content"
date: 2015-03-29
postTags: ["CSS", "HTML", "Screen readers"]
postCategories: ["Code things"]
postSummary: "I've been looking into how browsers and screen readers handle content generated with CSS before/after pseudo-selectors, and whether it's actually accessible to everyone."
---

The CSS [before/after pseudo-selectors](https://www.w3.org/TR/css3-selectors/#gen-content) can be used to insert content into a page. In some situations this technique is a useful thing to do, but how do browsers and screen readers handle the generated content?

Quick recap: The `before/after` selectors insert content either before or after an element’s existing content. For example the CSS shown below will insert "bar" immediately after the "Foo" that is already present in the HTML:

```css
#a:after { content: 'bar'; }
```

```html
<a href="/" id="a">Foo</a>
```

The result of which can be seen in this [test case](https://test-cases.tink.uk/css-generated/index.html). For more information on using these selectors, read Chris Coyer’s introduction to [after/before on CSS Tricks](https://css-tricks.com/almanac/selectors/a/after-and-before/).

## Accessibility mechanics

CSS generated content isn’t included in the DOM. Ordinarily browsers take information from the DOM to create the accessibility tree, but in this case the generated content is still factored into the [accessible name computation](https://www.w3.org/TR/accname-aam-1.1/#terminology) for the element.

## Accessibility results

Using the test case mentioned before indicates that generated content is accessibility supported in most browsers, and recognised by screen readers accordingly. Internet Explorer is the only browser regularly used with a screen reader that does not expose the generated content as the accessible name for the element. Screen readers depending on MSAA/UIAutomation in IE are therefore unaware of the generated content.

Browser and screen reader support for CSS generated content

| | Chrome 41 (Android) | Chrome 41 (Windows) | Firefox 36 (Windows) | Internet Explorer 11 (Windows) | Safari 8 (OSX) | Safari 8.1 (iOS) |
| -- | -- | -- | -- | -- | -- | --- |
| Jaws 16 | N/A | Yes | Yes | No | N/A | N/A |
| NVDA 2015.1 | N/A | Yes | Yes | No | N/A | N/A |
| TalkBack | Yes | N/A | N/A | N/A | N/A | N/A |
| VoiceOver | N/A | N/A | N/A | N/A | Yes | Yes |

With Internet Explorer accounting for about [15% of traffic](https://caniuse.com/usage_table.php) (in March 2015), there is good reason to consider the viability of using CSS generated content.

There is another more important consideration however * the separation of content and structure from design. Introducing content through the design layer breaks the standards model, and so it should be done only when the generated content does not alter the meaning of the original content. In other words, use CSS generated content to change or supplement the design, but not to create or alter important content on the page.
