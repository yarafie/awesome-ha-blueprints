/**
 * Component: Changelog
 * ────────────────────────────────────────────────────────────────
 * Purpose:
 *   Renders a blueprint’s changelog from its changelog.json file.
 *
 * Changelog :):
 *   • Initial Version (@EPMatt)
 *   - Updated 2026.12.02 (@yarafie):
 *      1. Moved utils.ts to utils/contexts.ts
 *      2. Migrated to Marked v17 configuration with custom Renderer.
 *      3. Added emoji replacement to support :emoji_codes:
 *      4. Added explicit variant support
 * ────────────────────────────────────────────────────────────────
 */
import React, { useEffect, useState } from 'react'
import { marked, Renderer } from 'marked'
import { LibraryChangelogsContext } from '../../utils/library_contexts' //1. Moved utils.ts to utils/contexts.ts

// 2. Added emoji replacement to support :emoji_codes:
// Import the full emoji map
import { emojiMap } from '../../utils/emojiMap'

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
  variant?: string // 3. Added explicit variant support
}

type ChangelogState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'empty' }
  | { status: 'ready'; entries: ChangelogEntry[] }

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

// 2. Migrated to Marked v17 configuration with custom Renderer.
// ─────────────────────────────────────────────
// Marked v17 configuration
// ─────────────────────────────────────────────
// Configure marked for inline markdown parsing
// Customize link renderer to open links in new tab
const renderer = new Renderer()
renderer.link = ({ href, title, text }) => {
  const titleAttr = title ? ` title="${title}"` : ''
  return `<a href="${href}" target="_blank" rel="noopener noreferrer"${titleAttr}>${text}</a>`
}

marked.setOptions({
  breaks: true, // Convert line breaks to <br>
  gfm: true, // GitHub Flavored Markdown
  async: false, // required for synchronous parse() marked 17
  renderer,
})

// 3. Added emoji replacement to support :emoji_codes:
// ─────────────────────────────────────────────
// Emoji replacement — uses imported emojiMap
// ─────────────────────────────────────────────
const replaceEmojiCodes = (text: string): string => {
  // Supports +1, -1, underscores, skin-tones, flags, etc.
  return text.replace(
    /:([a-zA-Z0-9_+-]+):/g,
    (match) => emojiMap[match] || match,
  )
}

// ─────────────────────────────────────────────
// Markdown → HTML (inline safe)
// ─────────────────────────────────────────────
const markdownToHtml = (markdown: string): string => {
  const withEmojis = replaceEmojiCodes(markdown)
  // Use parse() to handle line breaks properly, then strip <p> wrapper tags
  // to avoid extra spacing in inline contexts
  let html = marked.parse(withEmojis) as string
  // Remove leading/trailing <p> tags and their content wrappers
  html = html.replace(/^<p>/, '').replace(/<\/p>\s*$/, '')
  return html.trim()
}

const renderDescription = (description: string) => (
  <span dangerouslySetInnerHTML={{ __html: markdownToHtml(description) }} />
)

const Changelog: React.FC<ChangelogProps> = ({ category, id, variant }) => {
  const [state, setState] = useState<ChangelogState>({ status: 'loading' })

  useEffect(() => {
    let isMounted = true

    const loadChangelog = () => {
      try {
        // Default non-variant path
        let path = `./${category}/${id}/changelog.json`

        // 4. If controller + variant provided → use variant changelog.json
        if (category === 'controllers' && variant) {
          const variantPath = `./controllers/${id}/${variant}/changelog.json`
          if (LibraryChangelogsContext.keys().includes(variantPath)) {
            path = variantPath
          }
        }

        const parsed = LibraryChangelogsContext(
          path,
        ) as unknown as ChangelogEntry[]
        if (!isMounted) return
        if (!parsed || parsed.length === 0) {
          setState({ status: 'empty' })
          return
        }

        setState({ status: 'ready', entries: parsed })
      } catch (error) {
        if (!isMounted) return

        // If the file is not found by the context, consider it empty
        const message =
          error instanceof Error ? error.message : 'Unable to load changelog.'

        if (
          /^\.\/.+changelog\.json$/.test(message) ||
          /not found/i.test(message)
        ) {
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
  }, [category, id, variant]) // 3. Added explicit variant support

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
    <>
      <ul style={styles.list}>
        {state.entries.map((entry) => {
          const hasMultipleChanges = entry.changes.length > 1
          const hasBreakingChanges = entry.changes.some(
            (change) => change.breaking,
          )

          return (
            <li key={`${entry.date}`} style={styles.entry}>
              <strong>{entry.date}</strong>
              {hasMultipleChanges || hasBreakingChanges ? (
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
                <>: {renderDescription(entry.changes[0]?.description ?? '')}</>
              )}
            </li>
          )
        })}
      </ul>
    </>
  )
}

export default Changelog
