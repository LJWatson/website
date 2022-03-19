---
title: "Using a custom domain with multiple Github repositories"
date: "2017-07-02"
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

It's possible to use a single custom domain with multiple [Github](https://github.com) repositories that use [Github Pages](https://pages.github.com/). The available documentation makes it seem more complicated than it is, so this is an effort to provide some more simple instructions.

This post assumes you have a custom domain you want to use, and a Github account with one (or more) repositories that have a gh-pages branch. In my case **tink.uk** is the domain I want to use, and **ljwatson.github.io** is the root for the repositories that use gh-pages.

## Create sub-domains for each repository

You need to create a custom sub-domain for each repository. To do this, you need to edit the zone file for your custom domain. The way to do this depends on where your domain is registered, so check out the help documentation provided by your domain registrar.

Add a CNAME record to your zone file for each sub-domain you want to create. I created four sub-domains for **tink.uk**, using the following CNAME records:

Example CNAME records

Name

Type

TTL

Value

decks

CNAME

1800

ljwatson.github.io.

design-patterns

CNAME

1800

ljwatson.github.io.

playground

CNAME

1800

ljwatson.github.io.

test-cases

CNAME

1800

ljwatson.github.io.

When you've added all the CNAME records, save your changes and make sure your custom domain is using the updated zone file.

Meanwhile, you need to configure each Github repository to recognise the sub-domain name you've just created for it. To do this, go to the Github page for each repository, and in **Settings** add the sub-domain to the **Custom domain** field (don't forget to save it).

Once the CNAME records have propagated, you'll be able to use the sub-domain to reference the gh-pages branch of your Github repositories. For example, [design-patterns.tink.uk](https://design-patterns.tink.uk) instead of [ljwatson.github.io/design-patterns/](https://ljwatson.github.io/design-patterns).

Thanks to [Dan Hopkins](https://twitter.com/perlbod) for his help.
