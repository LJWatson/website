---
title: "Using the ARIA application role"
date: 2016-04-23
postTags: ["ARIA", "JavaScript", "Screen readers"]
postCategories: ["Code things"]
postSummary: "The ARIA `application` role stops screen readers from intercepting keystrokes, which can be useful for JavaScript keyboard shortcuts, but it also disables all standard screen reader navigation—so it must be used carefully and only when necessary."
---

The ARIA [application role](https://www.w3.org/TR/wai-aria-1.1/#application) changes the way screen readers interact with web content. Several good articles explain (rightly) why the `application` role should be [used with caution](https://www.marcozehe.de/2012/02/06/if-you-use-the-wai-aria-role-application-please-do-so-wisely/), but this post looks at a use case where the `application` role is used to good effect.

Screen readers sometimes intercept keystrokes and repurpose them for screen reader specific tasks, like navigating content by headings or reading a line of text. The `application` role prevents the screen reader from intercepting keystrokes, and passes them back through to the browser as though the screen reader wasn’t running. Read [Understanding screen reader interaction](/understanding-screen-reader-interaction-modes/) for more information.

It is this intercept behaviour that means some screen readers, notably those that run on Windows, do not work with keyboard shortcuts provided using JavaScript. The screen reader intercepts the given shortcut keys and uses them for its own purpose, instead of letting them through to the browser and the waiting Javascript. Read [Time to revisit accesskey](/time-to-revisit-accesskey/) for more information.

The answer may seem simple at this point – use the `application` role to stop the screen reader intercepting the shortcut keys, so the Javascript can do its job. The problem with this is that it will stop the screen reader intercepting every keystroke, not just those intended to be used as keyboard shortcuts. In other words, none of the keystrokes used for navigating and interacting with content will be available to the user. This seriously impairs their ability to read and interact with content in the normal way.

The decision to use the `application` role must therefore be taken carefully. It should only be used when there is no need for a screen reader user to be able to use any of the standard keyboard commands at their disposal. To put it another way, if you use the `application` role, the responsibility to provide all keyboard interaction lies with you.

One such case is the [Shower Presentation Engine](https://github.com/shower/shower) by Vadim Makeev. It is an HTML, CSS, ARIA and JavaScript based engine for writing presentation slides. It has the ability to display slides in a gallery or slideshow view, and to switch between views in response to click, tap or keyboard.

When in slideshow view there is a limited set of expected interactions: move to next/previous slide or move to first/last slide. The Shower engine provides keyboard shortcuts for each of these interactions, but it does so using JavaScript, resulting in the problem described above for Windows screen reader users.

In gallery view a screen reader user might want to navigate slides by heading, list or other element type, or to query content by word, line or paragraph. When in slideshow view and giving a presentation there is (almost) no need for any of the standard screen reader commands to be used though.

The exception is that a screen reader user needs to be able to query the title of each slide, and possibly the content of each slide as it appears. Instead of providing a specific keyboard shortcut to enable screen reader users to do this, the Shower engine accomplishes this using an [ARIA live region](https://www.w3.org/TR/wai-aria-1.1/#aria-live), that causes screen readers to automatically announce the title and content of each slide as it appears in the slideshow view.

The slideshow view is therefore that rare thing – a suitable place to use the `application` role. There is a clearly defined set of interactions, with complete keyboard support provided using JavaScript, and no need for standard screen reader commands to be used whilst giving a presentation.

Thanks to a contribution from [Dan Hopkins](https://github.com/danhopkins), the Shower engine applies the `application` role to the element whenever slideshow view is enabled. When switching back to gallery view, the `application` role is removed and standard screen reader behaviour resumes.
