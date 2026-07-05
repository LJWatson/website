---
title: "Using Schema.org with microdata"
date: 2015-02-25
postTags: ["HTML", "Schema"]
postCategories: ["Code things"]
postSummary: "Search engines struggle to extract meaning from web content because information is presented so many different ways, but marking it up using schema.org vocabularies makes it easier and is very straightforward to do."
---

Search engines have ways of extracting meaning from content, but they're prone to error because information on the webb can be presented in so many different ways. Marking up information so it's easier for search engines to index is a good thing to do, and thanks to the vocabularies available from [schema.org](https://schema.org/) it's also very easy.

## Choosing schema.org

There are several different ways to markup web content so it's meaningful to search engines, but search engine support for each format is inconsistent. This makes it awkward for developers who must identify the schema that most closely matches their requirements.

The vocabularies available on schema.org are the result of a public collaboration led by Google, Microsoft, Yandex and Yahoo! This means that developers can choose a single format for marking up information that is supported by all four major search engines (Google, Bing, Yandex and Yahoo!).

## Using schema.org

The schema.org vocabularies can be used with [Microdata](https://en.wikipedia.org/wiki/Microdata_%28HTML%29), [RDFa](https://en.wikipedia.org/wiki/RDFa) or [JSON-LD](https://en.wikipedia.org/wiki/JSON-LD). Microdata and RDFa can both be dropped straight into HTML, and of the two Microdata is the easiest way to start using the schema.org vocabularies.

The posts in the [recipe book](/category/recipe-book/) category of this website use schema.org vocabularies with Microdata to markup information. The basic HTML looks something like this:

```html
<article>
  <h1>Scrambled eggs on toast</h1>
  <p>Recipe introduction...</p>

  <h2>Information</h2>
  <dl>
    <dt>Makes</dt>
    <dd>Two helpings.</dd>
    <dt>Time</dt>
    <dd>15 minutes.</dd>
  </dl>

  <h2>Ingredients</h2>
  <ul>
    <li>4 large eggs.</li>
    <li>90ml (6tbsp) single cream.</li>
    ...
  </ul>

  <h2>Method</h2>
  <ol>
    <li>Beat the eggs lightly...</li>
    ...
  </ol>

  <h2>Notes</h2>
  <p>Recipe notes...</p>
</article>
```

### The `itemscope` attribute

The first step is to establish the scope of the thing being marked up. We do this by adding the `itemscope` attribute to the element that contains the relevant content:

```html
<article itemscope>
  ...
</article>
```

### The `itemtype` attribute

The next step is to identify what type of thing it is. The [schemas](https://www.schema.org/docs/schemas.html) on schema.org are based on type, where each type has a set of properties that describe the thing in question. The schemas are arranged in a [hierarchy](https://www.schema.org/docs/full.html), with properties being inherited down through the ancestoral pathway.

The type that sits at the top of the hierarchy is [Thing](https://www.schema.org/Thing). It's the most generic of all the schema.org types, with properties like name and description. Types that inherit from Thing include [Event](https://www.schema.org/Event), [Organization](https://www.schema.org/Organization), [Place](https://www.schema.org/Place) and [CreativeWork](https://www.schema.org/CreativeWork).

One of the types that inherits from CreativeWork is [Recipe](https://www.schema.org/Recipe), which is exactly the type of thing we need here. The type is defined using the `itemtype` attribute with the URL for the Recipe schema as its value. The `itemtype` attribute is applied to the element that has the `itemscope` attribute:

```html
<article itemscope itemtype="https://www.schema.org/Recipe">
  ...
</article>
```

### The `itemprop` attribute

From here it's simply a matter of applying the relevant Recipe schema properties to the rest of the content. This is done using the `itemprop` attribute with the property name as its value.

The [name](https://www.schema.org/name) property is assigned to the heading that contains the name of the recipe:

```html
<article itemscope itemtype="https://www.schema.org/Recipe">
  <h1 itemprop="name">Scrambled eggs on toast</h1>
  ...
</article>
```

The [text](https://www.schema.org/Text) property is assigned to the introductory text at the start of the recipe, and can later be applied to the notes at the end of the recipe:

```html
<article itemscope itemtype="https://www.schema.org/Recipe">
  <h1 itemprop="name">Scrambled eggs on toast</h1>
  <p itemprop="text">Recipe introduction...</p>
  ...
</article>
```

The [recipeYield](https://www.schema.org/recipeYield) property is used to markup the number of servings the recipe will make.

The [totalTime](https://www.schema.org/totalTime) property is used to indicate the amount of time it will take to create the dish. The Recipe schema also includes properties for [prepTime](https://www.schema.org/prepTime) and [cookTime](https://www.schema.org/cookTime), should you want to break it down.

Properties relating to time must be presented in [ISO8601](https://en.wikipedia.org/wiki/ISO_8601) format. To do this and maintain human readability, the HTML5 [`time`](https://www.w3.org/TR/html/text-level-semantics.html#the-time-element) element is used:

```html
<article itemscope itemtype="https://www.schema.org/Recipe">
  <h1 itemprop="name">Scrambled eggs on toast</h1>
  <p itemprop="text">Recipe introduction...</p>

  <h2>Information</h2>
  <dl>
    <dt>Makes</dt>
    <dd itemprop="recipeYield">Two helpings.</dd>
    <dt>Time</dt>
    <dd><time datetime="PT0H15M" itemprop="totalTime">15 minutes.</time></dd>
  </dl>
  ...
</article>
```

The [ingredients](https://www.schema.org/ingredients) property is used to markup each of the recipe's ingredients, and the [recipeInstructions](https://www.schema.org/recipeInstructions) property is assigned to each of the steps that explain how to create the dish:

```html
<article itemscope itemtype="https://www.schema.org/Recipe">
  <h1 itemprop="name">Scrambled eggs on toast</h1>
  <p itemprop="text">Recipe introduction...</p>

  <h2>Information</h2>
  <dl>
    <dt>Makes</dt>
    <dd itemprop="recipeYield">Two helpings.</dd>
    <dt>Time</dt>
    <dd><time datetime="PT0H15M" itemprop="totalTime">15 minutes.</time></dd>
  </dl>

  <h2>Ingredients</h2>
  <ul>
    <li itemprop="ingredients">4 large eggs.</li>
    <li itemprop="ingredients">90ml (6tbsp) single cream.</li>
    ...
  </ul>

  <h2>Method</h2>
    <ol>
    <li itemprop="recipeInstructions">Beat the eggs lightly...</li>
    ...
  </ol>

  <h2>Notes</h2>
  <p itemprop="text">Recipe notes...</p>
</article>
```

The Recipe schema has many more properties that could be used, including [recipeCuisine](https://www.schema.org/recipeCuisine), [nutrition](https://www.schema.org/nutrition) and [cookingMethod](https://www.schema.org/cookingMethod). Properties from the CreativeWork schema could also be added to other posts on this site, including [about](https://www.schema.org/about), [comment](https://www.schema.org/comment), [datePublished](https://www.schema.org/datePublished) and [keywords](https://www.schema.org/keywords).

## Checking conformance

When you use any kind of markup it's worth checking it conforms to the standards you're using. The [Google structured data testing tool](https://developers.google.com/structured-data/testing-tool/) checks code snippets or a URL for conformance with the schema.org vocabularies.

That's how easy it is to start marking up your content so that Google, Bing, Yandex and Yahoo! Can reliably identify what it is. Should making things easier for search engines seem like wasted effort, it's worth bearing in mind that the better search engines get at identifying things, the better we'll all get at finding them!
