---
title: "Screen reader support for HTML tables"
date: 2010-08-30
postTags: ["HTML", "Screen readers"]
postCategories: ["Code things"]
postSummary: "Screen reader support for tables is quite curious, with significant variations in how different screen readers handle them, partly because tables are often misused and poorly coded."
---

Screen reader support for tables is something of a curiosity. Although tables are among the most common of HTML elements, they’re often misused and poorly coded. To some extent this has influenced screen reader support, but even so the variations in screen reader behaviour are quite remarkable.

Possibly the biggest misuse of tables is using them to control page layout. Originally intended to markup tabular data, the concept of a layout table is now generally acknowledged.

## How do screen readers interact with tables?

As explained in a Webaim article on [creating accessible tables](https://webaim.org/techniques/tables/), screen reader users often struggle with tables. The mechanics of interacting with a table vary quite significantly between different screen readers.

When focus is on a table, Window Eyes has two specific commands for entering/exiting tables mode (Control +/-). Once in tables mode, you can use Insert + arrow keys to move up/down or left/right from one table cell to the next.

Jaws and NVDA have a slightly easier approach. Once a table has focus, the Control, Alt + arrow keys can be used to move through the table without entering into any kind of tables mode.

When it comes to reading a table summary, there is a rare moment of consistency. Jaws, NVDA and Window Eyes all read the summary just after the table itself has been announced. VoiceOver also speaks the summary, but only once focus has paused on the table for a few seconds first.

## So when is a table not a table?

No, not some kind of tabular [existentialism](https://en.wikipedia.org/wiki/Existentialism), but a reasonably serious question. What are the characteristics of a layout table? If a table has only one row/column, is it really a table at all? How does a screen reader identify a data table anyway?

## Screen reader results

Using a simple table test page and some help from Everett Zufelt, I put several popular screen readers through their paces in Firefox 3.6. The four screen readers were:

* Jaws 11.
* NVDA 2010.1.
* VoiceOver OSX10.6.
* Window Eyes 7.2.

Each of the screen readers was tested using its default configuration. Jaws and Window Eyes both have advanced table customisation settings, but it’s questionable how often such settings are used. More on this later though.

### Single row/column tables

All four screen readers agree that a single row/column table without a summary is a layout table. In other words, the table itself isn’t announced, and only the content is read.

When a summary is introduced into a single row/column table, there’s a definite split amongst the screen readers. Jaws and Window Eyes continue to treat it as a layout table, whilst NVDA and VoiceOver both announce that a table is present before reading the content.

### Multiple row/column tables

It’s when dealing with multiple row/column tables that the differences really start to appear. NVDA for example isn’t able to handle row/column headers at all. It’s a [known bug](https://www.nvda-project.org/ticket/361) that’s been partially fixed in the forthcoming 2010.2 release. NVDA will then be able to handle row/column headers in Firefox, but not in Internet Explorer.

If a table has multiple rows/columns, Jaws treats it as a correctly marked up data table whether the row/column headers have been marked up or not. It automatically uses the upper row and left hand column cell content as header information.

The table settings in Jaws mean you can switch to a more standards compliant interpretation of the code. The default assumption however, is that the table will not be marked up correctly and so Jaws fills in the gap on behalf of the user.

Window Eyes takes the reverse approach. By default it ignores even correctly marked up row/column headers. You must first change the table settings in Window Eyes before any information is made available.

Of the four, VoiceOver pays the closest attention to the code. Where the table has multiple rows/columns and no header markup, VoiceOver announces the table is present and simply reads the content.

When row/column headers are introduced using the <th> tag, VoiceOver acknowledges the column headers but not those for the row. If the scope attribute is the only means by which the row/column headers have been marked up, VoiceOver doesn’t recognise them at all.

With such a range of different behaviours, it’s enough to make you wonder whether it’s worth using/coding tables properly at all. The short answer is yes, it is.

## Screen readers and the web standards contract

It comes down to the theoretical contract between access technology vendors and web developers. If accessibility is really going to succeed, the contract to support web standards must be upheld by both parties.

Of the four screen readers covered here, VoiceOver probably comes the closest to supporting web standards when it comes to tables. Given its track record, there is every reason to think that NVDA 2010.2 will do the same when it’s released, albeit only in Firefox.

Jaws and Window Eyes are the real conundrum however. Both are quite capable of standards support, but neither do it out of the box. Jaws at least behaves this way on the assumption that data tables won’t be properly marked up, and it’s difficult to argue with that for the time being.

Right now, there is work that needs to be done on both sides as far as the web standards contract goes. There are still far too many badly marked up and confusing tables out there, and there is still much that screen readers could do to improve the way they interact with the good ones.

The signs are encouraging though. A few versions back, Jaws didn’t have an option to switch to using marked up headers at all. When the feature was first introduced in 6.01 it briefly became the default setting, and perhaps in time Jaws will revert to this behaviour.

NVDA and VoiceOver bring the greatest hope for a standards compliant web. Both were created in a time of standards awareness, and neither is held back by the millstone of legacy code and backwards compatibility.
