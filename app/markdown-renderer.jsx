import React from 'react'

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function parseMarkdownLine(text) {
  let html = escapeHtml(text)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/`(.+?)`/g, '<code>$1</code>')
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />')
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
  return html
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

    if (trimmed.startsWith('### ')) {
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
    } else if (trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)) {
      elements.push(<p key={i} className="md-image" dangerouslySetInnerHTML={{ __html: parseMarkdownLine(trimmed) }} />)
      i++
    } else {
      elements.push(<p key={i} dangerouslySetInnerHTML={{ __html: parseMarkdownLine(line) }} />)
      i++
    }
  }

  if (elements.length === 0) return null

  return <div className={className || 'md-content'}>{elements}</div>
}
