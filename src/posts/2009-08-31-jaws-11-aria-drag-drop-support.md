---
title: "Jaws 11 ARIA drag & drop support"
date: 2009-08-31
postTags: ["ARIA", "Screen readers"]
postCategories: ["Code things"]
postSummary: "Jaws 11 public beta now supports drag and drop with WAI ARIA, making it possible for screen reader users to drag and drop elements on web pages using the aria-grabbed and aria-dropeffect properties."
---

[Jaws 11 public beta](https://www.freedomscientific.com/downloads/jaws/JAWS-public-beta.asp) introduces support for drag and drop with [WAI ARIA](https://www.w3.org/WAI/intro/aria.php). Although Jaws has included desktop drag and drop capability for some while, the same functionality on a web page has always been more difficult. Jaws 11 now indicates which elements on the page can be dragged, and where they can be dropped.

## ARIA properties

Jaws 11 makes use of two ARIA properties intended to facilitate accessible drag and drop:

* [aria-grabbed](https://www.w3.org/WAI/PF/aria/#aria-grabbed)
* [aria-dropeffect](https://www.w3.org/WAI/PF/aria/#aria-dropeffect)

### Aria-grabbed Property

The `aria-grabbed` property indicates whether an element has been selected or not. If an element has been grabbed, it can be dragged and dropped elsewhere on the page. If an element does not have the `aria-grabbed` attribute, it cannot be selected at all.

### Aria-dropeffect Property

The `aria-dropeffect` property describes what happens when the grabbed element is dropped onto a target. Amongst other things, an element can be copied or moved onto a target. More than one drop effect can be defined for a given element.

## Jaws technique

Freedom Scientific include the following information in the Jaws 11 public beta announcement:

> "The CTRL+EQUAL SIGN keystroke opens the ARIA Drag and Drop dialog box. It shows a list of droppable objects, as tagged by the author, on the current Web page. When you select one of these objects, JAWS will move focus to that object. If no droppable objects are available, JAWS will announce the message, “No droppable elements were found on the page” instead of opening the dialog box."

## Test cases

Jaws 11 public beta ARIA drag and drop support can be tested in either Internet Explorer 8 or Firefox 3.x.

* [Gez Lemon's Drag & Drop Example](https://devfiles.myopera.com/articles/735/example.html)

With thanks to Gez Lemon.
