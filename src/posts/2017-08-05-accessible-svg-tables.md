---
title: "Accessible SVG tables"
date: 2017-08-05
postTags: ["SVG", "ARIA"]
postCategories: ["Code things"]
postSummary: "SVG has no native table semantics, but ARIA1.1 introduces roles that can polyfill the necessary information, making SVG tables more accessible for screen reader users."
---

SVG has no native semantics for representing structures like tables, but [ARIA1.1](https://www.w3.org/TR/wai-aria-1.1/) introduces a number of roles that can be used to polyfill the necessary semantic information.

If you're using HTML, use the relevant HTML elements to create tables. The `table`, `thead`, `tfooter`, `tbody`, `th`, and `td` elements are purpose built to do the job. Don't make things harder for yourself by reinventing the wheel.

That said, if you're working with SVG (which doesn't have elements for representing tables), then polyfilling the missing semantics with ARIA makes the SVG content more accessible for screen reader users.

## Basic SVG table

Let's take a simple SVG table as a working example.

### Basic SVG table code

The SVG code looks like this:

```html
<svg width="100%" height="100%" viewBox="0 0 370 160">
  <title>Expenses</title>

  <g id='rowGroup' transform='translate(0, 0)'>
    <rect x='25' y='40' width='310' height='20' fill='gainsboro'/>
    <rect x='25' y='76' width='310' height='20' fill='gainsboro'/>

    <text x='30' y='30' font-size='18px' font-weight='bold' fill='crimson' text-anchor='middle' role="row">
      <tspan  x='100'>Sales</tspan>
      <tspan   x='200'>Expenses</tspan>
      <tspan  x='300'>Net</tspan>
    </text>

    <text x='30' y='30' font-size='18px' text-anchor='middle' role="row">
      <tspan  x='30' dy='1.5em' font-weight='bold' fill='crimson' text-anchor='start'>Q1</tspan>
      <tspan  x='100'>$ 223</tspan>
      <tspan  x='200'>$ 195</tspan>
      <tspan  x='300'>$ 28</tspan>
    </text>

    <text x='30' y='30' font-size='18px' text-anchor='middle' role="row">
      <tspan  x='30' dy='2.5em' font-weight='bold' fill='crimson' text-anchor='start'>Q2</tspan>
      <tspan  x='100'>$ 183</tspan>
      <tspan  x='200'>$ 70</tspan>
      <tspan  x='300'>$ 113</tspan>
    </text>

    <text x='30' y='30' font-size='18px' text-anchor='middle' role="row">
      <tspan  x='30' dy='3.5em' font-weight='bold' fill='crimson' text-anchor='start'>Q3</tspan>
      <tspan  x='100'>$ 277</tspan>
      <tspan  x='200'>$ 88</tspan>
      <tspan  x='300'>$ 189</tspan>
    </text>

    <text x='30' y='30' font-size='18px' text-anchor='middle' role="row">
      <tspan id="q4"  x='30' dy='4.5em' font-weight='bold' fill='crimson' text-anchor='start'>Q4</tspan>
      <tspan  x='100'>$ 402</tspan>
      <tspan  x='200'>$ 133</tspan>
      <tspan  x='300'>$ 269</tspan>
    </text>
  </g>
</svg>
```

## Missing semantics

