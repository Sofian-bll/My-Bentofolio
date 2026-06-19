# Portfolio Pipeline Re-architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-architect the `portfolio-polish` pipeline into a coherent 10-step / 6-phase flow where each step's output feeds the next, replacing the internal template-fill site system with the superior `site-github` skill, removing the redundant `portfolio-index`, and integrating `add-project` as the terminal Bentofolio showcase step.

**Architecture:** The pipeline polishes a project's OWN repo through phases 1-5 (audit → hygiene → identity → docs → web presence), then phase 6 adds the project as a card to the SEPARATE Bentofolio portfolio repo. The key insight that drove this design: `add-project` operates on a different target (`My-Bentofolio/content/projects/`) than every other step (which operate on the project being polished), so it must be terminal — and it consumes the deployed-site screenshot as its card image. Logo becomes a single step with two user-selectable options (instant SVG vs Gemini prompt). Three orphan/competing systems are eliminated.

**Tech Stack:** Markdown SKILL.md files (opencode skill format with YAML frontmatter), bash orchestration, existing bundled scripts (generate-logo.js, capture-wireframe.sh, add-project.ts), gh CLI for Pages deploy.

---

## File Structure

Files MODIFIED:
- `~/.config/opencode/skills/portfolio/portfolio-polish/SKILL.md` — master orchestrator, full rewrite of Pipeline / Execution / Finalization / Requirements / Quick Reference / Common Mistakes sections
- `~/.config/opencode/skills/portfolio/portfolio-audit/SKILL.md` — remove phantom skill references in "See Also"

Files DELETED:
- `~/.config/opencode/skills/portfolio/portfolio-polish/scripts/build-site-config.py`
- `~/.config/opencode/skills/portfolio/portfolio-polish/scripts/fill-site.py`
- `~/.config/opencode/skills/portfolio/portfolio-polish/scripts/polish-pipeline.sh`
- `~/.config/opencode/skills/portfolio/portfolio-polish/assets/site-template.html`
- `~/.config/opencode/skills/portfolio/portfolio-index/` (entire directory)

Files KEPT AS-IS (no change, verified):
- `portfolio-logo/SKILL.md`, `portfolio-license/SKILL.md`, `portfolio-release/SKILL.md`, `portfolio-wireframe/SKILL.md`, `portfolio-prompt-builder/SKILL.md`
- `add-project/SKILL.md` (in Bentofolio workspace)
- `site-github` skill (separate top-level skill)

---

## Task 1: Snapshot baseline + verify current state

**Files:**
- Read: `~/.config/opencode/skills/portfolio/portfolio-polish/SKILL.md`

- [ ] **Step 1: Snapshot the polish skill before editing**

```bash
cp -r ~/.config/opencode/skills/portfolio/portfolio-polish /tmp/portfolio-polish-snapshot
ls /tmp/portfolio-polish-snapshot
```

Expected: SKILL.md, scripts/, assets/ listed.

- [ ] **Step 2: Confirm the files slated for deletion exist**

```bash
ls -la ~/.config/opencode/skills/portfolio/portfolio-polish/scripts/build-site-config.py \
       ~/.config/opencode/skills/portfolio/portfolio-polish/scripts/fill-site.py \
       ~/.config/opencode/skills/portfolio/portfolio-polish/scripts/polish-pipeline.sh \
       ~/.config/opencode/skills/portfolio/portfolio-polish/assets/site-template.html \
       ~/.config/opencode/skills/portfolio/portfolio-index/SKILL.md
```

Expected: all five paths exist.

---

## Task 2: Delete obsolete site-template-fill system and portfolio-index

**Files:**
- Delete: 4 files in portfolio-polish + the portfolio-index directory

- [ ] **Step 1: Delete the template-fill scripts and asset**

```bash
rm ~/.config/opencode/skills/portfolio/portfolio-polish/scripts/build-site-config.py
rm ~/.config/opencode/skills/portfolio/portfolio-polish/scripts/fill-site.py
rm ~/.config/opencode/skills/portfolio/portfolio-polish/scripts/polish-pipeline.sh
rm ~/.config/opencode/skills/portfolio/portfolio-polish/assets/site-template.html
```

- [ ] **Step 2: Delete the redundant portfolio-index skill**

```bash
rm -rf ~/.config/opencode/skills/portfolio/portfolio-index
```

- [ ] **Step 3: Verify deletions and clean empty dirs**

