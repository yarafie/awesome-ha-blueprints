/**
 * SafeActionsPanel
 *
 * Placeholder panel for maintainer-initiated safe actions.
 *
 * This panel is reserved for future actions that are:
 * - explicitly non-destructive
 * - idempotent or dry-run only
 * - validated externally (not enforced by this UI)
 *
 * No actions are currently implemented.
 */
import React from 'react'
import { panelBaseStyle, dashedPanelBorder } from './panelStyles'

export default function SafeActionsPanel(): JSX.Element {
  return (
    <section
      style={{
        ...panelBaseStyle,
        ...dashedPanelBorder,
      }}
    >
      <h3 style={{ marginTop: 0 }}>Safe Actions</h3>

      <p style={{ marginBottom: 0 }}>
        Maintainer-safe actions will be exposed here in the future.
      </p>
    </section>
  )
}
