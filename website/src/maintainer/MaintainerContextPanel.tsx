/**
 * MaintainerContextPanel
 *
 * Read-only context panel for the maintainer console.
 * Displays the authenticated maintainer identity, authorization context,
 * runtime environment, and session metadata.
 *
 * This component is intentionally:
 * - non-interactive
 * - non-mutating
 * - free of side effects
 *
 * Data sources are limited to the active Supabase session and
 * derived runtime information. No network requests are performed.
 *
 * This component must remain purely observational.
 */
import React from 'react'
import type { Session } from '@supabase/supabase-js'
import { panelBaseStyle, solidPanelBorder } from './panelStyles'

interface MaintainerContextPanelProps {
  session: Session
}

export default function MaintainerContextPanel({
  session,
}: MaintainerContextPanelProps): JSX.Element {
  const user = session.user

  const email = user.email ?? 'unknown'
  const provider = user.app_metadata?.provider ?? 'unknown'

  const issuedAt = session.access_token
    ? new Date(user.last_sign_in_at ?? '').toLocaleString()
    : 'unknown'

  const expiresAt = session.expires_at
    ? new Date(session.expires_at * 1000).toLocaleString()
    : 'unknown'

  const environment =
    typeof window !== 'undefined' &&
    window.location.hostname.includes('localhost')
      ? 'development'
      : 'production'

  return (
    <section
      style={{
        ...panelBaseStyle,
        ...solidPanelBorder,
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Maintainer Context</h2>

      <dl
        style={{
          display: 'grid',
          gridTemplateColumns: 'max-content 1fr',
          rowGap: '0.5rem',
          columnGap: '1rem',
          margin: 0,
        }}
      >
        <dt>Email</dt>
        <dd>{email}</dd>

        <dt>Auth Provider</dt>
        <dd>{provider}</dd>

        <dt>Maintainer Status</dt>
        <dd>Authorized</dd>

        <dt>Environment</dt>
        <dd>{environment}</dd>

        <dt>Session Issued</dt>
        <dd>{issuedAt}</dd>

        <dt>Session Expires</dt>
        <dd>{expiresAt}</dd>
      </dl>
    </section>
  )
}
