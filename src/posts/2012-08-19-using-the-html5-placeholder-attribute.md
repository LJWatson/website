---
title: "Using the HTML5 `placeholder attribute"
date: 2012-08-19
postTags: ["HTML"]
postCategories: ["Code things"]
postSummary: "HTML5 has introduced new features that make inclusive design more achievable, and one simple way to start is by using the `placeholder` attribute to make forms easier to complete."
---

HTML5 has changed the way we build websites and online applications. It introduces lots of new features, many of which make inclusive design much more achievable.

Happily you can start making your HTML5 more inclusive with a minimum of effort. One simple way is to make your forms easier for people to complete by using the HTML5 `placeholder` attribute.

## What is the HTML5 placeholder attribute?

The [HTML5 placeholder attribute](https://www.w3.org/TR/2010/WD-html5-20100624/common-input-element-attributes.html#attr-input-placeholder) lets you provide a short hint that helps people enter the right information into a form field. The hint might be an example of the required information, or a description of the expected format.

The placeholder hint or description is displayed inside the empty form field, and is removed as soon as the field is given focus. In other words, the HTML5 `placeholder attribute replaces one of the most common uses of JavaScript on the web.

## How is the HTML5 placeholder attribute applied?

You can apply the `placeholder` attribute to `input` fields like `text`, `email`, `tel`, `search` or `URL`. It can also be applied to a `textarea`.

```html
<label for="email">Email address:  
<input type="email" id="email" name="email" placeholder="you@example.com"/></label>
```
    
## What isn't the HTML5 placeholder attribute?

The `placeholder` attribute is not a replacement for a label. It's tempting to think that it could be, especially when screen real estate is at a premium and space for a visible label is limited.

The trouble is that once the field is given focus and the placeholder text disappears, there's nothing left to explain what kind of information should be entered. That makes things awkward for most of us, but it's particularly challenging for people with memory difficulties because there's no text label to remind them what information is expected.

It's also inconvenient for keyboard users. Instead of tabbing onto a field and reading the label, they need to look ahead to read the placeholder before moving focus to the field itself. Using a placeholder without a label makes the task of completing a form counter intuitive and much harder work.

## Can the HTML5 placeholder attribute be styled?

By default the placeholder text is displayed in light grey. This is to create the impression that the text is temporary and not something that has been entered by the person completing the form. It also makes it difficult to read.

It's a good idea to style the placeholder text to give it greater visibility. Choosing a foreground color that meets the 4.5:1 contrast ratio recommended by WCAG 2.0 [SC1.4.3](https://www.w3.org/WAI/WCAG20/quickref/#qr-visual-audio-contrast-contrast) is a good way to do this.

The drawback is that styling for the `placeholder` attribute is not well supported yet. It's necessary to use vendor specific prefixes, and even then support is limited.

```css
input::-webkit-input-placeholder {color: ##912cee ;}  
input:-moz-placeholder {color: ##912cee ;}
```

## Can the HTML5 placeholder attribute be used now?

The HTML5 `placeholder` attribute is supported in recent versions of Chrome, Firefox, Opera and Safari/Webkit. It isn't currently supported in Internet Explorer, but that should change when IE10 is released later this year.

Until the web sheds itself of all those pesky versions of Internet Explorer, it's a good idea to use a script such as [jQuery.placeholder](https://archive.plugins.jquery.com/project/input-placeholder) to handle support for legacy browsers. With that in mind though, you can go right ahead and use the HTML5 `placeholder attribute to make your forms easier for everyone to complete.
