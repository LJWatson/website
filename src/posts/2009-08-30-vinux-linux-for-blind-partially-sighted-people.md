---
title: "Vinux (Linux for blind & partially sighted people)"
date: 2009-08-30
postTags: ["Screen readers", "Linux"]
postCategories: ["Desktop things"]
postSummary: "Vinux is a Linux distribution optimised for blind and partially sighted people, and Vinux 2.0 beta was released earlier this month based on the Debian distribution with screen reader and Braille support fully loaded."
---

[Vinux](https://vinux.org.uk/index.php) is a Linux distribution optimised for blind and partially sighted people. Originally based on [Ubuntu](https://www.ubuntu.com/), Vinux 2.0 beta was released earlier this month based on the [Debian](https://www.uk.debian.org/) distribution. Vinux boots with screen reader and Braille support fully loaded, and with screen magnification available at a simple keystroke.

## Linux origins

Vinux 1.5 was the last stable release of the distribution, based on Ubuntu 8.10 (Intrepid Ibex). Vinux 2.0 beta is based on Debian 5.0.2 (Lenny). The decision to move to a different baseline distribution was taken in light of Vinux lead developer Tony Sayles concerns over Ubuntu's ongoing stability.

## User interfaces

Vinux uses the [Gnome desktop](https://www.uk.gnome.org/), which may seem like an unusual choice for a distro aimed at blind and partially sighted people. Graphical User Interfaces (GUI) do tend to be easier to learn than the typed commands of a console interface though, and a GUI also offers greater parity for people working alongside sighted colleagues.

The Vinux 2.0 beta GUI interface has been customised for partially sighted people. It offers one click access to all commonly used applications, and has a layout particularly suitable for wide screen displays. The desktop is also keyboard accessible, with easy movement between different panels. If the old school command line is more your style though, Vinux switches easily between GUI and console interfaces.

## Assistive technologies

[Orca](https://live.gnome.org/Orca) is the primary assistive technology for the Vinux distro. It provides access to applications such as the Gnome desktop, which support the [Assistive Technology Service Provider Interface (AT-SPI)](https://en.wikipedia.org/wiki/Assistive_Technology_Service_Provider_Interface). Orca provides screen reading, screen magnification and Braille support capability.

Speech synthesis is handled by the [Speech Dispatcher](https://www.freebsoft.org/speechd) interface, a device independent layer that sits between the application and the Text To Speech (TTS) engine. As well as Orca, Speakup is also installed, which provides screen reader access when using the command line. Both Orca and Speakup use the ESpeak TTS, which means there's a consistent audio quality across the GUI and console interfaces.

Braille support is provided by [BRLTTY](https://mielke.cc/brltty/), a package that enables access to the console interface using a range of refreshable Braille displays. Screen magnification in Orca is provided by the Gnome-Mag magnification service. Vinux supports both 2D and 3D screen magnification, with 2D magnification available from bootup at a simple keystroke.

## Available applications

Vinux 1.5 includes both [Open Office](https://www.openoffice.org/) and [Evolution](https://projects.gnome.org/evolution/), providing easy access to spreadsheet, word processing and email functionality. Unfortunately, with the move to a Debian based distro, space has become limited on the CD version of Vinux 2.0 beta.

Neither Open Office or Evolution are included with Vinux 2.0 beta, although both applications can later be downloaded if you install Vinux on your hard drive. Icedove, Abiword and Gnumeric have been included instead, but only work with screen magnification and not the screen reader.

* [Vinux Development mailing list](https://groups.google.com/group/vinux-development)
* [Vinux Development blog](https://vinux-development.blogspot.com/)
