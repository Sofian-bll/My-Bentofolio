import React from 'react'
import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { Markdown } from './markdown-renderer.jsx'

describe('Markdown', () => {
  test('renders markdown images as figures with resolved relative paths and captions', () => {
    const html = renderToStaticMarkup(
      <Markdown text={'![Dashboard admin](media/projects/connect-in/dashboard.jpg)'} />,
    )

    expect(html).toContain('<figure')
    expect(html).toContain('src="/media/projects/connect-in/dashboard.jpg"')
    expect(html).toContain('<figcaption>Dashboard admin</figcaption>')
  })
})
