---
title: "The difference between aria-label and aria-labelledby"
date: 2020-08-24
postTags: ["Screen readers", "ARIA"]
postCategories: ["Code things"]
postSummary: "aria-label and aria-labelledby do the same job but in different ways, and it's easy to confuse them with unintended results. This post explains the differences and how to choose the right one."
---

The [aria-label](https://www.w3.org/TR/wai-aria-1.1/#aria-label) and [aria-labelledby](https://www.w3.org/TR/wai-aria-1.1/#aria-labelledby) attributes do the same thing but in different ways. Sometimes the two attributes are confused and this has unintended results. This post describes the differences between `aria-label` and `aria-labelledby` and how to choose the right one.

The `aria-label` and `aria-labelledby` attributes are both used to give an element it's [accessible name](https://developer.paciellogroup.com/blog/2017/04/what-is-an-accessible-name/). An element's accessible name is a piece of text that differentiates one instance of that element in a document from the rest; the text of a link or text description for an image for example.

The difference between `aria-label` and `aria-labelledby` is where they get that piece of text, and the clue is in the name. If you think of the accessible name for an element as its label it becomes more understandable. The `aria-label` attribute gives an element its label; an element with the `aria-labelledby` attribute is labelled by something else.

## The aria-label attribute

The `aria-label` attribute takes a piece of text as its value. This text becomes the element's label or accessible name. For example, the accessible name of the button in the following example is "Search": 

```html
<button id="search" aria-label="Search"></button>
```

## The aria-labelledby attribute

The `aria-labelledby` attribute points to another element in the document. It takes the value of the id attribute on that other element as its value, creating a relationship between the two elements. The text contained in the other element becomes the label or accessible name for the element with `aria-labelledby` applied to it. For example, the accessible name for the button in the following example is also "Search":

```html
<h2 id="searchLabel">Search</h2>

<label for="search">Enter search term
  <input type="search" id="search">
</label>

<button aria-labelledby="searchLabel"></button>
```

## Choosing between aria-label and aria-labelledby

When it comes to deciding which attribute to use, consider these things:

1. Do you need to use ARIA?
2. If yes, does the text already exist elsewhere in the document?
3. If yes, use `aria-labelledby`; if no, use `aria-label`.

The first question references the [First Rule of ARIA](https://www.w3.org/TR/using-aria/#firstrule):

> If you can use a native HTML element or attribute with the semantics and behaviour you require already built-in, instead of repurposing an element and adding an ARIA role, state or property to make it accessible, then do so.

There are ways an element can be given an accessible name without using `aria-label` or `aria-labelledby`. For example, put text inside a link or button, use the `alt` attribute to give an image a text description, or match the `for` attribute on a `label` element with the `id` attribute of the form field it relates to.

If you think ARIA is the right solution, then the second question is whether the piece of text already exists in the document. Generally speaking it's better to reuse than duplicate, so using `aria-labelledby` to associate the piece of text with the element makes sense if the text already exists. If it does not exist elsewhere, then use `aria-label`.

## Implementation notes

The `aria-label` and `aria-labelledby` attributes do not [work consistently](https://developer.paciellogroup.com/blog/2017/07/short-note-on-aria-label-aria-labelledby-and-aria-describedby/) with all HTML elements.

The `aria-label` and `aria-labelledby` attributes will override any other accessible name assigned to the element. ARIA always takes precedence over native HTML semantics. The accessible name in the following example is "This", despite the content of the button: 

```html
<button aria-label="This">That</button>
```
