import { describe, expect, test } from 'bun:test'
import { projects } from './projects.js'

describe('content/projects', () => {
  test('exports one code-friendly file per project in portfolio order', () => {
    expect(projects.length).toBeGreaterThan(10)
    expect(projects.map((project) => project.id)).toContain('connect-in')
    expect(projects.every((project) => project.id && project.name && project.description)).toBe(true)
  })

  test('supports multiline markdown case studies directly in project files', () => {
    const project = projects.find((item) => item.id === 'connect-in')

    expect(project).toBeDefined()
    expect(project.caseStudy).toContain('\n')
    expect(project.caseStudy).toContain('#')
  })
})
