const PREVIEW_KEY = 'bentofolio.preview'

function cloneConfig(config) {
  if (typeof structuredClone === 'function') return structuredClone(config)
  return JSON.parse(JSON.stringify(config))
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function readJson(storage, key) {
  if (!storage || typeof storage.getItem !== 'function') return null

  try {
    const raw = storage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return isObject(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function getBrowserStorage(globalScope = globalThis) {
  try {
    return globalScope?.localStorage || null
  } catch {
    return null
  }
}

export function isPreviewFrame(windowRef) {
  try {
    return Boolean(windowRef) && windowRef.self !== windowRef.top
  } catch {
    return false
  }
}

export function getRuntimeConfigFromMessage(event, windowRef) {
  if (!isPreviewFrame(windowRef)) return null
  if (event?.data?.type !== '__bento_config_update') return null
  if (!isObject(event.data.config)) return null
  if (event.source !== windowRef.parent) return null

  const eventOrigin = event.origin
  const windowOrigin = windowRef.location?.origin
  if (eventOrigin && windowOrigin && eventOrigin !== windowOrigin) return null

  return event.data.config
}

export function markFeaturedProjects(projects, featuredIds = []) {
  if (!Array.isArray(projects)) return []

  const featured = new Set(Array.isArray(featuredIds) ? featuredIds : [])
  return projects.map((project) => ({ ...project, featured: featured.has(project.id) }))
}

function applyPreviewConfig(config, preview) {
  if (!preview) return config

  if (Array.isArray(preview.projects)) config.projects = preview.projects
  if (Array.isArray(preview.socialLinks)) config.socialLinks = preview.socialLinks
  if ('photo' in preview) config.photo = preview.photo
  if (isObject(preview.appearance)) config.appearance = { ...(config.appearance || {}), ...preview.appearance }
  if (isObject(preview.cv)) config.cv = { ...(config.cv || {}), ...preview.cv }
  if (isObject(preview.contact)) config.contact = { ...(config.contact || {}), ...preview.contact }

  return config
}

export function resolveAppConfig(baseConfig, storage, options = {}) {
  const config = cloneConfig(baseConfig)
  if (!options.isPreviewFrame) return config

  return applyPreviewConfig(config, readJson(storage, PREVIEW_KEY))
}
