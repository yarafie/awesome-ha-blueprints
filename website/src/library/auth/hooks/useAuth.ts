/**
 * useAuth.ts
 * ------------------------------------------------------------------
 * Purpose:
 *  - React hook orchestrating authentication flow
 *  - Bridges UI ↔ auth state ↔ auth services
 *
 * Design rules:
 *  - React-only logic lives here
 *  - Owns Supabase client lifecycle
 *  - NO page-specific assumptions (contributors, maintainers, etc.)
 */

import { useEffect, useMemo, useReducer } from 'react'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

import { authReducer, initialAuthState } from '../state/authReducer'
import {
  createAuthClient,
  buildRedirectTo,
  signInWithOAuth,
  signOut,
} from '../services/authClient'

/**
 * useAuth
 *
 * @param redirectPath logical app route (e.g. '/contributors', '/maintainers')
 */
export function useAuth(redirectPath: string) {
  const { siteConfig } = useDocusaurusContext()
  const { SUPABASE_URL, SUPABASE_ANON_KEY } =
    (siteConfig.customFields?.env as {
      SUPABASE_URL?: string
      SUPABASE_ANON_KEY?: string
    }) || {}

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase environment variables are not configured')
  }

  /**
   * Supabase client (stable for lifetime of hook)
   */
  const supabase = useMemo(
    () => createAuthClient(SUPABASE_URL, SUPABASE_ANON_KEY),
    [SUPABASE_URL, SUPABASE_ANON_KEY],
  )

  /**
   * Auth state machine
   */
  const [state, dispatch] = useReducer(authReducer, initialAuthState)

  /**
   * Session hydration on mount
   */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return

      const meta = data.session.user.user_metadata || {}
      if (!meta.user_name || !meta.provider_id) return

      dispatch({
        type: 'AUTH_SUCCESS',
        user: {
          id: Number(meta.provider_id),
          login: meta.user_name,
          name: meta.full_name,
          avatar_url: meta.avatar_url,
          html_url: `https://github.com/${meta.user_name}`,
        },
      })
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        dispatch({ type: 'AUTH_LOGOUT' })
        return
      }

      const meta = session.user.user_metadata || {}
      if (!meta.user_name || !meta.provider_id) return

      dispatch({
        type: 'AUTH_SUCCESS',
        user: {
          id: Number(meta.provider_id),
          login: meta.user_name,
          name: meta.full_name,
          avatar_url: meta.avatar_url,
          html_url: `https://github.com/${meta.user_name}`,
        },
      })
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  /**
   * Login action
   */
  const login = async () => {
    dispatch({ type: 'AUTH_START' })

    try {
      const redirectTo = buildRedirectTo(
        window.location.origin,
        siteConfig.baseUrl,
        redirectPath,
      )

      const { error } = await signInWithOAuth(supabase, {
        provider: 'github',
        redirectTo,
      })
      if (error) {
        dispatch({ type: 'AUTH_ERROR', error: error.message })
      }
    } catch (err) {
      dispatch({
        type: 'AUTH_ERROR',
        error: err instanceof Error ? err.message : 'Authentication failed',
      })
    }
  }

  /**
   * Logout action
   */
  const logout = async () => {
    await signOut(supabase)
    dispatch({ type: 'AUTH_LOGOUT' })
  }

  return {
    state,
    login,
    logout,
  }
}
