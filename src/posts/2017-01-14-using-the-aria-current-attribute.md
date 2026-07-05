---
title: "Using the aria-current attribute"
date: 2017-01-14
postTags: ["ARIA", "Screen readers"]
postCategories: ["Code things"]
postSummary: "Highlighting the current item in a collection visually is common on the web, but providing an alternative for screen reader users has often involved hacks—that's where the `aria-current` attribute comes in to solve this problem."
---

It is common on the web for the current thing in a collection to be highlighted visually, but providing an alternative for screen reader users has often involved something of a hack. The [aria-current](https://www.w3.org/TR/wai-aria-1.1/#aria-current) attribute is intended to solve this problem.

## Common patterns

There are several common patterns where the current thing in a group or collection is highlighted visually:

* The current page/link in a navigation block;
* The current step in a process/progressbar;
* The current date in a calendar;
* The current time in a timetable/schedule;
* The current location in a breadcrumb/map.

Usually the current thing is differentiated from the other things in the collection using CSS. For example:

```html
<style>
  .current {
    font-weight: bold;
    background-color: #cc33ff;
  }
</style>

<nav>
  <ul>
    <li><a href="/" class="current">Home</a></li>
    <li><a href="/">About</a></li>
    <li><a href="/">Contact</a></li>
  </ul>
</nav>
```

CSS is predominantly a visual medium, and with one [notable exception](/accessibility-support-for-css-generated-content/) it isn't exposed to screen readers * and therein lies the problem.

It's possible to solve this particular use case by removing the href attribute on the current link, rendering it inert and preventing screen readers from announcing it as a link at all. Or by using a foreground image instead of a background image, and giving it an alt text (like "Current page") that conveys the relevant information to screen reader users.

There are reasons why you may not want to use either of these solutions, and in any case they're only relevant to this particular pattern. What if the current thing isn't a link, or isn't an interactive element at all? For example:

```html
<table>
  <caption>July 2016</caption>
  <tr>
    <th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th><th>Sun</th>
  </tr>
  <tr>
    <td></td><td></td><td></td><td></td><td>1</td><td>2</td><td>3</td>
  </tr>
  <tr>
    <td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td>
  </tr>
  <tr>
    <td>11</td><td>12</td><td>13</td><td>14</td><td>15</td><td class="current">16</td><td>17</td>
  </tr>
  <tr>
    <td>18</td><td>19</td><td>20</td><td>21</td><td>21</td><td>22</td><td>23</td>
  </tr>
  <tr>
    <td>24</td><td>25</td><td>26</td><td>27</td><td>28</td><td>29</td><td>30</td>
  </tr>
  <tr>
    <td>31</td><td></td><td></td><td></td><td></td><td></td><td></td>
  </tr>
</table>
```

## The `aria-current` attribute

The `aria-current` attribute is intended to solve this problem. Here's the official attribute definition:

> Indicates the element that represents the current item within a container or set of related elements. The `aria-current` attribute is an enumerated type. Any value not included in the list of allowed values should be treated by assistive technologies as if the value true had been provided. If the attribute is not present or its value is an empty string, the default value of false applies and the `aria-current` state must not be exposed by user agents or assistive technologies.

According to the ARIA 1.1 specification, the `aria-current` attribute can be given one of a predefined set of values (enumerated tokens):

page

represents the current page within a set of pages;

step

represents the current step within a process;

location

represents the current location within an environment or context;

date

represents the current date within a collection of dates;

time

represents the current time within a set of times;

true

represents the current item within a set;

false

does not represent item within a set.

So the `aria-current` attribute can be used to solve the first use case in this post like this:

```html
<style>
  [aria-current] {
    font-weight: bold;
    background-color: #cc33ff;
  }
</style>

<nav>
  <ul>
    <li><a href="/" aria-current="page">Home</a></li>
    <li><a href="/">About</a></li>
    <li><a href="/">Contact</a></li>
  </ul>
</nav>
```

When a screen reader encounters the link identified with `aria-current`, it will announce something like "Home, current page link".

Whenever `aria-current` is used with a value other than true, that information is incorporated into the screen reader announcement. For example in this set of steps, a screen reader will announce "Do this, current step link"."

```html
<ol>
  <li><a href="/" aria-current="step">Do this</a></li>
  <li><a href="/">Do that</a></li>
  <li><a href="/">Do the other</a></li>
</ol>
```

Whereas in this calendar example, a screen reader will announce something like "Sat 16, current date".

```html
<table>
  <caption>July 2016</caption>
  <tr>
    <th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th><th>Sun</th>
  </tr>
  <tr>
    <td></td><td></td><td></td><td></td><td>1</td><td>2</td><td>3</td>
  </tr>
  <tr>
    <td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td>
  </tr>
  <tr>
    <td>11</td><td>12</td><td>13</td><td>14</td><td>15</td><td aria-current="date">16</td><td>17</td>
  </tr>
  <tr>
    <td>18</td><td>19</td><td>20</td><td>21</td><td>21</td><td>22</td><td>23</td>
  </tr>
  <tr>
    <td>24</td><td>25</td><td>26</td><td>27</td><td>28</td><td>29</td><td>30</td>
  </tr>
  <tr>
    <td>31</td><td></td><td></td><td></td><td></td><td></td><td></td>
  </tr>
</table>
```

The `aria-current` attribute can be applied outside of these use cases. When `aria-current` is set to true, then screen readers simply indicate that something is "Current", whatever that thing may be. For example:

```html
<ul>
  <li><a href="/" aria-current="true">Apples</a></li>
  <li><a href="/">Bananas</a></li>
  <li><a href="/">Cherries</a></li>
</ul>
```

Working examples, screen reader support and links to screen reader demos are available for all the [aria-current patterns](https://demos.tink.uk/aria-current/) mentioned in this post.
