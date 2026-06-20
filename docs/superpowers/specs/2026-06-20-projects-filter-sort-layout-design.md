# Projects Filter And Wide Layout Design

## Goal

Improve the projects page filter/sort area so it no longer overlaps or pushes the sort control awkwardly below the category filters, while making the portfolio layout wider and less cramped on large screens.

## Context

The current projects toolbar is one wrapping flex row in `app/projects.jsx` and `app/pages.css`. Category chips, spacer, sort control, and result count all compete for the same horizontal space. When the chips consume too much width, the sort control is displaced to a lower line.

The global shell width is defined in `app/components.css` with `1120px` max-width values for `.page-wrap`, `.navbar`, and `.footer-inner`.

The UXcel filtering and sorting guidance supports these decisions:

- Keep filtering and sorting available together because they solve different user needs.
- Show result counts near the controls.
- Avoid large horizontal filter areas that push results too far down.
- Keep mobile filter controls compact and accessible.

## Chosen Approach

Use a compact horizontal toolbar with two stable zones:

- Left zone: category filter chips.
- Right zone: result count and sort controls.

On desktop, the right zone remains aligned to the right and does not get pushed below the filters. If categories need more room, the left zone scrolls horizontally instead of forcing the whole toolbar to wrap badly.

On mobile, the toolbar stacks cleanly: filters remain horizontally scrollable, and result count plus sort stay in a compact row below or beside them depending on available width.

## Layout Changes

Increase global content width from `1120px` to `1440px` for:

- `.page-wrap`
- `.navbar`
- `.footer-inner`

This keeps the established visual system but lets the bento grid, projects grid, and detail pages breathe on large displays.

Update the projects controls markup in `app/projects.jsx`:

- Wrap category chips in a dedicated `.filter-chips` container.
- Wrap result count and sort controls in a dedicated `.filter-actions` container.
- Keep the existing filter and sort state model unchanged.

Update `app/pages.css`:

- Make `.filter-bar` a non-wrapping, aligned toolbar on desktop.
- Allow `.filter-chips` to horizontally scroll when needed.
- Keep `.filter-actions` fixed-size and right-aligned.
- Add responsive rules for small screens to stack the zones without overlap.

## Functional Scope

The implementation must preserve:

- Existing filters and counts.
- Existing sort choices: default, date, name.
- Existing sort directions for date and name.
- Existing project gallery state helpers and tests.

No new filter types, hidden filter drawer, search field, or view toggle will be added in this change.

## Testing

Run the existing unit tests after implementation:

```bash
npm test
```

Run a production build to catch CSS/JS integration issues:

```bash
npm run build
```

If practical, check the projects page at desktop and mobile widths to confirm there is no horizontal overflow and the sort control stays visible.
