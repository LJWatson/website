---
title: "Understanding semantics"
date: 2016-05-24
postTags: ["HTML"]
postCategories: ["Code things"]
postSummary: "The word \"semantic\" is regularly used in web development, but what do we really mean by it, and why does it matter for structure and meaning?"
---

[Эта статья на русском](https://css-live.ru/articles/ponimanie-semantiki.html)

The word “semantic” is regularly used in the context of web development. We talk about “semantic code” and the “semantics” of a given element, but what do we really mean by it, and why is it important?

The word semantic comes from the French sémantique, meaning non-comparable. In English it has three meanings:

1. Of or relating to the meaning of words;
2. Of code intended to reflect structure and meaning;
3. Of petty or trivial details.

It is the second definition that is relevant here. Semantic code has both structure and meaning, and both things are equally important.

## Structure

When we write HTML we give content structure. We define things like paragraphs, lists, tables and headings. Writing semantic code means choosing the most appropriate element to define the required structure. This helps interoperability.

There is a common understanding of what each element represents and does. For example the `p` tag represents a paragraph of static text, an `a` element is interactive and will fetch a new resource when activated. This common understanding enables browsers and other user agents to provide default functionality and styling for many elements.

## Meaning

When we use HTML we also give content meaning. Most HTML elements have an implicit role that defines the element’s purpose. For example the `a` element has an [implicit role](https://www.w3.org/TR/html-aam-1.0/) of “link”, the `img` element’s implicit role is “graphic” or “image” (depending on the platform), and the `header` element has an implicit role of “banner”.

## Demonstrations

These roles are discoverable using the accessibility APIs supported by the platform, and they are used by assistive technologies like speech recognition tools and screen readers.

```html
<a href="https://tink.uk">Tink UK</a>
```

When a screen reader queries the browser for information about the piece of content represented by the HTML shown above, it will discover that it is a link to this website. The screen reader identifies the element’s role as “link”, uses the text content inside it to give the link an accessible name, and makes this information available in synthetic speech.

Compare this to the pseudo link represented by the following code:

```html
<span class="link">Tink UK</span>
```

The browser does not recognise this structure as a link, and so does not provide any of the expected behaviour (the styling is provided using CSS). The `span` element is semantically neutral, so it does not have an implicit role that is useful in this context.

It is possible to use JavaScript, ARIA, and CSS to polyfill the missing semantic information, and to provide some (but not all) of the styling and behaviours associated with the `a` element. That takes a lot more code, a lot more effort, and it usually results in a very brittle implementation compared to that of a native html element.

HTML semantics are therefore important in two ways: We get a consistent understanding of content structure and native behaviour, and we get a common understanding of the content’s meaning and purpose. The best thing of all, is that we get those things for free whenever we use HTML as intended.
