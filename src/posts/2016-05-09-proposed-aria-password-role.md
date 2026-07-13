---
title: "Proposed ARIA password role"
date: 2016-05-09
postTags: ["ARIA", "Screen readers"]
postCategories: ["Code things"]
postSummary: "I'd never enter my password into a field I wasn't confident was protected from view, but a proposed ARIA password role could put screen reader users in exactly that position."
---

Let me ask you a question: Would you enter your password into a password field, if you couldn’t be confident it was protected from being viewed by other people? The answer is probably not, but a proposed ARIA role could put screen reader users in exactly this position.

When you use `<input type=”password”>` to create a native password field, the browser obscures the characters that are entered into the field, and prevents them being discoverable with cut/paste. At the accessibility layer the field has a role of “text” and a state of “protected”, which informs assistive technologies like screen readers what type of field they are dealing with. When a screen reader encounters a native password field it automatically stops echoing keys as they’re pressed, and instead announces the characters as they’re rendered inside the password field – as asterisks for example.

When you use a `<div>` or `<span>` to create a custom password field you must obscure the characters with scripting, and there is nothing you can do to protect against cut/paste discoverability. At the accessibility layer there is no role or state available to assistive technologies, and because screen readers do not recognise it is a password field they continue to echo keys as they’re pressed.

So there are security issues with custom password fields, irrespective of accessibility. There is no way to tell whether a password field is native or custom, and no guarantee that your password is adequately protected from discoverability.

There are also accessibility issues. It is not possible for assistive technologies to tell that it is a password field (or even a text input), and nothing to stop screen readers announcing the characters of your password as you type them.

To solve the first of the accessibility issues, a [password role](https://rawgit.com/w3c/aria/password-role/aria/aria.html#password) has been proposed in ARIA 1.1. When applied to a custom password field, the role will inform assistive technologies that the field should be considered a password field. The proposal will likely be extended to make the role more specific – to inform assistive technologies that it is a custom password field.

The password role also attempts to solve the second accessibility issue. According to the password role definition, when the role is applied to a custom password field screen readers should stop echoing keys as they’re pressed and instead announce only the characters as they are rendered inside the password field.

Neither of the other security issues with custom password fields will be solved by the password role, but ARIA is not the place to solve those problems. They do need to be solved (and soon), but it is a much wider discussion than accessibility alone.

If it sounds as though the ARIA password role is a good solution, there is a catch. The role itself is a step in the right direction, but if screen reader vendors don’t implement it properly it could leave screen reader users vulnerable. If the screen reader continues to announce the characters of your password as they’re typed, someone may overhear them. If the scripting fails or is implemented badly, it could also leave screen reader users uncertain about whether their password was displayed on-screen in plain text or whether the characters had been obscured because all they would hear would be the characters of their password echoed back to them. This also leaves open the possibility, however unlikely, of a malicious attack targeted at screen reader users.

So here is the catch… there is no requirement for ARIA to be tested in screen readers before it becomes an official W3C standard. This means the password role could be put out there in the wild with no reassurance that any screen reader had implemented it properly.

Each feature of a W3C standard is expected to be properly implemented and tested in at least two user agents. For most standards this means two shipping browsers or browser engines, but ARIA is unique in that it is the only standard that requires a screen reader to be used.

Until now this hasn’t been a problem. Testing ARIA implementations by examining platform accessibility API and browser support has been more than sufficient. If a screen reader vendor then implemented support for a feature incorrectly it might cause a feature not to work as expected, or a role to be misidentified, but irritating as that might be it does not represent a security risk for screen reader users.

The upshot is that the password role will offer better security for screen reader users if it is implemented correctly, but unless we can be sure it is implemented correctly there is a risk to screen reader users.

Testing ARIA with screen readers seems like the sensible thing to do. Screen readers are dependent on the accessibility APIs and browsers, but they also play a role in correctly supporting ARIA. If the ARIA Working Group chose to include screen readers in its testing for ARIA 1.1, even if only for the password role, that would be another step in the right direction.

There is another option, but it involves breaking the browser’s ["fourth wall"](https://en.wikipedia.org/wiki/Fourth_wall). If browsers implemented the same behaviour for custom password fields using the password role, as they do for native password fields, the security problems would go away – all of them, not just the accessibility ones.

Browsers have traditionally held back on providing functionality or making changes to the UI, based on ARIA. Custom password fields give us a compelling use case for revisiting this idea though, so perhaps the more progressive browser vendors will look again at their position on this. Then again, perhaps it is time to look beyond ARIA for an HTML solution that will give us the ability to imbue custom controls with native behaviours.

**Update 6th November 2016:** On 7th July 2016 the ARIA WG agreed to [move the password role to ARIA 2.0](https://lists.w3.org/Archives/Public/public-aria-admin/2016Jul/0010.html). This move was prompted by the realisation that no clear use cases for the role existed.

However, at a [joint meeting between the ARIA WG and Web Platform WG](https://www.w3.org/2016/09/19-webapps-minutes.html#item03) on 19th September 2016, there was discussion about ARIA 2.0 roles having parity with all HTML elements. If this goes ahead it would mean the inclusion of the password role by default, as it would be mapped to `<input type="password">`. It may be that the browser vendors will look again at the role and imbue it with the same characteristics as its native HTML counterpart, but for now the issue of ARIA role and HTML element parity remains [open for discussion](https://github.com/w3c/webcomponents/issues/552) on Github.
