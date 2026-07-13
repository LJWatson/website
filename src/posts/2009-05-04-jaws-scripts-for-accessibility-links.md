---
title: "Jaws scripts for accessibility links"
date: 2009-05-04
postTags: ["HTML", "Screen readers"]
postCategories: ["Code things"]
postSummary: "Bruce Lawson proposed adding `rel=accessibility` to HTML5 to help assistive technologies discover accessibility information, and I thought screen readers could easily support the idea with a simple script."
---

Bruce Lawson recently asked whether [adding `rel=accessibility` to the HTMl 5 specification](https://www.brucelawson.co.uk/2009/rel-accessibility/) was a good idea. Among the initial comments, Jared Smith noted that getting assistive technologies to support the idea might be a problem. For the major screen readers at least, I thought it could be easily solved though.

Bruce's idea went a little something like this:

> So I want to float the idea of `rel=accessibility` that would allow assistive technologies to discover and offer shortcuts to accessibility information, such as a WCAG 2 conformance claim, or a form to request content in alternate formats (for example).

The Immediate reaction to the idea was extremely positive, with only one or two people voicing a concern. From a screen reader user's perspective, the idea certainly has merit.

There are of course many different techniques available to a screen reader user looking for a particular link on a page. It's possible to tab through the links or open a dialogue box listing all the links on a page. It's possible to search the page for a certain key word or phrase. Both approaches will work well, but neither would be as reliable or consistent as the ability to move directly to a link relating to accessibility.

## Move to next/prior accessibility link

The script enables the user to move backwards and forwards between links with the `rel="accessibility"` attribute value. Where no such links are present, Jaws reports using the standard short or long message formats, depending on the user's verbosity settings.

Available keyboard commands are notoriously difficult to find in Jaws, particularly where quick navigation keys are concerned. In this case, 8/Shift 8 works well enough for the purpose. The keyboard command can be edited by the user through the quick navigation keys manager, if the chosen one proves unsuitable for any reason.

Appending the script to a quick navigation key made sense for two reasons. Firstly, because it's consistent with similar behaviour for moving through a web page using the virtual cursor. Secondly, because using the virtual.jss file means that the script is only effective when the virtual cursor is in use.

At present, the script has been tested with Jaws 10 on Internet Explorer 8 and Firefox 3.x. When I can find time, I'll run some tests on older versions of Jaws, with older browsers. None of the functions used require Jaws 10 specifically, so the script should be reasonably backwards compatible. Some slight changes may be needed to deal with different browser versions though.

Looking briefly to other popular screen readers, it should be straight forward to script Window Eyes to do something similar. It may also be possible with Hal, but my knowledge of that screen reader isn't up to scratch I'm afraid. SA To Go isn't scriptable, so we would need to wait for the developers to adopt it as a new feature. NDVA could be customised under the terms of the GNU General Public License of course.

## Download Jaws scripts

Warning:Scripts no longer available.
