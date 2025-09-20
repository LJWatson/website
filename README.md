# tink.uk site

[![Netlify Status](https://api.netlify.com/api/v1/badges/71696554-54db-49bc-9686-f58c711e5a5a/deploy-status)](https://app.netlify.com/sites/elated-thompson-d04e53/deploys)

Welcome aboard! This site runs off [Eleventy](https://www.11ty.dev/) and [Gulp](https://gulpjs.com/). The templates use [Nunjucks](https://mozilla.github.io/nunjucks/) and the CSS is written with [Sass](https://sass-lang.com/).

## Getting started 

Before anything, make sure you have [Node.js installed](https://nodejs.org/en/download/). It’s recommended that you use the LTS version of Node.js.

To run the site, first run `npm install` to install all of the dependencies.

Then:

1. To serve the site locally, run `npm start`
2. To build a production version of the site, run `npm run production`

When you run a production build of the site, the contents of the `dist` should be deployed to the server. If you use Netlify to host, the correct production config has been preset in `netlify.toml` for you.

Note to self: use this format when updating a post:

```
edited: "2025-06-10"
```
