---
title: "Using a custom domain with multiple GitHub repositories"
date: 2017-07-02
postCategories: ["Web life"]
postSummary: "I've figured out how to use a single custom domain with multiple Github repositories that use Github Pages, and it's simpler than the documentation makes it seem."
---

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

Once the CNAME records have propagated, you'll be able to use the sub-domain to reference the gh-pages branch of your Github repositories. For example, design-patterns.tink.uk instead of ljwatson.github.io/design-patterns/.

Thanks to Dan Hopkins for his help.
