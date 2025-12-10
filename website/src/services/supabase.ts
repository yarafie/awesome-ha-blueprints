/**
 * Services: Supabase
 * ────────────────────────────────────────────────────────────────
 * Changelog:
 *   - Initial Version (@EPMatt)
 *   - Updated 2026.12.07 (@yarafie):
 *       1. Added variant-aware and version-aware support
 *       2. Updated RPC integration (p_variant, p_version)
 *       3. Updated recordBlueprintDownload and getBlueprintDownloads
 *   - Updated 2026.12.09 (@yarafie):
 *       1. Added generic analytics helpers to be also used in
 *          the downloads metrics dashboard
 *           • Aggregated totals (per category/id/variant)
 *           • Daily download time series
 *       2. Aligned on a minimal RPC set:
 *           • get_blueprint_downloads
 *           • get_download_aggregates        (analytics only, ignores version)
 *           • get_daily_downloads_metrics     (analytics only, ignores version)
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
  console.log('Supabase initialized')
}

// ────────────────────────────────────────────────────────────────
// Public types for analytics / metrics
// ────────────────────────────────────────────────────────────────
/**
 * A single aggregated row for downloads.
 * Returned by the `get_download_aggregates` RPC.
 *
 * NOTE:
 *   Analytics IGNORE the physical version dimension.
 *   `blueprint_version` is kept in the type but will always be null
 *   from analytics RPCs.
 */
export interface DownloadAggregateRow {
  blueprint_category: string
  blueprint_id: string
  blueprint_variant: string | null
  blueprint_version: string | null
  total: number
  last_downloaded: string | null
}

/**
 * A single daily aggregated row.
 * Returned by the `get_daily_downloads_metrics` RPC.
 */
export interface DailyDownloadRow {
  day: string // ISO date string (YYYY-MM-DD)
  total: number
}

/**
 * Filter options for analytics helpers.
 * All fields are optional; `null` means “no filter” on that dimension.
 *
 * NOTE:
 *   `version` is ignored by analytics on purpose (per design).
 */
export interface DownloadFilterOptions {
  category?: string | null
  id?: string | null
  variant?: string | null
  version?: string | null // ← kept for API symmetry, ignored in analytics
}

/**
 * Options for daily series helper.
 */
export interface DailySeriesOptions extends DownloadFilterOptions {
  days: number
}

// ────────────────────────────────────────────────────────────────
// 1) Record a blueprint download
// ────────────────────────────────────────────────────────────────
/**
 * Record a blueprint download in the Supabase database
 *
 * @param category The blueprint category (e.g., 'controllers', 'hooks', 'automation')
 * @param id       The blueprint ID (e.g., 'ikea_e2001_e2002')
 * @param variant  The blueprint variant (e.g., 'EPMatt', 'yarafie') – controllers only // Added variant support
 * @param version  The blueprint version (e.g., '2025.12.01')
 * @returns        Promise that resolves to the insertion result or null (Promise<boolean> indicating success)
 */
