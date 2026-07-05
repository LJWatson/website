---
title: "Understanding screen reader interaction modes"
date: 2014-09-21
postTags: ["Screen readers", "ARIA"]
postCategories: ["Code things"]
postSummary: "Windows screen readers like JAWS and NVDA have multiple interaction modes that automatically switch depending on the task, and your code can influence that behaviour."
---

[Traduction française](https://access42.net/Comprendre-les-modes-d-interaction.html?lang=fr)

Windows screen readers have multiple modes of interaction, and depending on the task being carried out they’ll automatically switch to the most appropriate mode. This post explains why Windows screen readers behave the way they do, and how your code can influence that behaviour.

## Virtual/browse mode

When a document is rendered in the browser, Windows screen readers like JAWS and NVDA access the [Document Object Model (DOM)](https://en.wikipedia.org/wiki/Document_Object_Model) either directly or through the available accessibility APIs. The DOM is a hierarchical representation of the objects in the web-document, and the information that’s retrieved from it is augmented by the screen reader and displayed to the user as a virtual copy of the original.

By creating a virtual copy of the document, screen readers make it possible for blind people to interact with content in ways that would otherwise be impossible on the Windows platform. This happens because the screen reader intercepts most keypresses before they reach the browser, triggering an interaction with the virtual document instead.

For example the left/right cursor keys are intercepted and used to move focus to the previous/next character in the content, and the up/down keys move focus to the previous/next line instead of scrolling the page.

This behaviour also makes it possible to navigate through content using shortcut keys that are native to the screen reader. Most Windows screen readers follow a broadly similar shortcut convention: For example t moves focus to the next table, h to the next heading, l to the next list, g to the next graphic and so forth. It is also possible to open dialogues that list all the elements of a particular type – for example form controls or links.

In JAWS this mode of interaction is known as virtual mode, and in NVDA and Window-Eyes as browse mode. The copy of the original document is generally referred to as the virtual buffer.

## Forms/focus mode

Not all keypresses are captured by the screen reader however. When the tab key is pressed it is automatically passed through to the browser where it causes keyboard focus to move to the next piece of interactive content, exactly as though the screen reader weren’t running. The same thing happens in other circumstances too, when the enter key is used to activate a link or the space key to select a checkbox for example.

This intelligent processing happens automatically and without the user being aware of it, but there are circumstances in which the user needs to know about a change of interaction style. When interacting with a text field or combobox the user needs to know that the keys they press will do something other than perform a screen reader navigation command – for example that h will type a character instead of move focus to the next heading, or that the down cursor key will select an option in a combobox instead of move to the next line of content.

In NVDA this mode of interaction is known as focus mode, and in JAWS it’s forms mode. Window-Eyes doesn’t give it a name, but simply refers to browse mode being off. There are subtleties to this mode of interaction though. For example, NVDA will automatically enter/exit focus mode when the tab key is used to move focus on/off the form field, but not if the cursor keys are used. JAWS will automatically enter/exit forms mode whichever method is used to move focus to the field, although as of JAWS16 it’s possible to configure JAWS to ignore forms mode when navigating through content using the cursor keys. Both screen readers can also be forced to switch modes manually, and both indicate the switch in mode with an audible “click”.

There is one anomaly amongst form fields when it comes to forms/focus mode. Although it’s possible to select a radio button without switching modes, it is necessary to be in forms/focus mode in order to use the cursor keys to cycle through the radio buttons in a group. Being unaware of this can sometimes lead to the mistaken belief that a radio group is somehow flawed.

## Applications mode

Although this mode switching may seem unintuitive to someone unused to Windows screen readers, it works well in practice and most screen reader users are unaware of what’s happening “under the hood”. From a development point of view it’s far more important to understand something of screen reader mechanics though.

For the most part a screen reader will handle the different interaction modes automatically, providing the underlying code of the original document is robust semantic markup. All bets are off when it comes to custom/rich internet widgets though. A custom widget (like a menubar or tab set) is a web-based component that’s designed to behave like its counterpart in a software application. As a rule Windows screen readers don’t use a virtual buffer with software applications, so putting a custom widget in a web-document suddenly forces two screen reader paradigms into the same space.

A set of tabs is a good example: When interacting with a set of tabs in a software application, the left/right cursor keys cycle between each of the tabs in the set. When a set of tabs is transposed into a web-document the same interaction design pattern is supported by the script that provides the widget’s functionality. Herein lies the challenge though: A Windows screen reader will intercept the left/right keystrokes and use them to move focus within the virtual buffer, instead of passing them through to the browser to interact with the set of tabs.

[ARIA](https://www.w3.org/TR/wai-aria/) (known as WAI-ARIA on formal occasions) is the solution. When certain [ARIA roles](https://www.w3.org/TR/wai-aria/roles) are applied to custom widgets, they inform the screen reader that the element (or group of elements) has a specific purpose, and also that virtual/browse mode is not appropriate. The result is that the screen reader switches into applications mode and treats the widget as though it were a component of a software application.

To all intents and purposes, applications mode is the same as forms/focus mode – it causes the screen reader to pass keystrokes back through to the browser so they can fulfil their original purpose. For example, when the [tablist](https://www.w3.org/TR/wai-aria/roles#tablist) and [tab](https://www.w3.org/TR/wai-aria/roles#tab) roles are used as part of the [tab widget design pattern](https://www.w3.org/TR/wai-aria-practices/#tabpanel), using the tab key to move focus onto the first tab in the set causes a Windows screen reader to automatically switch into applications mode. From that point all the keyboard interaction is handled by the script. This does mean of course that the script driving the functionality of the widget has to be setup to handle keyboard interaction!

With thanks to [Hans Hillen](https://www.twitter.com/hanshillen).
