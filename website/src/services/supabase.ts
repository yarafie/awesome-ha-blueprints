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
 *           • Aggregated totals (per category/id/variant/version)
 *           • Daily download time series
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
  // eslint-disable-next-line no-console
  console.log('Supabase initialized')
}

// ────────────────────────────────────────────────────────────────
// Public types for analytics / metrics
// ────────────────────────────────────────────────────────────────
/**
 * A single aggregated row for downloads.
 * Returned by the `get_download_aggregates` RPC.
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
 */
export interface DownloadFilterOptions {
  category?: string | null
  id?: string | null
  variant?: string | null
  version?: string | null
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
 * Record a blueprint download in the Supabase database.
 *
 * @param category The blueprint category (e.g., 'controllers', 'hooks', 'automation')
 * @param id       The blueprint ID (e.g., 'ikea_e2001_e2002')
 * @param variant  The blueprint variant (e.g., 'EPMatt', 'yarafie') – controllers only
 * @param version  The blueprint version (e.g., '2025.12.01')
 * @returns        Promise<boolean> indicating success
 */
export const recordBlueprintDownload = async (
  category: string,
  id: string,
  variant: string | null = null,
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
        blueprint_variant: variant, // NEW FIELD: null for hooks/automation
        blueprint_version: version, // physical version (e.g., 2025.11.16)
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
//    Internally uses the generic aggregates RPC.
// ────────────────────────────────────────────────────────────────
/**
 * Get the total downloads for a blueprint, optionally filtered by
 * variant and/or version.
 *
 * NOTE:
 *   Uses the generic `get_download_aggregates` RPC so that
 *   per-blueprint and analytics code are all aligned.
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
  const client = ensureClient()
  if (!client) {
    console.error('[Supabase] getBlueprintDownloads: client not initialized')
    return 0
  }

  try {
    // Updated RPC payload: now includes variant + version
    const { data, error } = await client.rpc('get_download_aggregates', {
      p_category: category,
      p_id: id,
      p_variant: variant, // NEW RPC PARAM
      p_version: version, // NEW RPC PARAM
    })

    if (error) {
      console.error('[Supabase] Error in getBlueprintDownloads via RPC:', error)
      return 0
    }

    const rows = (data || []) as DownloadAggregateRow[]
    if (!rows.length) return 0

    // In practice this should be a single row, but we sum defensively.
    return rows.reduce((sum, row) => sum + Number(row.total || 0), 0)
  } catch (error) {
    console.error('[Supabase] Exception in getBlueprintDownloads:', error)
    return 0
  }
}

// ────────────────────────────────────────────────────────────────
// 3) Generic analytics helpers for DownloadMetricsPage
// ────────────────────────────────────────────────────────────────
/**
 * Fetch aggregated download stats by category/id/variant/version.
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

  const { category = null, id = null, variant = null, version = null } = filters

  try {
    const { data, error } = await client.rpc('get_download_aggregates', {
      p_category: category,
      p_id: id,
      p_variant: variant,
      p_version: version,
    })

    if (error) {
      console.error('[Supabase] Error in getDownloadAggregates RPC:', error)
      return []
    }

    return (data || []).map((row: any) => ({
      blueprint_category: row.blueprint_category,
      blueprint_id: row.blueprint_id,
      blueprint_variant: row.blueprint_variant ?? null,
      blueprint_version: row.blueprint_version ?? null,
      total: Number(row.total ?? 0),
      last_downloaded: row.last_downloaded ?? null,
    })) as DownloadAggregateRow[]
  } catch (error) {
    console.error('[Supabase] Exception in getDownloadAggregates:', error)
    return []
  }
}

/**
 * Fetch a daily download time series, optionally filtered
 * by category/id/variant/version.
 *
 * This calls the `get_daily_downloads_metrics` RPC and returns
 * rows like `{ day: '2025-12-09', total: 42 }`.
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
    version = null,
  } = options

  try {
    const { data, error } = await client.rpc('get_daily_downloads_metrics', {
      p_days: days,
      p_category: category,
      p_id: id,
      p_variant: variant,
      p_version: version,
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
