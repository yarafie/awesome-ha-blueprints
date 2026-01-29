/**
 * loadVersionJson
 * ────────────────────────────────────────────────────────────────
 *
 * Step 2.2.2 (A) — Load version.json
 *
 * Purpose:
 *  - Load raw version.json for a resolved update target
 *  - Used ONLY to discover blueprint_file
 *
 * Design constraints:
 *  - No schema validation
 *  - No defaults
 *  - No guessing
 *  - Fetch-only
 */

export interface VersionJson {
  blueprint_file?: string
}

export async function loadVersionJson(
  rawUrl: string,
): Promise<VersionJson | null> {
  try {
    const res = await fetch(rawUrl)
    if (!res.ok) return null
    return (await res.json()) as VersionJson
  } catch {
    return null
  }
}
