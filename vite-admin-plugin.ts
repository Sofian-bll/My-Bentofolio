import type { Plugin, ViteDevServer } from 'vite'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, basename, join } from 'path'

export function getConfigFilePath(root: string) {
  return resolve(root, 'config.json')
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
