---
title: "Using Narrator dev mode"
date: 2016-07-24
postTags: ["Screen readers", "Windows"]
postCategories: ["Desktop things"]
postSummary: "The August 2nd Windows 10 Anniversary update introduces Narrator dev mode, a new feature designed to help developers understand how screen readers consume content and identify which on-screen objects are accessible."
---

Narrator is the integrated screen reader for Windows 10. The August 2nd [Windows 10 Anniversary update](https://blogs.msdn.microsoft.com/accessibility/2016/07/01/making-progress-on-accessibility-with-the-windows-10-anniversary-update/) introduces several new Narrator features, including a Narrator mode designed specifically for developers.

When you develop accessible apps, webapps or websites, one of the challenges is understanding how screen readers consume content. Making sense of speech output and relating it to the different objects on-screen is an acquired skill.

## What is Narrator dev mode?

Narrator dev mode helps developers identify which on-screen objects are accessible to Narrator, which object Narrator is currently focused on, and what information is available to Narrator about that object.

When Narrator dev mode is enabled, the screen is masked except for the object Narrator is focused on. Only accessible objects and the text that is associated with them is visible. In other words, Narrator dev mode presents the visual equivalent of using Narrator in addition to Narrator's default speech output.

## How is Narrator dev mode enabled?

Narrator must be turned on before Narrator dev mode is enabled. It's a good idea to get a basic understanding of [Narrator commands](https://www.paciellogroup.com/blog/2015/01/basic-screen-reader-commands-for-accessibility-testing/) before experimenting with Narrator dev mode, but if you want to jump right in, the following table has the commands you'll need.

Useful Narrator commands

Action

Command

Turn Narrator on/off

Control + Windows key + Enter

Discover Narrator commands

Capslock f1

Discover Narrator context sensitive commands

Capslock f2

Turn Narrator dev mode on/off

Capslock Shift f12

Getting into the habit of testing your app, webapp or website with Narrator and Narrator dev mode won't give you a comprehensive knowledge of how the entire screen reader ecosystem consumes content. But it will help you understand the linear nature of screen reader interaction, and whether your product exposes information that is useful to screen readers * and that is knowledge that can be transferred to testing with other screen readers and/or platforms.
