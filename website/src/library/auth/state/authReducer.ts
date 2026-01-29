/**
 * Auth Reducer
 * ────────────────────────────────────────────────────────────────
 *
 * Purpose:
 *  - Central state machine for authentication
 *  - Handles login, logout, success, and error transitions
 *
 * Design constraints:
 *  - NO UI concerns
 *  - NO routing or page assumptions
 *  - Deterministic and side-effect free
 */

import type { AuthEvent, AuthState } from './authTypes'

/**
 * Initial authentication state
 */
export const initialAuthState: AuthState = {
  status: 'unauthenticated',
  user: null,
}

/**
 * Authentication reducer
 */
export function authReducer(state: AuthState, event: AuthEvent): AuthState {
  switch (event.type) {
    case 'AUTH_START':
      return {
        status: 'authenticating',
        user: null,
        error: undefined,
      }

    case 'AUTH_SUCCESS':
      return {
        status: 'authenticated',
        user: event.user,
        error: undefined,
      }

    case 'AUTH_LOGOUT':
      return {
        status: 'unauthenticated',
        user: null,
        error: undefined,
      }

    case 'AUTH_ERROR':
      return {
        status: 'error',
        user: null,
        error: event.error,
      }

    default: {
      // Exhaustiveness guard (compile-time safety)
      const _exhaustive: never = event
      return state
    }
  }
}
