import React, { useEffect, useState } from 'react'
import { marked, Renderer } from 'marked'
import { changelogsContext } from '../../utils'

// FULL EMOJI MAP (all GitHub shortcodes)
import { emojiMap } from '../../utils/emojiMap'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface ChangelogChange {
  description: string
  breaking: boolean
}

interface ChangelogEntry {
  date: string
  changes: ChangelogChange[]
}

interface ChangelogProps {
  category: string
  id: string
}

type ChangelogState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'empty' }
  | { status: 'ready'; entries: ChangelogEntry[] }

// ─────────────────────────────────────────────
// Inline styles (unchanged)
// ─────────────────────────────────────────────
const styles = {
  list: {
    listStyleType: 'disc',
    marginLeft: '1.5rem',
  } as React.CSSProperties,
  entry: {
    marginBottom: '0.5rem',
  } as React.CSSProperties,
  nestedList: {
    listStyleType: 'disc',
    marginTop: '0.5rem',
    marginLeft: '1.5rem',
  } as React.CSSProperties,
  inlineMessage: {
    margin: 0,
    color: 'var(--ifm-color-emphasis-600)',
  } as React.CSSProperties,
  warning: {
    fontWeight: 600,
  } as React.CSSProperties,
}

// ─────────────────────────────────────────────
// Build emoji lookup map from JSON (GitHub Compatible)
// ─────────────────────────────────────────────
const emojiMap: Record<string, string> = {}

emojiMapJson.forEach((entry: any) => {
  if (entry.names && entry.emoji) {
    entry.names.forEach((name: string) => {
      emojiMap[`:${name}:`] = entry.emoji
    })
  }
})

const replaceEmojiCodes = (text: string): string => {
  // Support all GitHub shortcodes, including +1, -1, snake_case
  return text.replace(
    /:([a-zA-Z0-9_+-]+):/g,
    (match) => emojiMap[match] || match,
  )
}

// ─────────────────────────────────────────────
// Marked v17 configuration
// ─────────────────────────────────────────────
const renderer = new Renderer()

renderer.link = ({ href, title, text }) => {
  const titleAttr = title ? ` title="${title}"` : ''
  return `<a href="${href}" target="_blank" rel="noopener noreferrer"${titleAttr}>${text}</a>`
}

marked.setOptions({
  gfm: true,
  breaks: true,
  async: false, // REQUIRED for synchronous parse()
  renderer,
})

// ─────────────────────────────────────────────
// Markdown → Inline-safe HTML
// ─────────────────────────────────────────────
const markdownToHtml = (markdown: string): string => {
  const withEmojis = replaceEmojiCodes(markdown)
  let html = marked.parse(withEmojis) as string

  // Remove surrounding <p> to keep inline formatting correct
  html = html.replace(/^<p>/, '').replace(/<\/p>\s*$/, '')
  return html.trim()
}

const renderDescription = (description: string): React.ReactNode => (
  <span dangerouslySetInnerHTML={{ __html: markdownToHtml(description) }} />
)

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
const Changelog: React.FC<ChangelogProps> = ({ category, id }) => {
  const [state, setState] = useState<ChangelogState>({ status: 'loading' })

  useEffect(() => {
    let isMounted = true

    const loadChangelog = () => {
      try {
        const path = `./${category}/${id}/changelog.json`
        const parsed = changelogsContext(path) as unknown as ChangelogEntry[]

        if (!isMounted) return

        if (!parsed || parsed.length === 0) {
          setState({ status: 'empty' })
          return
        }

        setState({ status: 'ready', entries: parsed })
      } catch (error) {
        if (!isMounted) return
        const message =
          error instanceof Error ? error.message : 'Unable to load changelog.'

        if (/not found/i.test(message)) {
          setState({ status: 'empty' })
        } else {
          setState({ status: 'error', message })
        }
      }
    }

    loadChangelog()
    return () => {
      isMounted = false
    }
  }, [category, id])

  // STATES
  if (state.status === 'loading') {
    return <p style={styles.inlineMessage}>Loading changelog…</p>
  }

  if (state.status === 'error') {
    return (
      <p style={styles.inlineMessage}>
        Unable to load changelog. {state.message}
      </p>
    )
  }

  if (state.status === 'empty') {
    return (
      <p style={styles.inlineMessage}>No changelog entries available yet.</p>
    )
  }

  // READY
  return (
    <ul style={styles.list}>
      {state.entries.map((entry) => {
        const hasMultiple = entry.changes.length > 1
        const hasBreaking = entry.changes.some((c) => c.breaking)

        return (
          <li key={entry.date} style={styles.entry}>
            <strong>{entry.date}</strong>

            {hasMultiple || hasBreaking ? (
              <ul style={styles.nestedList}>
                {entry.changes.map((change, index) => (
                  <li key={`${entry.date}-${index}`}>
                    {change.breaking && (
                      <span style={styles.warning}>
                        <strong>🚨 Breaking Change</strong> :
                      </span>
                    )}
                    {change.breaking && ' '}
                    {renderDescription(change.description)}
                  </li>
                ))}
              </ul>
            ) : (
              <>: {renderDescription(entry.changes[0]?.description || '')}</>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default Changelog
