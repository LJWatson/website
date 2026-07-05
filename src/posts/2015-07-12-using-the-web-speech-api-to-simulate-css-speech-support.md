---
title: "Using the Web Speech API to simulate CSS Speech support"
date: 2015-07-12
postTags: ["CSS", "JavaScript", "Web Speech API", "Screen readers"]
postCategories: ["Code things"]
postSummary: "The CSS Speech module is largely unsupported in browsers, but I've created a demo using the Web Speech API to show how CSS Speech properties might give content aural style, similar to how other CSS properties provide visual style."
---

Updated on 4th February 2018.

The CSS Speech properties are intended to give content aural style, in the same way other CSS properties give content visual style. The [CSS Speech module](https://www.w3.org/TR/css3-speech/) is largely unsupported in browsers, but the [Web Speech API](https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html#dfn-ttsgetvoices) can be used to demonstrate something of the way CSS Speech might work in practice.

The CSS Speech module and Web Speech API both use [Text To Speech (TTS)](https://en.wikipedia.org/wiki/Speech_synthesis). The CSS Speech module describes how a service that uses TTS (like a screen reader or voice assistant) speaks web content, and the Web Speech API produces synthetic speech using a TTS engine.

## Text to speech

There are TTS engines bundled with most platforms. Voice assistants like Siri, Cortana or Google Talk tend to use platform TTS engines. Screen readers may also use the platform TTS, but often come bundled with alternative TTS engines that offer a wider choice of voices or language support.

TTS voices are reasonably good at mimicking basic human speech patterns. Most respond to punctuation as though a person was reading the content aloud – they pause at commas, pause a little longer at full stops, or increase in pitch at the end of a sentence that asks a question. Some also simulate breathing patterns – decreasing in pitch when speaking long sentences without punctuation (as though running out of breath), or simulating the sound of breathing itself.

The trouble with TTS voices is that they’re completely flat. There is little variation in cadence or tone, and no emotional inflection at all. When you use a screen reader or listen to a voice assistant, everything is spoken in the same unchanging voice.

If CSS Speech was supported by browsers, it would be possible for a screen reader or voice assistant to determine the aural style of content and speak it accordingly. Content might be spoken more slowly, more loudly, or in a different voice for example.

In the absence of consistent browser support for CSS Speech, it isn’t possible to determine the [computed aural style](https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle) of content. Even if it were, there is no way to relay that information to a screen reader and force it to respond accordingly. There are no APIs for interacting directly with screen readers.

It is possible to use the Web Speech API to simulate the way a screen reader might respond to CSS Speech though. A [basic demo](https://playground.tink.uk/cssspeech/index.html) is available (with the warning that it’s held together with chicken wire and sticky tape). Thanks to Aurelio De Rosa, from whom I borrowed the workaround for the [getVoices() bug in Chrome](https://code.google.com/p/chromium/issues/detail?id=340160).

## CSS Speech properties

The CSS Speech properties let you define aural styles for content in the same way you define visual style. There is even an [aural box model](https://www.w3.org/TR/css3-speech/#aural-model) for arranging the spacial and temporal aspects of the aural presentation.

At present only [WebKit/Safari](https://webkit.org/blog/8084/release-notes-for-safari-technology-preview-48/) has support for CSS Speech, and then only for the `speak` and `speak-as` properties.

As the [`display`](https://www.w3.org/TR/CSS21/visuren.html#display-prop) property determines whether content is rendered visually, the [`speak`](https://www.w3.org/TR/css3-speech/#speak) property determines whether it is rendered aurally. The `speak` property can be set to `auto`, `none` or `normal`, with `auto` being the default.

When the `speak` property is set to `auto`, it defers to the state of the `display` property. `display: none;` is set the computed value of the `speak` property is also `none`, otherwise it is `normal`.

There are CSS properties for manipulating other basic speech characteristics:

The [`voice-volume`](https://www.w3.org/TR/css3-speech/#voice-volume) property determines the relative loudness of the TTS output. It can be set by keyword (`silent`, `x-soft`, `soft`, `medium`, `loud`, `x-loud`), or by decibel (`15DB`). By default it’s set to `medium`.

**When voice-volume: silent; is set, the content is rendered aurally but spoken at zero volume. In this respect it is similar to visibility: hidden;, which causes content to be rendered in the DOM but hidden from view.**

The [`voice-rate`](https://www.w3.org/TR/css3-speech/#voice-rate) property determines the speed at which content is spoken. It can be set using a keyword (`normal`, `x-slow`, `slow`, `medium`, `fast`, `x-fast`), or a percentage. It defaults to `normal`.

The [`voice-pitch`](https://www.w3.org/TR/css3-speech/#voice-pitch) property determines the frequency at which the content is spoken. It can be set using a keyword (`x-low`, `low`, `medium`, `high`, `x-high`), or by percentage. It is set to `medium` by default.

### CSS Speech example

```html
p {
  speak: normal;
  voice-volume: loud;
  voice-rate: medium;
  voice-pitch: low;
}
```

## Web Speech API

The Web Speech API consists of two interfaces: The [SpeechRecognition interface](https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html#speechreco-section) and the [SpeechSynthesis interface](https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html#tts-section). The SpeechRecognition interface handles speech input, and can be used to enable voice commands within a web application. The SpeechSynthesis interface handles synthetic speech output via a TTS engine.

According to [Can I Use](https://caniuse.com/#feat=speech-synthesis), the Speech Synthesis Interface is supported in all major browsers.

The SpeechSynthesis interface is available on the window object. Its methods are [`speak()`](https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html#dfn-ttsspeak), [`pause()`](https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html#dfn-ttspause), [`cancel()`](https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html#dfn-ttscancel), [`resume()`](https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html#dfn-ttsresume), and [`getVoices()`](https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html#dfn-ttsgetvoices).

The [`speechSynthesisUtterance()`](https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html#speechreco-section) constructor is used to create a speech object. The text to be spoken is then attributed to the speech object using the [`text()`](https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html#dfn-utterancetext) method. Other attribute methods include [`volume()`](https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html#dfn-utterancevolume), [`rate()`](https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html#dfn-utterancerate) and [`pitch()`](https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html#dfn-utterancepitch).

Passing the speech object to the SpeechSynthesis interface using speak(), causes the default TTS voice to speak the text content.

### SpeechSynthesis interface example

```javascript
var utterance = new SpeechSynthesisUtterance();
utterance.text = "Tequila";
window.speechSynthesis.speak(utterance);
```

The `getVoices()` method can be used on the SpeechSynthesis interface to return a list of available TTS voices. A TTS voice can then be assigned to the speech object using the [`voiceURI()`](https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html#dfn-utterancevoiceuri) method.

**Chrome and Safari use `voice()` instead of `voiceURI()`, so the examples and demos use `voice()`.**

## Further thoughts

The demos are poor imitations of screen reader interaction. Only the tab key is supported as a means of navigating through content, and to make even this work it was necessary to make non-interactive content focusable (something that should never be done in production code). Hopefully the demos do illustrate how content could be made more interesting to listen to with CSS Speech though.

If/when browser support for CSS Speech becomes more prevalent, it would be important for them to provide a mechanism for ignoring aural styles. Not everyone will want to listen to content spoken in different ways, and it should be possible for them to turn off this feature.

All the demos mentioned in this post, plus some earlier examples of the SpeechSynthesis interface are available on [Github](https://ljwatson.github.io/playground/).
