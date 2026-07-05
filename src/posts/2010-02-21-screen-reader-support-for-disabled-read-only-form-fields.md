---
title: "Screen reader support for disabled & read only form fields"
date: 2010-02-21
postTags: ["HTML", "Screen readers"]
postCategories: ["Code things"]
postSummary: "I was asked how screen readers handle disabled and read only form fields, and despite forms being commonplace on most websites, there's remarkably little information available on the subject."
---

Some while ago I was asked how screen readers handle disabled and read only form fields. Despite forms being commonplace on most websites, there's remarkably little information available on the subject. It turns out that there's also very little consistency in the way different screen readers behave either.

The [HTML 4.01 specification](https://www.w3.org/TR/html4/interact/forms.html) defines two attributes that can be used to prevent people from interacting with form fields:

* `disabled`
* `readonly`

Both attributes are boolean, meaning they can either be on or off.

## Disabled form fields

The `disabled` attribute can be applied to button, input, optgroup, option, select and submit form fields. For example:

```html
<input type="text" disabled="disabled" />
```

When applied to a form field, the `disabled` attribute means that the field:

* Should not receive focus.
* Should be skipped in the tab order.
* Should not successfully submit data.

## Read only form fields

The `readonly` attribute can be applied to input and textarea form fields. For example:

```html
<input type="text" readonly="readonly" />
```

When applied to a form field, the `readonly` attribute means that a field:

* Should receive focus, but cannot be modified by the user.
* Should be included in the tab order.
* Should successfully submit data.

## Screen reader results

Using these [disabled form fields](https://test-cases.tink.uk/disabled-form-fields/index.html) and [readonly form fields](https://test-cases.tink.uk/readonly-form-fields/index.html) test cases, page, I looked at the way three popular screen readers dealt with disabled and read only form fields. It wasn’t meant to be an exhaustive investigation, but more a chance to get a flavour of screen reader support. The screen readers in question were:

* Jaws 11.
* NVDA 2009.1.
* Window Eyes 7.11.

To keep things even, I put each screen reader through its paces in two different browsers:

* Firefox 3.6.
* Internet Explorer 8.

The results were extremely varied, with little consistency across either screen readers or browsers.

All three screen readers correctly reported when a form field was disabled, except for Jaws in Firefox. For some reason, Jaws treats disabled textboxes and textareas as though they weren’t there in Firefox at all.

There are slight differences in the way each screen reader reports a disabled form field. Jaws and NVDA both indicate the field is “Unavailable”, whilst Window Eyes reports that the field is “Disabled”.

Things get a little more complicated with read only form fields. NVDA and Window Eyes treat read only textboxes and textareas as plain text, so don’t report them as read only fields. Jaws does treat them as form fields and reports them as “Read only”, with the exception of textareas in Firefox.

Read only radio buttons are recognised as form fields by all three screen readers, but none of them correctly report them as “Read only”. To add to the confusion, read only buttons could be selected using all three screen readers.

Jaws and NVDA both exclude disabled form fields from the tab order, whilst Window Eyes does not. Bear in mind that Jaws completely ignores disabled textboxes and textareas in Firefox, which isn’t quite the same as skipping them in the tab order.

All three screen readers include read only radio buttons in the page tab order. In a reversal of the way disabled form fields are treated, Jaws and NVDA both include read only textboxes and textareas in the tab order, whilst Window Eyes does not.

Generally speaking, NVDA treated disabled and read only form fields most consistently. It was also the most accurate in terms of following the HTML 4.01 specification.

Window Eyes was reasonably consistent across both browsers, but didn’t follow the specification for disabled and read only fields particularly well. Jaws on the other hand seemed a little more true to the specification, but gave the most inconsistent results overall.

If anyone would like to contribute results for other screen readers or can add more information to the above results, please [drop me a line](mailto:tink@tink.uk).
