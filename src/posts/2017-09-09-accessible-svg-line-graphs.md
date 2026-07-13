---
title: "Accessible SVG line graphs"
date: 2017-09-09
postTags: ["SVG", "ARIA"]
postCategories: ["Code things"]
postSummary: "SVG is often used for data visualisation, but it lacks the semantics to express structures like bar charts and line graphs, making content difficult for screen reader users to interpret. The solution is to use accessible SVG table techniques as your starting point."
---

SVG is often used for data visualisation, but because SVG lacks the semantics to express structures like bar charts, line graphs, and scatter plots, the content is difficult for screen reader users to interpret. The solution is to use the technique for creating [accessible SVG tables](/accessible-svg-tables/) as your starting point.

Let's take a simple [SVG line graph](https://demos.tink.uk/svg-line-graph/original.html) as a working example. In this graph the y axis represents usage by percent, and the x axis represents time. The three lines represent the different screen readers:

* Jaws is a solid blue line;
* NVDA is a dotted black line;
* VoiceOver is a smaller dotted green line.

Using the graph you can tell what percent of usage each screen reader had at a particular point in time. For example, in January 2014 74% of screen reader users used Jaws, in May 2012 43% used NVDA, and in July 2014 30.9% used Voiceover.

This data can be represented as a table: where the rows represent the screen readers, the columns represent the points in time, with the usage percentage data in the table cells.

It's a good idea to give people choices about the way they consume content, so letting people choose between a graphical and tabular view of the data would be a good thing to do in any case. But in the interests of making your primary content as accessible as it can be, you can use the following ARIA to add table semantics directly in the SVG:

* [`table` role](https://w3.org/tr/wai-aria-1.1#table)
* [`row` role](https://w3.org/tr/wai-aria-1.1#row)
* [`rowheader` role](https://w3.org/tr/wai-aria-1.1#rowheader)
* [`columnheader` role](https://w3.org/tr/wai-aria-1.1#columnheader)
* [`cell` role](https://w3.org/tr/wai-aria-1.1#cell)
* [`img` role](https://w3.org/tr/wai-aria-1.1#img)
* [`aria-hidden` attribute](https://w3.org/tr/wai-aria-1.1#aria-hidden)

## Adding ARIA

Use a `g` element with `role="table"` to represent the table:

```svg
<g role="table">...</g>
```

Add `role="row"` to each of the `g` elements that represent the table rows:

```svg
<g role="row">...</g>
```

Add `role="columnheader"` to each of the `text` elements that represent the column headers:

```svg
<g role="row" class="grey small">
  <text role="columnheader" x="334.5" text-anchor="middle" class="grey" y="306">Time</text>
  <text role="columnheader" x="130" text-anchor="middle" y="269">Jan 2009</text>
  <text role="columnheader" x="232" text-anchor="middle" y="269">Dec 2010</text>
  <text role="columnheader" x="334.5" text-anchor="middle" y="269">May 2012</text>
  <text role="columnheader" x="436.5" text-anchor="middle" y="269">Jan 2014</text>
  <text role="columnheader" x="539" text-anchor="middle" y="269">Jul 2015</text>
</g>
```

Use a `g` element with `role="rowheader"` to represent the header for each row in the table. Move the `title` element that is the first child of the `rowheader`, so it is the child of the `path` element, and give the `path` element `role="img"`.

```svg
<g role="row">
  <g role="rowheader">
    <path role="img" transform="translate(79,63)" d="M 51 48.5 C 51 48.5 112.5 53 153.3 56.8 C 194 61 214 68 255.5 68 C 296 68 317 67.5 357.7 67.5 C 398.5 67.5 460 105 460 105" class="s1" stroke-linecap="round">
      <title>Jaws</title>
    </path>
  </g>
  ...
</g>
```

It's necessary to move the title element inside the path element, and to give the path element role="img" in order to fool browsers into thinking there is content inside the left-most column of the table. IE doesn't need this, but it's a workaround for other browsers.

Use a `g` element with `role="cell"`, to represent each of the table cells. Add `role="img"` to each of the `use` elements that represent the content of the cells:

```svg
<g role="cell">
  <use role="img" href="#points-0" x="130" y="112">
    <title>74%</title>
  </use>
</g>
```

The `img` role is again used to expose the content as a graphic in the browser, with the `title` element providing its accessible name.

Use the `aria-hidden` attribute to hide the y axis values, the y axis label ("Percentage usage"), and the legend, from screen readers. The same information is available to screen reader users through the row and column headers, so this avoids duplication of information without removing it from the visual presentation.

A [working demo](https://demos.tink.uk/svg-line-graph/) of the chart has all of these changes applied.

The state of SVG accessibility support in browsers and screen readers is still highly inconsistent, even when ARIA is used to polyfill semantic information. This solution works with Jaws in Chrome and IE, but only partially in Firefox (because Jaws doesn't recognise the contents of the table cells in that browser); NVDA struggles with the ARIA table semantics in Chrome, Firefox, and IE; whilst this solution works well with VoiceOver in Safari.

The upshot is that this technique is enough to make the primary SVG content more screen reader accessible, and support is likely to improve as browsers and screen readers improve their support for SVG and ARIA, but it isn't enough to make it completely so. For this (and many other good reasons), it's a good idea to provide an alternative view of the information, for example by providing both a graphical and a tabular view of the content (as noted above).

Thanks to [WebAIM](https://webaim.org) for the data (taken from their screen reader surveys) used to create this line graph, and to Chaals McCathie Nevile who borrowed the original SVG chart from HighChart and started [thinking about its accessibility](https://svg-access-w3cg.github.io/use-case-examples/hc-chart/notes.html).
