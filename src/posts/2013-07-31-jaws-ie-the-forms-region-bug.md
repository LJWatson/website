---
title: "Jaws, IE & the forms region bug"
date: 2013-07-31
postTags: ["Screen readers", "ARIA", "HTML", "Screen readers"]
postCategories: ["Code things"]
postSummary: "I've discovered an unusual problem where Jaws announces \"region\" before every form field in Internet Explorer when a form is inside a `role=\"main\"` container, but there's a simple workaround: add `role=\"form\"` to the form element itself."
---

There is an unusual problem with Jaws and Internet Explorer that causes the word "region" to be announced before every field in a form. Fortunately there is a workaround until the problem itself is resolved.

The situation arises when you have a form inside a container with `role="main"` applied to it. For example:

```html
<div role="main">
  <form method="post">

    <div>
      <label for="username">Username: </label><br> 
      <input type="text" id="username">
    </div>

    <div>
      <label for="password">Password: </label><br>
      <input type="password" id="password">
    </div>

    <div>
      <input type="submit" value="Log in">
    </div>

  </form>
</div>
```

The problem occurs in Internet Explorer 8, 9 and 10 (and possibly older versions too). It first appeared with Jaws 13 and persists in Jaws 14.

In an added twist the problem only happens when Jaws verbosity is set to beginner (the default) or intermediate. If verbosity is set to advanced the erroneous announcements don't happen.

There is a workaround that stops Jaws from doing this. Ordinarily it's good to be cautious about hacking around user agent bugs, but in this case it isn't too much of a dirty hack. Just add `role="form"` to the form element.

```html
<div role="main">
  <form role="form" method="post">
    ...

  </form>
</div>
```

It shouldn't be necessary to do this. The role maps to the element natively in HTML anyway. In this case though, adding `role="form"` directly in the HTML doesn't break the natural semantics of the page, and it won't cause any backwards/forwards compatibility issues either.
