---
title: "How screen readers navigate data tables"
date: 2020-09-28
postTags: ["Screen readers", "HTML"]
postCategories: ["Code things"]
postSummary: "When a table is created with appropriate HTML elements or ARIA roles, screen readers can inform users about table characteristics and provide keyboard commands for navigating tabular content."
---

When a table is created using the appropriate HTML elements (or ARIA roles) screen readers can inform users about the characteristics of the table, and users have access to keyboard commands specifically for navigating tabular content. 

For the purposes of this post I'm going to use NVDA. Jaws uses the same keyboard commands in this situation, which is useful because between them they represent more than [80% of the screen reader market](https://webaim.org/projects/screenreadersurvey8/#primary) on desktop/laptop devices. Check the documentation for [VoiceOver](https://www.apple.com/voiceover/info/guide/_1133.html) and [Narrator](https://support.microsoft.com/en-us/help/22806/windows-10-narrator-keyboard-commands-touch-gestures) to find the corresponding keyboard commands for those screen readers.

One more thing before we get started; there is a [difference between keyboard and screen reader navigation](/the-difference-between-keyboard-and-screen-reader-navigation/). Although most screen reader users use a keyboard not a mouse, they are not restricted to the same limited set of keyboard commands as other keyboard users. It also means that keyboard focus and screen reader focus are not the same thing.

Contrary to what you might have heard, you do not need to make each cell of a table focusable with a keyboard to aid navigation. If the cell contains a focusable and interactive element that's OK, but if it contains non-interactive content it is likely that you will make keyboard users work much harder to navigate the table than you intended.

## Moving to a table

Let's use the following table as our working example:

```html
<table>
    <caption>Average daily tea and coffee consumption</caption>
    <tr>
        <th>Person</th><th>Coffee</th><th>Tea</th>
    </tr>
    <tr>
        <th>Njoki</th><td>5 cups</td><td>0 cups</td>
    </tr>
    <tr>
        <th>Iesha</th><td>1 cup</td><td>2 cups</td>
    </tr>
    <tr>
        <th>Léonie</th><td>0 cups</td><td>25 cups</td>
    </tr>
</table>
```

Press <kbd>t</kbd> to move screen reader focus to the table and NVDA will say:

>Average daily tea and coffee consumption
>
>Table with 3 columns and 4 rows
>
>Average daily tea and coffee consumption caption

NVDA starts by announcing the table's [accessible name](https://developer.paciellogroup.com/blog/2017/04/what-is-an-accessible-name/), then that there is a table with 3 columns and 4 rows, before repeating the accessible name again but this time indicating it is the table's caption. 

All of this information comes from the browser; the table's accessible name is taken from the `caption` element, the implicit role of the `table` element is "table" (which is how the screen reader knows what it is), and the browser tells the screen reader how many rows and columns there are based on the number of `td` and `tr` elements.

The repetition of the table caption makes NVDA a little verbose, but it is an example of a common phenomenon - screen readers often do the same thing in slightly different ways. Jaws for example announces this when you press the <kbd>t</kbd> key:

>Table with 3 columns and 4 rows
>
>Average daily tea and coffee consumption
>
>Column 1, row 1
>
>Person

Jaws does not repeat the caption, but it does not indicate that the name of the table is a caption either. It also takes the additional step of moving screen reader focus to the first cell in the table and announcing its coordinates and content, where NVDA only moves screen reader focus to the table (not into it).

These differences are entirely normal and nothing to worry about. The important question to ask when you're testing with any screen reader is: will someone who uses this screen reader know what kind of content they're dealing with?

Whether you're using NVDA or Jaws, you'll know that there is a table, the table's dimensions, and something about the table content. In other words, you'll have the same information someone sighted might discover by glancing at it.

## Navigating table content

Use the <kbd>down arrow</kbd> key to move NVDA's focus into the table and NVDA will say:

>Row 1, column 1
>
>Person

Now the screen reader focus is in the first cell of the table, the next step is to explore the table and orientate yourself so you know what data the table contains.

Use the keyboard command <kbd>control alt + right arrow</kbd> to move one cell to the right, and NVDA will say:

>Column 2
>
>Coffee

Then repeat the same keyboard command until NVDA says:

>Edge of table

Then use <kbd>control alt + left arrow</kbd> to reverse direction until NVDA says:

>Edge of table

Now use <kbd>control alt + down arrow</kbd> to move one cell down, and NVDA will say:

>Row 2
>
>Njoki

Repeat the same keyboard command until NVDA says:

>Edge of table

Then use <kbd>control alt + up arrow</kbd> to reverse direction until NVDA tells you you're at the edge of the table again.

These four keyboard commands let you move left/right through rows and up/down through columns, and with them you have the basic method of navigating data tables with NVDA (and Jaws).

## Finding specific information

Let's say you want to find out  how much coffee Njoki drinks. Use <kbd>control alt + down arrow</kbd> until NVDA says:

>Row 2
>
>Njoki

Then use <kbd>control alt + right arrow</kbd> and NVDA will tell you:

>Coffee
>
>Column 2
>
>5 cups

Even though the screen reader is focused on the `td` element that represents the cell containing the number of cups, not the `th` element that represents the column header, the screen reader uses the information it got from the browser to create an association between the two. The screen reader counts on you remembering which row you're in, and just announces the column header as well as the cell content as you move horizontally across the row.

Now you might want to know how many cups of coffee Iesha drinks. Use <kbd>control alt + down arrow</kbd> to move down one cell and NVDA will say:

>Eisha
>
>Row 3
>
>1 cup

This time the screen reader associates the `th` element that is the row header with the contents of the `td` it is focused on, and speaks both pieces of information. As before, the screen reader counts on you remembering which column you're in, and just announces the row header as you move vertically through the column.

This ability to navigate the table using these commands is entirely dependent on the proper HTML (or equivalent ARIA roles) being used; especially the `th` elements that act as row and column headers.

Try it for yourself with this [demo data table](https://demos.tink.uk/html-table/), or watch this [screen reader demonstration](https://youtu.be/X1KR4u94cho) of the same thing.
    