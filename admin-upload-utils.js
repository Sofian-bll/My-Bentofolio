export function sanitizeFilename(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return 'project'

  let name = raw
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_.-]/g, '')

  const lastDot = name.lastIndexOf('.')
  if (lastDot > 0) {
    const base = name.slice(0, lastDot).replace(/\.+$/, '')
    const ext = name.slice(lastDot + 1).toLowerCase()
    name = (base && ext) ? `${base}.${ext}` : `project${ext ? `.${ext}` : ''}`
  }

  return name.replace(/^\.+/, '') || 'project'
}

export function parseDataUrl(raw) {
  if (typeof raw !== 'string' || !raw.startsWith('data:')) return null

  const match = raw.match(/^data:([^;,]+)(;base64)?,(.*)$/s)
  if (!match) return null

  const mime = match[1]
  const encoding = match[2] ? 'base64' : 'base64'
  const data = match[3]

  try {
    const bytes = encoding === 'base64'
      ? Uint8Array.from(atob(data), (c) => c.charCodeAt(0))
      : new TextEncoder().encode(data)
    return { mime, encoding, bytes }
  } catch {
    return null
  }
}

export function getMediaDir(projectId, root) {
  return `${root}/public/media/projects/${projectId}`
}
