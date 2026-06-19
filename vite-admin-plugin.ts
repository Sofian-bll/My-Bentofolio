import type { Plugin, ViteDevServer, HmrContext, ResolvedConfig } from 'vite'
import { writeFileSync, readFileSync, mkdirSync, existsSync, rmSync } from 'fs'
import { resolve, join } from 'path'

export function getConfigFilePath(root: string) {
  return resolve(root, 'config.json')
}

export function getProjectsDirPath(root: string) {
  return resolve(root, 'content', 'projects')
}

export function getProjectsOrderPath(root: string) {
  return resolve(root, 'content', 'projects', 'order.json')
}

export function getProjectDirPath(root: string, id: string) {
  return resolve(root, 'content', 'projects', id)
}

export function getProjectJsonPath(root: string, id: string) {
  return resolve(root, 'content', 'projects', id, 'project.json')
}

export function getProjectCaseStudyPath(root: string, id: string) {
  return resolve(root, 'content', 'projects', id, 'case-study.md')
}

export function sanitizeProjectId(raw: unknown) {
  if (typeof raw !== 'string') return ''
  return raw.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
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

export function readProjectOrder(root: string): string[] {
  const orderPath = getProjectsOrderPath(root)
  if (!existsSync(orderPath)) return []
  try {
    const raw = readFileSync(orderPath, 'utf8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function updateProjectOrder(
  existing: string[],
  id: string,
  action: 'save' | 'delete',
): string[] {
  if (action === 'save') {
    if (!existing.includes(id)) return [...existing, id]
    return existing
  }
  return existing.filter((item) => item !== id)
}

export function buildProjectIndex(root: string) {
  const order = readProjectOrder(root)
  const projects = order.map(id => {
    try {
      const jsonRaw = readFileSync(getProjectJsonPath(root, id), 'utf8')
      const project = JSON.parse(jsonRaw)
      try {
        project.caseStudy = readFileSync(getProjectCaseStudyPath(root, id), 'utf8')
      } catch {
        project.caseStudy = ''
      }
      return project
    } catch {
      return null
    }
  }).filter(Boolean)

  const indexPath = resolve(root, 'content', 'projects', 'index.json')
  writeFileSync(indexPath, JSON.stringify(projects, null, 2) + '\n', 'utf8')
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

function readRequestBody(req: Parameters<ViteDevServer['middlewares']['use']>[0], maxSize: number): Promise<string | null> {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString()
      if (body.length > maxSize) {
        req.destroy()
        resolve(null)
      }
    })
    req.on('error', () => resolve(null))
    req.on('end', () => resolve(body))
  })
}

const MAX_BODY_SIZE = 5_000_000
const MAX_UPLOAD_SIZE = 10_000_000

export function adminPlugin(): Plugin {
  return {
    name: 'bentofolio-admin',

    configResolved(config: ResolvedConfig) {
      buildProjectIndex(config.root)
    },

    handleHotUpdate({ file, server }: HmrContext) {
      const projectsDir = resolve(server.config.root, 'content', 'projects')
      const indexJson = resolve(server.config.root, 'content', 'projects', 'index.json')
      if (file === indexJson) return
      if (file.startsWith(projectsDir + '/') || file === resolve(server.config.root, 'content', 'projects', 'order.json')) {
        buildProjectIndex(server.config.root)
      }
    },

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

      server.middlewares.use('/api/admin/project/save', async (req, res, next) => {
        if (req.method !== 'POST') return next()
        if (req.url !== '/') return next()
        const root = server.config.root

        const body = await readRequestBody(req, MAX_BODY_SIZE)
        if (body === null) {
          return sendJson(res, 413, { ok: false, error: 'Payload too large' })
        }

        try {
          const { project } = JSON.parse(body)
          if (!project || typeof project !== 'object') {
            return sendJson(res, 400, { ok: false, error: 'Missing project object' })
          }

          const rawId = project.id || project.name
          const id = sanitizeProjectId(rawId)
          if (!id) {
            return sendJson(res, 400, { ok: false, error: 'Missing project id' })
          }

          if (id.includes('..') || id.includes('/') || id.includes('\\')) {
            return sendJson(res, 400, { ok: false, error: 'Invalid project id' })
          }

          const projectDir = getProjectDirPath(root, id)
          if (!existsSync(projectDir)) mkdirSync(projectDir, { recursive: true })

          const { caseStudy, ...meta } = project
          writeFileSync(getProjectJsonPath(root, id), JSON.stringify(meta, null, 2) + '\n', 'utf8')
          writeFileSync(getProjectCaseStudyPath(root, id), typeof caseStudy === 'string' ? caseStudy : '', 'utf8')

          const existingOrder = readProjectOrder(root)
          const newOrder = updateProjectOrder(existingOrder, id, 'save')
          const orderPath = getProjectsOrderPath(root)
          const orderDir = join(root, 'content', 'projects')
          if (!existsSync(orderDir)) mkdirSync(orderDir, { recursive: true })
          writeFileSync(orderPath, JSON.stringify(newOrder, null, 2) + '\n', 'utf8')

          buildProjectIndex(root)

          sendJson(res, 200, {
            ok: true,
            id,
            files: {
              project: getProjectJsonPath(root, id),
              caseStudy: getProjectCaseStudyPath(root, id),
              order: orderPath,
              index: resolve(root, 'content', 'projects', 'index.json'),
            },
          })
        } catch (err) {
          sendJson(res, 500, { ok: false, error: String(err) })
        }
      })

      server.middlewares.use('/api/admin/project/delete', async (req, res, next) => {
        if (req.method !== 'POST') return next()
        if (req.url !== '/') return next()
        const root = server.config.root

        const body = await readRequestBody(req, MAX_BODY_SIZE)
        if (body === null) {
          return sendJson(res, 413, { ok: false, error: 'Payload too large' })
        }

        try {
          const { id: rawId } = JSON.parse(body)
          const id = sanitizeProjectId(rawId)
          if (!id) {
            return sendJson(res, 400, { ok: false, error: 'Missing project id' })
          }

          const projectJson = getProjectJsonPath(root, id)
          const caseStudy = getProjectCaseStudyPath(root, id)

          if (existsSync(projectJson)) rmSync(projectJson)
          if (existsSync(caseStudy)) rmSync(caseStudy)

          const projectDir = getProjectDirPath(root, id)
          if (existsSync(projectDir)) {
            try { rmSync(projectDir, { recursive: true }) } catch { /* dir not empty, fine */ }
          }

          const existingOrder = readProjectOrder(root)
          const newOrder = updateProjectOrder(existingOrder, id, 'delete')
          writeFileSync(getProjectsOrderPath(root), JSON.stringify(newOrder, null, 2) + '\n', 'utf8')

          buildProjectIndex(root)

          sendJson(res, 200, { ok: true, id })
        } catch (err) {
          sendJson(res, 500, { ok: false, error: String(err) })
        }
      })
    },
  }
}
