/**
 * authClient.ts
 * ------------------------------------------------------------------
 * Purpose:
 *  - Centralized Supabase auth client helpers
 *  - NO page-specific assumptions (contributors / maintainers / etc.)
 *
 * Design rules:
 *  - Stateless
 *  - Reusable across any authenticated flow
 *  - Browser-safe (window access only inside functions)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

/**
 * Create a Supabase client from explicit env values.
 * NOTE: No React hooks in this file.
 */
export function createAuthClient(
  supabaseUrl: string,
  supabaseAnonKey: string,
): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are not configured')
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}

/**
 * Build an OAuth redirect URL.
 *
 * @param origin window.location.origin (e.g. https://example.com)
 * @param baseUrl Docusaurus baseUrl (e.g. '/', '/docs/')
 * @param redirectPath App path (e.g. '/contributors', '/maintainers')
 */
export function buildRedirectTo(
  origin: string,
  baseUrl: string,
  redirectPath: string,
) {
  const normalizedBase = (baseUrl || '/').replace(/\/?$/, '/') // ensure trailing /
  const normalizedPath = (redirectPath || '').replace(/^\//, '') // no leading /
  return `${origin}${normalizedBase}${normalizedPath}`
}

/**
 * Generic OAuth login
 *
 * @param supabase Supabase client
 * @param options OAuth options (provider, redirectTo, etc.)
 */
export async function signInWithOAuth(
  supabase: SupabaseClient,
  options: {
    provider: 'github'
    redirectTo: string
  },
) {
  return supabase.auth.signInWithOAuth({
    provider: options.provider,
    options: { redirectTo: options.redirectTo },
  })
}

/**
 * Logout helper
 */
export async function signOut(supabase: SupabaseClient) {
  return supabase.auth.signOut()
}