It looks like a table, but the samantic information exposed by SVG in the accessibility tree is not that of a table. According to the [SVG Accessibility API Mappings (AAM)](https://www.w3.org/TR/svg-aam-1.0/), the exposed roles are:

* `graphics-document` for the `svg` element;
* `graphics-symbol` for the `rect` element;
* `group` for the `g` element;
* `group` or `text` (depending on the accessibility API) for the `text` element.

**Note:** the graphics-document and `graphics-symbol` roles are documented in the [ARIA Graphics module](https://www.w3.org/TR/graphics-aria-1.0/), and the [Graphics AAM](https://w3c.github.io/aria/graphics-aam/graphics-aam.html).

There is an added complication: although these roles are supported by browsers and accessibility APIs, they are not well supported by screen readers. The `group` role is recognised by screen readers but is not communicated to users in this context, and neither the `graphics-document` or `graphics-symbol` roles is recognised at all. The text content is available to screen readers though.

## Adding semantics

So in the absence of useful semantic information, we can use these ARIA roles as an accessibility polyfill:

* [`table`](https://www.w3.org/TR/wai-aria-1.1#table)
* [`row`](https://www.w3.org/TR/wai-aria-1.1#row)
* [`columnheader`](https://www.w3.org/TR/wai-aria-1.1#columnheader)
* [`rowheader`](https://www.w3.org/TR/wai-aria-1.1#rowheader)
* [`cell`](https://www.w3.org/TR/wai-aria-1.1#cell)

## Basic SVG table + ARIA

This SVG table looks the same, but thanks to the ARIA it can be navigated by screen reader users in the same way as an HTML table.

\>ExpensesSalesExpensesNetQ1$ 223$ 195$ 28Q2$ 183$ 70$ 113Q3$ 277$ 88$ 189Q4$ 402$ 133$ 269

### Basic SVG table + ARIA code

The updated code looks like this:

```html
<svg width="100%" height="100%" viewBox="0 0 370 160">
  <title>Expenses</title>

  <g id='rowGroup' transform='translate(0, 0)' role="table">
    <rect x='25' y='40' width='310' height='20' fill='gainsboro'/>
    <rect x='25' y='76' width='310' height='20' fill='gainsboro'/>

    <text x='30' y='30' font-size='18px' font-weight='bold' fill='crimson' text-anchor='middle' role="row">
      <tspan role="columnheader" x='100'>Sales</tspan>
      <tspan  role="columnheader" x='200'>Expenses</tspan>
      <tspan role="columnheader" x='300'>Net</tspan>
    </text>

    <text x='30' y='30' font-size='18px' text-anchor='middle' role="row">
      <tspan role="rowheader" x='30' dy='1.5em' font-weight='bold' fill='crimson' text-anchor='start'>Q1</tspan>
      <tspan role="cell" x='100'>$ 223</tspan>
      <tspan role="cell" x='200'>$ 195</tspan>
      <tspan role="cell" x='300'>$ 28</tspan>
    </text>

    <text x='30' y='30' font-size='18px' text-anchor='middle' role="row">
      <tspan role="rowheader" x='30' dy='2.5em' font-weight='bold' fill='crimson' text-anchor='start'>Q2</tspan>
      <tspan role="cell" x='100'>$ 183</tspan>
      <tspan role="cell" x='200'>$ 70</tspan>
      <tspan role="cell" x='300'>$ 113</tspan>
    </text>

    <text x='30' y='30' font-size='18px' text-anchor='middle' role="row">
      <tspan role="rowheader" x='30' dy='3.5em' font-weight='bold' fill='crimson' text-anchor='start'>Q3</tspan>
      <tspan role="cell" x='100'>$ 277</tspan>
      <tspan role="cell" x='200'>$ 88</tspan>
      <tspan role="cell" x='300'>$ 189</tspan>
    </text>

    <text x='30' y='30' font-size='18px' text-anchor='middle' role="row">
      <tspan id="q4" role="rowheader" x='30' dy='4.5em' font-weight='bold' fill='crimson' text-anchor='start'>Q4</tspan>
      <tspan role="cell" x='100'>$ 402</tspan>
      <tspan role="cell" x='200'>$ 133</tspan>
      <tspan role="cell" x='300'>$ 269</tspan>
    </text>
  </g>
</svg>
```

This has the advantage of being supported on multiple platforms, in multiple browsers, and with multiple screen readers. The [ARIA tables demo](https://ljwatson.github.io/design-patterns/aria-tables/index.html) includes information about browser and screen reader support for Windows, MacOS, iOS, and Android.
