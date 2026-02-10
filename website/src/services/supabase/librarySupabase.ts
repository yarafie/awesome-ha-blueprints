/**
 * Services: Library Supabase
 * ────────────────────────────────────────────────────────────────
 * Purpose:
 *   Supabase integration for recording and querying blueprint
 *   downloads at the **library level** (author / maintainer),
 *   aligned with the authoritative database schema.
 *
 * Database Truth:
 *   - Table: library_downloads
 *   - Canonical dimension: blueprint_library
 *   - blueprint_release is REQUIRED
 *   - blueprint_version is REQUIRED
 *
 * Changelog:
 *   - Initial implementation derived from supabase.ts (@EPMatt)
 *   - Updated 2026.01.04 (@yarafie):
 *       1. Renamed service to librarySupabase.ts
 *       2. Canonical rename: variant → library
 *       3. recordBlueprintDownload aligned strictly with DB schema
 *       4. Enforced DB-strict inserts (library, release, version required)
 * ────────────────────────────────────────────────────────────────
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
// @ts-expect-error: Generated at build time by Docusaurus
import siteConfig from '@generated/docusaurus.config'

// ────────────────────────────────────────────────────────────────
// Internal client management
// ────────────────────────────────────────────────────────────────
let supabase: SupabaseClient | null = null

const ensureClient = (): SupabaseClient | null => {
  if (supabase) return supabase

  // Prefer values from customFields.env (in docusaurus.config.ts)
  const customFields: any = (siteConfig as any)?.customFields || {}
  const envFromConfig = customFields.env || {}

  const supabaseUrl: string | undefined = envFromConfig.SUPABASE_URL
  const supabaseKey: string | undefined = envFromConfig.SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseKey) {
    initializeSupabase({ supabaseUrl, supabaseKey })
  }

  return supabase
}

/**
 * Initialize the Supabase client (called once when app starts).
 */
export const initializeSupabase = ({
  supabaseUrl,
  supabaseKey,
}: {
  supabaseUrl: string
  supabaseKey: string
}): void => {
  supabase = createClient(supabaseUrl, supabaseKey)
  console.log('✅ [Supabase] initialized')
}

// ────────────────────────────────────────────────────────────────
// Record a library blueprint download (DB-strict)
// ────────────────────────────────────────────────────────────────
/**
 * Record a blueprint download in the Supabase database
 *
 * DB TRUTH:
 *   table: library_downloads
 *   All logical dimensions are REQUIRED
 *
 * @param category The blueprint category (controllers | hooks | automations)
 * @param id       The blueprint ID (e.g. ikea_e2001_e2002)
 * @param library  The owning library (e.g. EPMatt, yarafie)
 * @param release  The release identifier (e.g. awesome)
 * @param version  The physical blueprint version (YYYY.MM.DD)
 */
export const recordBlueprintDownload = async (
  category: string,
  id: string,
  library: string,
  release: string,
  version: string,
): Promise<boolean> => {
  const client = ensureClient()
  if (!client) {
    console.error(
      '❌ [Supabase] recordBlueprintDownload: client not initialized',
    )
    return false
  }

  try {
    const { error } = await client.from('library_downloads').insert([
      {
        blueprint_category: category,
        blueprint_id: id,
        blueprint_library: library,
        blueprint_release: release,
        blueprint_version: version,
        download_date: new Date().toISOString(),
      },
    ])

    if (error) {
      console.error('❌ [Supabase] Error recording library download:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('❌ [Supabase] Exception recording library download:', error)
    return false
  }
}

// ────────────────────────────────────────────────────────────────
// Per-blueprint total (used by BlueprintPage + BlueprintImportCard)
// Uses the dedicated get_library_downloads RPC.
// ────────────────────────────────────────────────────────────────
/**
 * Get the total downloads for a blueprint, optionally filtered by
 * library, release and/or version.
 *
 * @param category The blueprint category
 * @param id The blueprint ID
 * @param library Optional library
 * @param release Optional release
 * @param version Optional version (physical version YYYY.MM.DD)
 * @returns Promise that resolves to the total downloads count or 0
 *
 * Calls RPC:
 *   get_library_downloads(p_category, p_id, p_library, p_release, p_version)
 */
export const getBlueprintDownloads = async (
  category: string,
  id: string,
  library: string | null = null,
  release: string | null = null,
  version: string | null = null,
): Promise<number> => {
  const client = ensureClient()
  if (!client) {
    console.error('❌ [Supabase] getBlueprintDownloads: client not initialized')
    return 0
  }

  try {
    // RPC payload:
    const { data, error } = await client.rpc('get_library_downloads', {
      p_category: category,
      p_id: id,
      p_library: library,
      p_release: release,
      p_version: version,
    })
    if (error) {
      console.error('❌ [Supabase] Error in getBlueprintDownloads RPC:', error)
      return 0
    }

    // RPC returns a bigint scalar
    return typeof data === 'number' ? data : Number(data ?? 0)
  } catch (error) {
    console.error('❌ [Supabase] Exception in getBlueprintDownloads:', error)
    return 0
  }
}
