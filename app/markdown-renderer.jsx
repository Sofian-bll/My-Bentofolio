import React from 'react'
import { resolveImageSrc } from './config-runtime.js'

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function parseMarkdownLine(text) {
  let html = escapeHtml(text)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/`(.+?)`/g, '<code>$1</code>')
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => `<img src="${resolveImageSrc(src)}" alt="${alt}" loading="lazy" />`)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
  return html
}

function parseImage(trimmed) {
  return trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
}

export function Markdown({ text, className }) {
  if (!text) return null

  const lines = text.split('\n')
  const elements = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (trimmed === '') {
      i++
      continue
    }

    const image = parseImage(trimmed)

    if (trimmed.startsWith('```')) {
      const code = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        code.push(lines[i])
        i++
      }
      if (i < lines.length) i++
      elements.push(<pre key={`code-${i}`} className="md-codeblock"><code>{code.join('\n')}</code></pre>)
    } else if (trimmed.startsWith('### ')) {
      elements.push(<h4 key={i} className="md-h4" dangerouslySetInnerHTML={{ __html: parseMarkdownLine(trimmed.slice(4)) }} />)
      i++
    } else if (trimmed.startsWith('## ')) {
      elements.push(<h3 key={i} className="md-h3" dangerouslySetInnerHTML={{ __html: parseMarkdownLine(trimmed.slice(3)) }} />)
      i++
    } else if (trimmed.startsWith('# ')) {
      elements.push(<h2 key={i} className="md-h2" dangerouslySetInnerHTML={{ __html: parseMarkdownLine(trimmed.slice(2)) }} />)
      i++
    } else if (trimmed.startsWith('- ')) {
      const items = []
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        items.push(<li key={i} dangerouslySetInnerHTML={{ __html: parseMarkdownLine(lines[i].trim().slice(2)) }} />)
        i++
      }
      elements.push(<ul key={`ul-${i}`} className="md-list">{items}</ul>)
    } else if (/^\d+\.\s+/.test(trimmed)) {
      const items = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(<li key={i} dangerouslySetInnerHTML={{ __html: parseMarkdownLine(lines[i].trim().replace(/^\d+\.\s+/, '')) }} />)
        i++
      }
      elements.push(<ol key={`ol-${i}`} className="md-list md-list--ordered">{items}</ol>)
    } else if (trimmed.startsWith('> ')) {
      const quote = []
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        quote.push(lines[i].trim().slice(2))
        i++
      }
      elements.push(<blockquote key={`quote-${i}`} className="md-quote" dangerouslySetInnerHTML={{ __html: parseMarkdownLine(quote.join('<br />')) }} />)
    } else if (image) {
      const [, alt, src] = image
      elements.push(
        <figure key={i} className="md-figure">
          <img src={resolveImageSrc(src)} alt={alt} loading="lazy" />
          {alt && <figcaption>{alt}</figcaption>}
        </figure>,
      )
      i++
    } else {
      elements.push(<p key={i} dangerouslySetInnerHTML={{ __html: parseMarkdownLine(line) }} />)
      i++
    }
  }

  if (elements.length === 0) return null

  return <div className={className || 'md-content'}>{elements}</div>
}
