/**
 * auth.ts
 * ------------------------------------------------------------
 * Public entry point for the authentication module.
 *
 * Responsibilities:
 * - Expose a clean, reusable auth API
 * - Remain UI-agnostic and route-agnostic
 * - Be usable by Contributors, Maintainers, and future flows
 *
 * This file intentionally contains NO React code.
 */

import { createAuthClient } from './services/authClient'

/**
 * Parameters required to initialize authentication.
 * The caller (page-level orchestrator) decides intent.
 */
export interface AuthInitOptions {
  /**
   * Route to return to after OAuth login.
   * Example: '/contributors', '/maintainers', '/issues'
   */
  redirectPath: string
}

/**
 * Create an auth controller instance.
 * This keeps auth reusable and context-independent.
 */
export function createAuth(options: AuthInitOptions) {
  const { supabase, siteConfig } = createAuthClient()

  /**
   * Start GitHub OAuth login.
   */
  const login = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo:
          window.location.origin +
          siteConfig.baseUrl +
          options.redirectPath.replace(/^\//, ''),
      },
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  /**
   * Logout current user.
   */
  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
  }

  return {
    login,
    logout,
  }
}
