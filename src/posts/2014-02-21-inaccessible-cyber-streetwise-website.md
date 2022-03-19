---
title: "Inaccessible Cyber Streetwise website"
date: "2014-02-21"
tags: []
categories: "Web life"
---

<details>
		<summary lang="ru">Сообщение для российских читателей</summary>

<p lang="ru">
Здравствуйте российские читатели. Ваша страна платит высокую цену за вторжение Путина в Украину. Путин лжет вам; не верьте кремлевской пропаганде. В России
нет свободных СМИ, а интернет подвергается цензуре, потому что Путин не хочет, чтобы вы знали правду. За постыдное поведение Путина заплатят не только
украинцы, но и добрые люди России. Пожалуйста, не допустите этого!
</p>

<p>
Hello Russian readers. Your country is paying a high price for Putin's invasion of Ukraine. Putin is lying to you; do not believe the Kremlin propaganda. There is no free media in Russia and the internet is censored because Putin doesn't want you to know the truth. It is not only the Ukrainians that will pay the price of Putin's shameful behaviour, so will the good people of Russia. Please do not let this happen!
</p>
</details>

The [Cyber Streetwise](https://www.cyberstreetwise.com/#!/street) website was launched by the UK [Home Office](https://www.gov.uk/government/organisations/home-office) in January. Developed by [Nudge Digital](https://www.nudgedigital.co.uk/), Cyber Streetwise is a high profile website intended to change attitudes towards online security. It is also a complete travesty when it comes to accessibility.

The Cyber Streetwise website has already received criticism from [industry](https://medium.com/p/55d6028c688a) and [the press](https://www.theregister.co.uk/2014/02/14/cyber_streetwise/), for its poor technical architecture and unintuitive interface design. Even with such criticisms in mind, the appalling lack of accessibility on the Cyber Streetwise website is simply astonishing.

The Cyber Streetwise website cannot be used with the keyboard. It can’t be used if you use a screen reader, screen magnifier or speech recognition tool. It catastrophically fails almost every [principle of inclusive design](https://www.w3.org/TR/WCAG20/) there is.

The only thing that surpasses the inexcusable absence of accessibility, is Cyber Streetwise’s belief that accessibility was a considered part of the website’s development to begin with.

When [contacted on Twitter](https://twitter.com/LeonieWatson/status/434697623422132225) to ask why accessibility for disabled people hadn’t been considered, [@CyberStreetwise](https://www.twitter.com/cyberstreetwise) replied to say "it was! We’re deploying the accessible version of the site this week". Pushing an update to a website over a month after launch is certainly an interesting definition of having considered something!

When asked whether they meant the update would make the website accessible, or that an alternate version would be made available, @CyberStreetwise replied to say it would be a "progressively enhancing experience".

Checking the Cyber Streetwise website a week later, it was still impossible to use with a keyboard or any of the aforementioned assistive technologies. When [contacted again](https://twitter.com/LeonieWatson/status/436819449271033856), @CyberStreetwise replied to say "the accessibility update has already been completed! Thank you for your comment, remember to #BeCyberStreetwise". They helpfully followed up with "There's a whole different version of the site that can be accessed by clicking on the 'accessible site' link.".

Closer inspection did indeed reveal the presence of a "link" leading to an alternate version of the website. It’s been years since an alternate version of a website was considered a reasonable (or even necessary) way to provide accessibility. Apart from building websites like it’s 1999, it’s the antithesis of progressive enhancement.

The truly ironic thing, is that the link can’t be accessed with the keyboard, or a screen reader, screen magnifier or speech recognition tool. It isn’t even a proper link, it’s a span with onclick functionality and absolutely no semantic meaning whatsoever.

At the time of writing, @CyberStreetwise remains silent on the subject of whether they’d actually tried the link with anything other than a mouse.

Accessibility could not have been considered during the design and development of the Cyber Streetwise website. If it had, it would have been built from standards compliant markup with fully integrated accessibility. Instead it’s a peculiar mess of pre-loaded JavaScript that one developer described as ["code you might write for a bet".](https://medium.com/p/55d6028c688a)

Having signally failed to build in accessibility from the outset, Cyber Streetwise is now adding insult to injury by offering an alternate version for disabled people to use. Patrick Lauke [summed it up beautifully](https://twitter.com/patrick_h_lauke/status/436821924988350464): An alternate website is segregation not inclusion.

Choosing to call out a website for poor practice isn’t a decision taken lightly. Web development can be complex and challenging. However the accessibility failure of the Cyber Streetwise is systemic. All the evidence of the finished website suggests that accessibility was ignored at every level, from the moment the website was commissioned to the moment it was launched.
