import { describe, expect, test } from 'bun:test'
import { getMediaDir, parseDataUrl, sanitizeFilename } from './admin-upload-utils.js'

describe('sanitizeFilename', () => {
  test('keeps alphanumeric, dash and underscore intact', () => {
    expect(sanitizeFilename('photo-01_main.png'))
      .toBe('photo-01_main.png')
  })

  test('replaces spaces with underscores', () => {
    expect(sanitizeFilename('my project photo.png')).toBe('my_project_photo.png')
  })

  test('strips special characters', () => {
    expect(sanitizeFilename('héros@2026!.jpg')).toBe('heros2026.jpg')
  })

  test('preserves extension', () => {
    expect(sanitizeFilename('  Final   Design..JPEG  '))
      .toBe('Final_Design.jpeg')
  })

  test('returns fallback for blank input', () => {
    expect(sanitizeFilename('')).toBe('project')
    expect(sanitizeFilename(' ')).toBe('project')
    expect(sanitizeFilename('...')).toBe('project')
  })
})

describe('parseDataUrl', () => {
  test('extracts mime type, encoding and bytes from a valid data URL', () => {
    const result = parseDataUrl('data:image/png;base64,aGVsbG8=')
    expect(result.mime).toBe('image/png')
    expect(result.encoding).toBe('base64')
    expect(new Uint8Array(result.bytes)).toEqual(new Uint8Array([104, 101, 108, 108, 111]))
  })

  test('returns null for invalid data URLs', () => {
    expect(parseDataUrl('not-a-data-url')).toBeNull()
    expect(parseDataUrl('')).toBeNull()
    expect(parseDataUrl(null)).toBeNull()
  })

  test('defaults encoding to base64 when omitted', () => {
    const result = parseDataUrl('data:image/jpeg,rawcontent')
    expect(result.mime).toBe('image/jpeg')
    expect(result.encoding).toBe('base64')
  })
})

describe('getMediaDir', () => {
  test('returns the media directory path for a project', () => {
    expect(getMediaDir('my-project', '/repo')).toBe('/repo/public/media/projects/my-project')
  })
})
