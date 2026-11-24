/**
 * useAuth.ts
 * ------------------------------------------------------------------
 * Purpose:
 *  - React hook orchestrating authentication flow
 *  - Bridges UI ↔ auth state ↔ auth services
 *
 * Design rules:
 *  - React-only logic lives here
 *  - Owns auth state machine + session hydration
 *  - Delegates auth actions to shared auth controller
 *  - MUST be safe during Docusaurus SSG (no throws on missing env)
 */

import { useEffect, useMemo, useReducer, useState } from 'react'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

import { authReducer, initialAuthState } from '../state/authReducer'
import { createAuth } from '../auth'
import { createAuthClient } from '../services/authClient'

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

  /**
   * Detect whether auth is actually available in this environment.
   * - false during SSG / CI / dependabot
   * - true at runtime with proper env
   */
  const hasSupabaseEnv = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

  /**
   * Auth state machine
   */
  const [state, dispatch] = useReducer(authReducer, initialAuthState)

  /**
   * The GitHub token of the signed-in user, when GitHub handed one over
   * with the sign-in. It is kept in memory only and is what a page uses
   * to act on GitHub in the user's name (see requestAccess).
   */
  const [providerToken, setProviderToken] = useState<string | null>(null)

  /**
   * Supabase client
   * - Created ONLY when env is available
   * - Never during SSG
   */
  const supabase = useMemo(() => {
    if (!hasSupabaseEnv) return null
    return createAuthClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)
  }, [hasSupabaseEnv, SUPABASE_URL, SUPABASE_ANON_KEY])

  /**
   * Shared auth controller (login / logout)
   * Single source of auth actions
   */
  const auth = useMemo(() => {
    if (!hasSupabaseEnv) return null

    return createAuth({
      redirectPath,
      supabaseUrl: SUPABASE_URL!,
      supabaseAnonKey: SUPABASE_ANON_KEY!,
      baseUrl: siteConfig.baseUrl,
    })
  }, [
    hasSupabaseEnv,
    redirectPath,
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    siteConfig.baseUrl,
  ])

  /**
   * Session hydration + auth state changes
   * NO-OP during SSG
   */
  useEffect(() => {
    if (!supabase) return

    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return

      const meta = data.session.user.user_metadata || {}
      if (!meta.user_name || !meta.provider_id) return
      if (data.session.provider_token)
        setProviderToken(data.session.provider_token)

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
        setProviderToken(null)
        dispatch({ type: 'AUTH_LOGOUT' })
        return
      }

      const meta = session.user.user_metadata || {}
      if (!meta.user_name || !meta.provider_id) return
      // a refreshed session no longer carries the token: keep the one we have
      if (session.provider_token) setProviderToken(session.provider_token)

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
    if (!auth) {
      dispatch({
        type: 'AUTH_ERROR',
        error: 'Authentication is not available in this environment',
      })
      return
    }

    dispatch({ type: 'AUTH_START' })

    try {
      await auth.login()
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
    if (!auth) return
    await auth.logout()
    setProviderToken(null)
    dispatch({ type: 'AUTH_LOGOUT' })
  }

  /**
   * Ask GitHub for a further permission (for example 'public_repo').
   * The browser goes to GitHub and comes back to the same page, so a
   * page that needs its state afterwards has to save it first.
   * Throws when the request could not be started.
   */
  const requestAccess = async (scopes: string) => {
    if (!auth)
      throw new Error('Authentication is not available in this environment')
    await auth.login(scopes)
  }

  return {
    state,
    login,
    logout,
    providerToken,
    requestAccess,
  }
}
