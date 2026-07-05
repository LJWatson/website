---
title: "Using tabbed interfaces with a screen reader"
date: 2012-05-29
postTags: ["ARIA", "HTML", "Screen readers"]
postCategories: ["Code things"]
postSummary: "Tabbed interfaces are visually intuitive and space-efficient, but screen reader users face two key challenges: visual clues aren't available, and the required interaction isn't obvious."
---

Tabbed interfaces are increasingly common on web pages. They make good use of space, and they can be visually intuitive. Using tabs with a screen reader is a different experience though.

When it comes to tabbed interfaces on web pages, there are two disadvantages for screen reader users. The visual clues that establish the tab metaphor are not available, and the required form of interaction isn’t obvious. This makes understanding and using a tabbed interface with a screen reader an interesting experience!

## Understanding the tabbed interface

The first point is straight forward. The visual design helps a sighted person to understand the concept of layered content. The use of light and shadow gives a sense of depth, and the tabs are often styled to mimic their real life counterparts.

This problem can be solved with [ARIA](https://www.w3.org/TR/wai-aria/). The [tablist](https://www.w3.org/TR/wai-aria/roles#tablist), [tabpanel](https://www.w3.org/TR/wai-aria/roles#tablist) and [tab](https://www.w3.org/TR/wai-aria/roles#tab) roles make additional information available to screen readers like NVDA and Jaws. A `tablist` is a set of tabs, and each `tab` has a corresponding `tabpane`l.

```html
<ul role=”tablist”>  
  <li role=”tab”>Dogs</li>  
  <li role=”tab”>Cats</li>  
  <li role=”tab”>Sheep</li>  
</ul>  

<div role=”tabpanel”>  
  <h2>Dogs</h2>  
  …  
</div>  

<div role=”tabpanel”>  
  <h2>Cats</h2>  
  …  
</div>  

<div role=”tabpanel”>  
  <h2>Sheep</h2>  
  …  
</div>
```

ARIA bridges the visual gap, and helps blind people understand a little more about the widget they’re dealing with. Instead of announcing "Dogs", "Cats" and "Sheep", screen readers like NVDA and Jaws will announce "Dogs tab", "Cats tab" and "Sheep tab".

## Using the tabbed interface

The second point is more complex. To some extent the additional information provided through the ARIA indicates what form of interaction is required.

It’s standard screen reader behaviour to provide auditory clues that let people know what kind of action can be taken. Prefacing link text with the word "Link" sets up the expectation that pressing the Enter key will activate it for example. In this case the word "Tab" sets up the expectation that the set of tabs can be traversed, usually left to right (or vice versa).

The trouble is that it isn’t the action taken once a tab has focus that’s important. It’s the action taken to focus on the tab in the first place that makes all the difference.

For a tabbed interface to work, screen readers like Jaws and NVDA need to switch into [applications mode](/understanding-screen-reader-interaction-modes) In other words they need to start passing the keystrokes through to the browser, instead of intercepting them to perform screen reader specific commands.

Ordinarily a screen reader intercepts the left/right arrow keys and uses them to move focus backwards/forwards one character at a time. To interact successfully with a set of tabs, the left/right arrow keys need to be ignored by the screen reader and used to move focus backwards/forwards through the set of tabs instead.

Triggering applications mode is the key to getting screen readers like NVDA and Jaws to work with tabbed interfaces. Using the tab key to move focus to one of the tabs is the key to triggering applications mode.

## Using tabbed interfaces with a screen reader

The demo here uses Hans Hillen’s [accessible jQuery UI components page](https://access.aol.com/aegis/#goto_tabs). It’s a terrific set of accessible widgets, and the code is available from [Hans’ Github repository](https://www.github.com/hanshillen).

This demo was recorded using [NVDA 2012.2 beta](https://www.nvda-project.org/) and Firefox 12.
