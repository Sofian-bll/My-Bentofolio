# Admin Dashboard Guide

## Access

Navigate to `/#/admin` in your browser while the dev server is running (`bun run dev`). You will be prompted for a password. Enter:

```
bento
```

The dashboard is **only available in dev mode** — it depends on the Vite admin plugin which is not included in production builds.

---

## Layout

The admin dashboard has a three-panel layout:

1. **Sidebar navigation** (left) — 8 sections as vertical tabs
2. **Main editor** (center) — forms and inputs for the active section
3. **Live preview iframe** (right) — shows the portfolio site reflecting unsaved changes in real time

Changes in the editor update the preview instantly via `postMessage` to the iframe. Nothing is persisted to disk until you click **"Sauvegarder"**.

---

## Section 1: Projets (Projects)

Full CRUD for portfolio projects stored in `content/projects/`.

### Project list
Shows all projects in order from `order.json`. Each card displays:
- Project name and ID
- Category badge(s) with color
- Tech tags
- Role and period
- Edit / Delete buttons

### Adding a project
1. Click **"Ajouter"** (Add)
2. Fill in the form fields:
   - **Name** — display name (auto-generates the ID as a slug)
   - **Categories** — multi-select from the 9 available categories
   - **Featured** — toggle to show on CV page
   - **Techs** — add tech tags (label + tech key)
   - **Role** — e.g. `"Solo"`, `"Binôme"`, `"Équipe"`
   - **Period** — e.g. `"2026"`
   - **Duration** — e.g. `"3 sem."`
   - **Description** — short markdown description
   - **Highlights** — bullet points (add/remove)
   - **Demo URL** — optional link to live demo
   - **Repo URL** — optional link to source repository
   - **Image** — upload via the image picker or paste a path
3. Click **"Sauvegarder"** to write to disk

### Editing a project
Click the edit icon on any project card to open the same form pre-filled with existing data.

### Deleting a project
Click the delete icon. The project folder, its files, and its entry in `order.json` are removed, and `index.json` is rebuilt.

### Case study editor
Each project has a **full Markdown editor** for the case study content (`case-study.md`). This supports:
- Headings (`##`, `###`)
- Lists (ordered and unordered)
- Code blocks (fenced with triple backticks)
- Blockquotes (`>`)
- Images (`![alt](path)`)
- Links (`[text](url)`)
- Bold and italic

The case study appears on the project detail page rendered as formatted Markdown.

### Project image upload
Images are uploaded via the upload button in the project form. The image is stored at `public/media/projects/<project-id>/<timestamp>.<ext>`. The resulting path (e.g. `media/projects/my-project/1234567890.png`) is inserted into the image field automatically.

---

## Section 2: Experiences (Expériences)

CRUD for work experience entries stored in `config.json` under `experiences`.

### Experience form fields
- **Title** — job title
- **Company** — company/organization name
- **Location** — geographic location
- **Period** — time period string
- **Description** — paragraph about the role
- **Highlights** — achievement bullet points (add/remove)
- **Techs** — associated technologies (label + tech key)
- **Featured** — toggle for prominent display

### Management
- Add new experiences with the **"Ajouter"** button
- Edit existing by clicking the edit icon
- Delete with the delete icon
- Drag-to-reorder (if implemented in the UI)

---

## Section 3: Apparence (Appearance)

Visual theme and layout settings stored under `appearance` in `config.json`.

### Settings
| Setting               | Description                                        |
|-----------------------|----------------------------------------------------|
| **Accent color**      | Color picker for brand accent (`--brand` CSS var)   |
| **Display font**      | Font family for headings (e.g. `Sora`, `Syne`)      |
| **Density**           | `compact` / `cozy` / `large` — controls global gap |
| **Radius**            | Border radius style (e.g. `doux`)                   |
| **Photo size**        | `compact` / `medium` / `large` — profile photo display size |

### Photo focal point editor
The photo focal point editor lets you adjust the `object-position` CSS property of the profile photo. You can:

- **Drag** the focal point crosshair on the photo preview
- **Tap** any point on the preview to snap the focal point there
- See the position as both a percentage (e.g. `50% 61%`) and a visual crosshair

