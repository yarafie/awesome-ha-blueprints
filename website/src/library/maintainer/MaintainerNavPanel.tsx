/**
 * MaintainerNavPanel
 *
 * Maintainer-only navigation panel.
 * Provides explicit entry points to internal tools and dashboards
 * accessible from the maintainer console.
 *
 * This component:
 * - contains no routing logic
 * - performs no authorization checks
 * - does not fetch data
 *
 * All destinations are intentionally curated and static.
 */
import React from 'react'
import Link from '@docusaurus/Link'
import { panelBaseStyle, solidPanelBorder } from './panelStyles'

export default function MaintainerNavPanel(): JSX.Element {
  return (
    <section
      style={{
        ...panelBaseStyle,
        ...solidPanelBorder,
      }}
    >
      <h3 style={{ marginTop: 0 }}>Navigation</h3>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        <li style={{ marginBottom: '0.5rem' }}>
          <Link
            to='/library-explorer'
            className='button button--secondary button--sm'
          >
            Open Library Explorer
          </Link>
        </li>

        <li style={{ marginBottom: '0.5rem' }}>
          <Link to='/library-report'>Library Report</Link>
        </li>

        <li style={{ marginBottom: '0.5rem' }}>
          <Link to='/metrics'>Metrics Dashboard</Link>
        </li>

        <li style={{ marginBottom: '0.5rem', opacity: 0.6 }}>
          Validation Tools (coming soon)
        </li>

        <li style={{ marginBottom: '0.5rem', opacity: 0.6 }}>
          Workflow Status (coming soon)
        </li>
      </ul>
    </section>
  )
}
