---
title: "Quick guide to the ARIA specifications"
date: 2017-05-17
postTags: ["ARIA", "Standards"]
postCategories: ["Code things"]
postSummary: "I'm briefly introducing each ARIA specification from the W3C and explaining where each one fits into the overall ARIA landscape."
---

ARIA (Accessible Rich Internet Applications) is a suite of specifications from the W3C. Knowing which specification has the information you need isn't always obvious, so this post briefly introduces each specification and where it fits into the overall ARIA landscape.

## ARIA

This is where ARIA itself is defined. [ARIA 1.0](https://www.w3.org/TR/wai-aria/) was released in March 2014, and [ARIA 1.1](https://www.w3.org/TR/wai-aria-1.1/) is expected to become a W3C Recommendation within the next few months.

The ARIA specification describes the roles, states, and properties that can be used to poly fill accessibility for screen readers. This is the specification you need when you want to find out which roles, states, and properties are available for use with HTML and/or SVG.

## ARIA Authoring Practices Guide (APG)

The ARIA APG is a collection of design patterns for common interface components. The [ARIA APG 1.0](https://www.w3.org/TR/2016/WD-wai-aria-practices-1.1-20160317/) was never officially released, but the [ARIA APG 1.1](https://www.w3.org/TR/wai-aria-practices-1.1/) is under active development.

The APG describes the keyboard interaction expected for custom components like tabpanels, dialogs, and menubars. It also explains which ARIA roles, states, and properties are required to make custom components accessible to screen readers. If you're creating custom components in HTML or SVG, the ARIA APG is the reference manual you need.

## Accessibility API Mappings (AAM)

The AAM specifications document the way native components are mapped to [platform accessibility APIs](https://www.smashingmagazine.com/2015/03/web-accessibility-with-accessibility-api/). The [Core AAM 1.1](https://www.w3.org/TR/core-aam-1.1/), [HTML AAM 1.0](https://www.w3.org/TR/html-aam-1.0/), and [SVG AAM 1.0](https://www.w3.org/TR/svg-aam-1.0/), are all works in progress.

The HTML AAM describes how native HTML elements are mapped to ARIA roles, and to the equivalent roles on different platforms (and consequently different browsers). The SVG AAM attempts to do the same for SVG elements, but at present browser support for SVG accessibility API mappings is much less robust than for HTML. The AAM specifications are where you should go when you want to know how browsers should handle different elements in terms of keyboard focus, role, state, and property information for accessibility.

## ARIA in HTML

This specification documents the way tools should parse ARIA in HTML. [ARIA in HTML 1.0](https://www.w3.org/TR/html-aria/) is under active development, and is expected to become an official W3C Recommendation later this year.

ARIA in HTML is intended for use by conformance checkers, and tools that test for accessibility. If you want to know how these tools are expected to handle ARIA when it's used with HTML, this is the specification to use.

## Using ARIA

This describes a set of best practice principles for [Using ARIA in HTML](https://www.w3.org/TR/using-aria/). It's a reliable W3C Note, that is continually updated.

Using ARIA provides practical guidance for using ARIA in development. If you use ARIA with HTML, this specification is an essential reference point to help you make smart implementation choices.
