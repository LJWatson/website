---
title: "Everybody be Coil. You... Be Coil"
date: 2020-10-31
postTags: ["HTML"]
postCategories: ["Code things"]
postSummary: "I've decided to monetize this website using Web Monetization and become a Coil member because I've had enough of intrusive online advertising, tracking, and having my personal information bought and sold across the web."
---

Online advertising is, in my opinion, intrusive, invasive, and, in the case of accessibility, frequently destructive. Yet since it [first emerged in 1994](https://www.wired.com/2010/10/1027hotwired-banner-ads/), online advertising has been one of the few ways content creators have had to be compensated for their efforts. Until now.

[Web Monetization](https://webmonetization.org/specification.html) is a proposed standard being [incubated at the W3C](https://github.com/WICG/webmonetization). It lets browsers securely pay for content, and that in turn enables content creators to choose how to respond - by taking down a paywall, removing advertising, or revealing additional content for example.

[Coil](https://coil.com) is a service that uses Web Monetization to let content consumers pay content creators. You pay a monthly subscription of $5, install the Coil browser extension, and then keep browsing exactly as you always do. Only now something cool, or should that be Coil, happens in the background - whenever you visit a website that has Web Monetization enabled a tiny (really tiny) payment is sent from your browser to the content creator.

## Monetizing content

To monetize your content you need a digital wallet from a provider that supports the [Interledger Protocol](https://interledger.org/), for example [Uphold](https://uphold.com) or [Gatehub](https://gatehub.net). When your wallet is created it's given a public address known as a payment pointer, so the browser knows where to send payments.

You then use the `meta` element to add your payment pointer to your website, like this:

```html
<meta name="monetization" content="$ilp.uphold.com/dPdrQinmELyw">
```

Note: that example uses my payment pointer. You're welcome to use it of course but...

## Changing the web

I've had this website since 1998 and I've been creating content here and [elsewhere](/on-other-websites/) for much of that time. I've never seriously considered making a living from writing; I've been having too much fun with my chosen career for one thing. With Coil and Web Monetization I might be able to make the odd penny or two, but that is not why I decided to monetize this website.

I am under no illusion that writing will ever be a major source of income, in fact if I ever receive enough to cover my own monthly subscription to Coil I'll be a happy person. But I do think that Coil and Web Monetization are at the vanguard of a quiet revolution.

I decided to monetize this website and to become a [Coil member](https://coil.com/signup) because I've had enough of being tracked across the web, had enough of having my personal information bought and sold, had enough of being pestered to buy the washing machine I bought last week or the greatest hits album of a band I once listened to in 2008, and most of all because I've had enough of being bombarded and battered by online advertising.

Like all revolutions this one needs a critical mass to have the most impact. So I hope you will join me and [others](https://coil.com/explore) to make it happen. We Coil?