```bash
ls ~/.config/opencode/skills/portfolio/portfolio-polish/scripts/ 2>/dev/null
ls ~/.config/opencode/skills/portfolio/portfolio-polish/assets/ 2>/dev/null
ls ~/.config/opencode/skills/portfolio/ | grep -c portfolio-index
# remove assets/ dir if now empty
rmdir ~/.config/opencode/skills/portfolio/portfolio-polish/assets 2>/dev/null || true
```

Expected: build-site-config.py / fill-site.py / polish-pipeline.sh gone; site-template.html gone; `grep -c portfolio-index` returns 0.

---

## Task 3: Rewrite portfolio-polish frontmatter + Pipeline section

**Files:**
- Modify: `~/.config/opencode/skills/portfolio/portfolio-polish/SKILL.md:1-44`

- [ ] **Step 1: Update the frontmatter description**

Replace lines 1-4:

```markdown
---
name: portfolio-polish
description: Use when polishing portfolio projects, running /polish, or applying quality standards (licenses, releases, logos, README, landing pages) across multiple repos.
---
```

with:

```markdown
---
name: portfolio-polish
description: Use when polishing a portfolio project, running /polish, or applying quality standards (audit, license, release, logo, readme, landing page, deploy, Bentofolio showcase) to a project repo.
---
```

- [ ] **Step 2: Replace the Pipeline section**

Replace the entire block from `## Pipeline` through the optional-step fence (current lines 24-44) with:

````markdown
## Pipeline

The pipeline runs in 6 phases. Each step's output feeds the next: the logo is embedded by the README and the site; the deployed site is screenshotted; the screenshot becomes the Bentofolio card image.

```
PHASE 1 — Évaluer
  1. audit         portfolio-audit          -> score 0-6 + gap report

PHASE 2 — Hygiène repo
  2. license       portfolio-license        -> MIT (if missing)
  3. release       portfolio-release        -> tag v1.0.0 (if no tags)

PHASE 3 — Identité & assets
  4. logo          CHOICE per project:
                   A) portfolio-logo         -> instant deterministic SVG (assets/logo.svg)
                   B) portfolio-prompt-builder -> Gemini prompt -> user PNG (docs/assets/logo.png)
  5. wireframe     portfolio-wireframe       -> opt-in: architecture diagram / UI mockup

PHASE 4 — Documentation
  6. readme        readme-wizard --bilingual -> README.md (+ embeds logo, wireframe if present)

PHASE 5 — Présence web
  7. site          site-github               -> design-first single-file docs/index.html
  8. deploy        gh api                    -> GitHub Pages from /docs on main
  9. screenshot    Playwright                -> capture deployed page -> docs/assets/screenshot.png

PHASE 6 — Vitrine (targets the SEPARATE Bentofolio repo, not this project)
 10. add-project   add-project (Bentofolio)  -> portfolio card using the screenshot as image
```

**Step targets — critical distinction:** Steps 1-9 operate on the project's OWN repo. Step 10 operates on the separate Bentofolio repo (`My-Bentofolio/content/projects/`). That is why add-project is terminal: it consumes the finished, deployed, screenshotted project and registers it in the portfolio gallery.

**Logo (step 4) is a single step with two options.** In checkpoint mode, ask the user which they want:
- **A — Instant SVG:** zero wait, deterministic, good default. Runs `portfolio-logo`.
- **B — Gemini prompt:** higher quality, human-in-the-loop. Runs `portfolio-prompt-builder` (logo half only) to build the prompt; user generates a PNG in Gemini and returns it.

In auto mode, default to option A (instant SVG).

**Optional step:** wireframe (step 5) is opt-in. Include it with `--steps all` or when explicitly requested.
````

---

## Task 4: Rewrite Phase 4 Execution section

**Files:**
- Modify: `~/.config/opencode/skills/portfolio/portfolio-polish/SKILL.md` — the "### Phase 4 — Execution" block (current lines ~104-232)

- [ ] **Step 1: Replace the entire Phase 4 Execution body**

Replace everything from `### Phase 4 — Execution` up to (but not including) `### Phase 5 — Finalization` with:

````markdown
### Phase 4 — Execution

Execute steps in order for each project. Skip steps the audit marked as already complete. Steps 1-9 target the project repo; step 10 targets the Bentofolio repo.

**1. License** — if missing, invoke `portfolio-license`
```
Use portfolio-license skill to add MIT license to <project-path>. Commit the LICENSE file.
```

**2. Release** — if no tags, invoke `portfolio-release`
```
Use portfolio-release skill to tag v1.0.0 in <project-path>. Push the tag if a remote is configured.
```

**3. Logo** — single step, two options. In checkpoint mode ask which; in auto mode use option A.

