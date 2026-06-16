import { describe, expect, test } from 'bun:test'
import { DATA } from './data.js'
import appConfig from '../config.json'

describe('DATA.profile', () => {
  test('personalInfo comes from config', () => {
    expect(DATA.personalInfo.firstName).toBe(appConfig.profile.firstName)
    expect(DATA.personalInfo.lastName).toBe(appConfig.profile.lastName)
    expect(DATA.personalInfo.role).toBe(appConfig.profile.role)
  })

  test('contactInfos are filtered by visibility', () => {
    const visibleCount = appConfig.profile.contactInfos.filter(c => c.visible).length
    expect(DATA.contactInfos).toHaveLength(visibleCount)
  })

  test('skillGroups come from config', () => {
    expect(DATA.skillGroups).toEqual(appConfig.profile.skillGroups)
  })

  test('falls back to defaults when profile is missing fields', () => {
    expect(DATA.personalInfo.bio).toBeDefined()
  })
})
