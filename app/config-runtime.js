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

export function resolveImageSrc(path) {
  if (!path || typeof path !== 'string') return ''
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path
  return (import.meta.env.BASE_URL || '/') + path.replace(/^\//, '')
}

const DENSITY_GAP = { compact: '12px', cozy: '16px', large: '24px' }

export function applyLiveConfig(cfg, DATA, appConfig) {
  if (!cfg || !DATA) return

  if (isObject(cfg.profile)) {
    appConfig.profile = { ...appConfig.profile, ...cfg.profile }
  }
  if (isObject(cfg.cv)) {
    appConfig.cv = { ...appConfig.cv, ...cfg.cv }
  }
  if (isObject(cfg.appearance)) {
    appConfig.appearance = { ...appConfig.appearance, ...cfg.appearance }
  }
  if (isObject(cfg.contact)) {
    appConfig.contact = { ...appConfig.contact, ...cfg.contact }
  }
  if (Array.isArray(cfg.projects)) {
    DATA.projects = markFeaturedProjects(cfg.projects, appConfig.cv?.featured)
    appConfig.projects = DATA.projects
  }
  if (Array.isArray(cfg.experiences)) {
    DATA.experiences = cfg.experiences
    appConfig.experiences = cfg.experiences
  }
  if (Array.isArray(cfg.socialLinks)) {
    DATA.socialLinks = cfg.socialLinks
    appConfig.socialLinks = cfg.socialLinks
  }
  if (cfg.photo != null) {
    DATA.personalInfo.photoUrl = cfg.photo || null
    appConfig.photo = cfg.photo
  }

  // Apply profile fields to DATA.personalInfo
  if (isObject(cfg.profile)) {
    const p = cfg.profile
    if (p.firstName != null) DATA.personalInfo.firstName = p.firstName
    if (p.lastName != null) DATA.personalInfo.lastName = p.lastName
    if (p.role != null) DATA.personalInfo.role = p.role
    if (p.bio != null) DATA.personalInfo.bio = p.bio
    if (isObject(p.alternance)) DATA.personalInfo.alternance = { ...DATA.personalInfo.alternance, ...p.alternance }
    if (Array.isArray(p.contactInfos)) DATA.contactInfos = p.contactInfos.filter((c) => c.visible !== false).map((c) => ({ key: c.key, value: c.value }))
    if (Array.isArray(p.skillGroups)) DATA.skillGroups = p.skillGroups
    if (Array.isArray(p.formations)) DATA.formations = p.formations
    if (Array.isArray(p.interests)) DATA.interests = p.interests
    if (isObject(p.sectionLabels)) DATA.sectionLabels = { ...DATA.sectionLabels, ...p.sectionLabels }
    if (Array.isArray(p.heroChips)) DATA.profile = { ...DATA.profile, heroChips: p.heroChips }
    if (p.cvSubtitle != null) DATA.profile = { ...DATA.profile, cvSubtitle: p.cvSubtitle }
    if (p.cvSubtitleSize != null) DATA.profile = { ...DATA.profile, cvSubtitleSize: p.cvSubtitleSize }
    if (p.webExperienceSince != null) DATA.profile = { ...DATA.profile, webExperienceSince: p.webExperienceSince }
  }

  // Apply appearance CSS
  if (isObject(cfg.appearance)) {
    const a = cfg.appearance
    const root = document.documentElement
    if (a.accent) root.style.setProperty('--brand', a.accent)
    if (a.density) root.style.setProperty('--bento-gap', DENSITY_GAP[a.density] || '16px')
    if (a.displayFont) root.style.setProperty('--font-display', `'${a.displayFont}', 'Syne', sans-serif`)
    if (a.radius) root.setAttribute('data-radius', a.radius)
    if (a.photo) root.setAttribute('data-photo', a.photo)
    const homePosition = a.photoPositionHome || a.photoPosition
    const cvPosition = a.photoPositionCv || a.photoPosition
    if (homePosition) {
      root.style.setProperty('--photo-position', homePosition)
      root.style.setProperty('--photo-position-home', homePosition)
    }
    if (cvPosition) root.style.setProperty('--photo-position-cv', cvPosition)
  }
  if (isObject(cfg.cv)) {
    const c = cfg.cv
    const root = document.documentElement
    if (c.cvPhoto) root.setAttribute('data-cv-photo', c.cvPhoto)
    if (c.cvPills) root.setAttribute('data-cv-pills', c.cvPills)
    if (c.cvCardDensity) root.setAttribute('data-cv-density', c.cvCardDensity)
  }
}