Option A — instant SVG:
```
node ~/.config/opencode/skills/portfolio/portfolio-logo/scripts/generate-logo.js "<Project Name>" --output <project-path>/assets/logo.svg
```

Option B — Gemini prompt:
```
Use portfolio-prompt-builder skill to build a logo prompt for <project-path>.
Ask the user for the logo concept (monogram / abstract / mascot / describe).
Present the completed prompt. The user generates a 2K 1:1 PNG in Gemini and returns it.
Save the result to <project-path>/docs/assets/logo.png and commit.
```

**4. Wireframe (opt-in only)** — runs before README so the README can embed it. Invoke only with `--steps all` or on explicit request.
```
Use portfolio-wireframe skill on <project-path>. It detects project type:
web -> gsd-sketch, non-web -> excalidraw-diagram. Output saved to assets/.
```

**5. README** — invoke `readme-wizard --bilingual`
```
Use readme-wizard skill with --bilingual on <project-path>.
Embed the logo (assets/logo.svg or docs/assets/logo.png) if present.
Embed the wireframe/architecture diagram if step 4 produced one.
Generate README.md (primary) + README.fr.md or README.en.md.
```

**6. Site** — invoke `site-github` (replaces the old template-fill system)
```
Use site-github skill on <project-path>.
It produces a design-first single-file docs/index.html:
follows the mandatory design plan (audience + world + unique visual signature),
prefers plain HTML/CSS zero-deps, uses the project logo, and self-critiques
against generic AI-slop defaults. Review the result with the user.
```
Then create `docs/.nojekyll` and commit `docs/`.

**7. Deploy** — configure GitHub Pages via `gh`
```
Step A: git add docs/ assets/ && git commit -m "docs: add landing page" && git push
Step B: gh api repos/{owner}/{repo}/pages
        - 404 -> gh api repos/{owner}/{repo}/pages -X POST -f "source[branch]=main" -f "source[path]=/docs"
        - 200 -> gh api repos/{owner}/{repo}/pages -X PUT  -f "source[branch]=main" -f "source[path]=/docs"
Step C: report https://{owner}.github.io/{repo}/
```

**8. Screenshot** — capture the deployed page (feeds step 10)
```
After the site is live, capture a 1920x1080 (16:9) screenshot of
https://{owner}.github.io/{repo}/ via Playwright and save it to
<project-path>/docs/assets/screenshot.png.
If Playwright is unavailable or the capture fails, skip gracefully with a warning —
step 10 will fall back to no image.
git add docs/assets/screenshot.png && git commit -m "add screenshot" && git push
```

**Execution order per project (steps 1-9):**
```
license -> release -> logo (A or B) -> [wireframe] -> readme -> site -> deploy -> screenshot
```
````

---

## Task 5: Replace Phase 5 Finalization with the add-project showcase step

**Files:**
- Modify: `~/.config/opencode/skills/portfolio/portfolio-polish/SKILL.md` — the "### Phase 5 — Finalization" block (current lines ~234-259)

- [ ] **Step 1: Replace the Finalization section**

Replace everything from `### Phase 5 — Finalization` up to (but not including) the next top-level `## ` heading with:

````markdown
### Phase 5 — Showcase (add to Bentofolio)

This phase targets the SEPARATE Bentofolio repo, not the project that was just polished.

**10. add-project** — register the polished project as a Bentofolio portfolio card.

The `add-project` skill lives in the Bentofolio workspace at
`/Users/sofian/Developer/10-Personal/My-Bentofolio/.opencode/skills/add-project/`.
Invoke it from that working directory.

```
Use add-project skill to add <Project Name> to the Bentofolio portfolio.
Pass the deployed site as demoUrl (https://{owner}.github.io/{repo}/),
the repo as repoUrl, and the screenshot captured in step 9
(<project-path>/docs/assets/screenshot.png) as the card image —
copy it into Bentofolio's public/media/projects/<id>/ and set the image field.
Follow the skill's conversational workflow: it asks before writing,
never fabricates highlights or case study content.
```

If step 9 produced no screenshot, proceed with an empty image field — the user can add one later via the Bentofolio admin.

### Phase 6 — Summary

After the project is polished and showcased, present a summary:

```
Portfolio polish complete — <Project Name>

  Score:    <before>/6 -> <after>/6
  License:  <MIT added | already present>
  Release:  <v1.0.0 tagged | already tagged>
  Logo:     <SVG | Gemini PNG>
  README:   <bilingual updated>
  Site:     https://{owner}.github.io/{repo}/
  Bentofolio: card added (content/projects/<id>/)
```
````

---

## Task 6: Update Logo Prompt Template, Site Template, Requirements, Quick Reference, Common Mistakes

