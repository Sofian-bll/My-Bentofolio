import { describe, expect, test } from 'bun:test'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const contentDir = dirname(fileURLToPath(import.meta.url))
const projectsDir = join(contentDir, 'projects')
const projectOrderPath = join(projectsDir, 'order.json')
const legacyProjectsIndexPath = join(contentDir, 'projects.js')

describe('content/projects', () => {
  test('stores projects as ordered JSON metadata and Markdown case-study folders', () => {
    expect(existsSync(projectOrderPath)).toBe(true)

    const order = JSON.parse(readFileSync(projectOrderPath, 'utf8'))

    expect(Array.isArray(order)).toBe(true)
    expect(order.length).toBeGreaterThan(0)

    for (const id of order) {
      const projectJsonPath = join(projectsDir, id, 'project.json')
      const caseStudyPath = join(projectsDir, id, 'case-study.md')

      expect(existsSync(projectJsonPath)).toBe(true)
      expect(existsSync(caseStudyPath)).toBe(true)

      const project = JSON.parse(readFileSync(projectJsonPath, 'utf8'))

      expect(project).not.toHaveProperty('caseStudy')
    }

    expect(existsSync(legacyProjectsIndexPath)).toBe(false)
    expect(readdirSync(projectsDir).filter((entry) => entry.endsWith('.js'))).toEqual([])
  })
})
