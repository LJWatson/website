---
title: "Perceived affordances and the functionality mismatch"
date: 2022-07-14
postTags: ["Screen readers"]
postCategories: ["Web life"]
postSummary: "Styling one element to look like another creates a mismatch between the actions people expect to take and the ones they actually can, highlighting the essential problem with this common pattern."
---

Using one element or set of elements (usually because of their functionality) and styling them to look like something else is a common pattern. A recent conversation about using radio buttons styled to look like buttons highlighted the essential problem with this approach - it creates a mismatch between the actions people expect they can take and the ones they actually can.

## Affordance

The concept of "affordance" was first described by JJ Gibson in the late 1970s and Don Norman applied it to design in the late 1980s. Norman later used the phrase ["perceived affordance"](https://jnd.org/affordances_and_design/) to clarify the use of affordance in interface design. Perceived affordance, as Norman puts it, is "whether the user perceives that some action is possible (or in the case of perceived non-affordances, not possible)".

For example, a button is intended to be pressed with the expectation that something will happen when it is. When a button is not pressed it stands proud of the surrounding surface, and when it is pressed it's flat. This means you can tell that it's a button and what state it's in by touching it or by looking at it. In other words, a button has both physical and perceived affordances. The knowledge of what to do with it comes from your prior experience of using buttons that conform to the same convention.

The concepts of affordance and convention were so familiar to most people, they were transferred from the physical world to digital. Radio buttons, for example, are so called because of car radios from the days before digital broadcasting.

Finding a radio station used to involve twiddling a knob to slowly move through the different radio bands until you found a station you wanted to listen to. Doing this whilst driving and, presumably, wanting to keep your eyes on the road, was not altogether conducive to an accident free life, so radio buttons were invented.
Car owners could pre-tune their radio to a few favourite stations and assign each station to a button on the front of the radio. Since listening to one station at a time is enough for most people, the radio buttons were designed so that only one could be pressed at a time. 

## Perception

The digital world still hasn't really figured out physical affordance, at least not to the extent it's useful across websites and applications. This means we depend on perceived rather than physical affordance.

Buttons and radio buttons are not the only User Interface (UI) components to make the transition from the physical to digital world (think restaurant menus or the tabs in filing cabinets and telephone organisers), but let's stick with them for now. 

Even though digital radio buttons look nothing like their physical counterparts used to, a common visual convention for digital buttons and radio buttons has emerged over the past three decades or so. If you're sighted and you've used any form of Graphical User Interface (GUI) in that time, you'll probably be able to recognise a button or set of radio buttons by their visual appearance. if you can't see and use a screen reader instead, then you'll recognise them based on their [semantics](/understanding-semantics/) and the way your screen reader announces that information.

## Mismatch

Which brings us to the mismatch problem.

Using a set of radio buttons for a component that lets people select one thing at a time makes sense - it's what they're for after all. It's when the radio buttons don't look like radio buttons that the mismatch happens.

If you're a sighted mouse user, you'll see a set of buttons and your prior experience will tell you that you can point at the one you want and click on it with the expectation that something will happen when you do - and indeed it does.

If you're a sighted keyboard user, you'll also see a set of buttons, and your prior experience will tell you that you can repeatedly use the <kbd>Tab</kbd> key to navigate to the button you want, then the <kbd>Enter</kbd> or <kbd>Space</kbd> keys to activate it - except you can't because it isn't a set of buttons, it's a set of radio buttons, and the keyboard interaction is not the same.

You can use the <kbd>Tab</kbd> key to move to the first radio button in the set, but if you press it again, you'll navigate to the next focusable element **after** the radio buttons, not to the next radio button in the set. In other words, unless you happen to guess you're really using a set of radio buttons and you realise you should be using the arrow keys not the <kbd>Tab</kbd> key to navigate between them, you're likely to think the component is broken because you can't reach any other buttons in the set.

**Note:** Firefox is the exception because it does allow you to use the <kbd>Tab</kbd> key to navigate between all radio buttons in a set.

If you're a [sighted screen reader user](https://webaim.org/projects/screenreadersurvey9/#disabilitytypes), you too will see the set of buttons, and your prior experience will tell you that you can use your screen reader's shortcut key for navigating to and between buttons to reach them - except you can't because it isn't a set of buttons, it's a set of radio buttons, and the screen reader shortcut is not the same.

One of the [Inclusive Design Principles](https://inclusivedesignprinciples.org) is:

>Be consistent:
>Use familiar conventions and apply them consistently.

It goes on to explain:

>Familiar interfaces borrow from well-established patterns. These should be used consistently within the interface to reinforce their meaning and purpose.
>This should be applied to functionality, behaviour, editorial, and presentation. You should say the same things in the same way and users should be able to do the same things in the same way.

Good design means following that principle and making sure that the functionality of your component matches the perceived affordances of your visual design, or that your visual design matches the functionality of your component.
