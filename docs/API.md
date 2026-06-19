# Admin API Reference

## Important: Dev-only endpoints

All API endpoints described in this document are provided by the Vite admin plugin (`vite-admin-plugin.ts`) and **only exist in development mode** (`bun run dev` / `vite`). They are not available in production builds (`dist/`). In production, the site is fully static.

The admin dashboard (`/#/admin`) uses these endpoints to persist changes directly to the file system.

---

## Endpoint 1: Save full configuration

### `POST /api/admin/save`

Writes the full configuration object to `config.json` on disk.

**Request body**: A complete JSON config object.

```json
{
  "socialLinks": [...],
  "photo": "media/photo.jpg",
  "appearance": { "accent": "#6366f1", ... },
  "cv": { "featured": [...], ... },
  "contact": { "formspreeUrl": "...", ... },
  "experiences": [...],
  "profile": { "firstName": "...", ... }
}
```

**Max body size**: 5 MB (5,000,000 bytes). Larger payloads receive a `413 Payload too large` error.

**Success response** (200):
```json
{
  "ok": true,
  "savedAt": "2026-06-19T12:00:00.000Z",
  "path": "/absolute/path/to/config.json"
}
```

**Error responses**:

| Status | Body                                        | Cause                     |
|--------|---------------------------------------------|---------------------------|
| 400    | `{"ok":false,"error":"Expected a JSON object"}` | Body was an array or non-object |
| 400    | `{"ok":false,"error":"Invalid JSON"}`           | Malformed JSON            |
| 413    | `{"ok":false,"error":"Payload too large"}`      | Body exceeded 5 MB        |
| 400    | `{"ok":false,"error":"Request stream error"}`   | Stream read failure       |
| 500    | `{"ok":false,"error":"<fs error message>"}`     | Disk write failure        |

---

## Endpoint 2: Upload project image

### `POST /api/admin/upload`

Uploads a base64-encoded image and saves it to `public/media/projects/<projectId>/`.

**Request body**:
```json
{
  "projectId": "connect-in",
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."
}
```

| Field       | Type     | Description                              |
|-------------|----------|------------------------------------------|
| `projectId` | `string` | The project's folder ID (slug)           |
| `image`     | `string` | Base64 data URL (`data:image/png;base64,...`) |

**Max body size**: 10 MB (10,000,000 bytes).

**Success response** (200):
```json
{
  "ok": true,
  "path": "media/projects/connect-in/1718798340123.png"
}
```

The `path` is relative to `public/` and can be used directly in `project.json`:
```json
"image": "media/projects/connect-in/1718798340123.png"
```

Images are saved with the naming pattern `<timestamp>.<ext>` where `ext` is derived from the MIME type. The directory `public/media/projects/<projectId>/` is created automatically if it doesn't exist.

**Error responses**:

| Status | Body                                         | Cause                      |
|--------|----------------------------------------------|----------------------------|
| 400    | `{"ok":false,"error":"Missing projectId"}`    | `projectId` missing/invalid |
| 400    | `{"ok":false,"error":"Invalid image data URL"}` | Image not a valid data URL |
| 413    | `{"ok":false,"error":"Upload too large"}`     | Body exceeded 10 MB        |
| 500    | `{"ok":false,"error":"<error message>"}`      | Disk write failure         |

---

## Endpoint 3: Save a project

### `POST /api/admin/project/save`

Creates or updates a portfolio project in `content/projects/<id>/`. This endpoint:

1. Sanitizes the project ID (slugifies the name)
2. Writes `project.json` (metadata without caseStudy) to disk
3. Writes `case-study.md` (markdown content) to disk
4. Adds the project ID to `order.json` if not already present
5. Rebuilds `index.json` by merging all projects in order

**Request body**:
```json
{
  "project": {
    "id": "my-new-project",
    "name": "My New Project",
    "categories": ["dev"],
    "featured": true,
    "techs": [
      { "label": "React", "tech": "react" },
      { "label": "Node.js", "tech": "node" }
    ],
    "role": "Solo",
    "period": "2026",
    "duration": "2 sem.",
    "description": "Short description in markdown.",
    "highlights": ["Built in 2 weeks", "100% test coverage"],
    "demoUrl": "https://demo.example.com",
    "repoUrl": "https://github.com/user/repo",
    "image": "media/projects/my-new-project/1234567890.png",
    "caseStudy": "## Contexte\n\nLong-form case study content in Markdown..."
  }
}
```

