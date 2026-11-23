/**
 * UpdateTypeSelector
 * ────────────────────────────────────────────────────────────────
 *
 * Step 2.2.4
 *  - Explicit user choice: Version vs Release
 *  - Overrides heuristic suggestion if needed
 *
 * Definitions:
 *  - Version:
 *      A new version under the SAME release directory.
 *      Used for backward-compatible or incremental changes.
 *
 *  - Release:
 *      A NEW release directory.
 *      Used for large, structural, or breaking changes.
 *
 * Design constraints:
 *  - No defaults
 *  - No auto-selection
 *  - User choice is final (on confirm)
 */

import React, { useState } from 'react'
import type { UpdateType } from '../state/contributionTypes'

interface Props {
  value: UpdateType | null
  onChange: (value: UpdateType) => void

  /**
   * Fired only when user explicitly confirms their choice
   */
  onConfirm?: () => void
}

const UpdateTypeSelector: React.FC<Props> = ({
  value,
  onChange,
  onConfirm,
}) => {
  /**
   * Local confirmation latch.
   * Ensures the Continue button disappears immediately after click,
   * even before parent re-renders or unmounts this step.
   */
  const [confirmed, setConfirmed] = useState(false)

  return (
    <div className='card'>
      <div className='card__body'>
        <h3>Choose Update Type</h3>

        <p style={{ marginBottom: 16, opacity: 0.85 }}>
          Select how this change should be published.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Version option */}
          <label
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
              cursor: confirmed ? 'default' : 'pointer',
              opacity: confirmed ? 0.6 : 1,
            }}
          >
            <input
              type='radio'
              name='updateType'
              value='version'
              checked={value === 'version'}
              disabled={confirmed}
              onChange={() => onChange('version')}
            />
            <div>
              <strong>Version</strong>
              <p style={{ margin: '4px 0 0', opacity: 0.8 }}>
                Publish a new version under the existing release. Recommended
                for small, incremental, or compatible changes.
              </p>
            </div>
          </label>

          {/* Release option */}
          <label
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
              cursor: confirmed ? 'default' : 'pointer',
              opacity: confirmed ? 0.6 : 1,
            }}
          >
            <input
              type='radio'
              name='updateType'
              value='release'
              checked={value === 'release'}
              disabled={confirmed}
              onChange={() => onChange('release')}
            />
            <div>
              <strong>Release</strong>
              <p style={{ margin: '4px 0 0', opacity: 0.8 }}>
                Create a new release directory. Use this for major changes,
                refactors, or breaking updates.
              </p>
            </div>
          </label>
        </div>

        {/* Confirmation — bottom-right, disappears immediately after click */}
        {value && onConfirm && !confirmed && (
          <div
            style={{
              marginTop: 24,
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <button
              className='button button--primary'
              type='button'
              onClick={() => {
                setConfirmed(true)
                onConfirm()
              }}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default UpdateTypeSelector
