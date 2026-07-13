---
title: "Fixing the Jaws cursor in Firefox"
date: 2015-09-19
postTags: ["Screen readers"]
postCategories: ["Desktop things"]
postSummary: "When keyboard access doesn't work, Jaws screen reader can use simulated mouse movements instead, but this function is broken in Firefox due to graphics rendering changes. Here's a workaround involving three configuration tweaks."
---

When keyboard access doesn't work, the Jaws screen reader makes it possible to explore content using simulated mouse movements instead. This function is broken in Firefox, due to changes made (some time ago) in its graphics rendering engine. This post describes a workaround that has proved successful for some.

There are three configuration changes you can make to firefox. I'm obliged at this point to say that unless you're confident about changing such things, you probably shouldn't try this. That said, you're smart people and besides, it's your browser...

1. Open Firefox and type about:config into the navigation bar.
2. If you get the "Here be dragons" warning, use the "I'll be careful I promise" button to continue.
3. In the edit field type gfx.direct2d.disabled, then tab to the result which should say gfx.direct2d.disabled = false.
4. Use the enter key to toggle this setting to true.
5. Return to the edit field and type layers.acceleration.disabled, then tab to the result which should say layers.acceleration.disabled = false.
6. Use the enter key to toggle this setting to true.
7. Return to the edit field and type layers.offmainthreadcomposition.enabled, then tab to the result which should say layers.offmainthreadcomposition.enabled = true.
8. Use the enter key to toggle this setting to false.
9. Restart firefox.

Note: This workaround does not seem to work with Firefox 40 on Windows 10 with the [Jaws 17 public beta](https://www.freedomscientific.com/downloads/jaws/jawspublicbeta). Please use the comments to add further information about this workaround * but no technical support requests please.
