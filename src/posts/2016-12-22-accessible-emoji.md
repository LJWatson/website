---
title: "Accessible emoji"
date: 2016-12-22
postTags: ["ARIA", "HTML", "Screen readers"]
postCategories: ["Code things"]
postSummary: "Emoji help us communicate complex ideas easily, but on the web we need to make sure everyone can understand them — screen readers don't always recognise emoji without the right markup."
---

[Emoji](https://en.wikipedia.org/wiki/Emoji) help us communicate complex ideas very easily. When used in native apps and applications, emoji are reasonably accessible to screen readers, but on the web we need to do a little more to make sure everyone can understand emoji.

An emoji is an [ideogram](https://en.wikipedia.org/wiki/Ideogram) (a picture that represents an idea or concept). Unlike an image that is displayed from a (.png, .gif or .jpg) file, an emoji is displayed using a [Unicode](https://en.wikipedia.org/wiki/Unicode) character. On the web this is often done using the hexadecimal or decimal representation of the Unicode character. For example:

```html
<span>&#9731;</span>
```

This presents a snowman emoji (☃) in the browser. Unless you're looking at it with a screen reader, in which case there is a chance you'll be completely unaware it's there at all.

## The problem

The first problem is that browsers do not always expose the emoji as an image in the accessibility tree. The `<span>` element is semantically neutral * its role may not be communicated by the browser and/or used by screen readers.

The second problem is that the content of the `<span>` is just a character reference. The browser may not automatically assign it an accessible name or an accessible description. The upshot is that emoji may not be recognised or only partially recognised with some browser and screen reader combinations.

## The solution

These things are simple to fix though. We need to tell the browser to expose the emoji (or its container) as an image, then give it an accessible name.

Use the ARIA `img` role to expose the `<span>` as an image in the accessibility tree:

```html
<span role="img">&#9731;</span>
```

Then use the `aria-label attribute to give the emoji an accessible name:

```html
<span role="img" aria-label="Snowman">&#9731;</span>
```

If you use the `<i>` element as a container for an emoji, you probably shouldn't, but the same solution can be used:

```html
<i role="img" aria-label="Snowman">&#9731;</i>
```

Now the browser will expose the emoji as an image in the accessibility tree, and use the value of the aria-label attribute as its accessible name. When a screen reader queries the accessibility tree it will use this information to tell the user that there is an image of a snowman (☃) on the page.

_Update 30th December 2016:_ [Adrian Roselli](https://www.twitter.com/aardrian) has posted a useful follow-up article to this one * [Accessible emoji, tweaked](https://adrianroselli.com/2016/12/accessible-emoji-tweaked.html).
