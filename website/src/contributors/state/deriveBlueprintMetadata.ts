/**
 * Derivation helpers for Blueprint Metadata (Automations)
 * ──────────────────────────────────────────────────────
 * Locked rules implemented here:
 *  - blueprint_id derived from YAML blueprint.name (lowercase, spaces -> _)
 *  - description derived from YAML description:
 *      first complete sentence that does NOT start with '#'
 *  - category fixed by UI selection: "automations"
 *  - default status: "active"
 */

export type BlueprintStatus = 'active' | 'deprecated'

export interface Librarian {
  id: string
  name: string
  url?: string
}

export interface ExternalReference {
  label: string
  url: string
}

export interface BlueprintMetadataDraft {
  blueprint_id: string
  name: string
  description: string
  category: 'automations'
  status: BlueprintStatus
  tags: string[]
  images: string[]
  manual_files: string[]
  external_references: ExternalReference[]
  librarians: Librarian[]
}

function toBlueprintId(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function normalizeText(s: string): string {
  return s.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
}

/**
 * Extract first "complete sentence" from YAML description that does not start with '#'
 * - We treat a sentence end as '.', '!' or '?'
 * - If none found, we return the first non-empty non-heading line
 */
export function extractShortDescriptionFromYamlDescription(
  rawDescription: string,
): string {
  const text = normalizeText(rawDescription)

  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  // drop heading lines that start with '#'
  const nonHeading = lines.filter((l) => !l.startsWith('#'))

  if (nonHeading.length === 0) return ''

  // build a running buffer until we hit a sentence terminator
  let buf = ''
  for (const line of nonHeading) {
    buf = buf ? `${buf} ${line}` : line

    const m = buf.match(/^(.+?[.!?])(\s|$)/)
    if (m && m[1]) {
      return m[1].trim()
    }
  }

  // fallback
  return nonHeading[0].trim()
}

/**
 * Locked librarians order rule:
 *  - Add EPMatt first
 *  - Then yarafie
 *  - Then logged-in user
 *  - Unique by id
 */
export function deriveLibrarians(params: {
  loggedInUser: string
}): Librarian[] {
  const ordered = ['EPMatt', 'yarafie', params.loggedInUser]
  const seen = new Set<string>()
  const out: Librarian[] = []
  for (const id of ordered) {
    const v = String(id || '').trim()
    if (!v) continue
    if (seen.has(v)) continue
    seen.add(v)
    out.push({ id: v, name: v })
  }
  return out
}

export function deriveBlueprintMetadataDraft(params: {
  yamlName: string | null
  yamlDescription: string | null
  loggedInUser: string
}): BlueprintMetadataDraft {
  const name = (params.yamlName || '').trim()
  const blueprint_id = toBlueprintId(name || 'new_blueprint')

  const shortDesc = params.yamlDescription
    ? extractShortDescriptionFromYamlDescription(params.yamlDescription)
    : ''

  return {
    blueprint_id,
    name: name || '',
    description: shortDesc || '',
    category: 'automations',
    status: 'active',
    tags: [],
    images: [`${blueprint_id}.png`],
    manual_files: [],
    external_references: [],
    librarians: deriveLibrarians({ loggedInUser: params.loggedInUser }),
  }
}

export function isHttpsUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return u.protocol === 'https:'
  } catch {
    return false
  }
}