**Files:**
- Modify: `~/.config/opencode/skills/portfolio/portfolio-polish/SKILL.md` — remaining sections after Phase 6

- [ ] **Step 1: Remove the obsolete "## Site Template" section**

Delete the entire `## Site Template` section (it references the deleted `assets/site-template.html`). The site is now produced by `site-github`, which carries its own template.

- [ ] **Step 2: Keep the "## Logo Prompt Template" section but scope it**

Leave the existing Logo Prompt Template block in place, but add this sentence immediately under its heading:

```markdown
This template is used only for logo option B (Gemini prompt). It is built by `portfolio-prompt-builder`; reproduced here for reference.
```

- [ ] **Step 3: Replace the "## Requirements" section**

Replace the Requirements section body with:

````markdown
## Requirements

**REQUIRED SUB-SKILLS:** Use `dispatching-parallel-agents` for parallel audit dispatch (Phase 2 discovery). Use `subagent-driven-development` for execution — dispatch one implementer subagent per step.

Skills used by the pipeline:
- `portfolio-audit` (step 1)
- `portfolio-license` (step 2)
- `portfolio-release` (step 3)
- `portfolio-logo` (step 4, option A — instant SVG)
- `portfolio-prompt-builder` (step 4, option B — Gemini logo prompt; logo half only)
- `portfolio-wireframe` (step 5, opt-in)
- `readme-wizard` (step 6, `--bilingual`)
- `site-github` (step 7 — replaces the old internal template system)
- `add-project` (step 10 — lives in the Bentofolio workspace)
````

- [ ] **Step 4: Replace the "## Quick Reference" table**

Replace the Quick Reference table with:

````markdown
## Quick Reference

| # | Phase | Step | Skill / Tool | Output |
|---|-------|------|--------------|--------|
| 1 | Évaluer | Audit | `portfolio-audit` | score + gaps |
| 2 | Hygiène | License | `portfolio-license` | MIT LICENSE |
| 3 | Hygiène | Release | `portfolio-release` | tag v1.0.0 |
| 4 | Identité | Logo | `portfolio-logo` (SVG) **or** `portfolio-prompt-builder` (Gemini) | logo asset |
| 5 | Identité | Wireframe (opt-in) | `portfolio-wireframe` | diagram / mockup |
| 6 | Docs | README | `readme-wizard --bilingual` | README + logo |
| 7 | Web | Site | `site-github` | docs/index.html |
| 8 | Web | Deploy | `gh api` | Pages on /docs |
| 9 | Web | Screenshot | Playwright | docs/assets/screenshot.png |
| 10 | Vitrine | add-project | `add-project` (Bentofolio) | portfolio card |
````

- [ ] **Step 5: Update the "## Common Mistakes" section**

Replace the Common Mistakes body with:

````markdown
## Common Mistakes

- **Putting add-project mid-pipeline**: It targets the Bentofolio repo, not the project repo. It must be the terminal step (10) so it can use the deployed site URL and screenshot.
- **Running screenshot before deploy**: The site must be live first. Deploy (8) then screenshot (9).
- **Running add-project before screenshot**: The card image comes from the step-9 screenshot. Order matters.
- **Forgetting `.nojekyll`**: GitHub Pages skips underscore-prefixed dirs without it. Always create `docs/.nojekyll`.
- **Treating logo as two steps**: It is ONE step with two options (SVG or Gemini). Ask once, pick one.
- **Using the old template-fill site system**: It has been removed. Site generation is `site-github` only.
````

- [ ] **Step 6: Verify the rewritten skill is coherent**

```bash
grep -n "build-site-config\|fill-site\|portfolio-index\|site-template.html\|polish-pipeline" ~/.config/opencode/skills/portfolio/portfolio-polish/SKILL.md
```

Expected: no matches (all obsolete references removed).

---

## Task 7: Clean phantom skill references in portfolio-audit

**Files:**
- Modify: `~/.config/opencode/skills/portfolio/portfolio-audit/SKILL.md:160-163`

- [ ] **Step 1: Read the See Also section**

```bash
tail -8 ~/.config/opencode/skills/portfolio/portfolio-audit/SKILL.md
```

- [ ] **Step 2: Replace the phantom references**

Replace the `## See Also` section (which references the non-existent `portfolio-scorecard` and `portfolio-fix`) with:

```markdown
## See Also

- `portfolio-polish` — runs this audit as step 1 of the full pipeline.
```

- [ ] **Step 3: Verify**

```bash
grep -n "portfolio-scorecard\|portfolio-fix" ~/.config/opencode/skills/portfolio/portfolio-audit/SKILL.md
```

