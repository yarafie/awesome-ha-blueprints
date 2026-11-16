/**
 * Component: Changelog
 * ────────────────────────────────────────────────────────────────
 * Purpose:
 *   Renders a blueprint release changelog from its changelog.json file.
 *
 * Changelog :):
 *   • Initial Version (@EPMatt)
 *   - Updated 2025.12.02 (@yarafie):
 *      1. Moved utils.ts to utils/contexts.ts
 *      2. Migrated to Marked v17 configuration with custom Renderer.
 *      3. Added emoji replacement to support :emoji_codes:
 *      4. Migrated from variant to library / release / version model
 *      5. Aligned with unified changelog.schema.json
 * ────────────────────────────────────────────────────────────────
 */
import React, { useEffect, useState } from 'react'
import { markdownToHtml } from '@src/utils/safeMarkdown'
import { changelogsContext } from '@src/utils/libraryContexts' //1. Moved utils.ts to utils/contexts.ts
// 2. Added emoji replacement to support :emoji_codes:
// Import the full emoji map

interface ChangelogExternalReference {
  label: string
  url: string
}

interface ChangelogChange {
  author?: string
  description: string
  type?: 'feature' | 'fix' | 'refactor' | 'docs' | 'breaking'
  breaking?: boolean
  external_references?: ChangelogExternalReference[]
}

interface ChangelogEntry {
  date: string
  changes: ChangelogChange[]
}

interface ChangelogProps {
  category: string
  id: string
  library: string
  release: string
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
  meta: {
    marginLeft: '0.25rem',
    color: 'var(--ifm-color-emphasis-600)',
    fontSize: '0.875rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
  } as React.CSSProperties,
  authorAvatar: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    objectFit: 'cover',
  } as React.CSSProperties,
}

const renderDescription = (description: string) => (
  <span dangerouslySetInnerHTML={{ __html: markdownToHtml(description) }} />
)

// Normalize author → username (strip @)
const normalizeAuthor = (author: string) => author.replace(/^@/, '')

const Changelog: React.FC<ChangelogProps> = ({
  category,
  id,
  library,
  release,
}) => {
  const [state, setState] = useState<ChangelogState>({ status: 'loading' })

  useEffect(() => {
    let isMounted = true
    const loadChangelog = () => {
      try {
        const path = `./${category}/${id}/${library}/${release}/changelog.json`
        const parsed = changelogsContext(path) as unknown as ChangelogEntry[]
        if (!isMounted) return
        if (!parsed || parsed.length === 0) {
          setState({ status: 'empty' })
          return
        }
        setState({ status: 'ready', entries: parsed })
      } catch (error) {
        if (!isMounted) return
        setState({
          status: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Unable to load changelog.',
        })
      }
    }
    loadChangelog()
    return () => {
      isMounted = false
    }
  }, [category, id, library, release])

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
          const hasSingleChange = entry.changes.length === 1
          const singleChange = entry.changes[0]

          return (
            <li key={entry.date} style={styles.entry}>
              {/* One Change only in that date:
                  <date> - <author> - <?Breaking Change?> - <Description> */}
              {hasSingleChange ? (
                <>
                  <strong>{entry.date}</strong>

                  {singleChange.author &&
                    (() => {
                      const author = normalizeAuthor(singleChange.author)
                      return (
                        <span style={styles.meta}>
                          —
                          <img
                            src={`https://github.com/${author}.png`}
                            alt={`${author} avatar`}
                            style={styles.authorAvatar}
                          />
                          <a
                            href={`https://github.com/${author}`}
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            {author}
                          </a>
                        </span>
                      )
                    })()}

                  {(singleChange.breaking ||
                    singleChange.type === 'breaking') && (
                    <span style={styles.warning}> — 🚨 Breaking Change</span>
                  )}

                  {' — '}
                  {renderDescription(singleChange.description)}
                </>
              ) : (
                <>
                  {/* More than one change:
                      <date>
                        . <author> - <?Breaking Change?> - <Description 1>
                        . <author> - <?Breaking Change?> - <Description 2> */}
                  <strong>{entry.date}</strong>
                  <ul style={styles.nestedList}>
                    {entry.changes.map((change, index) => {
                      const author = change.author
                        ? normalizeAuthor(change.author)
                        : null
                      return (
                        <li key={`${entry.date}-${index}`}>
                          {author && (
                            <span style={styles.meta}>
                              <img
                                src={`https://github.com/${author}.png`}
                                alt={`${author} avatar`}
                                style={styles.authorAvatar}
                              />
                              <a
                                href={`https://github.com/${author}`}
                                target='_blank'
                                rel='noopener noreferrer'
                              >
                                {author}
                              </a>
                              {' — '}
                            </span>
                          )}
                          {(change.breaking || change.type === 'breaking') && (
                            <span style={styles.warning}>
                              🚨 Breaking Change —{' '}
                            </span>
                          )}
                          {renderDescription(change.description)}
                        </li>
                      )
                    })}
                  </ul>
                </>
              )}
            </li>
          )
        })}
      </ul>
    </>
  )
}

export default Changelog
