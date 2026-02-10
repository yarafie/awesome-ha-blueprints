/**
 * Services: Metrics Supabase
 * ────────────────────────────────────────────────────────────────
 * Fix: Explicitly passing nulls to match Postgres RPC signatures.
 * ────────────────────────────────────────────────────────────────
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js'
// @ts-expect-error: Generated at build time by Docusaurus
import siteConfig from '@generated/docusaurus.config'

// Types
export interface DownloadsAggregateRow {
  blueprint_category: string
  blueprint_library: string | null
  blueprint_release: string | null
  blueprint_id: string
  total: number
  last_downloaded: string | null
}

export interface DailyDownloadsRow {
  day: string
  total: number
}

// ────────────────────────────────────────────────────────────────
// Internal client management
// ────────────────────────────────────────────────────────────────
let supabase: SupabaseClient | null = null

const ensureClient = (): SupabaseClient | null => {
  if (supabase) return supabase

  // 1. Try Docusaurus Config (Client-side safe)
  const customFields = (siteConfig as any)?.customFields || {}
  const env = customFields.env || {}

  // 2. Fallback to process.env (Build time)
  const url = env.SUPABASE_URL || process.env.SUPABASE_URL
  const key = env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (url && key) {
    try {
      supabase = createClient(url, key)
    } catch (e) {
      console.error('Supabase init failed', e)
    }
  }
  return supabase
}

// ────────────────────────────────────────────────────────────────
// API Methods
// ────────────────────────────────────────────────────────────────

/**
 * Get aggregated totals.
 * RPC: get_library_downloads_aggregates(p_category, p_library, p_release, p_id)
 */
export const getDownloadsAggregates = async (filters: {
  category?: string | null
  library?: string | null
  release?: string | null
  id?: string | null
}): Promise<DownloadsAggregateRow[]> => {
  const client = ensureClient()
  if (!client)
    throw new Error('Supabase Client not initialized (Check Env Vars)')

  // FIX: Explicitly map undefined to null to match SQL signature
  const params = {
    p_category: filters.category || null,
    p_library: filters.library || null,
    p_release: filters.release || null,
    p_id: filters.id || null,
  }

  const { data, error } = await client.rpc(
    'get_library_downloads_aggregates',
    params,
  )

  if (error) {
    // Throwing error allows the UI to catch and display it
    throw new Error(`RPC Error: ${error.message} (Details: ${error.details})`)
  }

  return (data || []).map((r: any) => ({
    blueprint_category: r.blueprint_category,
    blueprint_library: r.blueprint_library,
    blueprint_release: r.blueprint_release,
    blueprint_id: r.blueprint_id,
    total: Number(r.total_downloads || 0),
    last_downloaded: r.last_downloaded,
  }))
}

/**
 * Get daily series.
 * RPC: get_library_downloads_daily(p_days, p_category, p_library, p_release, p_id)
 */
export const getDailyDownloadsSeries = async (options: {
  days: number
  category?: string | null
  library?: string | null
  release?: string | null
  id?: string | null
}): Promise<DailyDownloadsRow[]> => {
  const client = ensureClient()
  if (!client) throw new Error('Supabase Client not initialized')

  const params = {
    p_days: options.days,
    p_category: options.category || null,
    p_library: options.library || null,
    p_release: options.release || null,
    p_id: options.id || null,
  }

  const { data, error } = await client.rpc(
    'get_library_downloads_daily',
    params,
  )

  if (error) {
    console.error('RPC Error (Daily):', error)
    return []
  }

  return (data || []).map((row: any) => ({
    day: row.day,
    total: Number(row.total || 0),
  }))
}
