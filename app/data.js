/* =============================================
   BENTOFOLIO — DATA (ES module, v5: config.json)
   ============================================= */
import baseConfig from '../config.json'
import {
  getBrowserStorage,
  getRuntimeConfigFromMessage,
  isPreviewFrame,
  markFeaturedProjects,
  resolveAppConfig,
} from './config-runtime.js'

const appConfig = resolveAppConfig(
  baseConfig,
  getBrowserStorage(globalThis),
  { isPreviewFrame: isPreviewFrame(typeof window !== 'undefined' ? window : null) },
)

const profile = appConfig.profile || {}

const personalInfo = {
  firstName: profile.firstName || 'Sofian',
  lastName: profile.lastName || 'BELLOUL',
  role: profile.role || 'Développeur Web Full Stack',
  bio: profile.bio || '',
  photoUrl: appConfig.photo || null,
  alternance: profile.alternance || { start: 'sept. 2026', duration: '14 mois', rythme: '6/2 sem.' },
}

const contactInfos = (profile.contactInfos || []).filter((c) => c.visible !== false)
  .map((c) => ({ key: c.key, value: c.value }))

const socialLinks = appConfig.socialLinks || []

const skillGroups = profile.skillGroups || []

const formations = profile.formations || []

const interests = profile.interests || []

const categories = {
  dev:        { label: 'Dev',        color: 'var(--cat-dev)',        glyph: 'code' },
  webdesign:  { label: 'Webdesign',  color: 'var(--cat-webdesign)',  glyph: 'layout' },
  '3d':       { label: '3D',         color: 'var(--cat-3d)',         glyph: 'cube' },
  animation:  { label: 'Animation',  color: 'var(--cat-animation)',  glyph: 'play' },
  logo:       { label: 'Logo & Charte', color: 'var(--cat-logo)',    glyph: 'pen' },
  tooling:    { label: 'Outils',     color: 'var(--cat-tooling)',    glyph: 'tool' },
  devops:     { label: 'DevOps',     color: 'var(--cat-devops)',     glyph: 'server' },
  ai:         { label: 'IA & Data',  color: 'var(--cat-ai)',         glyph: 'brain' },
  tools:      { label: 'Outils',     color: 'var(--cat-tools)',      glyph: 'wrench' },
}

const sectionLabels = profile.sectionLabels || {}

const projects = markFeaturedProjects(appConfig.projects || [], appConfig.cv?.featured)
appConfig.projects = projects

export const DATA = {
  personalInfo, contactInfos, socialLinks, skillGroups, formations, interests,
  categories, projects, profile, sectionLabels,
}

export const APP_CONFIG = appConfig

/* ─── Runtime overrides (admin preview in iframe via parent postMessage) ─── */
if (typeof window !== 'undefined') window.addEventListener('message', (e) => {
  const cfg = getRuntimeConfigFromMessage(e, window)
  if (cfg) {
    if (cfg.cv) {
      appConfig.cv = { ...appConfig.cv, ...cfg.cv }
      DATA.projects = markFeaturedProjects(DATA.projects, appConfig.cv?.featured)
      appConfig.projects = DATA.projects
    }
    if (Array.isArray(cfg.projects)) {
      DATA.projects = markFeaturedProjects(cfg.projects, appConfig.cv?.featured)
      appConfig.projects = DATA.projects
    }
    if (Array.isArray(cfg.socialLinks)) DATA.socialLinks = cfg.socialLinks
    if (cfg.photo != null) DATA.personalInfo.photoUrl = cfg.photo || null

    if (cfg.appearance) {
      const a = cfg.appearance
      const root = document.documentElement
      const DENSITY_GAP = { compact: '12px', cozy: '16px', large: '24px' }
      if (a.accent) root.style.setProperty('--brand', a.accent)
      if (a.density) root.style.setProperty('--bento-gap', DENSITY_GAP[a.density] || '16px')
      if (a.displayFont) root.style.setProperty('--font-display', `'${a.displayFont}', 'Syne', sans-serif`)
      if (a.radius) root.setAttribute('data-radius', a.radius)
      if (a.photo) root.setAttribute('data-photo', a.photo)
    }
    if (cfg.cv) {
      const c = cfg.cv
      const root = document.documentElement
      if (c.cvPhoto) root.setAttribute('data-cv-photo', c.cvPhoto)
      if (c.cvPills) root.setAttribute('data-cv-pills', c.cvPills)
      if (c.cvCardDensity) root.setAttribute('data-cv-density', c.cvCardDensity)
    }
  }
})

/* Category helpers */
export function projCats(p) {
  if (!p) return []
  if (Array.isArray(p.categories) && p.categories.length) return p.categories
  return p.category ? [p.category] : []
}
export function primaryCat(p) { return projCats(p)[0] }
