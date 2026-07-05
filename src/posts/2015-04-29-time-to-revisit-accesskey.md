---
title: "Time to revisit accesskey?"
date: 2015-04-29
postTags: ["HTML", "JavaScript", "Screen readers"]
postCategories: ["Code things"]
postSummary: "Many websites provide keyboard shortcuts for common tasks, but the way they're delivered using JavaScript is problematic for Windows screen reader users because the screen reader intercepts the keys."
---

Many websites provide keyboard shortcuts for common tasks. Keyboard shortcuts are useful things to have, but the way in which they’re provided is often problematic for Windows screen reader users.

Websites like [Facebook](https://www.facebook.com/), Twitter and [Google](https://www.google.com/) provide keyboard shortcuts for repetitive tasks, like posting a status update, replying to a tweet, or deleting an email. The shortcuts are intended to make things easier for keyboard-only users, but also for mouse users (because it’s often quicker to hit a keyboard shortcut than it is to locate the relevant control and click on it with a mouse).

Each of these sites (and many others) provide keyboard shortcuts using JavaScript. On the face of it this seems like a reasonable way to do things, but layering keyboard functionality on top of the application means that none of the shortcuts are available to Windows screen reader users.

## Caught in the virtual buffer

Windows screen readers use a [virtual model](/understanding-screen-reader-interaction-modes) to support interaction with content rendered in the browser. A virtual buffer of the content is created, based on information from the DOM and accessibility tree. It is this virtual version of the content that the screen reader presents to the user.

Interaction with the virtual buffer works like this: the screen reader listens for keyboard events. When it detects a key press that corresponds to a screen reader command, that action is executed in the virtual buffer. For example, if the h key is pressed when a Windows screen reader is running, focus will move to the next heading (h1 – h6) in the virtual buffer. Otherwise the key is passed back through to the browser, where it will be caught by the JavaScript that handles the shortcuts provided by the website.

The trouble is that Windows screen readers utilise almost every available key for screen reader specific commands. This means that few keys make it past the screen reader to the browser, and consequently the JavaScript shortcuts are never triggered.

To take a specific example, p is the Facebook shortcut for posting a status update. If you use it without a Windows screen reader running, focus moves to the “What’s on your mind” field. If you try it with Jaws running, focus will move to the next paragraph, and in NVDA nothing will happen at all. In both cases the p key is intercepted by the screen reader, and never makes it any further.

It is possible to tell both NVDA and Jaws to pass the next key through to the browser. In NVDA you press the NVDA modifier (insert) f2, followed by the key you want to pass through. In Jaws it’s the Jaws modifier (insert) 3, followed by the key to pass back to the browser. This is not a user-friendly way to interact with a website though, even assuming you know it’s possible in the first place.

## Identifying shortcuts

If the screen reader could identify the shortcut keys provided by the website, it would be possible to give the user a choice: use the screen reader’s native shortcuts, or use the shortcuts provided by the website. The problem is that when JavaScript is used, there is no information about the available shortcuts exposed in the browser’s accessibility tree. Each of the platform accessibility APIs has a shortcut property (dating back to the days of `accesskey`), but it isn’t possible to access the APIs with JavaScript.

An April 2015 update to Jaws 16 introduced a feature that attempts to solve the problem. The “Web application reserved keystrokes” setting tells Jaws to stop intercepting keys that have been reserved by the website. In the case of Facebook, Jaws would ignore the p as a command to move to the next paragraph, and send the key through to the browser where it would trigger the JavaScript shortcut for posting a status update.

This feature does solve the problem (for Jaws users at least), but it’s something of a dirty hack. In order for Jaws to know which keys have been reserved by the website, it’s necessary to reference the shortcuts in the HTML. For example:

```html
<div data-at-shortcutkeys={‘j’: ‘Key to navigate to next post’, ‘q’: ‘Key to place focus in chat’}></div>
```

Jaws then has to scrape the DOM to get at that information. It’s a method that’s prone to error, and scraping the DOM is always much less efficient than querying the accessibility API.

## Accessibility API access

What we need is a way for websites to provide keyboard shortcuts that are exposed in the browser’s accessibility tree – so that the information can be queried by any assistive technology using the accessibility API. Perhaps it’s time to [revisit accesskey](https://www.w3.org/WAI/PF/HTML/wiki/Accesskey), fix the broken bits and extend it to become a useful thing?
