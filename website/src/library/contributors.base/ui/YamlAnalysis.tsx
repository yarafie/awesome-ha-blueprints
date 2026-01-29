import React, { useMemo, useState } from 'react'
import { analyzeYamlDiff } from '../services/analyzeYamlDiff'

interface Props {
  existingYaml: string
  proposedYaml: string
}

type DiffBlock = {
  id: string
  oldStart: number
  oldEnd: number
  newStart: number
  newEnd: number
  oldLines: string[]
  newLines: string[]
}

function normalizeLines(text: string): string[] {
  return (text || '').replace(/\r\n/g, '\n').split('\n')
}

function computeChangedBlocks(
  oldText: string,
  newText: string,
  opts?: { contextLines?: number; maxBlocks?: number },
): DiffBlock[] {
  const contextLines = opts?.contextLines ?? 2
  const maxBlocks = opts?.maxBlocks ?? 12

  const a = normalizeLines(oldText)
  const b = normalizeLines(newText)

  const max = Math.max(a.length, b.length)
  const blocks: DiffBlock[] = []

  let i = 0
  while (i < max && blocks.length < maxBlocks) {
    const left = a[i] ?? ''
    const right = b[i] ?? ''

    if (left === right) {
      i++
      continue
    }

    const start = i
    let j = i
    let stable = 0
    const stabilityWindow = 3

    while (j < max) {
      const l = a[j] ?? ''
      const r = b[j] ?? ''

      if (l === r) stable++
      else stable = 0

      if (stable >= stabilityWindow) {
        j = j - stabilityWindow + 1
        break
      }
      j++
    }

    const end = Math.min(j, max)
    const oldStart = Math.max(0, start - contextLines)
    const newStart = Math.max(0, start - contextLines)
    const oldEnd = Math.min(a.length, end + contextLines)
    const newEnd = Math.min(b.length, end + contextLines)

    blocks.push({
      id: `${blocks.length + 1}-${oldStart + 1}-${oldEnd}`,
      oldStart: oldStart + 1,
      oldEnd,
      newStart: newStart + 1,
      newEnd,
      oldLines: a.slice(oldStart, oldEnd),
      newLines: b.slice(newStart, newEnd),
    })

    i = end + stabilityWindow
  }

  return blocks
}

function safeNumber(n: any): number {
  return typeof n === 'number' && Number.isFinite(n) ? n : 0
}

function safeString(v: any): string {
  if (typeof v === 'string') return v
  if (v == null) return ''
  return String(v)
}

/**
 * Shifts lines to the left by removing common leading whitespace.
 * Highlights text in red if the line differs from the opposite side.
 */
function RenderDiffLines({
  lines,
  otherSideLines,
}: {
  lines: string[]
  otherSideLines: string[]
}) {
  const processedLines = useMemo(() => {
    const indents = lines
      .filter((line) => line.trim().length > 0)
      .map((line) => line.match(/^\s*/)?.[0].length ?? 0)

    const minIndent = indents.length > 0 ? Math.min(...indents) : 0

    return lines.map((line, idx) => {
      const stripped = line.slice(minIndent)
      const isDifferent = line !== otherSideLines[idx]
      const match = stripped.match(/^(\s*)(.*)$/)

      return {
        indent: match?.[1] || '',
        content: match?.[2] || '',
        isDifferent,
      }
    })
  }, [lines, otherSideLines])

  return (
    <>
      {processedLines.map((line, idx) => (
        <div
          key={idx}
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            color: line.isDifferent ? 'var(--ifm-color-danger)' : 'inherit',
          }}
        >
          <span>{line.indent}</span>
          <span>{line.content || '\u00A0'}</span>
        </div>
      ))}
    </>
  )
}

