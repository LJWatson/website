---
title: "Why we need CSS Speech"
date: 2022-10-18
postTags: ["Screen readers"]
postCategories: ["Code things"]
postSummary: "Whilst almost every device can talk to you now, there's currently no way for web authors to design the aural presentation of content the way they can the visual — but CSS Speech could change that."
---

In these times when almost every device and platform is capable of talking to you, you may be surprised to learn that there is no way for authors to design the aural presentation of web content, in the way they can design the visual presentation.

Once this was largely an accessibility issue. Listening to a screen reader is incredibly tedious. Everything sounds exactly the same, regardless of what
it is. Imagine if every website looked like it did back in the 90s (all grey backgrounds with blue/maroon links) and you start to get the idea! 

Now it's something much broader than that. Edge, Firefox, and Safari, all make it possible for someone to listen to content, and there are extensions that
bring the same capability to Chrome. Users have limited choices (to change the voice, increase/decrease the speaking rate), but authors have no ability
to design the voice experience itself. 

In these days of voice interaction on every platform, there is a growing expectation that it should be possible to design that experience just like we can the visual experience. In the same way an organisation chooses a logo and colour palette for its website, it stands to reason that they may also choose a particular voice that represents their brand. 

SSML is intended for this purpose, and indeed it's how voice design for the Echo and devices with Google Assistant is handled, but it is not supported in any browser that I know of. Even if it were, it arguably returns us to the days of HTML before
we had CSS to let us control the design from a central source (think font and centre elements for example). 

## CSS Speech

Enter [CSS Speech](https://www.w3.org/TR/css-speech-1/). It began life back in the early 00s as [Aural Style Sheets](https://www.w3.org/TR/CSS2/aural.html). Although a version of it was implemented in EMACSPEAK, it never achieved the implementation experience to become a W3C Recommendation. 

## What is CSS Speech

In summary, CSS Speech is a set of CSS properties intended to let authors design the aural presentation of content - whether by a platform Text To Speech (TTS)
through the browser's read aloud capability or someone using a screen reader. In 2015, I used the [Web Speech API to simulate CSS Speech support](/using-the-web-speech-api-to-simulate-css-speech-support/) with a very basic [proof of concept](https://playground.tink.uk/cssspeech/index.html).

It begins with the `speak:;` property. Like `display:;` determines if an element is visible or not, the `speak:;` property determines if the content contained within the element should be spoken or not. In fact, when set to `auto` the intent is that `speak:;` and `display:;` will be symbiotic - if `display: none;`, then speak is automatically
assumed to be `speak: none;`. 

There are then numerous other properties for setting the `voice-family`, `voice-pitch`, `voice-rate`, and `voice-volume` of the speech output. Again, you'll notice the similarities with existing CSS properties - `voice-family` is the equivalent of `font-family` for example. 

## Arguments against CSS Speech

One of the arguments against implementing CSS Speech is that it could disrupt or even prevent someone from using the website. This is both true, not true, and relatively easily solved in any case. 

It is possible for CSS to make a website thoroughly unusable already. It happens all the time. This is why browsers have the ability for users to turn-off
style sheets already. With CSS Speech support it would be necessary to have an additional on/off toggle just for Speech style sheets, but the basic capability has precedence. 

Conversely, several properties have recently been added to CSS that either enhance the usability of web content, or that enable users to indicate their
personal preferences. Think `prefers-reduced-motion` for example. It may also be possible to add a `prefers-no-speec`h property to the CSS Speech spec perhaps.

## Getting CSS Speech

I've spent the past few years talking a lot about this at conferences, along with ways to design the voice experience on other platforms like Google Home or the Echo. Without fail, people are astonished that no such capability is available on the web, and so I think the time has come to revisit it. 

As it is, the CSS Speech spec is too big, too wordy, and has too many features. It's essentially unchanged in the 20 years it's been around, and certain
features like the "aural box model " are definitely "of their time"! 

A while ago the CSS Working Group accepted my offer to edit the CSS Speech module. It didn't come to anything at the time, but with sufficient interest, I'd like to strip the spec down to the bare minimum (the speech media type and a handful of basic properties like `speak`, `voice-family`, `voice-rate`, `voice-pitch`, and `voice-volume` for example), then with some implementations (behind the flag possibly) get some evidence to validate the anecdotal evidence.

What do you think?
