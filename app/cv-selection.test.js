import { describe, expect, test } from 'bun:test'
import { getFeaturedCvProjects } from './cv-selection.js'

describe('getFeaturedCvProjects', () => {
  test('returns only projects flagged as featured in source order', () => {
    const projects = [
      { id: 'api', featured: true },
      { id: 'landing', featured: false },
      { id: 'tooling', featured: true },
      { id: 'draft' },
    ]

    expect(getFeaturedCvProjects(projects).map((project) => project.id)).toEqual(['api', 'tooling'])
  })

  test('handles missing or invalid project arrays', () => {
    expect(getFeaturedCvProjects(null)).toEqual([])
    expect(getFeaturedCvProjects({ id: 'not-an-array' })).toEqual([])
  })
})
