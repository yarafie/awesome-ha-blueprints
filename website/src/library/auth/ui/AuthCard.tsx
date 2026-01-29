/**
 * AuthCard
 * ────────────────────────────────────────────────────────────────
 *
 * Purpose:
 *  - Generic authentication container
 *  - Renders different UI based on authentication state
 *
 * Design constraints:
 *  - NO page-specific assumptions (contributors / maintainers / etc.)
 *  - NO routing logic
 *  - NO Supabase client access
 *
 * This component is a PURE UI shell.
 * All logic comes from useAuth() or parent orchestration.
 */

import React from 'react'
import type { AuthState } from '../state/authTypes'

type EffectiveRole = 'contributor' | 'maintainer'

interface AuthCardProps {
  authState: AuthState

  /** Called when user clicks "Login" */
  onLogin: () => void

  /** Called when user clicks "Logout" */
  onLogout: () => void

  /**
   * Optional role override (UI-only)
   * If omitted, role UI is not rendered
   */
  effectiveRole?: EffectiveRole

  /**
   * Optional role toggle handler
   */
  onRoleChange?: (role: EffectiveRole) => void

  /**
   * Controls visibility of role selector
   * Parent decides WHEN this is allowed
   */
  showRoleToggle?: boolean
}

const AuthCard: React.FC<AuthCardProps> = ({
  authState,
  onLogin,
  onLogout,
  effectiveRole,
  onRoleChange,
  showRoleToggle = false,
}) => {
  return (
    <div className='card' style={{ maxWidth: 640 }}>
      <div className='card__body'>
        {/* Unauthenticated */}
        {authState.status === 'unauthenticated' && (
          <>
            <h3>Authentication Required</h3>
            <p>Please sign in to continue.</p>
            <button className='button button--primary' onClick={onLogin}>
              Sign in
            </button>
          </>
        )}

        {/* Authenticating */}
        {authState.status === 'authenticating' && (
          <>
            <h3>Signing in…</h3>
            <p>Please wait while authentication completes.</p>
          </>
        )}

        {/* Authenticated */}
        {authState.status === 'authenticated' && authState.user && (
          <>
            <h3>Signed in</h3>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 16,
                marginTop: 12,
                flexWrap: 'wrap',
              }}
            >
              {/* User identity */}
              <div style={{ display: 'flex', gap: 12 }}>
                {authState.user.avatar_url && (
                  <img
                    src={authState.user.avatar_url}
                    alt={authState.user.login}
                    width={48}
                    height={48}
                    style={{ borderRadius: '50%' }}
                  />
                )}

                <div>
                  <strong>{authState.user.name ?? authState.user.login}</strong>
                  <div>
                    <a
                      href={authState.user.html_url}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      @{authState.user.login}
                    </a>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <button
                      className='button button--secondary button--sm'
                      onClick={onLogout}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>

              {/* Role badge + optional toggle */}
              {effectiveRole && (
                <div>
                  {/* Persistent role badge */}
                  <div style={{ marginBottom: showRoleToggle ? 6 : 0 }}>
                    <span
                      className={`badge ${
                        effectiveRole === 'maintainer'
                          ? 'badge--success'
                          : 'badge--secondary'
                      }`}
                    >
                      {effectiveRole === 'maintainer'
                        ? 'Maintainer'
                        : 'Contributor'}
                    </span>
                  </div>

                  {/* Role toggle (pre-selection only) */}
                  {showRoleToggle && onRoleChange && (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                        marginTop: 6,
                      }}
                    >
                      <label>
                        <input
                          type='radio'
                          checked={effectiveRole === 'contributor'}
                          onChange={() => onRoleChange('contributor')}
                        />{' '}
                        Contributor
                      </label>

                      <label>
                        <input
                          type='radio'
                          checked={effectiveRole === 'maintainer'}
                          onChange={() => onRoleChange('maintainer')}
                        />{' '}
                        Maintainer
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Error */}
        {authState.status === 'error' && (
          <>
            <h3>Authentication Error</h3>
            <p style={{ color: 'var(--ifm-color-danger)' }}>
              {authState.error}
            </p>
            <button className='button button--primary' onClick={onLogin}>
              Try again
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default AuthCard
