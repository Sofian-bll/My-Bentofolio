import { describe, expect, test } from 'bun:test'
import { buildProjectsFromContent } from './project-content-loader.js'

describe('buildProjectsFromContent', () => {
  test('returns projects in order.json order', () => {
    const projectModules = {
      '../content/projects/b/project.json': { default: { id: 'b', title: 'B' } },
      '../content/projects/a/project.json': { default: { id: 'a', title: 'A' } },
    }
    const caseStudyModules = {}
    const result = buildProjectsFromContent({ order: ['b', 'a'], projectModules, caseStudyModules })
    expect(result.length).toBe(2)
    expect(result[0].id).toBe('b')
    expect(result[1].id).toBe('a')
  })

  test('attaches case-study.md content as caseStudy', () => {
    const projectModules = {
      '../content/projects/x/project.json': { default: { id: 'x' } },
    }
    const caseStudyModules = {
      '../content/projects/x/case-study.md': { default: '# Hello\n\nWorld' },
    }
    const result = buildProjectsFromContent({ order: ['x'], projectModules, caseStudyModules })
    expect(result[0].caseStudy).toBe('# Hello\n\nWorld')
  })

  test('ignores orphan project folders not in order', () => {
    const projectModules = {
      '../content/projects/orphan/project.json': { default: { id: 'orphan' } },
      '../content/projects/listed/project.json': { default: { id: 'listed' } },
    }
    const caseStudyModules = {}
    const result = buildProjectsFromContent({ order: ['listed'], projectModules, caseStudyModules })
    expect(result.length).toBe(1)
    expect(result[0].id).toBe('listed')
  })

  test('handles missing caseStudy gracefully', () => {
    const projectModules = {
      '../content/projects/y/project.json': { default: { id: 'y' } },
    }
    const caseStudyModules = {}
    const result = buildProjectsFromContent({ order: ['y'], projectModules, caseStudyModules })
    expect(result[0].caseStudy).toBe('')
  })

  test('skips projects missing from projectModules', () => {
    const projectModules = {}
    const caseStudyModules = {}
    const result = buildProjectsFromContent({ order: ['missing'], projectModules, caseStudyModules })
    expect(result.length).toBe(0)
  })
})
