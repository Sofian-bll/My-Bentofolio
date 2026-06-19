import type { Plugin, ViteDevServer } from 'vite'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, basename, join } from 'path'

export function getConfigFilePath(root: string) {
  return resolve(root, 'config.json')
}

export function getProjectsDirPath(root: string) {
  return resolve(root, 'content', 'projects')
}

export function getProjectsIndexPath(root: string) {
  return resolve(root, 'content', 'projects.js')
}

export function sanitizeProjectId(raw: unknown) {
  if (typeof raw !== 'string') return ''
  return raw.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function projectIdToVariableName(id: string) {
  const variable = sanitizeProjectId(id).replace(/-/g, '_')
  return /^[0-9]/.test(variable) ? `_${variable}` : variable
}

function escapeTemplateLiteral(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')
}

function escapeSingleQuotedString(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function formatString(value: unknown) {
  if (typeof value !== 'string') return "''"
  return value.includes('\n') || value.includes('`') || value.includes('${')
    ? `\`${escapeTemplateLiteral(value)}\``
    : `'${escapeSingleQuotedString(value)}'`
}

function formatValue(value: unknown, indent = 2): string {
  if (typeof value === 'string') return formatString(value)
  if (typeof value === 'number' || typeof value === 'boolean') return JSON.stringify(value)
  if (Array.isArray(value)) return JSON.stringify(value, null, indent)
  if (value && typeof value === 'object') return JSON.stringify(value, null, indent)
  return 'null'
}

export function serializeProjectModule(project: Record<string, unknown>) {
  const orderedKeys = [
    'id', 'name', 'categories', 'featured', 'techs', 'role', 'period', 'duration',
    'description', 'highlights', 'caseStudy', 'demoUrl', 'repoUrl', 'image',
  ]
  const allKeys = [...orderedKeys, ...Object.keys(project).filter((key) => !orderedKeys.includes(key))]
  const lines = ['export default {']
  for (const key of allKeys) {
    if (!(key in project)) continue
    lines.push(`  ${key}: ${formatValue(project[key])},`)
  }
  lines.push('}')
  return `${lines.join('\n')}\n`
}

export function buildProjectsIndex(projectIds: string[]) {
  const ids = projectIds.map(sanitizeProjectId).filter(Boolean)
  const imports = ids.map((id) => `import ${projectIdToVariableName(id)} from './projects/${id}.js'`)
  const entries = ids.map((id) => `  ${projectIdToVariableName(id)},`)
  return `${imports.join('\n')}\n\nexport const projects = [\n${entries.join('\n')}\n]\n`
}

export function parseConfigBody(body: string) {
  try {
    const config = JSON.parse(body)
    if (!config || typeof config !== 'object' || Array.isArray(config)) {
      return { ok: false, status: 400, error: 'Expected a JSON object' }
    }
    return { ok: true, body: `${JSON.stringify(config, null, 2)}\n` }
  } catch {
    return { ok: false, status: 400, error: 'Invalid JSON' }
  }
}

function parseDataUrl(raw: string) {
  if (typeof raw !== 'string' || !raw.startsWith('data:')) return null
  const match = raw.match(/^data:([^;,]+)(;base64)?,(.*)$/s)
  if (!match) return null
  try {
    const bytes = Uint8Array.from(Buffer.from(match[3], 'base64'))
    return { mime: match[1], bytes }
  } catch { return null }
}

function sanitizeUploadFilename(raw: string, fallback: string) {
  if (typeof raw !== 'string' || !raw.trim()) return fallback
  let name = raw.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '')
  const dot = name.lastIndexOf('.')
  if (dot > 0) {
    const base = name.slice(0, dot).replace(/\.+$/, '')
    const ext = name.slice(dot + 1).toLowerCase()
    name = (base && ext) ? `${base}.${ext}` : `${fallback}${ext ? `.${ext}` : ''}`
  }
  return name.replace(/^\.+/, '') || fallback
}

function sendJson(res: Parameters<ViteDevServer['middlewares']['use']>[1], status: number, payload: object) {
  if (res.writableEnded) return
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

const MAX_BODY_SIZE = 5_000_000
const MAX_UPLOAD_SIZE = 10_000_000

export function adminPlugin(): Plugin {
  return {
    name: 'bentofolio-admin',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api/admin/save', (req, res, next) => {
        if (req.method !== 'POST') return next()
        if (req.url !== '/') return next()
        const configFile = getConfigFilePath(server.config.root)
        let body = ''
        req.on('data', (chunk: Buffer) => {
          body += chunk.toString()
          if (body.length > MAX_BODY_SIZE) {
            req.destroy()
            sendJson(res, 413, { ok: false, error: 'Payload too large' })
          }
        })
        req.on('error', () => {
          sendJson(res, 400, { ok: false, error: 'Request stream error' })
        })
        req.on('end', () => {
          if (res.writableEnded) return
          const parsed = parseConfigBody(body)
          if (!parsed.ok) {
            sendJson(res, parsed.status, { ok: false, error: parsed.error })
            return
          }

          try {
            writeFileSync(configFile, parsed.body, 'utf-8')
            sendJson(res, 200, { ok: true, savedAt: new Date().toISOString(), path: configFile })
          } catch (err) {
            sendJson(res, 500, { ok: false, error: String(err) })
          }
        })
      })

      server.middlewares.use('/api/admin/upload', (req, res, next) => {
        if (req.method !== 'POST') return next()
        if (req.url !== '/') return next()
        const root = server.config.root
        let body = ''
        req.on('data', (chunk: Buffer) => {
          body += chunk.toString()
          if (body.length > MAX_UPLOAD_SIZE) {
            req.destroy()
            sendJson(res, 413, { ok: false, error: 'Upload too large' })
          }
        })
        req.on('error', () => {
          sendJson(res, 400, { ok: false, error: 'Request stream error' })
        })
        req.on('end', () => {
          if (res.writableEnded) return
          try {
            const { projectId, image } = JSON.parse(body)
            if (!projectId || typeof projectId !== 'string') {
              return sendJson(res, 400, { ok: false, error: 'Missing projectId' })
            }
            const parsed = parseDataUrl(image)
            if (!parsed) {
              return sendJson(res, 400, { ok: false, error: 'Invalid image data URL' })
            }

            const dir = join(root, 'public', 'media', 'projects', projectId)
            if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

            const ext = parsed.mime.split('/')[1] || 'png'
            const filename = `${Date.now()}.${ext}`
            const filepath = join(dir, filename)
            writeFileSync(filepath, parsed.bytes)

            sendJson(res, 200, {
              ok: true,
              path: `media/projects/${projectId}/${filename}`,
            })
          } catch (err) {
            sendJson(res, 500, { ok: false, error: String(err) })
          }
        })
      })
    },
  }
}
