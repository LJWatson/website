---
title: "Enhancing ARIA landmarks with aria-labelledby"
date: 2012-06-20
postTags: ["ARIA", "Screen readers"]
postCategories: ["Code things"]
postSummary: "ARIA landmark roles help screen reader users navigate web pages, but adding aria-labelledby makes them even more useful by distinguishing between multiple similar landmarks."
---

ARIA landmark roles provide a useful way for screen reader users to navigate through web pages, and to understand the purpose of different sections of content on the page. With just a little bit more ARIA you can make landmarks even more helpful to blind and partially sighted people.

If you haven’t come across ARIA landmark roles before, you might find the following screen reader demo and articles worth a look:

* [How do ARIA landmark roles help screen reader users?](/how-do-aria-landmark-roles-help-screen-reader-users/)
* [Screen readers and ARIA landmark roles](https://www.nomensa.com/blog/2010/screen-readers-and-aria-landmark-roles/)

## Using ARIA landmark roles

Let’s take a typical situation. A web page that has two navigation blocks. You apply the appropriate ARIA landmark role to each containing element. The code might look something like this:

```html
<nav role="navigation">  
  <p>Choose an aisle to browse:</p>  
  <ul>  
    <li><a href="fresh.html">Fresh foods</a></li>  
    <li><a href="dairy.html">Milk and dairy</a></li>  
    …  
  </ul>  
</nav>

<nav role="navigation">  
  <p>Choose a shelf to browse:</p>  
  <ul>  
    <li><a href="milk.html">Milk</a></li>  
    <li><a href="butter.html">Butter</a></li>  
    <li><a href="eggs.html">Eggs</a></li>  
    …  
  </ul>  
</nav>  
```

By applying the landmark role you’ve made it easy for screen reader users to move from one landmark to the next.. Screen readers like NVDA, Jaws and VoiceOver include shortcuts for moving quickly between the landmarks on a page. In this case (depending on the screen reader) you’ll hear something like "Navigation region start" or "Navigation landmark".

## Using aria-labelledby

With just a little more ARIA you can make even more information available. With the above example there isn’t any way to tell what differentiates the two navigation blocks. Screen readers will report them both in exactly the same way, until you drill down into the content itself of course.

Using [aria-labellebdy](https://www.w3.org/TR/wai-aria/states_and_properties#aria-labelledby) you can supplement the information available to screen readers. This creates an association between the `nav` element (or `div` if you’re using HTML4) and a piece of text elsewhere on the page. The effect is that screen readers will now announce "Aisle navigation region start" or "Shelf navigation region start", or whatever the screen reader specific variation might be.

```html
<nav role="navigation" aria-labelledby="firstLabel">  
  <p>Choose an <span id="firstLabel">aisle</span> to browse:</p>  
  <ul>  
    <li><a href="fresh.html">Fresh foods</a></li>  
    <li><a href="dairy.html">Milk and dairy</a></li>  
    …  
  </ul>  
</nav>  

<nav role="navigation" aria-labelledby="secondLabel">  
  <p>Choose a <span id="secondLabel">shelf</span> to browse:</p>  
  <ul>  
    <li><a href="milk.html">Milk</a></li>  
    <li><a href="butter.html">Butter</a></li>  
    <li><a href="eggs.html">Eggs</a></li>  
    …  
  </ul>  
</nav>
```

This technique makes it a lot easier for blind and partially sighted people (with ARIA enabled screen readers) to do something very like visually scanning a page.
