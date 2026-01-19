/**
 * Component: ContributorHeader
 * ────────────────────────────────────────────────────────────────
 *
 * Purpose:
 *  - Contributor page header
 *  - GitHub OAuth entry point (Supabase)
 *  - Dispatches auth lifecycle events into auth reducer
 *
 * Notes:
 *  - No authorization logic (contributors are open)
 *  - No email checks
 *  - Auth session hydration happens in ContributorsApp
 *  - SSR/SSG safe: window access only in event handlers
 */
import React, { useMemo } from 'react'
import type { AuthEvent, AuthState } from '../state/authState'
import { createClient } from '@supabase/supabase-js'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

interface Props {
  authState: AuthState
  authDispatch: React.Dispatch<AuthEvent>
}

const ContributorHeader: React.FC<Props> = ({ authState, authDispatch }) => {
  const { siteConfig } = useDocusaurusContext()

  const { SUPABASE_URL, SUPABASE_ANON_KEY } = (siteConfig.customFields.env ||
    {}) as {
    SUPABASE_URL: string
    SUPABASE_ANON_KEY: string
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase environment variables are not configured')
  }

  const supabase = useMemo(
    () => createClient(SUPABASE_URL, SUPABASE_ANON_KEY),
    [SUPABASE_URL, SUPABASE_ANON_KEY],
  )

  const handleLogin = async () => {
    authDispatch({ type: 'AUTH_START' })
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo:
          window.location.origin + siteConfig.baseUrl + 'contributors',
      },
    })
    if (error) {
      authDispatch({ type: 'AUTH_ERROR', error: error.message })
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    authDispatch({ type: 'AUTH_LOGOUT' })
  }

  return (
    <div className='container padding-vert--lg'>
      <h1>Welcome to Awesome HA Library Contributors Page</h1>
      <div
        style={{
          marginTop: 24,
          padding: 24,
          border: '1px solid var(--ifm-color-emphasis-300)',
          borderRadius: 8,
          maxWidth: 520,
        }}
      >
        {authState.status === 'unauthenticated' && (
          <>
            <h3>GitHub Authentication</h3>
            <p>
              Authenticate with GitHub to contribute. Authentication is handled
              using GitHub OAuth.
            </p>
            <button className='button button--primary' onClick={handleLogin}>
              Authenticate with GitHub
            </button>
          </>
        )}

        {authState.status === 'authenticating' && (
          <>
            <h3>Authenticating…</h3>
            <p>Please wait while GitHub authentication completes.</p>
          </>
        )}

        {authState.status === 'authenticated' && authState.user && (
          <>
            <h3>Authenticated</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <button
                className='button button--secondary'
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </>
        )}

        {authState.status === 'error' && (
          <>
            <h3>Authentication Error</h3>
            <p style={{ color: 'var(--ifm-color-danger)' }}>
              {authState.error}
            </p>
            <button className='button button--primary' onClick={handleLogin}>
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default ContributorHeader
