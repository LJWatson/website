# AGENTS.md

## Core rules

- Prefer native platform features. Avoid unnecessary abstractions, dependencies, and libraries.
- Use semantic HTML.
- Prefer plain CSS and vanilla JavaScript.
- Prefer inline SVG when control, styling, or reuse matter.

## CSS rules

- Order all CSS properties alphabetically.
- Do not indent CSS declarations.
- Keep the closing curly brace on the same line as the last property.
- Do not use the `transform` shorthand property. Use individual transform properties (`rotate`, `scale`, `translate`).
- Prefer simple, shallow selectors and avoid deep selector chains.

## Motion

- Always respect `prefers-reduced-motion`.
- Motion should be subtle, purposeful, and non-disruptive.
- Use CSS for animation and JavaScript for triggers.

## Writing

- Use British English.
- Use sentence case for headings, interface copy, and labels.

## House style

- See `docs/html-css-style-guide.md` for preferred HTML and CSS naming patterns, accessibility conventions, and copy style examples.
