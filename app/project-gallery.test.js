import { describe, expect, test } from 'bun:test'
import { getProjectGalleryState, sortProjects } from './project-gallery.js'

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

describe('sortProjects', () => {
  const items = [
    { id: 'zoo', name: 'zoo', period: '2024' },
    { id: 'alpha', name: 'alpha', period: '2026' },
    { id: 'mid', name: 'mid', period: '2025' },
  ]

  test('default preserves original order', () => {
    expect(sortProjects(items, 'default').map((p) => p.id)).toEqual(['zoo', 'alpha', 'mid'])
  })

  test('az sorts alphabetically', () => {
    expect(sortProjects(items, 'az').map((p) => p.id)).toEqual(['alpha', 'mid', 'zoo'])
  })

  test('za sorts reverse alphabetically', () => {
    expect(sortProjects(items, 'za').map((p) => p.id)).toEqual(['zoo', 'mid', 'alpha'])
  })

  test('recent sorts by period newest first', () => {
    expect(sortProjects(items, 'recent').map((p) => p.id)).toEqual(['alpha', 'mid', 'zoo'])
  })

  test('recent falls back to name when periods equal', () => {
    const sameYear = [
      { id: 'b', name: 'b', period: '2025' },
      { id: 'a', name: 'a', period: '2025' },
    ]
    expect(sortProjects(sameYear, 'recent').map((p) => p.id)).toEqual(['a', 'b'])
  })

  test('recent parses range periods like "2022 – 2024"', () => {
    const ranges = [
      { id: 'old', name: 'old', period: '2020 – 2022' },
      { id: 'new', name: 'new', period: '2024 – 2026' },
    ]
    expect(sortProjects(ranges, 'recent').map((p) => p.id)).toEqual(['new', 'old'])
  })

  test('missing period sorts last', () => {
    const mixed = [
      { id: 'a', name: 'a', period: '2025' },
      { id: 'b', name: 'b', period: undefined },
      { id: 'c', name: 'c', period: '2023' },
    ]
    expect(sortProjects(mixed, 'recent').map((p) => p.id)).toEqual(['a', 'c', 'b'])
  })
})

describe('getProjectGalleryState with sort', () => {
  const projs = [
    { id: 'z', name: 'z', categories: ['dev'], period: '2026' },
    { id: 'a', name: 'a', categories: ['dev'], period: '2024' },
    { id: 'm', name: 'm', categories: ['dev'], period: '2025' },
  ]
  const cats = { dev: { label: 'Dev' } }

  test('filter + sort works together', () => {
    const state = getProjectGalleryState({ projects: projs, categories: cats, filter: 'dev', sort: 'az' })
    expect(state.shown.map((p) => p.id)).toEqual(['a', 'm', 'z'])
  })

  test('all filter with az sort', () => {
    const state = getProjectGalleryState({ projects: projs, categories: cats, filter: 'all', sort: 'az' })
    expect(state.shown.map((p) => p.id)).toEqual(['a', 'm', 'z'])
  })
})
