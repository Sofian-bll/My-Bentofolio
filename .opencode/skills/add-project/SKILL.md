---
name: add-project
description: Use when the user wants to add a new project to their Bentofolio portfolio, types /add-project, asks to "ajouter un projet", "créer un projet", or "nouveau projet". Also use when the user describes a project they built and mentions showcasing it or adding it to their portfolio. Do NOT use for editing existing projects — that's a different workflow.
---

# Add Project to Bentofolio

Conversational workflow to gather project metadata, validate it, and write the files via a standalone script.

## Core principle

**Never write files directly.** The workflow is: ask questions → confirm with user → run the script. The script handles validation, file paths, and format. You doing it manually leads to invalid categories, missing fields, and fabricated content.

## When NOT to use

- The user says "modifier", "update", "edit", "changer" an existing project
- The project already exists in `content/projects/<id>/` — the user means to update it

## Workflow

Follow this step-by-step. After each step, confirm before moving on.

### Step 1: Name → derive ID

Ask: "Quel est le nom du projet ?"

Derive the ID: lowercase, no accents, spaces → hyphens, strip special chars. Show the derived ID to the user immediately:
```
→ ID généré : "mon-projet"
```
If the ID already exists in `content/projects/`, warn the user: "Ce projet existe déjà. Tu veux le mettre à jour ou en créer un nouveau ?"

### Step 2: Categories

Ask: "Dans quelle(s) catégorie(s) ?"

Valid categories (exactly these): `dev`, `webdesign`, `3d`, `animation`, `logo`, `tooling`, `devops`, `ai`, `tools`.

Show the list to the user if they're unsure. Accept 1 or more.

### Step 3: Role

Ask: "Quel était ton rôle ?" (optional). Examples: "Solo", "Binôme", "Équipe (3)".

### Step 4: Dates

Ask: "Quand as-tu commencé ?" → derive `startDate` as YYYY-MM-DD. If user only gives a year, use YYYY-01-01.

Ask: "Quand as-tu fini ?" → derive `endDate` as YYYY-MM-DD or `null` if ongoing.

Show: `startDate: "2025-03-15" → endDate: null ("En cours")`.

Period and duration are computed automatically — do NOT ask for them.

### Step 5: Tech stack

Ask: "Quelles technos ?"

For each tech the user names, look it up in `config.json` → `skillPalette`. A match gives you the `tech` key, `label`, and `color`. Use those. If not in the palette, use `{ label: "Name", tech: "default", color: "#888888" }`.

Show the resolved techs with their colors.

### Step 6: Description and highlights

Ask for a one-sentence description (required, under 150 chars).

Ask for 3 highlights (optional). Keep them short, factual, no emojis (the list already uses bullet points).

### Step 7: URLs

Ask: "Une démo en ligne ?" (demoUrl, optional).
Ask: "Un repo GitHub ?" (repoUrl, optional).

### Step 8: Case study

Ask: "Tu veux une étude de cas ? (oui/non)"

If yes, guide the user through: Contexte (why this project exists), Process (how it was built), Difficultés (what was hard), Fiertés (what they're proud of), Si c'était à refaire.

Format as markdown with `##` headings. **Do NOT include a `## Stack` section** — the stack is rendered via tech pills separately. **Never fabricate content** — if the user doesn't provide it, don't invent it.

### Step 9: Final review

Show a summary of ALL gathered data in this format:

```
Projet : AppStore Scraper (appstore-scraper)
Catégories : dev, tools
Rôle : Solo
Dates : 2025-01-01 → 2025-09-04
Technos : Python (python, #3776ab)
Description : Scraper Python de l'App Store Apple...
Highlights :
  • Scrape 36 storefronts Apple
  • ...
Demo : https://...
Repo : https://...
Case study : oui (1942 caractères)
```

Ask: "Tout est bon ? Je lance le script ?"

### Step 10: Run the script

Build the JSON payload with ALL fields and run:

```bash
bun run .opencode/skills/add-project/scripts/add-project.ts '<JSON>'
```

The `caseStudy` field goes in the JSON as a string, not a separate file. The script handles writing both `project.json` and `case-study.md`, and updating `order.json`.

### Step 11: Verify

Run `bun run test` to confirm nothing broke. Tell the user: "Projet ajouté. Lance `bun dev` pour voir le résultat."

## JSON payload format

```json
{
  "name": "My Project",
  "categories": ["dev"],
  "role": "Solo",
  "featured": false,
  "startDate": "2025-01-01",
  "endDate": null,
  "description": "Short description.",
  "highlights": ["Point 1", "Point 2", "Point 3"],
  "techs": [
    { "label": "React", "tech": "react", "color": "#61dafb" }
  ],
  "demoUrl": "https://...",
  "repoUrl": "https://...",
  "image": "",
  "caseStudy": "## Contexte\n\n..."
}
```

Important:
- `startDate` is YYYY-MM-DD, never a bare year
- `endDate` is YYYY-MM-DD or `null`
- Do NOT include `period` or `duration` — they are computed at runtime
- `color` comes from the skill palette in `config.json`
- The script writes `content/projects/<id>/project.json` and `case-study.md`, and appends to `order.json`
- The script does NOT rebuild `index.json` — Vite HMR handles that

## Anti-patterns (from baseline failures)

| Don't | Why | Do instead |
|-------|-----|------------|
| Write project.json directly with `writeFileSync` | You'll use wrong fields, invalid categories, miss the schema | Use the script |
| Fabricate highlights or case study content | User may not agree, facts may be wrong | Ask the user, leave empty if they skip |
| Include `## Stack` in case study | Stack is rendered via tech pills, duplication is noise | Skip it |
| Use category names that aren't in the valid list | "tools" is not valid, only "tooling" is | Validate against the list |
| Overwrite existing project without warning | Existing data may be correct | Check if ID exists first, warn the user |
| Build the JSON manually in a `writeFileSync` | Wrong structure, missing validation | Use the script — it validates everything |
