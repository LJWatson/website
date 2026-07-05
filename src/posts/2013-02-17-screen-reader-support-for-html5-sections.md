---
title: "Screen reader support for HTML5 sections"
date: 2013-02-17
postTags: ["Screen readers", "HTML"]
postCategories: ["Code things"]
postSummary: "I tested how well screen readers support HTML5's sectioning elements like `header`, `footer`, `nav`, `article`, `section` and `aside`, and the results show support is patchy and inconsistent across different screen readers and browsers."
---

HTML5 includes a handful of [sectioning elements](https://www.w3.org/TR/2011/WD-html5-20110525/sections.html) that give documents a robust semantic structure. The `header`, `footer`, `nav`, `article`, `section` and `aside` elements give different regions of a document meaning. Amongst other things, that meaning can be understood by screen readers, and the information used to help blind and partially sighted people orient themselves and navigate around the page.

Now that HTML5 is being used on mainstream websites (such as that of the [UK Government](https://www.gov.uk)), it’s interesting to see how well screen readers support this handful of elements. Testing included [Jaws 14](https://www.freedomscientific.com), [NVDA 2012.3](https://www.nvda-project.org/) and [Window Eyes 8](https://www.gwmicro.com), with Firefox 18 and Internet Explorer 9, and [VoiceOver (Mac OSX 10.8.2)](https://www.apple.com/accessibility/voiceover/) with Safari 6.

Thanks to [Alastair Campbell](https://www.twitter.com/alastc) and [Kiran Kaja](https://www.twitter.com/kirankaja12) for VoiceOver testing, and [Steve Faulkner](https://www.twitter.com/stevefaulkner) for the mighty useful [HTML5 Accessibility test page](https://www.html5accessibility.com/html5elements/).

## Test results

Screen reader support for HTML5 sections

| Element | Jaws 14/FF 18 | Jaws 14/IE 9 | NVDA 2012.3/FF 18 | NVDA 2012.3/IE 9 | VoiceOver/Safari 6 | Window Eyes 8/FF 18 | Window Eyes 8/IE 9 |
| --- | -- | -- | -- | -- | -- | -- | --- |
| [article](https://www.w3.org/html/wg/drafts/html/master/sections.html#the-article-element) | Yes | Yes | No | No | No | No | No |
| [aside](https://www.w3.org/html/wg/drafts/html/master/sections.html#the-aside-element) | Yes | Yes | Yes | No | Yes | No | No |
| [footer](https://www.w3.org/html/wg/drafts/html/master/sections.html#the-footer-element) | Yes | No | Yes | No | Yes | No | No |
| [header](https://www.w3.org/html/wg/drafts/html/master/sections.html#the-header-element) | No | No | No | No | Yes | No | No |
| [nav](https://www.w3.org/html/wg/drafts/html/master/sections.html#the-nav-element) | Yes | Yes | No | No | Yes | No | No |
| [section](https://www.w3.org/html/wg/drafts/html/master/sections.html#the-section-element) | Yes | Yes | No | No | No | No | No |

## Test notes

Of the six HTML5 elements tested, `header` is the least well supported.

Only Window Eyes does not support any of the HTML5 elements (in any browser). VoiceOver, Jaws and NVDA all support some elements, but not always consistently across browsers.

NVDA reports the start of supported elements. For example the `aside` element is announced as “Complimentary information landmark”. Jaws and VoiceOver report both the start and end of supported elements. For example Jaws announces “Article” and “Article end” for the article element, and VoiceOver uses the format "Entering article landmark" and "Leaving article landmark".

One difference between the screen readers that support the footer element is that VoiceOver reports it as "footer", whilst NVDA and Jaws use "Content information" and "Content info" respectively.

Jaws, VoiceOver and NVDA include supported elements when navigating by landmark. This makes sense because the `header`, `footer`, `nav`, `article`, `section` and `aside` elements all [Map to ARIA landmarks](https://www.flickr.com/photos/odmag/8467120722/). Worth noting that all screen readers tested have good support for [ARIA landmarks](https://www.paciellogroup.com/blog/2013/02/using-wai-aria-landmarks-2013/).

Those elements that are not supported in a particular screen reader/browser combination are handled in the same way as a `div` or other element without semantic meaning would be. Which is to say that the content is accessible, but the element itself is not acknowledged in any way.