Three separate positions can be set:
- **Home page** — `photoPositionHome`
- **CV page** — `photoPositionCv`
- **Default fallback** — `photoPosition` (used when a page-specific one isn't set)

---

## Section 4: CV

CV/Resume page layout settings stored under `cv` in `config.json`.

### Settings
| Setting              | Options                                    | Description                           |
|----------------------|--------------------------------------------|---------------------------------------|
| **CV photo size**    | `petite` / `moyenne` / `grande`            | Size of photo on the CV page          |
| **Pill style**       | `mono` / `color`                           | Tech tag color mode on CV cards       |
| **Max bullets**      | Number (e.g. `2`)                          | Max bullet points shown per project   |
| **Card density**     | `compact` / `cozy` / `large`               | Spacing between CV project cards      |
| **Featured projects**| Multi-select picker                        | Which projects appear on the CV page  |

### Featured project picker
Select which projects from your portfolio appear on the CV page. The selected project IDs are stored in `cv.featured[]`. Projects marked as featured get a `featured: true` flag at runtime (via `markFeaturedProjects()` in `config-runtime.js`).

---

## Section 5: Contact

Contact section configuration stored under `contact` in `config.json`.

### Settings
| Setting                | Description                                   |
|------------------------|-----------------------------------------------|
| **Formspree URL**      | Formspree form endpoint for the contact form   |
| **Show status**        | Toggle availability status badge visibility   |
| **Show phone**         | Toggle phone number visibility                |
| **Show contract type** | Toggle alternance/contract type info          |

When `formspreeUrl` is empty, the contact form is hidden and only the contact info cards are shown.

---

## Section 6: Liens (Social Links)

CRUD for social link entries stored under `socialLinks` in `config.json`.

### Link form fields
- **Icon** — icon picker (e.g. `linkedin`, `github`, `x`, `mail`, `website`)
- **Label** — display text (e.g. `"in/sofianbll"`)
- **URL** — full href

### Management
- Add with **"Ajouter"**
- Edit with the edit icon
- Delete with the delete icon
- Order can be rearranged (drag if implemented)

---

## Section 7: Profil (Profile)

Personal identity and content configuration stored under `profile` in `config.json`.

### Identity
- **First name** — `firstName`
- **Last name** — `lastName`
- **Role** — professional title (e.g. `"Développeur Web Full Stack"`)
- **Bio** — short biography text
- **CV subtitle** — text displayed below the name on the CV page
- **CV subtitle size** — font size in pixels for the subtitle
- **Web experience since** — starting year

### Alternance
- **Start** — e.g. `"sept. 2026"`
- **Duration** — e.g. `"14 mois"`
- **Rhythm** — e.g. `"6/2 sem."`

### Contact infos
Key-value pairs with visibility toggles:
- Add entries with key, value, and a visible/hidden toggle
- Hidden entries (`visible: false`) are filtered out at runtime
- Common entries: `Âge`, `Localisation`, `Téléphone`, `Email`

### Hero chips
Chips shown in the hero section header:
- **Text** — display text
- **Variant** — `"outline"` or `"solid"`
- Add/remove chips as needed

### Skill groups
Categorized skill lists:
- Each group has a **category** name and an array of **skills**
- Each skill has a **label** (display) and **tech** (tech key for tag color)
- Five skill groups are typically used: Dev Web, DevOps, Design & IA, Outils & CLI, Soft Skills

### Formations
Education/training entries:
- **Title** — qualification name
- **Badge** — badge text
- **Where** — institution and date
- **Description** — short description

### Interests
Personal interest entries:
- **Emoji** — icon
- **Title** — interest name
- **Detail** — descriptive text

### Section labels
Customize section heading text:
- Skills, Formation, Contact, Interests, Projects

---

## Section 8: Backup (Sauvegarde)

JSON export and import for disaster recovery.

### Export
Downloads the entire `config.json` as a `.json` file to your computer. Use this before making major changes.

### Import
1. Click the import button
2. Select a previously exported `.json` file
3. The imported config replaces the current `config.json` (after confirmation)

---

## Save flow

The **"Sauvegarder"** button (available in most sections) triggers a save to disk:

1. The frontend constructs the full config object from form state
2. For project changes, it calls `POST /api/admin/project/save` or `DELETE /api/admin/project/delete`
3. For config changes (appearance, profile, CV, contact, social, experiences, photo), it calls `POST /api/admin/save`
4. The Vite admin plugin writes the changes to the file system
5. The live preview iframe receives updates via `postMessage` and re-renders
6. A success toast confirms the save

**The preview updates live as you type** — no save needed to see changes. The save button only persists to disk.

---

## How project images work

1. In the admin **Projets** section, click the upload button next to the image field
2. The image is sent as a base64 data URL to `POST /api/admin/upload`
3. The server saves it to `public/media/projects/<project-id>/<timestamp>.<ext>`
4. The returned path (e.g. `media/projects/my-project/1718798340123.png`) is stored in `project.json` under `image`
5. In the portfolio, the image is resolved by `resolveImageSrc()` in `config-runtime.js` which prepends the Vite base URL

Images can also be referenced in `case-study.md` using standard Markdown syntax:
```markdown
![Screenshot](media/projects/my-project/screenshot.png)
```

---

## Tips

- **Use the live preview** — the iframe on the right updates instantly with every change. Tweak and iterate without saving.
- **Export a backup** before making major changes (use Section 8: Backup).
- **Project order matters** — the order in `order.json` determines display order. Drag to reorder in the admin (if supported) or edit `order.json` directly.
- **Test your CV** — after changing CV settings, open the CV page (`/#/cv`) in the preview to verify the layout.
- **Save frequently** — changes in the editor are not persisted until you click "Sauvegarder".
