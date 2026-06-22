import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'fs'

function extractRule(css, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(escaped + '\\s*\\{([^}]+)\\}', 's')
  const m = css.match(re)
  return m ? m[1].replace(/\s+/g, ' ').trim() : null
}

const css = readFileSync(__dirname + '/components.css', 'utf8')

describe('.proj-mini .thumb', () => {
  test('fills card width by compensating for card padding', () => {
    const rule = extractRule(css, '.proj-mini .thumb')
    expect(rule).toBeTruthy()
    expect(rule).toContain('width: calc(100% + var(--s4) * 2)')
  })

  test('has no border so it blends with the card edge', () => {
    const rule = extractRule(css, '.proj-mini .thumb')
    expect(rule).toBeTruthy()
    expect(rule).toContain('border: none')
  })

  test('has overflow hidden to clip content to rounded-top corners', () => {
    const rule = extractRule(css, '.proj-mini .thumb')
    expect(rule).toBeTruthy()
    expect(rule).toContain('overflow: hidden')
  })
})

describe('.proj-mini', () => {
  test('has overflow hidden to clip thumb to card border-radius', () => {
    const rule = extractRule(css, '.proj-mini')
    expect(rule).toBeTruthy()
    expect(rule).toContain('overflow: hidden')
  })
})
