/**
 * YamlAnalysis
 * ────────────────────────────────────────────────────────────────
 *
 * Step 2.2.6
 *  - Analyze uploaded YAML against existing YAML
 *  - Present heuristic guidance (Version vs Release)
 *
 * Design constraints:
 *  - Read-only
 *  - No state mutation
 *  - No auto-selection
 *
 * NOTE:
 *  - UI parity with contributors.base
 *  - Layout adapted for ContributorsApp flow (no section / centering)
 */

import React, { useMemo, useState, useEffect } from 'react'
import { analyzeYamlDiff } from '../services/analyzeYamlDiff'

interface Props {
  existingYaml: string
  uploadedYaml: string
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

/** Additive UI helper: small inline badge */
function Badge({
  children,
  tone,
}: {
  children: React.ReactNode
  tone?: 'neutral' | 'good' | 'warn'
}) {
  const bg =
    tone === 'good'
      ? 'rgba(0, 200, 0, 0.12)'
      : tone === 'warn'
        ? 'rgba(255, 165, 0, 0.14)'
        : 'var(--ifm-color-emphasis-200)'

  const border =
    tone === 'good'
      ? 'rgba(0, 200, 0, 0.35)'
      : tone === 'warn'
        ? 'rgba(255, 165, 0, 0.35)'
        : 'var(--ifm-color-emphasis-300)'

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: 999,
        fontSize: 12,
        lineHeight: 1.4,
        background: bg,
        border: `1px solid ${border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}

/**
 * Additive heuristic:
 * - Roughly classifies changed lines as "metadata" vs "logic"
 * - Uses common HA blueprint section keys to determine category
 */
function classifyYamlLine(line: string): 'metadata' | 'logic' | 'other' {
  const t = (line ?? '').trim()
  if (!t) return 'other'

  // Ignore comments-only lines
  if (t.startsWith('#')) return 'other'

  // Try detect "key:" (YAML mapping key)
  const m = t.match(/^([A-Za-z0-9_\-]+)\s*:/)
  const key = (m?.[1] || '').toLowerCase()

  // Metadata-ish keys (blueprint header / doc / inputs)
  const metadataKeys = new Set([
    'blueprint',
    'name',
    'description',
    'domain',
    'source_url',
    'author',
    'version',
    'release',
    'homeassistant',
    'input',
    'icon',
  ])

  // Logic-ish keys (automation behavior)
  const logicKeys = new Set([
    'trigger',
    'condition',
    'action',
    'variables',
    'sequence',
    'choose',
    'repeat',
    'wait_for_trigger',
    'service',
    'target',
    'data',
    'entity_id',
    'device_id',
    'area_id',
    'platform',
    'event',
    'time',
    'state',
    'numeric_state',
  ])

  if (metadataKeys.has(key)) return 'metadata'
  if (logicKeys.has(key)) return 'logic'

  // Also classify by common section headers that might appear as values
  if (
    t.startsWith('blueprint:') ||
    t.startsWith('input:') ||
    t.startsWith('homeassistant:')
  ) {
    return 'metadata'
  }

  if (
    t.startsWith('trigger:') ||
    t.startsWith('condition:') ||
    t.startsWith('action:') ||
    t.startsWith('sequence:') ||
    t.startsWith('choose:')
  ) {
    return 'logic'
  }

  return 'other'
}

function computeDominantChangeType(
  existingYaml: string,
  uploadedYaml: string,
  blocks: DiffBlock[],
): {
  dominant: 'metadata' | 'logic' | 'mixed' | 'unknown'
  meta: number
  logic: number
} {
  if (!existingYaml || !uploadedYaml) {
    return { dominant: 'unknown', meta: 0, logic: 0 }
  }

  // Count only the lines that differ inside detected changed blocks.
  let meta = 0
  let logic = 0

  for (const b of blocks) {
    const max = Math.max(b.oldLines.length, b.newLines.length)
    for (let i = 0; i < max; i++) {
      const a = b.oldLines[i] ?? ''
      const c = b.newLines[i] ?? ''
      if (a === c) continue

      // Classify both sides; prefer a decisive category if either side indicates it.
      const ca = classifyYamlLine(a)
      const cb = classifyYamlLine(c)

      const cats = new Set([ca, cb])
      if (cats.has('metadata')) meta++
      if (cats.has('logic')) logic++
    }
  }

  if (meta === 0 && logic === 0) return { dominant: 'unknown', meta, logic }
  if (meta === logic) return { dominant: 'mixed', meta, logic }
  return { dominant: meta > logic ? 'metadata' : 'logic', meta, logic }
}

/**
 * Original highlighting logic (kept):
 * - Shifts lines left by removing common leading whitespace.
 * - Highlights text in red if the line differs from the opposite side.
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
            wordBreak: 'break-word',
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

function RenderDiffLinesWithNumbers({
  lines,
  otherSideLines,
}: {
  lines: string[]
  otherSideLines: string[]
}) {
  const processed = useMemo(() => {
    const indents = lines
      .filter((l) => l.trim().length > 0)
      .map((l) => l.match(/^\s*/)?.[0].length ?? 0)

    const minIndent = indents.length ? Math.min(...indents) : 0

    return lines.map((line, idx) => {
      const stripped = line.slice(minIndent)
      const isDifferent = line !== otherSideLines[idx]
      const match = stripped.match(/^(\s*)(.*)$/)

      return {
        number: idx + 1,
        indent: match?.[1] || '',
        content: match?.[2] || '',
        isDifferent,
      }
    })
  }, [lines, otherSideLines])

  return (
    <>
      {processed.map((line) => (
        <div
          key={line.number}
          style={{
            display: 'grid',
            gridTemplateColumns: '3em auto 1fr',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            color: line.isDifferent ? 'var(--ifm-color-danger)' : 'inherit',
          }}
        >
          <span
            style={{
              opacity: 0.5,
              userSelect: 'none',
              textAlign: 'right',
              paddingRight: 8,
            }}
          >
            {line.number}
          </span>
          <span>{line.indent}</span>
          <span>{line.content || '\u00A0'}</span>
        </div>
      ))}
    </>
  )
}

const YamlAnalysis: React.FC<Props> = ({ existingYaml, uploadedYaml }) => {
  const [showBlocks, setShowBlocks] = useState(false)
  const [showFullDiff, setShowFullDiff] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowFullDiff(false)
    }
    if (showFullDiff) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showFullDiff])

  const analysis: any = useMemo(() => {
    try {
      return analyzeYamlDiff(existingYaml, uploadedYaml)
    } catch (e) {
      return { error: (e as Error)?.message ?? 'Analyzer failed' }
    }
  }, [existingYaml, uploadedYaml])

  const blocks = useMemo(
    () =>
      computeChangedBlocks(existingYaml, uploadedYaml, {
        contextLines: 2,
        maxBlocks: 12,
      }),
    [existingYaml, uploadedYaml],
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

  // Additive: confidence pulled from analyzer if present; otherwise derived from score distance to thresholds.
  const confidencePct = useMemo(() => {
    const direct =
      typeof analysis?.confidencePct === 'number'
        ? analysis.confidencePct
        : typeof analysis?.confidence === 'number'
          ? analysis.confidence
          : null

    if (typeof direct === 'number' && Number.isFinite(direct)) {
      const clamped = Math.max(0, Math.min(100, direct))
      return clamped
    }

    // Fallback heuristic: farther from cutoffs => higher confidence
    const s = Number(scorePct)
    if (!Number.isFinite(s)) return 0

    const d = Math.min(Math.abs(s - 15), Math.abs(s - 40))
    const pct = Math.max(0, Math.min(100, Math.round(50 + d * 2)))
    return pct
  }, [analysis, scorePct])

  const confidenceTone: 'neutral' | 'good' | 'warn' =
    confidencePct >= 75 ? 'good' : confidencePct >= 55 ? 'neutral' : 'warn'

  const dominantChange = useMemo(
    () => computeDominantChangeType(existingYaml, uploadedYaml, blocks),
    [existingYaml, uploadedYaml, blocks],
  )

  const preStyle: React.CSSProperties = {
    margin: 0,
    padding: 10,
    borderRadius: 8,
    background: 'var(--ifm-background-surface-color)',
    border: '1px solid var(--ifm-color-emphasis-200)',
    lineHeight: 1.35,
    fontSize: '13px',
    fontFamily: 'monospace',
  }

  return (
    <>
      <div className='card'>
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button
                className='button button--secondary button--sm'
                type='button'
                onClick={() => setShowBlocks((v) => !v)}
              >
                {showBlocks
                  ? 'Hide changed sections'
                  : `Show changed sections (${blocks.length})`}
              </button>

              <button
                className='button button--secondary button--sm'
                type='button'
                onClick={() => setShowFullDiff(true)}
              >
                View full diff
              </button>
            </div>
          </div>

          {error && (
            <p style={{ color: 'var(--ifm-color-danger)', marginTop: 10 }}>
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

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong>Suggested update type:</strong>{' '}
                <span>{suggestedType}</span>
                {/* ✅ Additive: surface confidence badge */}
                <Badge tone={confidenceTone}>
                  Confidence: {Math.round(confidencePct)}%
                </Badge>
              </div>
            </div>

            {/* ✅ Additive: dominant change type summary */}
            <div
              style={{
                marginTop: 10,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong>Dominant change type:</strong>{' '}
                <span>
                  {dominantChange.dominant === 'unknown'
                    ? 'Unknown'
                    : dominantChange.dominant === 'mixed'
                      ? 'Mixed'
                      : dominantChange.dominant === 'metadata'
                        ? 'Metadata'
                        : 'Logic'}
                </span>
                <Badge tone='neutral'>
                  Metadata: {dominantChange.meta} • Logic:{' '}
                  {dominantChange.logic}
                </Badge>
              </div>
            </div>

            {reason && <p style={{ marginTop: 8, opacity: 0.85 }}>{reason}</p>}
          </div>

          {/* ✅  RESTORED: Changed sections */}
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

      {/* Full diff overlay */}
      {showFullDiff && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 9999,
            padding: '4vh 3vw',
          }}
        >
          <div
            style={{
              background: 'var(--ifm-background-surface-color)',
              height: '92vh',
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: 12,
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--ifm-color-emphasis-200)',
              }}
            >
              <strong>Full YAML Diff</strong>
              <button
                className='button button--secondary button--sm'
                onClick={() => setShowFullDiff(false)}
              >
                Close
              </button>
            </div>

            {/* Sticky FROM/TO headers */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
                padding: '8px 12px',
                borderBottom: '1px solid var(--ifm-color-emphasis-200)',
                position: 'sticky',
                top: 0,
                background: 'var(--ifm-background-surface-color)',
                zIndex: 1,
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.8 }}>FROM (existing)</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>TO (uploaded)</div>
            </div>

            {/* ✅  Single scroll container (both sides scroll together) */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16,
                  alignItems: 'start',
                }}
              >
                <pre style={preStyle}>
                  <RenderDiffLinesWithNumbers
                    lines={normalizeLines(existingYaml)}
                    otherSideLines={normalizeLines(uploadedYaml)}
                  />
                </pre>

                <pre style={preStyle}>
                  <RenderDiffLinesWithNumbers
                    lines={normalizeLines(uploadedYaml)}
                    otherSideLines={normalizeLines(existingYaml)}
                  />
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default YamlAnalysis
