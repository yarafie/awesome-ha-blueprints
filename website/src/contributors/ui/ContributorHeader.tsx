/**
 * Component: ContributorHeader
 * - header + mock auth
 * - SSR/SSG safe: window only inside useEffect
 */

import React, { useEffect, useState } from 'react'
import type { AuthEvent, AuthState, GitHubUser } from '../state/authState'
import { parseAuthRedirect, clearAuthParams } from '../state/parseAuthRedirect'

interface Props {
  authState: AuthState
  authDispatch: React.Dispatch<AuthEvent>
}

const ContributorHeader: React.FC<Props> = ({ authState, authDispatch }) => {
  const [githubInput, setGithubInput] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const event = parseAuthRedirect(window.location)
    if (event) {
      authDispatch(event)
      clearAuthParams(window.location)
    }
  }, [authDispatch])

  const handleAuthStart = () => {
    authDispatch({ type: 'AUTH_START' })
    setTimeout(() => {
      const login = githubInput.trim()
      if (!login) {
        authDispatch({
          type: 'AUTH_ERROR',
          error: 'GitHub username is required',
        })
        return
      }
      const mockUser: GitHubUser = {
        id: 1,
        login,
        name: login,
        avatar_url: `https://avatars.githubusercontent.com/${login}`,
        html_url: `https://github.com/${login}`,
      }
      authDispatch({ type: 'AUTH_SUCCESS', user: mockUser })
    }, 500)
  }

  const handleLogout = () => {
    authDispatch({ type: 'AUTH_LOGOUT' })
    setGithubInput('')
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
              securely using GitHub’s official authorization flow.
            </p>
            <input
              type='text'
              placeholder='GitHub username'
              value={githubInput}
              onChange={(e) => setGithubInput(e.target.value)}
              style={{ width: '100%', padding: 8, marginBottom: 12 }}
            />
            <button
              className='button button--primary'
              onClick={handleAuthStart}
            >
              Authenticate with GitHub
            </button>
          </>
        )}

        {authState.status === 'authenticating' && (
          <>
            <h3>Authenticating…</h3>
            <p>Please wait while we verify your GitHub identity.</p>
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
            <button
              className='button button--primary'
              onClick={handleAuthStart}
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default ContributorHeader
