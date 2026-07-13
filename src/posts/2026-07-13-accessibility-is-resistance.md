---
title: "Accessibility is resistance!"
date: 2026-07-13
postTags: ["AI"]
postCategories: ["Web life"]
postSummary: "Hello, my name is Léonie, and I 💜 AI. Well, that isn't entirely true, but I do use AI, quite a bit actually, and I'd like to tell you why."
---

Hello, my name is Léonie, and I 💜 AI.

<audio controls src="/media/2026/Dramatic-dum-dum-dum-sfx.mp3"></audio>

<details>
<summary>Sound effect transcript</summary>
[Loud orchestral]
>Pom, pom, Pom!
</details>

Well, that isn't entirely true, but I do use AI, quite a bit actually, and I'd like to tell you why.

## Documents

If I asked you to think of a document likely to have good accessibility, you'd be forgiven for suggesting the [European Accessibility Act (EAA)](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32019L0882). It is, after all, a standard intended to make things more accessible.

It's also a text file consisting of more than 125k words that, if printed, would cover almost 130 pages.

It has no semantic structures like [landmarks](https://tetralogical.com/blog/2022/03/18/landmarks/) or [headings](https://tetralogical.com/blog/2022/02/28/headings/), that I typically use to skim documents with my screen reader. It has no [lists](https://tetralogical.com/blog/2022/04/29/lists/) that might offer a different way to navigate it either.

If I want to get a sense of what the EAA is, requires, or otherwise contains, I'll just have to read it.

The [average reading speed](https://testmyreading.com/guides/average-reading-speed) of someone who is fluent in English with a typical level of literacy, is 238 Words Per Minute (WPM) for non-fiction.
That's 9 hours of reading to get through the EAA. Even at the [elevated reading speeds](/notes-on-synthetic-speech/) of around 500 WPM I get with my screan reader, it's still 4 hours of my life I'd never get back.

Our I could ask an AI "where do I find the requirements for websites in the EAA?".

And get a response like this:

> For websites covered by the European Accessibility Act, Directive EU 2019/882, the accessibility requirements are found primarily in: Annex 1, Section 3, General accessibility Requirements related to all services covered by this directive. You also need to look at Annex 1, Section 4, Additional accessibility requirements related to specific services. This contains service specific requirements that supplement the general requirements in Section 3.

Now I know which bit of the EAA has the information I need at that moment in time, I can search for certain phrases in the document, navigate to them, then read from there.
 
## Images

Like many people, I shop online. I might even do it more regularly than most, because organizing a trip to the mall is a logistical challenge involving friends and/or family, calendar management, and the understanding that I won't ask the person I share my life with to go shopping because we quite like being married to each other and want it to stay that way.

If I asked you to think of a clothing brand likely to have an accessible website, you might think of retailers with plenty of money - Amazon Essentials, Calvin Klein, or Marks and Spencer perhaps. Let's use Calvin Klein as the working example. Here's a product page from their UK website:

<img src="/images/2026/CK-product-page.png" alt="Screenshot of a product page on the Calvin Klein website showing a large image and some associated product information">

Notice how much information about the product is held in image format? Here's the product information available as text on the page:

>Highlights: long-sleeve, turtle-neck, ribbed knit.
>Shape and fit: relaxed fit.
>Composition and care: 65% merino wool, 30% Nylon, 5% Alpaca, dry clean. 

OK, I don't know about you, but I have questions...

Ignoring the fact it needs dry-cleaning, because who has time for that nonsense, what does "relaxed fit" mean exactly?

Alpacas are large fluffy arrangements aren't they? Does that mean the jumper is fluffy?

Is the jumper cropped? Long? Something else?

Is the jumper going to make me appear sophisticated and elegant, or look like a [Flump](https://en.wikipedia.org/wiki/The_Flumps)?

Now, if you're even a little bit familiar with accessibility, you'll be thinking "Aha! But, what about [text descriptions](https://tetralogical.com/blog/2022/01/24/text-descriptions/)?". Here's an image from the product page:

<img src="/images/2026/CK-product-image.png" alt="Product image from the Calvin Klein website showing a model wearing a black jumper">

And the text description? Here you go:

>Black ribbed chunky relaxed turtle-neck sweater for women, Calvin Klein Jeans.

That'll be a slow-hand clap for Calvin Klein then. To be fair, I could have chosen almost any retailer and we'd be having the same conversation, and at least CK hasn't stoopped to implementing an [accessibility overlay](https://overlayfactsheet.com).

What makes this such an excruciating example, is that the text description is a duplicate of the page title.

Oh, and, every. Product. Image. On. The. Page. Has. Exactly. The. Same. Damned. Text description!

Ahem!

Apps like [SeeingAI](https://en.wikipedia.org/wiki/Seeing_AI) have used image and object recognition to assist blind people since 2017, and browsers have been offering automated text descriptions for images since at least 2019, but [ChatGPT](https://chatgpt.com) and [Claude](https://claude.com) are now available directly through my screen reader.

Using a single keyboard command I can query ChatGPT (or Claude) for a description, and get something like this in return:

>The image shows a person standing with their back to the camera. They have long straight dark hair. The person is wearing a chunky black ribbed knit sweater with a high turtle-neck and slightly over-sized sleeves that appear loose and comfortable. They're wearing a black leather skirt that stops above the knees. The overall look is stylish and modern.
 
It isn't just that I can request an image description with a single keyboard shortcut, or that I can request descriptions for images on the web, on my laptop, or in documents like PDF. It isn't just that the descriptions, generated without any context, are detailed, useful, and informative. It's that I can ask questions if I want more information; like "What's the overall aesthetic of the jumper?".

And get a response like this:

>The jumper's ribbed knit texture and over-size fit convey a sense of warmth and comfort that make it suitable for cooler weather. The high turtle-neck adds a classic slightly sophisticated touch, balancing the casual feel of the loose fit. The solid black colour gives it a sleek minimalist look that could easily be paired with various outfits.
>
>Overall the jumper combines elements of modern minimalism with a relaxed comfortable vibe.

## World

I have a pair of [Meta Ray-Bans](/using-ray-ban-meta-glasses) and whereas there is much I dislike about Meta, I can't deny that they've got accessibility right in this case.

Had you been standing next to me at this tea plantation, not far from Hangzhou China, earlier this year, this would have been your view:

<img src="/images/2026/Hangzhou-tea-plantation.jpg" alt="A view looking out over a tea plantation in China">

But since you weren't there, an the aforementioned person I share my life with had gone off to order some lunch, it was just me and the view.

When I said, "Hey Meta, look and tell me what you see", Meta took that photo and then told me:

>I see a lush, green terraced hillside, under a bright, clear sky. The terraces are planted with evenly trimmed rows of what appear to be tea bushes.
>
> In the foreground there is a patch of bare soil with some small plants and young bushes growing. Two small trees stand near the centre, and a stone wall runs across part of the slope. Tall trees surround the terrace, casting some shade on the vibrant landscape.
>
> The overall scene is serene and verdant.

I haven't been able to idly contemplate my surroundings since I [lost my sight](/losing-sight) more than 25 years ago, so it's hard to describe how much of a wonder this is. I can be anywhere with connectivity and I can discover what's in front of me, what the place I'm in looks like, if there's a restroom nearby, what's on the menu I'm holding, if my (otherwise identical) jeans are the blue ones or the black ones, if the tin I'm about to open for lunch is soup or custard, if there's a billboard in front of me and if so what it's advertising...

## Finding things

Contrary to common belief, wearable AI devices don't continuously record what's going on and describe it, and until someone figures out how to get  a lot more battery capacity into such comparatively small devices, it probably isn't going to happen anytime soon.

Some devices, including the Meta Ray-Bans (if you live in the US), iPhone and Android phones, and apps for the likes of ChatGPT can describe your video feed in realtime, but you need to be quick about it unless you have a charger nearby.

Ever put your keys down when you came home and forgotten where you left them? Now imagine trying to search the house with your eyes closed and no ability to scan surfaces or spaces for the missing item, except by touch.

Enter [Oorion](https://www.oorion.fr/en), an app that's installed on your phone and that works with Meta Ray-Bans, thanks to the [Meta Wearables Device Access Toolkit](https://developers.meta.com/blog/introducing-meta-wearables-device-access-toolkit/). 

I could, for example, say "Oorion, find my laptop", and here's what would happen:

<video controls src="/media/2026/Desktop-scan-with-audio.mp4"></video>

<details>
<summary>Find laptop transcript</summary>
Male American Voice:
> Alright, I'm launching the search objects feature for "laptop". Please wait.
>
> Move your head slowly from side-to-side to scan the area.
>
> You're facing a desk. Try scanning to the left. 
>
> There's a black laptop on the desk just in front of you. You can reach out and grab it.
>
> Object found.
</details>

## Different cases

Broadly speaking, these use cases fall into two categories: AI as compensation and AI as augmentation.

The latter, where AI enables me to connect with the world around me, where there is no concept of human authored accessibility, no guarantee of available human assistance, where AI augments me in ways that most other people take for granted, is extra-ordinary and I'm not going to apologise for using it.

But the former, where AI is being used to compensate for missing human authored accessibility, where it's the only way for some people to exist independently in a world that requires digital interaction but is too often inaccessible, that's a different story altogether.

I [disagreed with Jacob Nielsen](/nielsen-needs-to-think-again/) when he said that accessibility had failed and AI generated UI would be the solution, and I still do.

Vibe coding, or more accurately vibe coding by people who don't know what good looks like, is not only making things worse, it's making things worse at a speed and scale hitherto unachieved by non-AI assisted humans.

For now, and for me at least, much of the web is accessible if not exactly effortless. But enough of it doesn't work to mean I have to find workarounds and alternatives for myself. These can include simulating mouse clicks with my screen reader, hacking the DOM with dev tools, using Optical Character Recognition (OCR),and  asking the nearest warm body for a few minutes of their time (again).

And frankly, I'm fed-up. I'm fed-up with not knowing what's in an image, fed-up with not being able to activate a link or a button, fed-up with date-pickers I can't even open, fed-up with having to ask for help, fed-up with not knowing, fed-up with the uncertainty, and I'm really, really fed-up with having to do the hard work because someone else hasn't.

So is it any wonder that people like me find the promise of AI agents that can do the heavy-lifting so compelling?

If you've made it this far and you're thinking "but what about the ethical implications of AI?", you're not the only one.

I think about it a lot. I also think about the ethical implications of not getting accessibility right when we have the opportunity.

The uncomfortable truth is that if we'd done a better job of making the web accessible, if we'd let the web realise its accessibility potential, far fewer people would be turning to AI to compensate now.

But the story isn't over yet.

Those of us who use AI to compensate but also recognise the need to [resist AI](https://airesistlist.org/) need your help. For 30 years we've been asked, silently and implicitly, to use a web that hasn't been designed or built for us, and AI offers us a solution.

Don't keep making us the ones who have to make the difficult decisions.

If you want to resist AI, make accessibility part of everything you do, every decision you make, every product you design and build. Remove the need for people to use AI to compensate, and remember, accessibility is resistance.