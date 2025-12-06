/**
 * Services: Supabase - recordBlueprintDownload / getBlueprintDownloads
 * ────────────────────────────────────────────────────────────────
 * Changelog:
 *   - Initial Version (@EPMatt)
 *   - Updated 2026.12.07 (@yarafie):
 *       1. Added variant-aware and version-aware support
 *       2. Updated RPC integration (p_variant, p_version)
 *       3. Updated recordBlueprintDownload and getBlueprintDownloads
 * ────────────────────────────────────────────────────────────────
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
// @ts-expect-error: Generated at build time by Docusaurus
import siteConfig from '@generated/docusaurus.config'

// Initialize Supabase client
let supabase: SupabaseClient | null = null

const ensureClient = (): SupabaseClient | null => {
  if (supabase) return supabase

  // Prefer values from customFields.env
  const customFields: any = (siteConfig as any)?.customFields || {}
  const envFromConfig = customFields.env || {}

  const supabaseUrl = envFromConfig.SUPABASE_URL
  const supabaseKey = envFromConfig.SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseKey) {
    initializeSupabase({ supabaseUrl, supabaseKey })
  }

  return supabase
}

/**
 * Initialize the Supabase client (called once when app starts)
 */
export const initializeSupabase = ({
  supabaseUrl,
  supabaseKey,
}: {
  supabaseUrl: string
  supabaseKey: string
}): void => {
  supabase = createClient(supabaseUrl, supabaseKey)
  console.log('Supabase initialized')
}

/**
 * Record a blueprint download in the Supabase database
 *
 * @param category The blueprint category
 * @param id The blueprint ID
 * @param version The blueprint version
 * @param variant The blueprint variant // Added variant support
 * @returns Promise that resolves to the insertion result or null
 */
export const recordBlueprintDownload = async (
  category: string,
  id: string,
  version: string = 'latest',
  variant: string | null = null, // Added variant support
): Promise<boolean> => {
  if (!ensureClient()) {
    console.error('Supabase client not initialized')
    return false
  }

  try {
    const { error } = await (supabase as SupabaseClient)
      .from('blueprint_downloads')
      .insert([
        {
          blueprint_category: category,
          blueprint_id: id,
          blueprint_version: version, // physical version (e.g., 2025.11.16)
          blueprint_variant: variant, // NEW FIELD: null for hooks/automation
          download_date: new Date().toISOString(),
        },
      ])

    if (error) {
      console.error('Error recording blueprint download:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Exception recording blueprint download:', error)
    return false
  }
}

/**
 * Get the total downloads for a blueprint
 *
 * @param category The blueprint category
 * @param id The blueprint ID
 * @param variant Optional variant (controllers only)
 * @param version Optional version (physical version YYYY.MM.DD)
 * @returns Promise that resolves to the total downloads count or 0
 */
export const getBlueprintDownloads = async (
  category: string,
  id: string,
  variant: string | null = null, // Added variant support
  version: string | null = null, // Added version support
): Promise<number> => {
  if (!ensureClient()) {
    console.error('Supabase client not initialized')
    return 0
  }

  try {
    // Updated RPC payload: now includes variant + version
    const { data, error } = await (supabase as SupabaseClient).rpc(
      'get_blueprint_downloads',
      {
        p_category: category,
        p_id: id,
        p_variant: variant, // NEW RPC PARAM
        p_version: version, // NEW RPC PARAM
      },
    )

    if (error) {
      console.error('Error getting blueprint downloads via RPC:', error)
      return 0
    }

    return typeof data === 'number' ? data : 0
  } catch (error) {
    console.error('Exception getting blueprint downloads:', error)
    return 0
  }
}
