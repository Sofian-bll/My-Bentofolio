import { describe, expect, test } from 'bun:test'
import { getProjectGalleryState } from './project-gallery.js'

const categories = {
  dev: { label: 'Dev' },
  '3d': { label: '3D' },
  animation: { label: 'Animation' },
  webdesign: { label: 'Webdesign' },
}

const projects = [
  { id: 'api', categories: ['dev'] },
  { id: 'seahorse', categories: ['3d', 'animation', 'webdesign'] },
  { id: 'landing', categories: ['webdesign'] },
]

describe('getProjectGalleryState', () => {
  test('all filter returns each project once in source order', () => {
    const state = getProjectGalleryState({ projects, categories, filter: 'all' })

    expect(state.activeFilter).toBe('all')
    expect(state.shown.map((project) => project.id)).toEqual(['api', 'seahorse', 'landing'])
  })

  test('category filter still includes multi-category projects', () => {
    const state = getProjectGalleryState({ projects, categories, filter: 'animation' })

    expect(state.activeFilter).toBe('animation')
    expect(state.shown.map((project) => project.id)).toEqual(['seahorse'])
  })

  test('invalid category falls back to all projects', () => {
    const state = getProjectGalleryState({ projects, categories, filter: 'missing' })

    expect(state.activeFilter).toBe('all')
    expect(state.shown).toHaveLength(3)
  })
})
