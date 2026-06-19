#!/usr/bin/env bun
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, join } from 'path'

const ROOT = resolve(import.meta.dir, '..', '..', '..', '..')
const PROJECTS_DIR = resolve(ROOT, 'content', 'projects')
const ORDER_PATH = resolve(PROJECTS_DIR, 'order.json')

const VALID_CATEGORIES = ['dev', 'webdesign', '3d', 'animation', 'logo', 'tooling', 'devops', 'ai', 'tools']

function sanitizeId(raw: string): string {
  return raw.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function readOrder(): string[] {
  if (!existsSync(ORDER_PATH)) return []
  try { return JSON.parse(readFileSync(ORDER_PATH, 'utf8')) } catch { return [] }
}

function writeOrder(order: string[]) {
  writeFileSync(ORDER_PATH, JSON.stringify(order, null, 2) + '\n', 'utf8')
}

function validate(project: Record<string, unknown>): string | null {
  if (!project.name || typeof project.name !== 'string') return 'name is required'
  if (!project.categories || !Array.isArray(project.categories) || project.categories.length === 0) return 'categories is required (non-empty array)'
  for (const cat of project.categories as string[]) {
    if (!VALID_CATEGORIES.includes(cat)) return `invalid category: "${cat}". Valid: ${VALID_CATEGORIES.join(', ')}`
  }
  if (!project.techs || !Array.isArray(project.techs)) return 'techs is required (array of {label, tech})'
  for (const t of project.techs as Array<{ label?: string; tech?: string }>) {
    if (!t.label || typeof t.label !== 'string') return 'each tech must have a label'
    if (!t.tech || typeof t.tech !== 'string') return `tech "${t.label || '?'}" must have a tech key`
  }
  if (project.startDate) {
    if (typeof project.startDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(project.startDate))
      return 'startDate must be YYYY-MM-DD'
  }
  if (project.endDate !== null && project.endDate !== undefined) {
    if (typeof project.endDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(project.endDate))
      return 'endDate must be YYYY-MM-DD or null'
  }
  return null
}

function main() {
  const input = process.argv[2]
  if (!input) {
    console.error('Usage: bun add-project.ts \'{"name":"...","categories":["dev"],...}\'')
    process.exit(1)
  }

  let payload: Record<string, unknown>
  try { payload = JSON.parse(input) } catch {
    console.error('Invalid JSON input')
    process.exit(1)
  }

  const error = validate(payload)
  if (error) {
    console.error(`Validation error: ${error}`)
    process.exit(1)
  }

  const id = sanitizeId(payload.id as string || payload.name as string)
  if (!id) {
    console.error('Could not generate a valid project id')
    process.exit(1)
  }

  const { caseStudy, period, duration, ...meta } = payload as Record<string, unknown>

  const projectDir = resolve(PROJECTS_DIR, id)
  if (!existsSync(projectDir)) mkdirSync(projectDir, { recursive: true })

  const projectJson = { id, ...meta }
  if (period) delete (projectJson as Record<string, unknown>).period
  if (duration) delete (projectJson as Record<string, unknown>).duration
  delete (projectJson as Record<string, unknown>).caseStudy

  writeFileSync(resolve(projectDir, 'project.json'), JSON.stringify(projectJson, null, 2) + '\n', 'utf8')
  writeFileSync(resolve(projectDir, 'case-study.md'), typeof caseStudy === 'string' ? caseStudy : '', 'utf8')

  const order = readOrder()
  if (!order.includes(id)) {
    order.push(id)
    writeOrder(order)
  }

  console.log(JSON.stringify({
    ok: true,
    id,
    files: {
      project: resolve(projectDir, 'project.json'),
      caseStudy: resolve(projectDir, 'case-study.md'),
      order: ORDER_PATH,
    },
    note: 'index.json will be rebuilt by Vite HMR or next dev/build start',
  }, null, 2))
}

main()
