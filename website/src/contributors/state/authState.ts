/**
 * Auth State Contract – v1.1 (Hardened)
 * Deterministic, side-effect free
 */

export type AuthStatus =
  | 'unauthenticated'
  | 'authenticating'
  | 'authenticated'
  | 'error'

export interface GitHubUser {
  id: number
  login: string
  name?: string
  avatar_url?: string
  html_url?: string
}

export interface AuthState {
  status: AuthStatus
  user: GitHubUser | null
  error: string | null
}

export type AuthEvent =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; user: GitHubUser }
  | { type: 'AUTH_ERROR'; error: string }
  | { type: 'AUTH_LOGOUT' }

export const initialAuthState: AuthState = {
  status: 'unauthenticated',
  user: null,
  error: null,
}

export function authReducer(state: AuthState, event: AuthEvent): AuthState {
  switch (event.type) {
    case 'AUTH_START':
      if (state.status === 'authenticated') return state
      return { status: 'authenticating', user: null, error: null }

    case 'AUTH_SUCCESS':
      if (state.status !== 'authenticating') return state
      return { status: 'authenticated', user: event.user, error: null }

    case 'AUTH_ERROR':
      if (state.status !== 'authenticating') return state
      return { status: 'error', user: null, error: event.error }

    case 'AUTH_LOGOUT':
      return initialAuthState

    default:
      return state
  }
}