Expected: no matches.

---

## Task 8: Add cross-skill reference in add-project + final verification

**Files:**
- Modify: `/Users/sofian/Developer/10-Personal/My-Bentofolio/.opencode/skills/add-project/SKILL.md`

- [ ] **Step 1: Add a note that add-project is the terminal step of portfolio-polish**

Add this section near the end of the add-project SKILL.md (before any final reference section):

```markdown
## Pipeline Integration

This skill is the terminal step (10) of the `portfolio-polish` pipeline. When invoked from that pipeline, the project has already been polished, deployed, and screenshotted. The `image` field should receive the deployed-site screenshot (`<project-path>/docs/assets/screenshot.png`), copied into `public/media/projects/<id>/`. The `demoUrl` is the GitHub Pages URL and `repoUrl` is the project repo.
```

- [ ] **Step 2: Verify the full pipeline references resolve**

```bash
grep -n "site-github\|add-project\|portfolio-logo\|portfolio-prompt-builder\|portfolio-wireframe\|readme-wizard" ~/.config/opencode/skills/portfolio/portfolio-polish/SKILL.md | head -20
```

Expected: all step skills referenced, no obsolete ones.

- [ ] **Step 3: Confirm the portfolio skill directory is clean**

```bash
ls ~/.config/opencode/skills/portfolio/
```

Expected: portfolio-audit, portfolio-license, portfolio-logo, portfolio-polish, portfolio-prompt-builder, portfolio-release, portfolio-wireframe, logo-generator (NO portfolio-index).

---

## Task 9: Commit the changes

**Files:**
- The portfolio skills live in `~/.config/opencode/skills/` — check if it is a git repo before committing.

- [ ] **Step 1: Determine if the config skills dir is version-controlled**

```bash
cd ~/.config/opencode && git rev-parse --is-inside-work-tree 2>/dev/null && git status --short skills/portfolio/ || echo "NOT_A_GIT_REPO"
```

- [ ] **Step 2a: If it IS a git repo — stage and commit**

```bash
cd ~/.config/opencode
git add skills/portfolio/portfolio-polish/ skills/portfolio/portfolio-audit/SKILL.md
git rm -r --cached skills/portfolio/portfolio-index 2>/dev/null || true
git commit -m "refactor(portfolio): re-architect polish pipeline into 6-phase flow

- replace internal template-fill site system with site-github skill
- remove redundant portfolio-index (Bentofolio gallery covers it)
- logo becomes one step with two options (SVG or Gemini)
- integrate add-project as terminal Bentofolio showcase step
- remove phantom skill refs in portfolio-audit"
```

- [ ] **Step 2b: If NOT a git repo — note it and skip**

State to the user that `~/.config/opencode/skills/` is not version-controlled, so the changes are applied on disk but not committed.

- [ ] **Step 3: Commit the add-project cross-reference in the Bentofolio repo**

```bash
cd /Users/sofian/Developer/10-Personal/My-Bentofolio
git add .opencode/skills/add-project/SKILL.md docs/superpowers/plans/2026-06-19-portfolio-pipeline-rearchitecture.md
git commit -m "docs(skills): add-project pipeline integration note + pipeline plan"
git push
```

---

## Self-Review

**Spec coverage:** Every approved pipeline element is covered — audit (kept), license/release (kept), logo as one step two options (Task 3 + 4), wireframe opt-in before readme (Task 4), readme embeds logo (Task 4), site-github replaces template (Task 2 delete + Task 4 step 6), deploy (Task 4), screenshot (Task 4), add-project terminal using screenshot (Task 5 + 8). Removals: portfolio-index (Task 2), template-fill scripts (Task 2), polish-pipeline.sh (Task 2), phantom audit refs (Task 7).

**Placeholder scan:** `{owner}`, `{repo}`, `<project-path>`, `<Project Name>`, `<id>` are runtime substitution tokens shown in skill prose (these are documentation templates, not plan placeholders) — acceptable and intentional in orchestration docs.

**Consistency:** Logo option A outputs `assets/logo.svg`; option B outputs `docs/assets/logo.png`. README step references both paths. Screenshot path `docs/assets/screenshot.png` is consistent between step 9 (produce) and step 10 (consume).

**Note on TDD:** Per writing-skills the iron law is "no skill without a failing test." These edits are orchestration/documentation restructuring of an existing skill (not new behavioral rules requiring pressure-scenario baselines), so verification is via grep assertions (Tasks 3/6/7/8) confirming obsolete references are gone and new structure is present, plus the existing add-project evals remain valid.
