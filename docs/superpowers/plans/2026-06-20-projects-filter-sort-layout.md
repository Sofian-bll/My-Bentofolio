# Projects Filter Sort Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stabilize the projects filter/sort toolbar and widen the public portfolio layout to `1440px` on large screens.

**Architecture:** Keep the existing React state and gallery helpers unchanged. Restructure only the projects toolbar markup into filter and action zones, then adjust CSS layout rules and shell max-width tokens.

**Tech Stack:** React 18, Vite, plain CSS, Bun tests.

---

## File Structure

- Modify `app/projects.jsx`: split the filter toolbar into `.filter-chips` and `.filter-actions` containers without changing filter/sort behavior.
- Modify `app/pages.css`: replace the current wrapping `.filter-bar` rules with a stable responsive toolbar.
- Modify `app/components.css`: increase `.page-wrap`, `.navbar`, and `.footer-inner` max-width from `1120px` to `1440px`.
- Verify with `npm test` and `npm run build`.

### Task 1: Restructure Projects Toolbar Markup

**Files:**
- Modify: `app/projects.jsx:131-157`

- [ ] **Step 1: Update toolbar JSX**

Replace the existing `.filter-bar` contents with this structure:

```jsx
<div className="filter-bar">
  <div className="filter-chips" aria-label="Filtrer les projets par catégorie">
    <button className={'filter-chip filter-chip--all' + (activeFilter === 'all' ? ' active' : '')}
      style={{ '--fc': 'var(--accent)' }} onClick={() => setFilter('all')}>
      <Icon name="grid" size={14} /> Tous <span className="count">{projects.length}</span>
    </button>
    {catKeys.map((k) => (
      <button key={k} className={'filter-chip' + (activeFilter === k ? ' active' : '')}
        style={{ '--fc': categories[k].color }} onClick={() => setFilter(k)}>
        <Icon name={categories[k].glyph} size={14} /> {categories[k].label}
        <span className="count">{counts[k]}</span>
      </button>
    ))}
  </div>
  <div className="filter-actions">
    <span className="filter-result">{shown.length} projet{shown.length > 1 ? 's' : ''}</span>
    <div className="sort-group">
      <select className="sort-select" value={sortBy} onChange={(e) => handleSortBy(e.target.value)} aria-label="Trier par">
        <option value="default">Par défaut</option>
        <option value="date">Période</option>
        <option value="name">Nom</option>
      </select>
      {sortBy !== 'default' && (
        <button className="sort-dir-btn" onClick={toggleDir} aria-label={sortAsc ? 'Ordre décroissant' : 'Ordre croissant'}>
          {sortAsc ? '▲' : '▼'}
        </button>
      )}
    </div>
  </div>
</div>
```

- [ ] **Step 2: Run unit tests**

Run: `npm test`

Expected: existing project gallery tests still pass because helper behavior is unchanged.

### Task 2: Stabilize Toolbar CSS

**Files:**
- Modify: `app/pages.css:6-45`

- [ ] **Step 1: Replace toolbar CSS**

Use these rules:

```css
.filter-bar {
  display: flex; gap: var(--s3); align-items: center; justify-content: space-between;
  margin-bottom: var(--s6); min-width: 0;
}
.filter-chips {
  display: flex; gap: var(--s2); align-items: center;
  flex: 1 1 auto; min-width: 0; overflow-x: auto; padding-bottom: 2px;
  scrollbar-width: none;
}
.filter-chips::-webkit-scrollbar { display: none; }
.filter-chip {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 8px 15px; border-radius: var(--radius-pill);
  border: 1px solid var(--border); background: var(--bg-card);
  font-size: var(--text-base); font-weight: 600; color: var(--text-2);
  transition: all var(--dur-fast) var(--ease); flex: 0 0 auto;
}
.filter-chip:hover { border-color: var(--text-2); color: var(--text); }
.filter-chip.active { color: #fff; border-color: transparent; background: var(--fc, var(--accent)); }
.filter-chip--all.active { background: var(--accent); color: var(--accent-fg); }
.filter-chip .count { font-size: 11px; opacity: 0.7; font-weight: 700; }
.filter-actions {
  display: flex; align-items: center; justify-content: flex-end; gap: var(--s3);
  flex: 0 0 auto;
}
.filter-result { font-size: var(--text-sm); color: var(--text-2); white-space: nowrap; }
.sort-group {
  display: inline-flex; align-items: center; gap: 4px;
}
```

- [ ] **Step 2: Add mobile CSS**

Add this immediately after `.sort-dir-btn:hover`:

```css
@media (max-width: 700px) {
  .filter-bar { flex-direction: column; align-items: stretch; gap: var(--s2); }
  .filter-actions { justify-content: space-between; width: 100%; }
  .sort-select { width: 100%; max-width: 180px; }
}
```

### Task 3: Widen Public Shell

**Files:**
- Modify: `app/components.css:7-16`
- Modify: `app/components.css:46-47`

- [ ] **Step 1: Change max-width values**

Update these declarations:

```css
.page-wrap {
  width: 100%; max-width: 1440px; margin: 0 auto;
  padding: 88px var(--s4) var(--s10);
  flex: 1;
}

.navbar {
  position: fixed; top: var(--s3); left: 50%; transform: translateX(-50%);
  width: calc(100% - var(--s6)); max-width: 1440px; height: 56px;
```

Update footer:

```css
.footer-inner {
  max-width: 1440px; margin: 0 auto;
```

### Task 4: Verify

**Files:**
- No source changes.

- [ ] **Step 1: Run tests**

Run: `npm test`

Expected: all listed Bun tests pass.

- [ ] **Step 2: Run build**

Run: `npm run build`

Expected: Vite production build completes successfully.

- [ ] **Step 3: Inspect changed files**

Run: `git diff -- app/projects.jsx app/pages.css app/components.css docs/superpowers/specs/2026-06-20-projects-filter-sort-layout-design.md docs/superpowers/plans/2026-06-20-projects-filter-sort-layout.md`

Expected: diff only contains the approved toolbar, width, spec, and plan changes.
