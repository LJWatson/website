---
title: "Using HTML5 headings"
date: 2011-11-28
postTags: ["HTML"]
postCategories: ["Code things"]
postSummary: "I originally recommended using flat `h1` heading structures, but four years later the HTML5 outline algorithm still isn't supported in browsers, making that approach meaningless—better to use explicitly ranked HTML headings instead."
---

**Updated:** 26th November 2015.

Originally I recommended using a flat `h1` heading structure. Four years later the HTML5 outline algorithm is still not supported in browsers, and without that an `h1` only heading structure is meaningless. Better to use explicitly ranked HTML headings and take care to get the [heading hierarchy](https://www.nomensa.com/blog/2010/using-html-headings) right!

**Updated:** 2 October 2022

The HTML Standard has been updated to reflect reality. No browser supports the outline algorithm properly (some support it visually in the default browser styles, but none support it semantically), finally resolving [issue #83](https://github.com/whatwg/html/issues/83).

HTML5 headings make it easy to syndicate and reuse content, without breaking the heading hierarchy. Using HTML5 headings and keeping the heading hierarchy backwards compatible proves unexpectedly complicated though. The [HTML5 specification](https://dev.w3.org/html5/spec/spec.html#contents) has a solution, but is it the right one?

## HTML5 sections

HTML5 uses [sectioning content](https://dev.w3.org/html5/spec/content-models.html#sectioning-content) to break a page up into chunks. The `article`, `aside`, `nav` and `section` elements can be used to explicitly create sections. Here’s what the HTML5 specification says about sectioning content:

> Sectioning content is content that defines the scope of headings and footers… Each sectioning content element potentially has a heading and an outline.

## HTML5 headings

This means that each section contains its own heading hierarchy. Here’s what the HTML5 specification says about it:

> The first element of heading content in an element of sectioning content represents the heading for that section.

This means that you could use an h1 at the start of each sectioning element. For example:

```html
<body>
  <h1>Favourite colours</h1>

  <section>
    <h1>Purple</h1>
    <p>Purple is my favourite colour.</p>

    <aside>
      <h1>Reasons</h1>
      <p>I like purple because…</p>
    </aside>
  </section>

  <section>
    <h1>Pink</h1>
    <p>Pink is my least favourite colour.</p>

    <aside>
      <h1>Reasons</h1>
      <p>I dislike pink because…</p>
    </aside>
  </section>

</body>
```

HTML5 calculates the rank of each heading based on its location within the sectioning content elements. The above example would therefore have the following structure:

1. Favourite colours  
  1.1. Purple  
  &nbsp;&nbsp;&nbsp;&nbsp;1.1.1 Reasons  
  1.2 Pink  
  &nbsp;&nbsp;&nbsp;&nbsp;1.2.1 Reasons

If the same page were to be coded with semantically correct HTML4.01, it might look something like this:

```html
<body>
  <h1>Favourite colours</h1>

  <div>
    <h2>Purple</h2>
    <p>Purple is my favourite colour.</p>

    <div>
      <h3>Reasons</h3>
      <p>I like purple because…</p>
    </div>
  </div>

  <div>
    <h2>Pink</h2>
    <p>Pink is my least favourite colour.</p>

    <div>
      <h3>Reasons</h3>
      <p>I dislike pink because…</p>
    </div>
  </div>

</body>
```

The idea is that the HTML5 heading hierarchy is adaptable. You could pull out the `section` elements and slot them into another HTML5 website, without breaking the heading hierarchy.

## HTML5 explicit and implicit headings

Things get a touch more involved when you create a heading hierarchy within a single section. The HTML5 specification goes on to say:

> The first element of heading content in an element of sectioning content represents the heading for that section. Subsequent headings of equal or higher rank start new or implied sections. Headings of lower rank start implied sub sections that are part of the previous one.

This means that if you use nested headings within the same section, HTML5 will behave as though they’re explicit sub sections. For example:

```html
<body>
  <h1>Favourite colours</h1>

  <section>
    <h1>Purple</h1>
    <p>Purple is my favourite colour.</p>

    <h2>Reasons</h2>
    <p>I like purple because…</p>
  </section>

</body>
```

In the above example the `aside` element has been removed, so that section is no longer explicitly defined. The “Reasons” heading is of lower rank than the “Purple” heading though, so HTML5 implicitly assumes there is a sub section there anyway. The outline would look like this:

1. Favourite colours  
  1.1. Purple  
  &nbsp;&nbsp;&nbsp;&nbsp;1.1.1. Reasons

If the “Reasons” heading had been an `h1` instead, HTML5 would automatically close the explicitly defined <section> and open an implicitly defined section at the same level. For example:

```html
<body>
  <h1>Favourite colours</h1>

  <section>
    <h1>Purple</h1>
    <p>Purple is my favourite colour.</p>

    <h1>Reasons</h1>
    <p>I like purple because…</p>
  </section>

</body>
```

The resulting outline structure would therefore be:

1. Favourite colours  
  1.1. Purple  
  1.2. Reasons

## Using h1 only or explicitly ranked headings

If you wanted to conform to the HTML5 specification, and there was no need to provide backwards compatibility, the `h1` only technique would be fine.

It’s going to be some while before we reach that utopia though. In the meantime, developers can use explicitly ranked headings to support the browsers and assistive technologies that haven’t implemented HTML5 headings at all. Here’s what the HTML5 specification has to say on the subject:

> Sections may contain headings of any rank, but authors are strongly encouraged to either use only h1 elements, or to use elements of the appropriate rank for the section’s nesting level.

This means that the following HTML5 examples would both represent the same outline structure.

### Using h1 only

```html
<body>
  <h1>Favourite colours</h1>

  <section>
    <h1>Purple</h1>
    <p>Purple is my favourite colour.</p>

    <aside>
      <h1>Reasons</h1>
      <p>I like purple because…</p>
    </aside>
  </section>

</body>
```

### Using explicitly ranked headings

```html
<body>
  <h1>Favourite colours</h1>

  <section>
    <h2>Purple</h2>
    <p>Purple is my favourite colour.</p>

    <aside>
      <h3>Reasons</h3>
      <p>I like purple because…</p>
    </aside>
  </section>

</body>
```

The outline structure represented by both of the above examples would be:

1. Favourite colours  
  1.1. Purple  
  &nbsp;&nbsp;&nbsp;&nbsp;1.1.1. Reasons

## HTML5 heading support

The Jaws screen reader briefly introduced support for the HTML5 outline algorithm in version 13. The implimentation was broken however, and subsequently removed in Jaws 15. No browsers currently support the outline algorithm.

## Choosing h1 only or explicitly ranked headings

The question has been asked whether the `h1` only or explicitly ranked headings technique is the best one to use.