export default function YamlAnalysis({ existingYaml, proposedYaml }: Props) {
  const [showBlocks, setShowBlocks] = useState(false)

  const analysis: any = useMemo(() => {
    try {
      return analyzeYamlDiff(existingYaml, proposedYaml)
    } catch (e) {
      return { error: (e as Error)?.message ?? 'Analyzer failed' }
    }
  }, [existingYaml, proposedYaml])

  const blocks = useMemo(
    () =>
      computeChangedBlocks(existingYaml, proposedYaml, {
        contextLines: 2,
        maxBlocks: 12,
      }),
    [existingYaml, proposedYaml],
  )

  const stats = analysis?.stats ?? {}
  const added = safeNumber(stats.added)
  const removed = safeNumber(stats.removed)
  const changed = safeNumber(stats.changed)

  const scorePct =
    typeof analysis?.scorePct === 'number'
      ? analysis.scorePct
      : typeof analysis?.score === 'number'
        ? analysis.score
        : 0

  const suggestedType =
    safeString(analysis?.suggestionType) ||
    safeString(analysis?.suggestion?.type) ||
    safeString(analysis?.suggested?.type) ||
    'version'

  const reason =
    safeString(analysis?.suggestionReason) ||
    safeString(analysis?.suggestion?.reason) ||
    safeString(analysis?.suggested?.reason) ||
    ''

  const error = safeString(analysis?.error)

  const preStyle: React.CSSProperties = {
    margin: 0,
    padding: 10,
    borderRadius: 8,
    background: 'var(--ifm-background-surface-color)',
    border: '1px solid var(--ifm-color-emphasis-200)',
    overflowX: 'hidden',
    lineHeight: 1.35,
    fontSize: '13px',
    fontFamily: 'monospace',
  }

  return (
    <section className='container padding-vert--lg'>
      <div
        className='card'
        style={{ maxWidth: 980, margin: '0 auto', overflow: 'hidden' }}
      >
        <div className='card__body'>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <h3 style={{ marginBottom: 0 }}>YAML Analysis</h3>
            <button
              className='button button--secondary button--sm'
              type='button'
              onClick={() => setShowBlocks((v) => !v)}
            >
              {showBlocks
                ? 'Hide changed sections'
                : `Show changed sections (${blocks.length})`}
            </button>
          </div>

          {error && (
            <p
              style={{
                color: 'var(--ifm-color-danger)',
                marginTop: 10,
                marginBottom: 0,
              }}
            >
              {error}
            </p>
          )}

          <div style={{ marginTop: 12 }}>
            <strong>Change statistics</strong>
            <ul style={{ marginTop: 8, marginBottom: 10 }}>
              <li>
                Lines added: <strong>{added}</strong>
              </li>
              <li>
                Lines removed: <strong>{removed}</strong>
              </li>
              <li>
                Lines changed: <strong>{changed}</strong>
              </li>
            </ul>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <strong>Change score:</strong>{' '}
                <span>{Number(scorePct).toFixed(1)}%</span>
              </div>
              <div>
                <strong>Suggested update type:</strong>{' '}
                <span>{suggestedType}</span>
              </div>
            </div>
            {reason && (
              <p style={{ marginTop: 8, marginBottom: 0, opacity: 0.85 }}>
                {reason}
              </p>
            )}
          </div>

          {showBlocks && (
            <div style={{ marginTop: 16 }}>
              {blocks.length === 0 ? (
                <p style={{ margin: 0, opacity: 0.8 }}>
                  No changed blocks detected.
                </p>
              ) : (
                blocks.map((b) => (
                  <details key={b.id} style={{ marginBottom: 12 }}>
                    <summary style={{ cursor: 'pointer' }}>
                      Changed block — old L{b.oldStart}–L{b.oldEnd} • new L
                      {b.newStart}–L{b.newEnd}
                    </summary>
                    <div
                      style={{
                        marginTop: 10,
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 12,
                        alignItems: 'start',
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 12,
                            opacity: 0.8,
                            marginBottom: 6,
                          }}
                        >
                          FROM (existing)
                        </div>
                        <pre style={preStyle}>
                          <RenderDiffLines
                            lines={b.oldLines}
                            otherSideLines={b.newLines}
                          />
                        </pre>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 12,
                            opacity: 0.8,
                            marginBottom: 6,
                          }}
                        >
                          TO (uploaded)
                        </div>
                        <pre style={preStyle}>
                          <RenderDiffLines
                            lines={b.newLines}
                            otherSideLines={b.oldLines}
                          />
                        </pre>
                      </div>
                    </div>
                  </details>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
