/**
 * Component: LibraryChangelog
 * ────────────────────────────────────────────────────────────────
 * Renders a blueprint’s changelog from its variant-level changelog.json.
 *
 * Expected locations:
 *  - automations/<id>/<variant>/<variant>/changelog.json
 *  - hooks/<id>/<variant>/<variant>/changelog.json
 *  - controllers/<id>/<library>/<variant>/changelog.json
 */
import React, { useEffect, useState } from 'react'
import { marked, Renderer } from 'marked'
import { libraryChangelogsContext } from '../../utils/library_contexts'
import { emojiMap } from '../../utils/emojiMap'

/* ───────────────────────────── Types ───────────────────────────── */

interface LibraryChangelogChange {
  description: string
  breaking: boolean
}

interface LibraryChangelogEntry {
  date: string
  changes: LibraryChangelogChange[]
}

interface LibraryChangelogProps {
  category: 'automation' | 'hooks' | 'controllers'
  id: string
  variant: string
}

type LibraryChangelogState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'empty' }
  | { status: 'ready'; entries: LibraryChangelogEntry[] }

/* ─────────────────────────── Styling ─────────────────────────── */

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

/* ───────────────────── Markdown + Emoji ───────────────────── */

const renderer = new Renderer()
renderer.link = ({ href, title, text }) => {
  const titleAttr = title ? ` title="${title}"` : ''
  return `<a href="${href}" target="_blank" rel="noopener noreferrer"${titleAttr}>${text}</a>`
}

marked.setOptions({
  breaks: true,
  gfm: true,
  async: false,
  renderer,
})

const replaceEmojiCodes = (text: string): string =>
  text.replace(/:([a-zA-Z0-9_+-]+):/g, (m) => emojiMap[m] || m)

const markdownToHtml = (markdown: string): string => {
  let html = marked.parse(replaceEmojiCodes(markdown)) as string
  return html
    .replace(/^<p>/, '')
    .replace(/<\/p>\s*$/, '')
    .trim()
}

const renderDescription = (description: string) => (
  <span dangerouslySetInnerHTML={{ __html: markdownToHtml(description) }} />
)

/* ───────────────────────── Component ───────────────────────── */

const LibraryChangelog: React.FC<LibraryChangelogProps> = ({
  category,
  id,
  variant,
}) => {
  const [state, setState] = useState<LibraryChangelogState>({
    status: 'loading',
  })

  useEffect(() => {
    let mounted = true

    try {
      let path: string

      switch (category) {
        case 'automation':
          path = `./automations/${id}/${variant}/${variant}/changelog.json`
          break
        case 'hooks':
          path = `./hooks/${id}/${variant}/${variant}/changelog.json`
          break
        case 'controllers':
          path = `./controllers/${id}/${variant}/changelog.json`
          break
        default:
          throw new Error(`Unsupported changelog category: ${category}`)
      }

      const entries = libraryChangelogsContext(path) as LibraryChangelogEntry[]

      if (!mounted) return

      if (!entries || entries.length === 0) {
        setState({ status: 'empty' })
      } else {
        setState({ status: 'ready', entries })
      }
    } catch (error) {
      if (!mounted) return
      setState({
        status: 'error',
        message:
          error instanceof Error ? error.message : 'Unable to load changelog.',
      })
    }

    return () => {
      mounted = false
    }
  }, [category, id, variant])

  /* ───────────────────────── Render ───────────────────────── */

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
                {entry.changes.map((change, i) => (
                  <li key={`${entry.date}-${i}`}>
                    {change.breaking && (
                      <span style={styles.warning}>
                        <strong>🚨 Breaking Change</strong>:{' '}
                      </span>
                    )}
                    {renderDescription(change.description)}
                  </li>
                ))}
              </ul>
            ) : (
              <>: {renderDescription(entry.changes[0].description)}</>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default LibraryChangelog
