/**
 * Auth Types
 * ────────────────────────────────────────────────────────────────
 *
 * Purpose:
 *  - Define all authentication-related types
 *  - Shared across reducer, hooks, UI, and services
 *
 * Design constraints:
 *  - NO page-specific assumptions (contributors, maintainers, etc.)
 *  - Serializable and framework-agnostic
 *  - Suitable for reuse across multiple flows
 */

/**
 * Supported authentication states
 */
export type AuthStatus =
  | 'unauthenticated'
  | 'authenticating'
  | 'authenticated'
  | 'error'

/**
 * Normalized authenticated user
 * (provider-agnostic shape)
 */
export interface AuthUser {
  id: number
  login: string
  name?: string
  avatar_url?: string
  html_url?: string
}

/**
 * Global authentication state
 */
export interface AuthState {
  status: AuthStatus
  user: AuthUser | null
  error?: string
}

/**
 * Authentication events
 * (drives the reducer)
 */
export type AuthEvent =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; user: AuthUser }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_ERROR'; error: string }
