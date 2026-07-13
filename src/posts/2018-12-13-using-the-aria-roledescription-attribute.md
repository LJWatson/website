---
title: "Using the aria-roledescription attribute"
date: 2018-12-13
postTags: ["ARIA", "Screen readers", "WebVR"]
postCategories: ["Code things"]
postSummary: "The `aria-roledescription` attribute changes how screen readers announce element roles, intended to provide localised, human-readable descriptions—but it has the capacity to both enhance and seriously break accessibility for screen reader users."
---

The [aria-roledescription](https://www.w3.org/TR/wai-aria-1.1/#aria-roledescription) attribute changes the way screen readers announce the role of an element. Intended to give authors a way to provide a localised and human-readable description for a role, it has the capacity to both enhance and seriously break accessibility for screen reader users.

The ARIA1.1 specification describes the `aria-roledescription` attribute like this:

> Defines a human-readable, author-localized description for the role of an element.
> Some assistive technologies, such as screen readers, present the role of an element as part of the user experience. Such assistive technologies typically localize the name of the role, and they may customize it as well. Users of these assistive technologies depend on the presentation of the role name, such as "region," "button," or "slider," for an understanding of the purpose of the element and, if it is a widget, how to interact with it.>

Let's take a link as an example:

```html
<a href="https://tink.uk">tink.uk</a>
```

The screen reader takes the element's role ("link") and uses it to tell the user what kind of thing they're dealing with. The user can then make an informed decision about what to do with the element (in this case activate the link or ignore it).

Screen readers do this for most HTML elements. In other words, when you can't see the element on-screen, the role is critical to understanding the nature of the element. So why would anyone want to override such useful information?

The ARIA1.1 specification offers two possible use cases for `aria-roledescription`:

* Changing the role announcement for a `section` element, when it's used to represent a slide in an HTML slide deck;
* Changing the role announcement for a `<button>` element, when the button is used to manage an email attachment.

The first use case looks something like this:

```html
<section aria-roledescription="slide" aria-labelledby="s1">
  <h2 id="s1">Accessibility mechanics</h2>
  ...
</section>
```

The implicit role of the `section` element is "region", so without the `aria-roledescription` attribute, screen readers would announce this as "Accessibility mechanics region". With the `aria-roledescription` attribute, the announcement becomes "Accessibility mechanics slide" instead.

The second use case looks something like this:

```html
<button aria-roledescription="attachment button">this.txt</button>
```

The implicit role of the `button` element is "button", but with the `aria-roledescription` attribute the role announcement has been extended to "attachment button". On encountering this particular button, a screen reader would therefore announce "this.txt attachment button".

It can be argued that in both cases, the alteration is worthwhile, because it provides the user with more specific or accurate information about the thing they're dealing with.

The trouble with `aria-roledescription` is that it can too easily be used to break accessibility for screen reader users. Let's take a theoretical example:

```html
<button aria-roledescription="slice">Pizza</button>
```

It's a button that you might find on a delivery restaurant website, for adding a slice of pizza to your order. Except that a screen reader will announce "Pizza slice", with no mention of the word "button" at all.

So how is a screen reader user supposed to know they should use it like a button?

The ARIA1.1 specification acknowledges some of the risk:

>The aria-roledescription property gives authors the ability to override how assistive technologies localize and express the name of a role. Thus inappropriately using aria-roledescription may inhibit users' ability to understand or interact with an element. Authors SHOULD limit use of aria-roledescription to clarifying the purpose of non-interactive container roles like group or region, or to providing a more specific description of a widget.>

This really needs to be said much more explicitly though: do not use aria-roledescription to change the way a role is announced, if it will prevent the user from knowing what to do with it.

The ARIA1.1 specification goes on to place constraints on the way authors use aria-roledescription:

>When using aria-roledescription, authors SHOULD also ensure that:
>
>1. The element to which aria-roledescription is applied has a valid WAI-ARIA role or has an implicit WAI-ARIA role semantic.
>2. The value of aria-roledescription is not empty or does not contain only whitespace characters.

It then places stronger constraints on the way browsers handle the aria-roledescription attribute:

>User agents MUST NOT expose the aria-roledescription property if any of the following conditions exist:
>
>1. The element to which aria-roledescription is applied does not have a valid WAI-ARIA role or does not have an implicit WAI-ARIA role semantic.
>2. The value of aria-roledescription is empty or contains only whitespace characters.

The difference in the language is subtle: in W3C language, things marked "SHOULD" (in uppercase) are advisory, but things marked "MUST" (in uppercase) are required. So in this case, authors are advised against using `aria-roledescription` on elements without an implicit or explicit ARIA role (refer to the [HTML Accessibility API Mappings](https://www.w3.org/TR/html-aam-1.0/) specification for details) and against giving `aria-roledescription` an empty or whitespace value, whereas browsers are explicitly prohibited from exposing the `aria-roledescription` attribute if either of those conditions fail.

One use case worth exploring is [WebVR](https://webvr.info/). As we start to see more Virtual Reality (VR) content on the web, we're going to need ways to identify all kinds of objects; everything from a pair of jeans to the [Ravenous Bugblatter Beast of Traal](https://hitchhikers.fandom.com/wiki/Ravenous_Bugblatter_Beast_of_Traal). Some of those things will be interactive and some will not, but most will be things outside of the standard set of UI components ARIA is able to handle.

WebVR is scripted, and attached to the `canvas` element. This means that objects inside the WebVR have no DOM, so for now it's necessary to put fallback content inside the `canvas` element.

```html
<canvas id="webgl-thing">
  <div role="img" aria-roledescription="Ravenous Bugblatter Beast of Traal" aria-label="A red monster with lots of teeth"></div>
</canvas>
```

This example assumes there is a single static object inside of the WebVR, so it's a long way short of production reality, but it does mean the object inside the WebVR would be announced by a screen reader as "A red monster with lots of teeth; Ravenous Bugblatter Beast of Traal". The ordering of the information isn't ideal, but it does at least communicate what the object is, and give a brief description of it.

**Note:** it's necessary to include `role="img"` on the `div` in order to conform to the requirement that `aria-roledescription` is only used on elements with an implicit or explicit ARIA role (`div` elements do not have an implicit ARIA role, so one is provided explicitly using the `role` attribute).

For now though the use cases for `aria-roledescription` are there, but they're not particularly compelling. In the future this could well change, but in the meantime think very carefully before you decide to change the way an element's role is announced by screen readers!
