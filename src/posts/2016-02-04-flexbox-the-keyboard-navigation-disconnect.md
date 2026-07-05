---
title: "Flexbox & the keyboard navigation disconnect"
date: 2016-02-04
postTags: ["CSS", "ARIA", "HTML"]
postCategories: ["Code things"]
postSummary: "CSS Flexbox can create a disconnect between DOM order and visual presentation, breaking keyboard navigation. I explore why asking authors not to use flexbox this way seems illogical."
---

CSS Flexbox can create a disconnect between the DOM order and visual presentation of content, causing keyboard navigation to break. For this reason, the [CSS Flexible Box Layout module](https://www.w3.org/TR/css-flexbox-1/) warns against resequencing content logic, but asking authors not to use flexbox in this way seems illogical in itself.

TLDR: The only viable way (in my opinion) for the flexbox disconnect to be resolved, is in the browser (as with the Firefox "bug") and the accessibility tree.

## The problem

When content is presented in sequence, we expect to read it and navigate through it in a logical order. In the West this is typically top to bottom/left to right. In the following example, the expected order is "1", "2", "3".

```html
<div>
  <a href="/">One</a>
  <a href="/">Two</a>
  <a href="/">Three</a>
</div>
```

With flexbox it is possible to display content in a different visual order, without changing the DOM order. Items inside a flex container can be visually sequenced using the [CSS `order` property](https://www.w3.org/TR/css-flexbox-1/#order-property). In the following example, the visual order is "3, "2", "1", but the DOM order is still "1", "2", "3".

```html
<div style="display: flex;">
  <a href="/" style="order: 3;">One</a>
  <a href="/" style="order: 2;">Two</a>
  <a href="/" style="order: 1;">Three</a>
</div>
```

When you use the tab key to move through the content, there is a disconnect between the visual order and the keyboard navigation (DOM) order. In this simple example it's mildly awkward, but in a situation where flexbox is used to layout a complex interface it could make things horribly unusable.

## The options

There are two things that can be done to bypass the DOM order at the code level, but neither of them solve the flexbox disconnect problem.

### The `tabindex` attribute

The [HTML `tabindex` attribute](https://w3c.github.io/html/editing.html#the-tabindex-attribute) can be used to impose a specific DOM order on content. If the `tabindex` values match the corresponding `order` property values, the visual and DOM orders can be brought into alignment. In the following example the visual and keyboard order are both "3", "2", "1".

```html
<div style="display: flex;">
  <a href="/" style="order: 3;" tabindex="3">One</a>
  <a href="/" style="order: 2;" tabindex="2">Two</a>
  <a href="/" style="order: 1;" tabindex="1">Three</a>
</div>
```

The problem is that [`tabindex` is scoped to the document](https://www.paciellogroup.com/blog/2014/08/using-the-tabindex-attribute/). If the above code were included in a page, it would completely hijack the tab order. The three items with tabindex would be the first three things on the page to receive keyboard focus, irrespective of their overall location in the DOM structure. In other words, you can use tabindex to solve the flexbox disconnect, but only by pushing the problem up to the document level.

### The `aria-flowto` attribute

The [`aria-flowto` attribute](https://www.w3.org/TR/wai-aria/states_and_properties#aria-flowto) can be used to provide an alternative keyboard navigation for screen reader users. In the following example the visual and aria-flowto orders are both "3", "2", "1", and the DOM order is "1", "2", "3".

```html
<div style="display: flex;">
  <a href="/" style="order: 3;" id="i1">One</a>
  <a href="/" style="order: 2;" id="i2" aria-flowto="i1">Two</a>
  <a href="/" style="order: 1;" id="i3" aria-flowto="i2">Three</a>
</div>
```

The first reason `aria-flowto` does not solve the flexbox disconnect, is because it complicates rather than simplifies the problem. It introduces a third mode of navigation, and one that is only applicable to screen reader users (who must use specific keyboard commands to benefit from it).

The second problem is that `aria-flowto` has extremely poor accessibility support. Of the various popular browser and screen reader combinations, only Jaws with Firefox, or Narrator with Edge and IE, has support for aria-flowto.

## The browser

A more promising option is for the browser to handle the flexbox disconnect.

Firefox realigns the tab order to match the visual order (based on the order property). When you use the tab key to move through the above example, focus moves to each link in the order in which it appears on screen.

Interestingly this behaviour is considered to be an [implementation bug](https://bugzilla.mozilla.org/show_bug.cgi?id=812687) because it's contrary to the FlexBox specification. This may explain why neither the DOM order or the accessibility tree seem to be altered (the realignment appears to happen elsewhere), but the upshot is that it solves the disconnect problem for people using the tab key to navigate content.

It doesn’t entirely solve the flexbox disconnect problem for screen reader users though. If a screen reader user tabs through the content the realignment happens as described, but screen readers that use a [virtual buffer](/understanding-screen-reader-interaction-modes/) will also present the content in DOM order when the virtual mode is used. It’s worth mentioning that this is the case with all the options mentioned here, and it’s likely to be the case with any future option that doesn't rearrange the DOM and/or accessibility tree.

So the current situation is unsatisfactory for developers and users alike. As [Rich Schwerdtfeger explains](https://lists.w3.org/Archives/Public/public-apa/2016Jan/0025.html), the CSS "don’t use it" recommendation is unacceptable, and hacking things at the code level isn’t desirable or worthwhile in this instance.

The Firefox implementation/bug seems to have merit though. It isn’t perfect, but it comes close to solving the problem with a minimum of fuss and bother for developers and a reasonable outcome for keyboard users.

## Related reading

* [HTML source order versus CSS display order, by Adrian Roselli](https://adrianroselli.com/2015/10/html-source-order-vs-css-display-order.html)
