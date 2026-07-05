---
title: "Playing with the Accessibility Object Model (AOM)"
date: 2017-09-15
postTags: ["ARIA", "JavaScript", "Screen readers"]
postCategories: ["Code things"]
postSummary: "The Accessibility Object Model (AOM) is an experimental JavaScript API that enables developers to modify the browser accessibility tree, with phase one support recently landing in Chrome Canary behind a flag."
---

**Updated on 27th February 2019:** The Accessibility Object Model (AOM) specification has been updated and `accessibleNode` has been dropped. Read the [AOM explainer](https://github.com/WICG/aom/blob/gh-pages/explainer.md) for more information.

The [Accessibility Object Model (AOM)](https://github.com/WICG/aom) is an experimental JavaScript API that enables developers to modify the browser accessibility tree. The AOM has four phases, and support for phase one recently landed in Chrome Canary behind the flag.

## The status quo

Traditionally, access to the accessibility tree has been limited to the [platform accessibility APIs](https://www.smashingmagazine.com/2015/03/web-accessibility-with-accessibility-api/) used by Assistive Technologies (AT). Even so, the access has been one-way, AT can query the accessibility tree but not manipulate it.

For developers, the only way to manipulate the accessibility tree has been to use ARIA to add, remove, or change the native semantics of HTML elements. Where the semantics (role, name, and state) of native HTML elements are implicit, ARIA forces us to declare the additional semantics explicitly. Using the AOM it's possible to avoid "sprouting attributes" (as the [AOM explainer](https://github.com/WICG/aom/blob/gh-pages/explainer.md) cheerfully puts it), and instead keep the HTML clean. When it comes to Custom Elements it also means the semantics can be encapsulated within the implementation, instead of added as a "leaky abstraction".

## The AOM

The AOM is being developed by Alice Boxhall and Dominic Mazzoni of Google, James Craig of Apple, and Alexander Surkov of Mozilla. They propose to introduce AOM capabilities in four phases:

1. Modify the semantic properties of the accessibility node associated with a DOM node;
2. Directly respond to events or actions from AT;
3. Create virtual accessibility nodes (not associated with DOM nodes);
4. Programmatically explore the accessibility tree, and access the computed properties of accessibility nodes.

## AOM phase 1

The [AOM Phase 1 specification](https://wicg.github.io/aom/spec/) introduces the `AccessibleNode` and `AccessibleNodeList` interfaces. These enable developers to modify the semantics of nodes in the accessibility tree, and to pass references to accessible nodes to other properties.

As an experiment I decided to create a custom disclosure widget using the Accessibility Object Model (AOM) instead of ARIA. For many reasons it's not advisable to start from a `span` and a `div` when you create this kind of interaction, but in the interests of playing with the AOM it serves the purpose.

The underlying HTML looks like this:

```html
<span id="button">Tequila!</span>
<div id="container">
  Makes me happy!
</div>
```

Everything else happens in the JavaScript. First we create references to the DOM nodes that represent the `span` and `div` elements:

```javascript
var button = document.getElementById('button');
var container = document.getElementById('container');
```

Then modify their properties by setting the `tabindex` attribute on the `span` to make it focusable, and the `hidden` attribute on the `div` to hide the content:

```javascript
button.setAttribute('tabindex', 0);
container.setAttribute('hidden', true);
```

We could then start adding semantics to the DOM node for the span in the usual way:

```javascript
button.setAttribute('role', 'button');
button.setAttribute('aria-expanded', false);
```

But instead we can create a reference to the accessible node that corresponds to the DOM node for the span element, and add the semantics straight into the accessibility tree:

```javascript
button.accessibleNode.role = "button";
button.accessibleNode.expanded = false;
```

The AOM uses the same set of roles as ARIA. The AOM Phase 1 spec also includes a table that maps AOM properties to their corresponding ARIA attributes (the `expanded` property corresponds to the `aria-expanded` attribute for example).

We can then create and call the function that handles the behaviour of the disclosure widget:

```javascript
function disclose(event) {

    if(container.getAttribute('hidden')) {
        button.accessibleNode.expanded = true;
        container.removeAttribute('hidden');
    }
    else {
        button.accessibleNode.expanded = false;
        container.setAttribute('hidden', true);
    }
}

button.addEventListener('click', disclose, false);
button.addEventListener('keydown', function(event) {
    if (event.keyCode == 13 || event.keyCode ==32) {
        disclose();
    }
});
```

It removes the `hidden` attribute from the `div` element, and changes the value of the AOM `expanded` property on the accessible node for the `span` element.

The AOM also makes it possible to pass object references to other accessible node properties. We'd usually set the `aria-controls` attribute on the `span` element like this:

```javascript
button.setAttribute('aria-controls', 'container');
```

But the AOM means we don't have to pass an idref to the `aria-controls` attribute to indicate that the `span` element controls the `div` element. Instead we create an AccessibleNodeList:

```javascript
var content = new AccessibleNodeList();
```

Then we add the accessible node for the `div` element to the array:

```javascript
content.add(container.accessibleNode);
```

Lastly, in the function that handles the disclosure behaviour, we create the association between the accessible nodes for the `span` and `div` elements directly in the accessibility tree:

```javascript
function disclose(event) {

    if(container.getAttribute('hidden')) {
        button.accessibleNode.expanded = true;
        button.accessibleNode.controls = content;
        container.removeAttribute('hidden');
    }
    else {
        button.accessibleNode.expanded = false;
        button.accessibleNode.controls = null;
        container.setAttribute('hidden', true);
    }
}
```

By using an array to store one or more accessible node references, it's possible to associate multiple accessible nodes with another. Think of the AOM properties that equate to ARIA attributes like `aria-labelledby`, `aria-describedby`, or `aria-owns`, that can take multiple idrefs as values.

## Running the experiment

As mentioned at the start, the AOM is an experimental API. For now support for Phase 1 is only available behind the flag in [Chrome Canary](https://www.google.co.uk/chrome/browser/canary.html). This means you need to run Canary from the command line. To do this, open Windows Command Prompt or MacOS Terminal, and navigate to the directory where Chrome Canary is installed.

In Windows run:  
`chrome.exe --enable-blink-features=AccessibilityObjectModel`

In MacOS run:  
`open -a Google\\ Chrome --args --enable-blink-features=AccessibilityObjectModel`

You can then open this [AOM disclosure demo](https://test-cases.tink.uk/aom-disclosure), and with a screen reader running it'll behave exactly like you'd expect. The screen reader recognises a button in a collapsed state. When the button is activated, the screen reader recognises the button is now in the expanded state and (Jaws only) recognises that the button is being used to control the disclosed content.

With thanks to [Dan Hopkins](https://twitter.com/perlbod) and [Ian Pouncey](https://twitter.com/ianpouncey).
