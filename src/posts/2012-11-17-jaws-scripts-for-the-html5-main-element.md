---
title: "Jaws scripts for the HTML5 `main` element"
date: 2012-11-17
postTags: ["Screen readers", "ARIA", "HTML"]
postCategories: ["Code things"]
postSummary: "Jaws scripts are no longer available, but a shortcut for moving directly to the `main` element is now standard, offering a more reliable way for screen readers to pinpoint primary content."
---

**Updated:** 1 November 2018

Jaws scripts no longer available. A shortcut ("q") for moving directly to the `main` element is now available in Jaws as standard.

The [main element extension](https://dvcs.w3.org/hg/html-extensions/raw-file/tip/maincontent/index.html) specifies a way to markup the primary content area of a web page in HTML5. There are several good reasons for introducing the `main` element, including a more reliable way for screen readers to pinpoint the start of the primary content area on the page.

## ARIA roles

[ARIA roles](https://www.w3.org/TR/wai-aria/roles) can be applied to HTML elements to give them semantic meaning. For example a div with role="navigation" is announced by Jaws as "Navigation region".

The advantage of ARIA roles is that [screen readers can use them](https://tink.uk/2011/07/how-do-aria-landmark-roles-help-screen-reader-users/) to navigate through a page. Use the **semi colon** key in Jaws, the **d** key in NVDA, or the **roter** with VoiceOver to move between these landmarks.

The disadvantage is that developers must consciously include ARIA roles in their HTML code. The advent of HTML5 elements with stronger native semantics means that (in time) this will no longer be necessary (with HTML at least). For example the HTML5 `nav` element already causes Jaws to announce "Navigation region", whether role="navigation" is present or not.

## HTML5 elements

Until the `main` element extension was proposed by Steve Faulkner, there was no direct mapping between `role="main"` and an HTML5 element. This means that a screen reader mechanism for moving focus to the primary content area, would be entirely dependent on `role="main"` being added to the HTML.

One of the [reasons for introducing the main element](https://www.w3.org/html/wg/wiki/User:Sfaulkne/main-usecases#Introduction) is that it's easier for developers to code and style `<main></main>` , than it is to use `<div id="main" role="main"></div>`.

On the basis that the `main` element is more convenient for developers (and is therefore more likely to be present), it's much more reliable for screen readers to hook into as well. It then becomes feasible for screen readers to introduce commands for moving straight to the primary content area of the page.

## Jaws scripts

These (proof of concept) Jaws scripts for Firefox demonstrate how this interaction might work. When installed they introduce a new layered keystroke: **Jaws key + Space j**.

Invoking the command causes Jaws to look for the `main` element with role="main" applied. The `main` element doesn't exist yet, so Jaws doesn't recognise it. The script cheats by using the **MoveToTagWithAttribute** function instead.

If Jaws finds that combination of element and role, it jumps focus to that point and announces "Main content area" or "Start of main content area" if beginner verbosity is enabled). Otherwise it announces "No main content area" (or "There is no main content area on this page").

There is a test page included in the zip file that uses `main role="main"`, but there has been at least one [sighting of `<main>` in the wild](https://www.theatre-optique.com/oculus/1/1) already.
