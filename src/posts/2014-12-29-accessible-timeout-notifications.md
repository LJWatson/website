---
title: "Accessible timeout notifications"
date: 2014-12-29
postTags: ["ARIA", "HTML", "JavaScript", "Screen readers"]
postCategories: ["Code things"]
postSummary: "I've written about making session timeout warnings accessible to all users, including those using assistive technologies like screen readers, by moving keyboard focus to the notification and using proper ARIA attributes."
---

When a web application has a session timeout, it’s a good idea to warn users about the impending timeout and give them the opportunity to do something about it. It’s therefore important to make sure that all users know when the warning notification appears.

When you set the timeout initially, don’t forget that some people will take longer to use your application than others. This might be because someone lacks confidence with the web or because they find reading or comprehension difficult. In both cases an extended period of inactivity might be the result of them taking extra time to read and understand the content, and a timeout notification will only exacerbate the problem. Make the initial timeout as generous as possible.

When the timeout is imminent, a common approach is to display a notification on-screen. The notification usually indicates how much time is left before the timeout occurs, and includes an option to postpone it for a further period of time.

It’s better to use [DOM scripting](https://www.w3.org/TR/WCAG20-TECHS/SCR21.html) to add the notification to the page at the appropriate time. If you rely on toggling `display:none;` in the CSS, the notification will be permenantly available to anyone who has CSS disabled and/or who uses their own stylesheets.

When the notification appears there are a few simple things you can do to make sure everyone is aware of it. Your basic notification might look like this:

```html
<div>
  <h1>You will be logged out soon</h1>
  …
</div>
```

## Move keyboard focus

Use the [tabindex attribute](https://www.paciellogroup.com/blog/2014/08/using-the-tabindex-attribute/) with a value of `-1` on the `div`. When the notification appears on-screen, use `obj.focus()` to move keyboard focus to the notification. This will ensure that keyboard users (including people using screen readers and screen magnifiers) are aware that the notification has appeared.

when the user confirms the timeout extension, keyboard focus should be returned to its original location on the page. This stops keyboard users from having to manually navigate back to their original point in the content.

## Indicate group semantics

Use the [group role](https://www.w3.org/TR/wai-aria/roles#group) on the `div`. This will indicate to screen readers (and other assistive technologies that support ARIA in the future) that the content contained within the `div` has a common purpose.

## Provide an accessible name

Use the [aria-labelledby attribute](https://www.w3.org/WAI/PF/aria/states_and_properties#aria-labelledby) on the `div` and use the idref of the `h1` as its value. This will give the `div` an accessible name based on the content of the `h1` element so that screen readers can differentiate the group from other content.

```html
<div tabindex="-1" role="group" aria-labelledby="notification">
  <h1 id=""notification">You will be logged out soon</h1>
  …
</div>
```

In doing these things you’ll make sure that people have a reasonable amount of time to use the application comfortably, that they’re aware when a timeout is about to happen, and that they can act to postpone it in good time.
