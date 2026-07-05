---
title: "Addressing concerns about CSS Speech"
date: 2022-11-26
postTags: ["Screen readers"]
postCategories: ["Code things"]
postSummary: "The case for CSS Speech isn't just about screen readers, but concerns about websites taking over your screen reader and making content less accessible are worth examining carefully."
---

The [case for CSS Speech](/why-we-need-css-speech/) is not just about screen readers, but they do of course matter. Whenever the topic is mentioned, someone will contact me to say they worry about websites taking over their screen reader and making content less accessible instead of more enjoyable.

The concern is that if a website makes your screen reader talk faster or louder, or in a different voice, or if it forces your screen reader to speak content in a particular way, it could make the content difficult or impossible to understand. These concerns are not unfounded, but neither are they as unique, serious, or unsolvable as they might seem and arguably they do not outweigh the benefits CSS Speech could bring.

It's worth noting that the use case for CSS Speech is not just about screen readers. It also encompasses reader/read aloud capability (available in Firefox, Edge, and Safari, plus Chrome with an extension). So concerns about speaking rate and volume apply to anyone who listens to content for whatever reason.

Let's take a look at the protections and safe-guards that already exist, that could be improved upon, and that will be needed if CSS Speech is to be supported in browsers and adopted across the web. 

## User control

As a rule, screen reader users are accustomed to listening to [synthetic speech](/notes-on-synthetic-speech/) and we often do so at higher speeds than most other people find comfortable. This probably puts us at something of an advantage over people using browser readers, but the likelihood is that the speech rate will be designed to suit the majority and if anything, screen reader users will probably find the chosen speech rate too slow rather than too fast.

If the CSS sets a rate that is too fast or too slow, screen readers have shortcuts that let you change the rate of speech on the fly. It's not uncommon for screen reader users to do this anyway - you might slow down your screen reader when reading a document that needs your close attention, with the speaking rate reverting to normal when you switch to another application or use the shortcut again.

The ability to change the speaking rate is also available in browser readers, so in short, if the speaking rate set in the CSS is too fast or slow for your preference, you can change it yourself using the browser reader or your screen reader.

## Built-in safeguards

The [CSS Speech module](https://www.w3.org/TR/css-speech-1/) has some safeguards built into it. For example, the `voice-volume` property can currently be set to "silent", "x-soft", "soft", "medium", "loud", or "x-loud". These are all relative to the volume you're listening at, so "loud" would make the voice a bit louder than usual, and "x-loud" a bit louder than that. Here's what the CSS Speech module currently says about this:

>This sequence of keywords corresponds to monotonically non-decreasing volume levels, mapped to implementation-dependent values that meet the listener's
requirements with regards to perceived loudness. These audio levels are typically provided via a preference mechanism that allow users to calibrate sound
options according to their auditory environment. The keyword ‘x-soft’ maps to the user's minimum audible volume level, ‘x-loud’ maps to the user's maximum
tolerable volume level, ‘medium’ maps to the user's preferred volume level, ‘soft’ and ‘loud’ map to intermediary values.

Which is a complicated way of saying that the increments are not meant to be dramatic or uncomfortable, just changes that are relative to your current volume level.

However, according to the CSS Speech module, the `voice-volume` property can also be set using a Decibel offset from the chosen keyword. The idea is that more subtle incremental changes could be made to the volume, but it also opens up the possibility of more extreme changes too. This could be addressed in the specification , either by limiting the range of Decibels that are supported, or by removing the Decibel offset option entirely.

## Browser settings

The ultimate safeguard is for browsers to offer a way to ignore CSS Speech. There is precedent in the existing ability to ignore all CSS, but that is too much of a blunt instrument in this context. [Not all screen reader users are blind or have low vision](https://webaim.org/projects/screenreadersurvey9/#disabilitytypes), so the visual design of content is still relevant to some. Even screen reader users who cannot see are affected by certain CSS properties like `display` that have an impact on the way content is presented to sighted and non-sighted people alike. In other words, there needs to be the option to ignore CSS Speech that is independent of the option to ignore CSS generally.

## Benefits

With these protections and safeguards in place, CSS Speech would let us elevate the experience of listening to content from a monotone into something altogether more interesting.

There are some truly [extraordinary Text To Speech (TTS) engins](https://play.ht/) out there, but they're not the ones used by browsers or screen readers as a rule. For the most part this means that content spoken by web readers or screen readers is delivered in a flat, disinterested way that never changes - whether reading about a climate catastrophe or describing unfeasibly cute and fluffy things.

Imagine this news item:

```html
<h2>News headline: Nothing happened!</h2>
<p>Reported on 1 April</p>
<p>Nothing happened today. Everybody went and had a nice cup of tea instead.</p>>
```

<details>
<summary aria-label="Show media player for news item without CSS Speech">Show media player</summary>
<audio controls src="../media/2022/screen-reader-demo-without-css-speech.mp3"></audio>

## Transcript

MALE VOICE (FLAT VOLUME, RATE, PITCH): "News headline: Nothing happened! Reported on April the 1st. Nothing happened today. Everybody went and had a nice cup of tea instead."
</details>

With CSS Speech it would be possible to subtley alter the way parts of the news item are spoken - giving them a little bit of texture and interest:

```html
.headline {
speak: auto;
voice-volume: x-loud;
voice-rate: fast;
voice-pitch: high;
}

.date {
speak: auto;
voice-volume: soft;
voice-rate: x-fast;
voice-pitch: low;
}

<h2 class="headline">News headline: Nothing happened!</h2>
<p class="date">Reported on 1 April</p>
<p>Nothing happened today. Everybody went and had a nice cup of tea instead.</p>>
```

<details>
<summary aria-label="Show media player for news item with CSS Speech">Show media player</summary>
<audio controls src="../media/2022/screen-reader-demo-with-css-speech.mp3"></audio>

## Transcript

MALE VOICE (LOUD, FAST, HIGH PITCH): "News headline: Nothing happened today."
MALE VOICE (SOFT, EXTRA FAST, LOW PITCHED): "Reported on April the 1st."
MALE VOICE (NORMAL VOLUME, RATE, PITCH): "Nothing happened today. Everybody went and had a nice cup of tea instead."
</details>

This is the real case for CSS Speech - the ability to make aural design as much a part of thoughtful user experience as visual design.
