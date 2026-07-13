---
title: "Accessible forms with ARIA live regions"
date: 2012-11-10
postTags: ["ARIA", "HTML", "Screen readers"]
postCategories: ["Code things"]
postSummary: "ARIA live regions are a simple way to announce dynamic page updates to screen reader users, so they don't miss important changes like basket confirmations that happen outside their current focus."
---

When a form is used to update information on the page, it can be troublesome for screen reader users. Unless the screen reader is focused on the relevant bit of the page, the update goes by un-noticed. ARIA live regions are a simple way to improve the experience for screen reader users.

Quick recap: Screen readers rely almost entirely on the HTML of the page, and focus is moved from one element to another using a range of navigation commands. In other words, a screen reader can only focus on one element at a time.

That's where the trouble starts. If a screen reader is focused on a form field, it can't be focused on the bit of the page being updated as well.

## Dynamic updates

The [Marks & Spencer website](https://www.marksandspencer.co.uk/) is a good example. When an item is added to the shopping basket, the basket summary at the top right of the page gets updated. In fact it's the only confirmation that the item has been successfully added.

The update is easy to see at a glance, but not at all easy with a screen reader. First you have to discover that something has changed, then you have to find out where it happened. Even once you know this, you still need to move focus back and forth between the summary and the product information, every time you add an item to the basket.

### Code example: without ARIA

A massively simplified version of this interaction might look like this:

```html
<!DOCTYPE html>
<html lang="en">

  <head>
    <title>Tequila</title>

    <script>
      var items = 0;
      function updateItems () {
        items = items + 1;
        document.getElementById("quantity").innerHTML=items;
      }
    </script>
  </head>

  <body>
    <h1>Tequila</h1>
    <p>Tequila makes me happy...</p>
    <p><button onclick="updateItems()">Add tequila to basket</button></p>

    <h2>Basket summary</h2>
    <div>
      <p>Your basket contains <span id="quantity">0</span> items.</p>
    </div>

  </body>
</html>
```

When the button is activated with a screen reader, nothing appears to happen. The page doesn't reload, so focus remains on the button and the screen reader stays silent. The basket summary is updated, but the screen reader user remains oblivious.

## The aria-live attribute

The [aria-live attribute](https://www.w3.org/WAI/PF/aria/states_and_properties#aria-live) can be used to turn the basket summary into an ARIA live region. ARIA enabled screen readers can monitor ARIA live regions for changes, and automatically announce them as they happen. The monitoring is done in the background, so even if the screen reader is focused somewhere else on the page at the time, changes within the live region are still announced.

### Code example/: with aria-live

Adding the `aria-live` attribute to the basket summary:

```html
<h2>Basket summary</h2>
<div aria-live="assertive">
  <p>Your basket contains <span id="quantity">0</span> items.</p>
</div>
```

The `aria-live` attribute takes three possible values: off (default), polite and assertive. The polite value means that the screen reader will wait until its finished it’s current task before announcing the update, and the assertive value means the update is announced as soon as the screen reader encounters a slight pause (in reality it's almost always immediate).

## The aria-atomic attribute

The [aria-atomic attribute](https://www.w3.org/WAI/PF/aria/states_and_properties#aria-atomic) defines whether all of the content in the ARIA live region should be announced, or only the part that's changed.

### Code example: with aria-atomic

Adding the aria-atomic attribute to the basket summary:

```html
<h2>Basket summary</h2>
<div aria-live="assertive" aria-atomic="true">
  <p>Your basket contains <span id="quantity">0</span> items.</p>
</div>
```

The `aria-atomic` attribute has two possible values: true and false (default). Using `aria-atomic="true"` means that all of the content within the ARIA live region will be announced, even though only a small part of it has changed. So screen readers will announce something like "Your basket contains 3 items", instead of just "3".

The [All Star route deviation calculator](https://www.allstarcard.co.uk/calculators/route-deviation) is one of the best examples of this technique in the wild. Developed by Matt Lawson of [Nomensa](https://www.nomensa.com), the form is used to calculate cost savings based on reduced mileage.

As you manipulate information within the form, your potential cost saving is dynamically updated on the page. Because the updated information is an ARIA live region, using the form with a screen reader couldn't be easier.
