/**
 * UpdateTargetSummaryCard
 * ────────────────────────────────────────────────────────────────
 *
 * Step 2.2.5
 *  - Read-only summary of the resolved update target
 *
 * Purpose:
 *  - Make the selected blueprint target explicit
 *  - Prevent accidental updates to the wrong path
 *
 * Design constraints:
 *  - Read-only
 *  - No actions
 *  - No editing
 *  - Presentation only
 */

import React from 'react'
import type { UpdateBlueprintTarget } from '../state/contributionTypes'

interface Props {
  target: UpdateBlueprintTarget
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 10px',
        borderRadius: 999,
        background: 'var(--ifm-background-surface-color)',
        border: '1px solid var(--ifm-color-emphasis-200)',
        fontSize: 12,
        marginRight: 8,
        marginBottom: 8,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}

const UpdateTargetSummaryCard: React.FC<Props> = ({ target }) => {
  const fullPath = `${target.category}/${target.blueprintId}/${target.libraryId}/${target.releaseId}/${target.version}/`

  return (
    <div className='card'>
      <div className='card__body'>
        {/* ───────────────────────────────────────────── */}
        {/* Header */}
        {/* ───────────────────────────────────────────── */}
        <h3 style={{ marginBottom: 4 }}>Update Target Summary</h3>
        <p style={{ opacity: 0.7, marginTop: 0, marginBottom: 16 }}>
          Confirming the exact blueprint location that will be updated
        </p>

        {/* ───────────────────────────────────────────── */}
        {/* Pill-style confirmation (contributors.base parity) */}
        {/* ───────────────────────────────────────────── */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>
            Selected update target
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            <Pill>
              <strong>Category:</strong> {target.category}
            </Pill>
            <Pill>
              <strong>Blueprint:</strong> {target.blueprintId}
            </Pill>
            <Pill>
              <strong>Library:</strong> {target.libraryId}
            </Pill>
            <Pill>
              <strong>Release:</strong> {target.releaseId}
            </Pill>
            <Pill>
              <strong>Version:</strong> {target.version}
            </Pill>
          </div>
        </div>

        {/* ───────────────────────────────────────────── */}
        {/* Existing detailed block (UNCHANGED) */}
        {/* ───────────────────────────────────────────── */}
        <p style={{ marginBottom: 16, opacity: 0.85 }}>
          You are about to update the following blueprint location:
        </p>

        <div
          style={{
            fontFamily: 'monospace',
            background: 'var(--ifm-background-surface-color)',
            border: '1px solid var(--ifm-color-emphasis-200)',
            borderRadius: 6,
            padding: 12,
          }}
        >
          <div>
            <strong>Category:</strong> {target.category}
          </div>
          <div>
            <strong>Blueprint ID:</strong> {target.blueprintId}
          </div>
          <div>
            <strong>Library ID:</strong> {target.libraryId}
          </div>
          <div>
            <strong>Release ID:</strong> {target.releaseId}
          </div>
          <div>
            <strong>Version:</strong> {target.version}
          </div>
        </div>

        {/* ───────────────────────────────────────────── */}
        {/* Path confirmation (UNCHANGED) */}
        {/* ───────────────────────────────────────────── */}
        <p style={{ marginTop: 12, opacity: 0.7 }}>
          Path:
          <br />
          <code>{fullPath}</code>
        </p>

        {/* ───────────────────────────────────────────── */}
        {/* Defensive UX hint */}
        {/* ───────────────────────────────────────────── */}
        <p style={{ marginTop: 10, fontSize: 13, opacity: 0.6 }}>
          This is a read-only confirmation step to prevent accidental updates to
          the wrong blueprint location.
        </p>
      </div>
    </div>
  )
}

export default UpdateTargetSummaryCard
