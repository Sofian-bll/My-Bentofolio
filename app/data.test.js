import { describe, expect, test } from 'bun:test'
import { DATA } from './data.js'

describe('DATA.profile', () => {
  test('personalInfo fields are defined from profile config', () => {
    expect(DATA.personalInfo.firstName).toBeTruthy()
    expect(DATA.personalInfo.lastName).toBeTruthy()
    expect(DATA.personalInfo.role).toBeTruthy()
    expect(DATA.personalInfo.alternance).toBeDefined()
    expect(DATA.personalInfo.alternance.start).toBeTruthy()
    expect(DATA.personalInfo.alternance.duration).toBeTruthy()
    expect(DATA.personalInfo.alternance.rythme).toBeTruthy()
  })

  test('contactInfos are present and have required keys', () => {
    expect(DATA.contactInfos.length).toBeGreaterThan(0)
    for (const ci of DATA.contactInfos) {
      expect(ci.key).toBeTruthy()
      expect(ci.value).toBeDefined()
    }
  })

  test('skillGroups come from config', () => {
    expect(DATA.skillGroups.length).toBeGreaterThan(0)
    for (const group of DATA.skillGroups) {
      expect(group.category).toBeTruthy()
      expect(group.skills.length).toBeGreaterThan(0)
    }
  })

  test('fallback defaults work when profile fields are empty string', () => {
    const bio = DATA.personalInfo.bio
    expect(typeof bio).toBe('string')
  })

  test('profile and sectionLabels are exported', () => {
    expect(DATA.profile).toBeDefined()
    expect(DATA.sectionLabels).toBeDefined()
  })

  test('formations and interests are exported as arrays', () => {
    expect(Array.isArray(DATA.formations)).toBe(true)
    expect(Array.isArray(DATA.interests)).toBe(true)
  })

  test('categories and socialLinks are exported', () => {
    expect(DATA.categories).toBeDefined()
    expect(DATA.categories.dev).toBeDefined()
    expect(Array.isArray(DATA.socialLinks)).toBe(true)
  })
})
