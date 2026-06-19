# Add Project

Adds a new project to a Bentofolio portfolio via conversational data gathering and a standalone validation script.

## Activation

Triggered by the user typing `/add-project` or asking to "add a project", "create a new project", "ajouter un projet".

## Workflow

Follow this conversational flow step by step. After each step, confirm with the user before proceeding to the next one.

### Step 1: Gather basic metadata

Ask the user for these fields (required unless noted):

- **Nom du projet** (required) — Display name
- **Catégories** (required, array) — One or more from: `dev`, `webdesign`, `3d`, `animation`, `logo`, `tooling`, `devops`, `ai`, `tools`
- **Rôle** (optional) — Role on the project (e.g. `"Solo"`, `"Binôme"`, `"Equipe (3)"`)
- **Période** (optional) — Ask "Quand as-tu commencé ?" and "Quand as-tu fini ?" to derive `startDate` (ISO YYYY-MM-DD) and `endDate` (ISO or `null` if ongoing). Do NOT ask for `period` or `duration` — those are computed automatically.

Confirm with user: "Je résume : [nom], catégories [x, y], rôle [rôle], période [startDate → endDate]. C'est bon ?"

### Step 2: Gather tech stack

Ask: "Quelles technos as-tu utilisées ?"

For each tech:
- **Label** — Human-readable name (e.g. `"React"`, `"Docker"`)
- **Tech key** — Machine key from the palette (e.g. `"react"`, `"docker"`). If the user provides a label that matches a palette entry, use its key and color. If not in the palette, use a reasonable key or default.

Confirm with user: "Je résume les technos : React (react), Docker (docker), ... C'est bon ?"

### Step 3: Gather description and highlights

- **Description** (required) — Une phrase courte (max 150 chars). Demander: "Décris le projet en une phrase."
- **Highlights** (optional, array of 3 strings) — Bullet points. Demander: "3 points clés à mettre en avant ?"

### Step 4: Gather URLs

- **Demo URL** (optional) — Live demo link. Demander: "Une démo en ligne ?"
- **Repo URL** (optional) — Source repository. Demander: "Un repo GitHub ?"

### Step 5: Gather case study

Demander: "Tu veux ajouter une étude de cas ? (oui/non)"

If yes, ask the user to describe the project in natural language. Guide them to cover:
- **Contexte** — Why this project exists, what problem it solves
- **Points clés** — Key features or achievements
- **Architecture** (optional) — How it's built
- **Leçons apprises** (optional) — What they learned

Then format their answer as a case-study.md:

```markdown
## Contexte

[User's context description]

## Points clés

- [Key point 1]
- [Key point 2]
- [Key point 3]

[Optional sections if user provided them]
```

**Important:** Do NOT include `## Stack` — the stack is already displayed via tech pills.

### Step 6: Final review and confirmation

Present ALL gathered data to the user in a structured format:

```
Projet : [name] ([id])
Catégories : [cat1, cat2]
Rôle : [role]
Dates : [startDate] → [endDate | "En cours"]
Description : [description]
Highlights :
  - [h1]
  - [h2]
  - [h3]
Techs : [React (react), Docker (docker), ...]
Demo : [demoUrl | —]
Repo : [repoUrl | —]
Case study : [oui/non]
```

Ask: "Tout est correct ? Je lance le script ?"

### Step 7: Run the script

Build the JSON payload and run:

```bash
bun run .opencode/skills/add-project/scripts/add-project.ts '<JSON>'
```

The script writes:
- `content/projects/<id>/project.json`
- `content/projects/<id>/case-study.md`
- Updates `content/projects/order.json`

**It does NOT rebuild `index.json`** — that is handled automatically by Vite HMR or the next `bun dev`/`bun build`.

### Step 8: Verify

After the script succeeds, run the tests:

```bash
bun run test
```

Then tell the user: "Projet ajouté. Lance `bun dev` pour voir le résultat, ou `bun run build` pour déployer."

## JSON payload format

```json
{
  "name": "My Project",
  "categories": ["dev", "tooling"],
  "featured": true,
  "role": "Solo",
  "startDate": "2025-03-15",
  "endDate": null,
  "description": "A short description.",
  "highlights": ["Point 1", "Point 2", "Point 3"],
  "techs": [
    { "label": "React", "tech": "react", "color": "#61dafb" },
    { "label": "TypeScript", "tech": "ts", "color": "#3178c6" }
  ],
  "demoUrl": "https://demo.example.com",
  "repoUrl": "https://github.com/user/repo",
  "image": "",
  "caseStudy": "## Contexte\n\n..." 
}
```

## Important rules

1. **Always validate with the user** before running the script — show the full summary first
2. **Never fabricate data** — only include what the user provides
3. **Do NOT include `period` or `duration`** — they are auto-computed
4. **Do NOT rebuild index.json** — Vite handles it
5. **Use the palette** for tech keys and colors when possible — look up `config.json` > `skillPalette`
6. **Keep one-step-per-exchange** — don't ask all questions at once, it's a conversation