The `caseStudy` field is extracted from the project object and written as `case-study.md`. All other fields go into `project.json`.

**Success response** (200):
```json
{
  "ok": true,
  "id": "my-new-project",
  "files": {
    "project": "/absolute/path/content/projects/my-new-project/project.json",
    "caseStudy": "/absolute/path/content/projects/my-new-project/case-study.md",
    "order": "/absolute/path/content/projects/order.json",
    "index": "/absolute/path/content/projects/index.json"
  }
}
```

**Error responses**:

| Status | Body                                         | Cause                         |
|--------|----------------------------------------------|-------------------------------|
| 400    | `{"ok":false,"error":"Missing project object"}` | `project` field missing      |
| 400    | `{"ok":false,"error":"Missing project id"}`     | Could not derive a valid ID  |
| 400    | `{"ok":false,"error":"Invalid project id"}`     | ID contains `..`, `/`, or `\` |
| 413    | `{"ok":false,"error":"Payload too large"}`      | Body exceeded 5 MB           |
| 500    | `{"ok":false,"error":"<error message>"}`        | Disk write failure           |

---

## Endpoint 4: Delete a project

### `POST /api/admin/project/delete`

Removes a project from `content/projects/`. This endpoint:

1. Deletes `content/projects/<id>/project.json`
2. Deletes `content/projects/<id>/case-study.md`
3. Removes the project directory if empty (best effort)
4. Removes the project ID from `order.json`
5. Rebuilds `index.json`

**Request body**:
```json
{
  "id": "my-new-project"
}
```

The ID is sanitized (slugified) before use to prevent path traversal.

**Success response** (200):
```json
{
  "ok": true,
  "id": "my-new-project"
}
```

**Error responses**:

| Status | Body                                        | Cause                        |
|--------|---------------------------------------------|------------------------------|
| 400    | `{"ok":false,"error":"Missing project id"}`   | `id` missing or invalid     |
| 413    | `{"ok":false,"error":"Payload too large"}`    | Body exceeded 5 MB          |
| 500    | `{"ok":false,"error":"<error message>"}`      | File system error           |

---

## Security model

### Path traversal protection

Project IDs are sanitized via `sanitizeProjectId()` which:
- Strips Unicode accents
- Lowercases
- Replaces non-alphanumeric characters with hyphens
- Trims leading/trailing hyphens
- Blocks IDs containing `..`, `/`, or `\`

This prevents attackers from writing files outside `content/projects/`.

### Body size limits

| Endpoint                   | Max size |
|----------------------------|----------|
| `/api/admin/save`          | 5 MB     |
| `/api/admin/upload`        | 10 MB    |
| `/api/admin/project/save`  | 5 MB     |
| `/api/admin/project/delete`| 5 MB     |

Exceeding the limit results in a `413` response and the request stream is destroyed.

### Admin password gate

In the frontend, the admin dashboard is protected by a password prompt. When accessing `/#/admin`, the user must enter the password `"bento"` before making any API calls. This is a client-side gate only — the API endpoints themselves have no authentication (they are dev-only).

---

## Usage from the admin dashboard

The admin dashboard uses these helper functions from `app/admin-save.js` and `app/admin-project-save.js`:

```js
import { saveConfigToDisk } from './app/admin-save.js'
import { saveProjectToContent, deleteProjectFromContent } from './app/admin-project-save.js'

// Save full config
const result = await saveConfigToDisk(configObject)
if (result.ok) console.log('Saved at', result.savedAt)

// Save a project
await saveProjectToContent({ id: 'my-project', name: 'My Project', caseStudy: '## Intro\n...' })

// Delete a project
await deleteProjectFromContent('my-project')
```

For image uploads, the dashboard sends a `POST` directly:
```js
const res = await fetch('/api/admin/upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ projectId: 'my-project', image: 'data:image/png;base64,...' }),
})
const { ok, path } = await res.json()
```
