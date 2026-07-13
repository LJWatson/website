---
title: "Thoughts on screen reader detection"
date: 2014-02-27
postTags: ["Screen readers", "Philosophy"]
postCategories: ["Web life"]
postSummary: "Screen reader detection has been under discussion lately, and I'm not comfortable with it. I'd like to share the reasons why—it's really about disability detection, and that's a very different thing altogether."
---

The subject of [screen reader detection](https://dvcs.w3.org/hg/IndieUI/raw-file/default/src/indie-ui-context.html#userScreenReaderSettings) has been under discussion lately. It isn’t something I’m comfortable with, so I’d like to share the reasons why.

## I don’t want to share personal information with websites I visit

My disability is personal to me, and I share that information at my discretion. Proponents of screen reader detection say it would be discretionary, but that’s like choosing between plague and pestilence. Choosing between privacy and accessibility is no choice at all.

## I don’t want to be relegated to a ghetto

We’ve spent years encouraging people to move away from [text-only websites](https://www.nomensa.com/blog/2004/text-only-sites/), and with good reason. If there is one thing that history should have taught us by now, it’s that social segregation is a bad idea.

## I don’t want design decisions to be based on the wrong thing

The best screen reader detection can hope for, is to tell whether a screen reader is present or not. People use screen readers for different reasons – because they’re blind, partially sighted, Dyslexic or on the Autistic spectrum for example. Even this may be overly optimistic. Unless screen reader vendors agree to share some kind of UA string, the detection mechanism is likely to be access to the browser’s accessibility layer. In that case it may only be possible to detect an assistive technology in the most general sense, whether it be a screen reader, screen magnifier, speech recognition tool or something else entirely.

## I don’t want old mistakes to be repeated

We’ve spent time turning to web standards and feature detection, instead of [browser sniffing](https://css-tricks.com/browser-detection-is-bad/) and excluding the ones we didn’t care to support (guilty as charged). Screen reader detection leaves us vulnerable to the same exclusion allover again, only this time feature detection won’t come to the rescue. The relationship between screen readers and browsers is symbiotic, and in terms of traditionally detectable features, screen readers derive most of their capability from the browser.

## I don’t want things to be hard work

Most things that make a website usable with a screen reader are achieved by conforming to web standards, and the rest require relatively little modification. In these days of responsive design, including a media feature for screen readers would automatically double the work involved. You’d need to serve up a screen reader alternative for every break point version of your website.

## I do want much more conversation about screen reader detection

Hence this blog post. But as the conversation continues, please bear in mind that this isn’t really about screen reader detection, or even assistive technology detection, at all. What is really being discussed is disability detection, and that is a very different thing altogether.
