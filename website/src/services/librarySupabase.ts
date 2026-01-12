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
 *       5. Added runtime-safe env resolution via window.env
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

  // Build-time env (may be empty at runtime)
  const customFields: any = (siteConfig as any)?.customFields || {}
  const envFromConfig = customFields.env || {}

  // Runtime env injected via <script> (guaranteed in browser)
  const runtimeEnv =
    typeof window !== 'undefined' ? (window as any).env || {} : {}

  const supabaseUrl: string | undefined =
    envFromConfig.SUPABASE_URL || runtimeEnv.SUPABASE_URL

  const supabaseKey: string | undefined =
    envFromConfig.SUPABASE_ANON_KEY || runtimeEnv.SUPABASE_ANON_KEY

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
  console.log('✅  [Supabase] initialized')
}

// ────────────────────────────────────────────────────────────────
// Record a library blueprint download (DB-strict)
// ────────────────────────────────────────────────────────────────
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
      '❌  [Supabase] recordBlueprintDownload: client not initialized',
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
      console.error('❌  [Supabase] Error recording library download:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('❌  [Supabase] Exception recording library download:', error)
    return false
  }
}

// ────────────────────────────────────────────────────────────────
// Per-blueprint total (used by BlueprintPage, ImportCard, etc.)
// ────────────────────────────────────────────────────────────────
export const getBlueprintDownloads = async (
  category: string,
  id: string,
  library: string | null = null,
  release: string | null = null,
  version: string | null = null,
): Promise<number> => {
  const client = ensureClient()
  if (!client) {
    console.error(
      '❌  [Supabase] getBlueprintDownloads: client not initialized',
    )
    return 0
  }

  try {
    const { data, error } = await client.rpc('get_library_downloads', {
      p_category: category,
      p_id: id,
      p_library: library,
      p_release: release,
      p_version: version,
    })

    if (error) {
      console.error('❌  [Supabase] Error in getBlueprintDownloads RPC:', error)
      return 0
    }

    return typeof data === 'number' ? data : Number(data ?? 0)
  } catch (error) {
    console.error('❌  [Supabase] Exception in getBlueprintDownloads:', error)
    return 0
  }
}
