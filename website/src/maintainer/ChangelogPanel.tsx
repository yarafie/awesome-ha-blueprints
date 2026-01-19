/**
 * ChangelogPanel
 *
 * Read-only renderer for changelog.json.
 *
 * Backed by changelog.schema.json.
 * Displays entries in descending date order (latest first),
 * with structured change items.
 *
 * This panel is intentionally specialized:
 * - changelog.json is an array, not an object
 * - rendering as a timeline is more meaningful than key/value
 */

import React from 'react'
import changelogSchema from '@site/schemas/changelog.schema.json'

interface ChangelogPanelProps {
  data: unknown
}

type ChangelogEntry = {
  date: string
  changes: Array<{
    author?: string
    description: string
    type?: string
    breaking?: boolean
    external_references?: Array<{
      label: string
      url: string
    }>
  }>
}

export default function ChangelogPanel({
  data,
}: ChangelogPanelProps): JSX.Element {
  if (!Array.isArray(data)) {
    return (
      <Section>
        <h4>Changelog</h4>
        <div style={{ opacity: 0.7 }}>
          Invalid changelog format (expected array)
        </div>
      </Section>
    )
  }

  const entries = [...(data as ChangelogEntry[])].sort((a, b) =>
    b.date.localeCompare(a.date),
  )

  return (
    <Section>
      <h4 style={{ marginTop: 0 }}>Changelog</h4>

      {entries.map((entry) => (
        <div
          key={entry.date}
          style={{
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              fontWeight: 600,
              marginBottom: '0.5rem',
            }}
          >
            {entry.date}
          </div>

          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            {entry.changes.map((change, idx) => (
              <li key={idx} style={{ marginBottom: '0.4rem' }}>
                <span>{change.description}</span>

                {change.type ? (
                  <span
                    style={{
                      marginLeft: '0.5rem',
                      opacity: 0.7,
                    }}
                  >
                    ({change.type})
                  </span>
                ) : null}

                {change.breaking ? (
                  <span
                    style={{
                      marginLeft: '0.5rem',
                      color: 'var(--ifm-color-danger)',
                      fontWeight: 600,
                    }}
                  >
                    BREAKING
                  </span>
                ) : null}

                {change.author ? (
                  <span
                    style={{
                      marginLeft: '0.5rem',
                      opacity: 0.6,
                    }}
                  >
                    — {change.author}
                  </span>
                ) : null}

                {change.external_references?.length ? (
                  <ul
                    style={{
                      marginTop: '0.25rem',
                      paddingLeft: '1rem',
                    }}
                  >
                    {change.external_references.map((ref) => (
                      <li key={ref.url}>
                        <a href={ref.url} target='_blank' rel='noreferrer'>
                          {ref.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Section>
  )
}

/* ───────────────────────────────────────────────────────── */

function Section({ children }: { children: React.ReactNode }) {
  return (
    <section
      style={{
        marginTop: '1rem',
        border: '1px solid var(--ifm-color-emphasis-300)',
        borderRadius: '12px',
        padding: '1.25rem',
        background: 'var(--ifm-background-surface-color)',
      }}
    >
      {children}
    </section>
  )
}
