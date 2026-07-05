---
title: "Screen reader support for ARIA live regions"
date: 2009-06-01
postTags: ["ARIA", "HTML", "Screen readers"]
postCategories: ["Code things"]
postSummary: "Rich Internet Applications present challenges for screen reader users, so the WAI's ARIA standard aims to bridge that gap, particularly through live regions that announce page updates without requiring focus."
---

Rich Internet Application (RIA) websites encourage people to generate content, collaborate online and make choices about the information they receive. Unsurprisingly, RIA websites can represent a considerable challenge for screen reader users. The WAI's [Accessible Rich Internet Applications (ARIA)](https://www.w3.org/WAI/intro/aria)is an emerging standard that aims to bridge the gap between RIA websites and screen reading technology.

## ARIA live regions

Amongst other things, the [ARIA roadmap](https://www.w3.org/TR/wai-aria-roadmap/) defines live regions. Live regions are areas of a web page that allow updates to be announced, without the screen reader focusing on that part of the page.  
The aim is to automatically provide screen reader users with appropriate information each time a live region of a page is updated. Live regions should help make many rich internet aplications more accessible to screen reader users.

There are three different types of live region:

* Polite.
* Assertive.
* \*Rude.

\**The rude live region type has been removed from the ARIA specification.**

The following tests were carried out independently on different virtual machines, each running a variation of Windows XP. The test cases were sourced from Charles Chen's [AJAX Accessibility](https://accessibleajax.clcworld.net/) simple test cases.

### Polite Live Regions

Live regions that are marked as `polite` should cause the screen reader to announce the update as soon as it's finished its current activity. For example, an update would be announced as soon as you finished reading the current line of text, or finished reading the page with a Say All command.

#### Polite Screen Reader Support

Test case: [live="polite"](https://accessibleajax.clcworld.net/simple/live_polite.htm)

| Screen Reader | IE8 | FF3.x | Notes |
| --- | --- | --- | --- |
| Hal 11 | No | No | Updates are not announced automatically, and are not available when the live region is accessed |
|Jaws 10.x | Yes | Yes | Updates are announced automatically at the end of the current activity, subsequent updates are announced until a further activity is invoked by the screen reader |
|NVDA 0.6P3.2 | No | No |Updates are not announced automatically, although the information can be determined by accessing the live region itself in FF3.x.<br/> The information cannot be determined by accessing the live region in IE8 |
| SA To Go | No | No | Updates are not announced automatically, although the information can be determined by accessing the live region itself in IE8 .<br/> The information cannot be determined by accessing the live region in FF3.x |
| Window Eyes 7.01 | No | No | Updates are not announced automatically, and are not available when the live region is accessed |

### Assertive Live Regions

Live regions marked as `assertive` should cause the screen reader to announce the update as soon as the current activity is finished, or perhaps sooner depending on the current activity.  
For example an update would be announced at the end of a short activity such as reading a line of text, but would interupt a longer activity such as reading the page with a Say All command.

#### Assertive Screen Reader Support

Test case: [live="assertive"](https://accessibleajax.clcworld.net/simple/live_assertive.htm)

| Screen Reader | IE8 | FF3.x | Notes |
| --- | --- | --- | --- |
|Hal 11 | No | No | Updates are not announced automatically, and are not available when the live region is accessed |
| Jaws 10.x | Yes | Yes | Updates are announced automatically at the end of the current activity, subsequent updates are announced until a further activity is invoked by the screen reader |
| NVDA 0.6P3.2 | No | No | Updates are not announced automatically, although the information can be determined by accessing the live region itself in FF3.x. <br/> The information cannot be determined by accessing the live region in IE8 |
| SA To Go | No | No | Updates are not announced automatically, although the information can be determined by accessing the live region itself in IE8 <br/> The information cannot be determined by accessing the live region in FF3.x |
| Window Eyes 7.01 | No | No | Updates are not announced automatically, and are not available when the live region is accessed |

### Rude Live Regions

Live regions marked as `rude` should cause the screen reader to announce the update immediately. For example it would overide any activity including reading a line of text or reading a page with a Say All command.

#### Rude Screen Reader Support

Test case: [live="rude"](https://accessibleajax.clcworld.net/simple/live_rude.htm)

| Screen Reader | IE8 | FF3.x | Notes |
| --- | --- | --- | --- |
| Hal 11 | No | No | Updates are not announced automatically, and are not available when the live region is accessed |
| Jaws 10.x | Yes | Yes | Updates are announced automatically at the end of the current activity, subsequent updates are announced until a further activity is invoked by the screen reader |
| NVDA 0.6P3.2 | No | No | Updates are not announced automatically, although the information can be determined by accessing the live region itself in FF3.x.  <br/>The live region itself cannot be accessed in IE8 |
| SA To Go | No | No | Updates are not announced automatically, although the information can be determined by accessing the live region itself in IE8  <br/>The information cannot be determined by accessing the live region in FF3.x |
| Window Eyes 7.01 | No | No | Updates are not announced automatically, and are not available when the live region is accessed |

## Screen reader experience

Given proper support in the screen reader, the experience of using a web page with polite or assertive live regions is good. The balance between interacting with the page, and being kept up to date with the activity in the live region, works well.

The experience of using a page with rude live regions is quite different. It's disruptive, irritating and frustrating, even when the interupt is set to long intervals. It's impossible to fluidly access any other content on the page, because the updates are relentless in their interuption.
