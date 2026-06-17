import { describe, expect, test } from 'bun:test'
import {
  getBrowserStorage,
  getRuntimeConfigFromMessage,
  markFeaturedProjects,
  resolveAppConfig,
} from './config-runtime.js'

function storageWith(values) {
  return {
    getItem(key) {
      return values[key] ?? null
    },
  }
}

const baseConfig = {
  projects: [{ id: 'disk-project' }],
  socialLinks: [{ label: 'disk-link' }],
  photo: '/disk.jpg',
  appearance: { accent: '#111111', density: 'cozy' },
  cv: { featured: ['disk-project'], cvPhoto: 'rounded' },
  contact: { headline: 'Disk contact', tone: 'direct' },
}

const previewConfig = {
  projects: [{ id: 'preview-project' }],
  socialLinks: [{ label: 'preview-link' }],
  photo: '/preview.jpg',
  appearance: { accent: '#ff0000' },
  cv: { featured: ['preview-project'] },
  contact: { headline: 'Preview contact' },
}

describe('resolveAppConfig', () => {
  test('ignores local preview and import overrides outside the preview iframe', () => {
    const config = resolveAppConfig(
      baseConfig,
      storageWith({
        'bentofolio.preview': JSON.stringify(previewConfig),
        'bentofolio.import': JSON.stringify({ projects: [{ id: 'imported-project' }] }),
      }),
      { isPreviewFrame: false },
    )

    expect(config.projects.map((project) => project.id)).toEqual(['disk-project'])
    expect(config.socialLinks.map((link) => link.label)).toEqual(['disk-link'])
    expect(config.photo).toBe('/disk.jpg')
    expect(config.appearance).toEqual({ accent: '#111111', density: 'cozy' })
    expect(config.cv).toEqual({ featured: ['disk-project'], cvPhoto: 'rounded' })
    expect(config.contact).toEqual({ headline: 'Disk contact', tone: 'direct' })
  })

  test('applies local preview overrides inside the preview iframe only', () => {
    const config = resolveAppConfig(
      baseConfig,
      storageWith({ 'bentofolio.preview': JSON.stringify(previewConfig) }),
      { isPreviewFrame: true },
    )

    expect(config.projects.map((project) => project.id)).toEqual(['preview-project'])
    expect(config.socialLinks.map((link) => link.label)).toEqual(['preview-link'])
    expect(config.photo).toBe('/preview.jpg')
    expect(config.appearance).toEqual({ accent: '#ff0000', density: 'cozy' })
    expect(config.cv).toEqual({ featured: ['preview-project'], cvPhoto: 'rounded' })
    expect(config.contact).toEqual({ headline: 'Preview contact', tone: 'direct' })
  })

  test('returns base config when preview storage is unavailable', () => {
    const config = resolveAppConfig(
      baseConfig,
      { getItem() { throw new Error('storage blocked') } },
      { isPreviewFrame: true },
    )

    expect(config.projects.map((project) => project.id)).toEqual(['disk-project'])
  })
})

describe('getBrowserStorage', () => {
  test('returns null when reading localStorage throws', () => {
    const globalScope = {}
    Object.defineProperty(globalScope, 'localStorage', {
      get() {
        throw new Error('storage blocked')
      },
    })

    expect(getBrowserStorage(globalScope)).toBeNull()
  })
})

describe('markFeaturedProjects', () => {
  test('marks the provided project array instead of a stale previous array', () => {
    const projects = [{ id: 'new-project' }, { id: 'other-project', featured: true }]

    expect(markFeaturedProjects(projects, ['new-project'])).toEqual([
      { id: 'new-project', featured: true },
      { id: 'other-project', featured: false },
    ])
    expect(projects).toEqual([{ id: 'new-project' }, { id: 'other-project', featured: true }])
  })
})

describe('getRuntimeConfigFromMessage', () => {
  test('accepts config updates only from the iframe parent on the same origin', () => {
    const parent = {}
    const windowRef = {
      self: {},
      top: {},
      parent,
      location: { origin: 'http://localhost:5173' },
    }
    const config = { projects: [{ id: 'preview-project' }] }

    expect(getRuntimeConfigFromMessage({
      data: { type: '__bento_config_update', config },
      source: parent,
      origin: 'http://localhost:5173',
    }, windowRef)).toBe(config)

    expect(getRuntimeConfigFromMessage({
      data: { type: '__bento_config_update' },
      source: parent,
      origin: 'http://localhost:5173',
    }, windowRef)).toBeNull()

    expect(getRuntimeConfigFromMessage({
      data: { type: '__bento_config_update', config },
      source: {},
      origin: 'http://localhost:5173',
    }, windowRef)).toBeNull()

    expect(getRuntimeConfigFromMessage({
      data: { type: '__bento_config_update', config },
      source: parent,
      origin: 'https://example.com',
    }, windowRef)).toBeNull()

    expect(getRuntimeConfigFromMessage({
      data: { type: '__bento_config_update', config },
      source: parent,
      origin: 'http://localhost:5173',
    }, { ...windowRef, top: windowRef.self })).toBeNull()
  })
})