export const recordBlueprintDownload = async (
  category: string,
  id: string,
  variant: string | null = null, // Added variant support
  version: string = 'latest',
): Promise<boolean> => {
  const client = ensureClient()
  if (!client) {
    console.error('[Supabase] recordBlueprintDownload: client not initialized')
    return false
  }

  try {
    const { error } = await client.from('blueprint_downloads').insert([
      {
        blueprint_category: category,
        blueprint_id: id,
        blueprint_variant: variant, // null for hooks/automation
        blueprint_version: version, // physical version (e.g., 2025.11.16) or "latest"
        download_date: new Date().toISOString(),
      },
    ])

    if (error) {
      console.error('[Supabase] Error recording blueprint download:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('[Supabase] Exception recording blueprint download:', error)
    return false
  }
}

// ────────────────────────────────────────────────────────────────
// 2) Per-blueprint total (used by BlueprintImportCard)
//    Uses the dedicated get_blueprint_downloads RPC.
// ────────────────────────────────────────────────────────────────
/**
 * Get the total downloads for a blueprint, optionally filtered by
 * variant and/or version.
 *
 * @param category The blueprint category
 * @param id The blueprint ID
 * @param variant Optional variant (controllers only)
 * @param version Optional version (physical version YYYY.MM.DD)
 * @returns Promise that resolves to the total downloads count or 0
 *
 * Calls RPC:
 *   get_blueprint_downloads(p_category, p_id, p_variant, p_version)
 */
export const getBlueprintDownloads = async (
  category: string,
  id: string,
  variant: string | null = null, // Added variant support
  version: string | null = null, // Added version support
): Promise<number> => {
  const client = ensureClient()
  if (!client) {
    console.error('[Supabase] getBlueprintDownloads: client not initialized')
    return 0
  }

  try {
    // Updated RPC payload: now includes variant + version
    const { data, error } = await client.rpc('get_blueprint_downloads', {
      p_category: category,
      p_id: id,
      p_variant: variant, // Added variant support
      p_version: version, // Added version support
    })
    if (error) {
      console.error('[Supabase] Error in getBlueprintDownloads RPC:', error)
      return 0
    }

    // RPC returns a bigint scalar
    return typeof data === 'number' ? data : Number(data ?? 0)
  } catch (error) {
    console.error('[Supabase] Exception in getBlueprintDownloads:', error)
    return 0
  }
}

// ────────────────────────────────────────────────────────────────
// 3) Generic analytics helpers for DownloadMetricsPage
//    (version is ignored in all analytics)
// ────────────────────────────────────────────────────────────────
/**
 * Fetch aggregated download stats by category/id/variant.
 *
 * This calls the `get_download_aggregates` RPC and returns raw
 * per-blueprint aggregates. The caller (e.g., DownloadMetricsPage)
 * can derive:
 *   - totalDownloads        (sum of total)
 *   - byCategory            (group by blueprint_category)
 *   - topBlueprints         (sort by total, slice top N)
 *   - variant-specific views (filter by blueprint_variant)
 */
export const getDownloadAggregates = async (
  filters: DownloadFilterOptions = {},
): Promise<DownloadAggregateRow[]> => {
  const client = ensureClient()
  if (!client) {
    console.error('[Supabase] getDownloadAggregates: client not initialized')
    return []
  }

  const { category = null, id = null, variant = null } = filters

  try {
    const { data, error } = await client.rpc('get_download_aggregates', {
      p_category: category,
      p_variant: variant,
      p_id: id,
    })

    if (error) {
      console.error('[Supabase] Error in getDownloadAggregates RPC:', error)
      return []
    }

    // Map DB columns to our canonical shape
    return (data || []).map((row: any) => ({
      blueprint_category: row.blueprint_category,
      blueprint_id: row.blueprint_id,
      blueprint_variant: row.blueprint_variant ?? null,
      // SQL column is "total_downloads"
      total: Number(row.total_downloads ?? 0),
      last_downloaded: row.last_downloaded
        ? new Date(row.last_downloaded).toISOString()
        : null,
    })) as DownloadAggregateRow[]
  } catch (error) {
    console.error('[Supabase] Exception in getDownloadAggregates:', error)
    return []
  }
}

/**
 * Fetch a daily download time series, optionally filtered
 * by category/id/variant.
 *
 * Calls RPC:
 *   get_daily_downloads_metrics(p_days, p_category, p_variant, p_id)
 *
 * NOTE:
 *   Version dimension is intentionally ignored in analytics.
 */
export const getDailyDownloadSeries = async (
  options: DailySeriesOptions,
): Promise<DailyDownloadRow[]> => {
  const client = ensureClient()
  if (!client) {
    console.error('[Supabase] getDailyDownloadSeries: client not initialized')
    return []
  }

  const {
    days,
    category = null,
    id = null,
    variant = null,
    // version is intentionally ignored
  } = options

  try {
    const { data, error } = await client.rpc('get_daily_downloads_metrics', {
      p_days: days,
      p_category: category,
      p_variant: variant,
      p_id: id,
    })

    if (error) {
      console.error('[Supabase] Error in getDailyDownloadSeries RPC:', error)
      return []
    }

    return (data || []).map((row: any) => ({
      day: row.day,
      total: Number(row.total ?? 0),
    })) as DailyDownloadRow[]
  } catch (error) {
    console.error('[Supabase] Exception in getDailyDownloadSeries:', error)
    return []
  }
}
