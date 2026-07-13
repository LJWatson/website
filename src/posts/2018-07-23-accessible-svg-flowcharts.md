---
title: "Accessible SVG flowcharts"
date: 2018-07-23
postTags: ["SVG", "ARIA"]
postCategories: ["Code things"]
postSummary: "I've used ARIA table semantics to make SVG line graphs accessible to screen readers, and I'm now using the same approach to make an SVG flowchart accessible too."
---

The [accessible SVG line graphs](/accessible-svg-line-graphs/) post explains how to use ARIA table semantics to make that form of data visualisation accessible to screen readers. This article uses the same ARIA based approach to make a screen reader accessible SVG flowchart.

The example comes from the W3C Process document, and a flowchart that describes the process of taking a specification from its First Public Working Draft (FPWD) through to official W3C Recommendation (Rec). The original SVG can be found in the [W3C Process 2015](https://www.w3.org/2015/Process-20150901/) document, and a revised version (with a first attempt at accessibility) is in the [W3C Process 2017](https://www.w3.org/2017/Process-20170301/) document.

SVG lacks the semantics to express structures like line graphs, bar charts, or flowcharts, and so SVG data visualisations are difficult for screen reader users to understand. The structure of a flowcart can be represented as a series of nested lists, so we can use ARIA to impose these semantics for the benefit of screen reader users.

The following ARIA roles and attributes were used for the W3C flowchart:

* [`list` role](https://www.w3.org/TR/wai-aria-1.1/#list)
* [`listitem` role](https://www.w3.org/TR/wai-aria-1.1/#listitem)
* [`img` role](https://www.w3.org/TR/wai-aria-1.1/#img)
* [`aria-hidden` attribute](https://www.w3.org/TR/wai-aria-1.1/#list)

## Adding the ARIA

The first step was to create the skeleton structure of the flowchart, using the `g` element as the base. Here's a fragment:

```svg
<g role="list">
  <g role="listitem"></g>
  <g role="listitem">
    <g role="list">
      <g role="listitem"></g>
      <g role="listitem"></g>
    </g>
  </g>
</g>
```

Once the existing SVG content had been moved into the new structure, the `img` role was applied to the first child element inside each link (more on the links later), and the `title` element used to give the element its accessible name, to encourage screen readers to recognise the listitems.

The `aria-hidden` attribute was then used to hide the `text` element from screen readers (because it duplicated the accessible name of the `title` element).

```svg
<g role="list">

  <!-* FPWD -->
  <g role="listitem">

    <a xlink:href="#wd-1">
      <rect role="img" fill="white" y="122" width="57" height="45">
        <title>First Public Working Draft (FPWD) * Exclusion opportunity</title>
      </rect>

      <text font-size="8">
        <tspan aria-hidden="true" y="132" x="0">First Public WD</tspan>
        <tspan x="0" y="152">WG decision</tspan>
        <tspan x="0" y="162">Director's approval</tspan>
      </text>

      <path d="M0,140h53" fill="none" stroke="#000"></path>
      <polygon points="47,136 57,140 47,144"></polygon>
    </a>
  </g>

  <!-* WD -->
  <g role="listitem">

    <a xlink:href="#cr-1">
      <ellipse role="img" id="wd-1" ry="18" rx="38" cy="140" cx="97" stroke="black" fill="#fff">
        <title>Working Draft (WD)</title>
      </ellipse>

      <text aria-hidden="true" font-size="14" y="144" x="97" text-anchor="middle">WD</text>
    </a>

    <g role="list">

      <!-* New WD -->
      <g role="listitem">

        <a xlink:href="#wd-1">
          <g role="img">
            <title>Publish a new Working Draft</title>
          </g>

          <text font-size="8"><tspan x="30" y="92">WG Decision: review needed, or</tspan>
            <tspan x="40" y="100">No change for 6 months</tspan>
          </text>

          <path d="M78,124C73,114 79,104 97,104 108,104 115,108 117,114" fill="none" stroke="black" stroke-dasharray="6 1"></path>
          <polygon points="120,114 116,124 114,113"></polygon>
        </a>
      </g>

      <!-* Advance to CR -->
      <g role="listitem" fill="#060">

        <a xlink:href="#cr-1">
          <g role="img">
            <title>Advance to Candidate Recommendation</title>
          </g>

          <text x="138" y="134" font-size="8">Director's approval</text>

          <path stroke="#060" d="M135,140h81"></path>
          <polygon points="211,136 221,140 211,144"></polygon>
        </a>
      </g>
    </g>

    ...
  </g>

  ...
</g>
```

## Navigation

The SVG flowchart now has a semantically meaningful structure, but to really understand the data in a flowchart, it's helpful to be able to navigate between siblings, as well as to follow a parent/child path through it.

The flowchart in the W3C Process document attempts to provide this form of navigation using links. This makes it possible to navigate directly between the siblings in the first layer of the flowchart (using the tab key), but is also introduces some different problems:

* The links have no [perceived affordance](https://www.jnd.org/dn.mss/affordances_and.html); this may be ok for pointer device users who do not need the links, but not for sighted keyboard users who do. The visual affordance of the links could be improved, but that creates a different problem; should a pointer device user click/tap on the link, the shift of focus would be so slight as to be unnoticeable and the link would appear to be broken.
* The destination of the link is not indicated to anyone. This could be resolved by separating the link from the item, but this reduces the usability of navigating from one sibling item directly to the next by introducing additional keystrokes.
* It isn't particularly scalable. Without some way of knowing when a press of the tab key moved focus out of one branch to the next, it would be too easy for keyboard users (sighted and not) to get lostt in a flowchart with multiple branches.

Although the keyboard experience still leaves something to be desired in SVG, adding ARIA goes some way to making the content more usable by screen reader users. The ARIA enabled version is included in the [W3C Process 2018](https://www.w3.org/2018/Process-20180201/), and a [demo version](https://demos.tink.uk/svg-flowchart/) is also available. If you find any issues, you can file them on [Github](https://github.com/w3c/w3process/).
