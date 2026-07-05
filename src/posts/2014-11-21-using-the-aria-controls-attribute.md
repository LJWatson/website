---
title: "Using the aria-controls attribute"
date: 2014-11-21
postTags: ["ARIA"]
postCategories: ["Code things"]
postSummary: "I've been looking at the `aria-controls` attribute in ARIA 1.0, which creates cause and effect relationships between elements when those connections aren't clear from the DOM structure alone."
---

There are a handful of [ARIA1.0](https://www.w3.org/TR/wai-aria/) attributes that can be used to indicate relationships between elements, when those relationships can’t be ascertained easily from the DOM. One such attribute is [aria-controls](https://www.w3.org/TR/wai-aria/states_and_properties#aria-controls).

The `aria-controls` attribute creates a cause and effect relationship. It identifies the element(s) that are controlled by the current element, when that relationship isn’t represented in the DOM. For example a `button` that controls the display of information contained within a `div`:

```html
<button onclick="showInfo();" aria-controls="I">Show info</button>
…
<div id="I">Information.</div>
```

The more widely the two elements are separated in the DOM, the more useful the `aria-controls` attribute becomes. Imagine a checkbox that controls the filtration of search results, or a tab that controls a tabpanel:

```html
<ul role="tablist">
  <li role="presentation"><a href="#" onclick="displayTab(1);" role="tab" aria-controls="panel1" aria-selected="true">Tab 1</a></li>
  <li role="presentation"><a href="#" onclick="displayTab(2);" role="tab" aria-selected="false">Tab 2</a></li>
  ...
</ul>

<div role="tabpanel" id="panel1">...</div>
<div role="tabpanel" id="panel2">…</div>
```

When a User Agent (UA) supports `aria-controls`, it makes it possible for focus to be moved from the current element directly to the element it controls. The alternative is to navigate through all the intervening content in hopes of discovering what might have changed elsewhere on the page. For this reason, `aria-controls` should only be used to point to something that is available in the DOM and which can be navigated to.

UA support for `aria-controls` is still somewhat inconsistent. Firefox and Internet Explorer both expose `aria-controls` through their accessibility API (IAccessible2 and UIAutomation respectively). Assistive Technology (AT) support is less encouraging though. Jaws (14+) supports `aria-controls`, but only in Firefox. When Jaws encounters the `aria-controls` attribute it announces “Use the Jaws key Alt and m to move to the controlled element”. NVDA, VoiceOver and Window Eyes don’t seem to support it at all in any browser.

Despite the fact support amongst browsers and screen readers could be better, the `aria-controls` attribute is still worth using. Creating relationships within the DOM is certainly more robust, but it isn’t always practical or achievable. The presence of `aria-controls` won’t damage the User Experience (UX) for people using UA that don’t support it, but it will enormously improve the UX for those people whose browser/screen reader combinations do.
