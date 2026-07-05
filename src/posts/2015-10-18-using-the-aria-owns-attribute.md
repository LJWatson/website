---
title: "Using the aria-owns attribute"
date: 2015-10-18
postTags: ["ARIA", "HTML"]
postCategories: ["Code things"]
postSummary: "Sometimes parent/child relationships are evident on-screen but missing from the DOM; the `aria-owns` attribute can establish that relationship in the accessibility layer, though screen reader support remains inconsistent."
---

When a parent/child relationship is evident on-screen, but it isn’t represented in the DOM, the [aria-owns](https://www.w3.org/TR/wai-aria/states_and_properties#aria-owns) attribute can be used to establish that relationship in the accessibility layer.

The parent/child relationship is a cornerstone of HTML structure. Every element in an HTML document is the parent, sibling or child of another.

In some cases these relationships are critical to the semantics of a document. A table contains rows, headers and cells for example. Without the correct arrangement of all the elements that the table consists of, the structure breaks down and becomes meaningless.

These relationships are not always available in the DOM though. Sometimes because of the way code is written, sometimes because the structures themselves do not exist. HTML has no elements for tree structures, and SVG has no concept of data structures like lists or tables for example.

Let’s take an artificial example, which isn’t likely to happen in the wild, but which makes it easier to explain how `aria-owns` works.

```html
<ul>
  <li>Fruit</li>
  <li>Vegetables</li>
</ul>

<ul>
  <li>Apples</li>
  <li>Bananas</li>
</ul>
```

The two lists are separate in the DOM. Beyond the fact they are siblings in the DOM tree, they have no relationship with each other.

Now suppose that we want to change the way the lists are displayed, so that the second list appears as a child of the first. We could rewrite the source code and rebuild the DOM, or we could style the lists so they have the appearance of being nested.

The problem with the first option is that it takes effort and could effect performance. The problem with the second option is that it’s only cosmetic. An assistive technology like a screen reader (that relies on the DOM for information) will still consider the two lists as completely separate.

We can use the `aria-owns` attribute to fix this problem though.

```html
<ul>
  <li aria-owns="child">Fruit</li>
  <li>Vegetables</li>
</ul>

<ul id="child">
  <li>Apples</li>
  <li>Bananas</li>
</ul>
```

The `aria-owns` attribute creates a parent/child relationship between the two lists in the accessibility layer. The DOM tree remains unchanged, but the accessibility tree now exposes the two lists as though they were nested. In other words, the lists are now exposed like this in the accessibility tree:

```html
<ul>
  <li>Fruit
    <ul>
      <li>Apples</li>
      <li>Bananas</li>
    </ul>
  </li>

  <li>Vegetables</li>
</ul>
```

Which is to say that is what should happen. Unfortunately screen reader support for `aria-owns` is still inconsistent.

Using this [aria-owns test case](https://ljwatson.github.io/test-cases/aria-owns/index.html), Jaws has support with Chrome, firefox and Internet Explorer. NVDA has support with chrome, but not Edge, Firefox or Internet Explorer. TalkBack does with Chrome, but VoiceOver does not in Safari (OSX or iOS).

Updated on 19th October to include results for Narrator (on Windows 10). The `aria-owns` attribute is not supported by Narrator with either Edge or Internet Explorer.
