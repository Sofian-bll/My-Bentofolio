# Bentofolio — Testing Guide

Test strategy, available suites, and how to write new tests.

## Overview

Bentofolio uses two test layers:

| Layer | Tool | Scope | Command |
|-------|------|-------|---------|
| **Unit tests** | Bun (`bun:test`) | Pure logic, data resolution, plugins | `bun test` |
| **E2E tests** | Playwright | Full browser interaction, visual smoke tests | `bun run test:e2e` |

Tests run in CI via `.github/workflows/deploy.yml` — `bun test` is executed before every build.

## Unit Tests

Run all unit tests:

```bash
bun test
```

This runs every file matching `*.test.js` or `*.test.jsx` in the project (Bun's default test pattern).

### Test File List

| File | Description |
|------|-------------|
| `vite-admin-plugin.test.js` | Tests for the Vite admin plugin: `parseConfigBody` JSON validation, path helpers, `sanitizeProjectId` slug generation and path traversal blocking, `readProjectOrder`/`updateProjectOrder` persistence, `buildProjectIndex` index generation |
| `admin-upload-utils.test.js` | Tests for `parseDataUrl` (base64 data URL parsing), `sanitizeFilename` (filename normalization), and `getMediaDir` path resolution |
| `app/data.test.js` | Validates that `DATA` exports are properly loaded from `config.json`: personal info fields, social links structure, project data integrity, category definitions, CV featured projects |
| `app/markdown-renderer.test.jsx` | Renders `Markdown` component to static HTML, verifies image tag conversion, figure/caption wrapping, and relative path resolution |
| `app/config-runtime.test.js` | Tests for config resolution pipeline: `getBrowserStorage` (localStorage abstraction), `getRuntimeConfigFromMessage` (postMessage filtering), `markFeaturedProjects` (featured flag application), `resolveAppConfig` (config merging with overrides) |
| `app/admin-save.test.js` | Tests `saveConfigToDisk` (POST to `/api/admin/save`, response handling, error propagation) and `clearAdminSaveOverrides` (localStorage cleanup) using injectable fetch |
| `app/admin-project-save.test.js` | Tests `saveProjectToContent` and `deleteProjectFromContent` using an injectable `_fetch` parameter for isolated API mocking |
| `app/project-gallery.test.js` | Tests `getProjectGalleryState`: category filtering, project sorting, empty state handling, and category extraction from project data |
| `app/project-content-loader.test.js` | Tests `buildProjectsFromContent`: ordering from `order.json`, case study merging, missing file handling, and module resolution |
| `app/cv-selection.test.js` | Tests `getFeaturedCvProjects`: filters only projects with `featured: true`, preserves source order, handles empty arrays |
| `content/projects.test.js` | Content integrity tests: verifies `order.json` exists and is valid JSON, checks every referenced project folder has a `project.json`, validates required fields (`id`, `name`, `categories`, `techs`, `role`, `period`, `duration`, `highlights`, `image`), ensures product photos exist |

### Running a Single Test File

```bash
bun test path/to/file.test.js
```

Examples:

```bash
bun test app/config-runtime.test.js
bun test vite-admin-plugin.test.js
bun test content/projects.test.js
```

### Running a Single Test Case

Use Bun's `--test-name-pattern` flag:

```bash
bun test --test-name-pattern "sanitizeProjectId" vite-admin-plugin.test.js
```

## E2E Tests

```bash
bun run test:e2e
```

**Important:** The dev server must be running on port 5173. The Playwright config sets `baseURL: http://localhost:5173`. Either start it manually (`bun dev`) or run both:

```bash
bun dev & bun run test:e2e
```

### E2E Test Suites

All 16 tests live in `e2e/tests.js`, organized into three suites:

#### Public UX (6 tests)

| Test | What it verifies |
|------|-----------------|
| Home page loads | Hero name, bento grid, and navbar are visible on `/#/` |
| Projects page loads | Project gallery renders with project cards on `/#/projets` |
| Experiences page loads | Page title contains "Experiences" on `/#/experiences` |
| CV page loads | A4 page frame and CV name are visible on `/#/cv` |
| Contact page loads | Page title contains "Contact" on `/#/contact` |
| Navigation works | Clicking nav links navigates to correct pages (Projets → Experiences → CV → Contact) |

#### Admin UX (8 tests)

| Test | What it verifies |
|------|-----------------|
| Login shows password input | Password field is visible on `/#/admin` |
| Correct password enters dashboard | Entering `bento` reveals `.dashboard-v5` |
| Sidebar shows all sections | All 8 sections (Projets, Experiences, Apparence, Profil, CV, Contact, Liens, Backup) are visible |
| Live preview renders content | The preview panel renders the home view component |
| Sections switch without crash | Navigating through Apparence, Profil, CV, Liens, Projets works |
| CV section no runtime errors | CV section opens and shows "CV" title with zero page errors |
| Focal controls separate | Home/CV tabs exist; clicking focal preview updates the position value |
| Case study image upload exposed | Modifying a project shows the "Insérer image étude de cas" button |
| Preview tabs work | Clicking Accueil, Projets, CV, Contact preview tabs switches views |

#### Preview Mode (1 test)

| Test | What it verifies |
|------|-----------------|
| Preview mode hides nav | `?preview` query parameter sets navbar to `display: none` |

## Writing New Tests

### Unit Tests

Follow **Test-Driven Development** (TDD):

1. Write the test first
2. Run `bun test` to see it fail
3. Implement the feature
4. Run `bun test` to see it pass

Use the Bun test API:

```js
import { describe, expect, test } from 'bun:test'

describe('component or module name', () => {
  test('describes what is being tested', () => {
    // Arrange
    const input = 'hello world'

    // Act
    const result = myFunction(input)

    // Assert
    expect(result).toBe('Hello World')
  })
})
```

### Unit Test Conventions

- **Pure functions where possible.** Keep logic testable without DOM or file system dependencies.
- **Injectable fetch for API tests.** Functions that call the network should accept an optional `_fetch` parameter so tests can inject a mock:
  ```js
  export async function saveConfigToDisk(config, _fetch = fetch) {
    const resp = await _fetch('/api/admin/save', { method: 'POST', body: JSON.stringify(config) })
    return resp.json()
  }
  ```
- **Avoid mocking the file system.** Tests in `vite-admin-plugin.test.js` use a temporary directory (`.tmp-plugin-test/`) for integration-style assertions rather than mocking `fs`.
- **Test project content integrity.** `content/projects.test.js` validates structural requirements across all content files.

### E2E Tests

Use Playwright's `test` and `expect`:

```js
import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:5173'

test('my feature', async ({ page }) => {
  await page.goto(BASE + '/index.html#/my-page')
  await page.waitForSelector('.my-element', { timeout: 5000 })
  await expect(page.locator('.my-element')).toBeVisible()
})
```

### E2E Conventions

- Use **CSS class selectors** for element targeting (`.my-element`, not XPath or fragile text selectors)
- Always set explicit **timeouts** on `waitForSelector` (5000ms default)
- Use **`data-testid`** attributes for elements that lack stable CSS classes
- Check for **page errors** when testing complex interactions:
  ```js
  const pageErrors = []
  page.on('pageerror', error => pageErrors.push(error.message))
  // ... test actions ...
  expect(pageErrors).toEqual([])
  ```
- E2E tests target `index.html#/...` URLs to match the hash-based routing
