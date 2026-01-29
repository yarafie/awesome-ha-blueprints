/**
 * Derivation helpers for Blueprint Metadata
 * ──────────────────────────────────────────────────────────
 *
 * Purpose:
 *  - Produce a BlueprintMetadataDraft for BlueprintMetadataForm
 *
 * Supported flows:
 *  - blueprint:new    → derive from YAML only (original behavior)
 *  - blueprint:update → derive from filesystem JSON using Phase A updateTarget
 *
 * IMPORTANT RULES:
 *  - Never implicitly assume anything about tree semantics.
 *  - Only use what is explicitly provided:
 *      - YAML fields for blueprint:new
 *      - updateTarget selection + filesystem JSON for blueprint:update
 *  - No heuristics. No release/version decisions here.
 */
import {
  jsonContext,
  pngContext,
  pdfContext,
} from '../../utils/libraryContexts'

export type BlueprintStatus = 'active' | 'deprecated'
export type BlueprintCategory = 'automations' | 'controllers' | 'hooks'

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
  category: BlueprintCategory
  status: BlueprintStatus
  tags: string[]
  images: string[]
  manual_files: string[]
  external_references: ExternalReference[]
  librarians: Librarian[]
}

/**
 * Phase A update-target selection (FACTUAL mapping by direct path):
 * 0 category  (controllers|hooks|automations)
 * 1 blueprint (blueprintId)
 * 2 library   (libraryId)   e.g. EPMatt, yarafie
 * 3 release   (releaseId)   e.g. awesome, anything
 * 4 version   (version)     e.g. 2025.11.16
 * 5 yaml file (blueprintId.yaml)
 */
export interface UpdateTarget {
  category: BlueprintCategory
  blueprintId: string
  libraryId: string
  releaseId: string
  version: string
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
 * Extract first "complete sentence" from YAML description that:
 *  - does NOT start with '#'
 *  - ends with '.', '!' or '?'
 * Fallback: first non-empty non-heading line
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
 *  - Add yarafie first
 *  - Then logged-in user
 *  - Unique by id
 */
export function deriveLibrarians(params: {
  loggedInUser: string
}): Librarian[] {
  const ordered = ['yarafie', params.loggedInUser]
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

export function isHttpsUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return u.protocol === 'https:'
  } catch {
    return false
  }
}

function safeLoadJson<T>(path: string): T | null {
  try {
    return jsonContext(path) as T
  } catch {
    return null
  }
}

function hasPng(category: BlueprintCategory, blueprintId: string): boolean {
  const k = `./${category}/${blueprintId}/${blueprintId}.png`
  return pngContext.keys().includes(k)
}

function hasPdf(category: BlueprintCategory, blueprintId: string): boolean {
  const k = `./${category}/${blueprintId}/${blueprintId}.pdf`
  return pdfContext.keys().includes(k)
}

/**
 * Schema-aligned shapes (website/schemas/*.schema.json)
 * - blueprint.schema.json: blueprint_id,name,description,category,status,tags,images,manual_files,external_references
 * - library.schema.json: maintainers[]
 */
type BlueprintJson = Partial<{
  blueprint_id: string
  name: string
  description: string
  category: BlueprintCategory
  status: BlueprintStatus
  tags: unknown
  images: unknown
  manual_files: unknown
  external_references: unknown
  librarians: unknown // not in schema, but keep compatible if present
}>

type LibraryJson = Partial<{
  maintainers: unknown
}>

function coerceStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v
    .map(String)
    .map((s) => s.trim())
    .filter(Boolean)
}

function coerceExternalReferences(v: unknown): ExternalReference[] {
  if (!Array.isArray(v)) return []
  return v
    .filter(
      (r: any) =>
        r &&
        typeof r.label === 'string' &&
        typeof r.url === 'string' &&
        isHttpsUrl(r.url),
    )
    .map((r: any) => ({ label: r.label, url: r.url }))
}

function coerceLibrariansFromMaintainers(v: unknown): Librarian[] {
  if (!Array.isArray(v)) return []
  return v
    .filter(
      (m: any) =>
        m &&
        typeof m.id === 'string' &&
        typeof m.name === 'string' &&
        (m.url === undefined || typeof m.url === 'string'),
    )
    .map((m: any) => ({
      id: String(m.id).trim(),
      name: String(m.name).trim(),
      url: m.url ? String(m.url).trim() : undefined,
    }))
    .filter((m: Librarian) => m.id.length > 0 && m.name.length > 0)
}

function deriveDraftFromYaml(args: {
  yamlName: string | null
  yamlDescription: string | null
  loggedInUser: string
}): BlueprintMetadataDraft {
  const name = (args.yamlName || '').trim()
  const blueprint_id = toBlueprintId(name || 'new_blueprint')
  const shortDesc = args.yamlDescription
    ? extractShortDescriptionFromYamlDescription(args.yamlDescription)
    : ''

  // NOTE: original behavior preserved:
  // - category was fixed to 'automations' for this phase
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
    librarians: deriveLibrarians({ loggedInUser: args.loggedInUser }),
  }
}

function deriveDraftFromUpdateTarget(args: {
  updateTarget: UpdateTarget
  loggedInUser: string
}): BlueprintMetadataDraft {
  const { updateTarget, loggedInUser } = args
  const { category, blueprintId, libraryId } = updateTarget

  // FACTUAL, locked paths (no extrapolation):
  const blueprintJsonPath = `./${category}/${blueprintId}/blueprint.json`
  const libraryJsonPath = `./${category}/${blueprintId}/${libraryId}/library.json`

  const blueprintJson = safeLoadJson<BlueprintJson>(blueprintJsonPath)
  const libraryJson = safeLoadJson<LibraryJson>(libraryJsonPath)

  if (!blueprintJson) {
    throw new Error(`Missing blueprint.json at ${blueprintJsonPath}`)
  }
  if (!libraryJson) {
    throw new Error(`Missing library.json at ${libraryJsonPath}`)
  }

  // category is present both in path and schema; if schema says otherwise, that is a real mismatch.
  if (blueprintJson.category && blueprintJson.category !== category) {
    throw new Error(
      `Category mismatch: path=${category} blueprint.json.category=${blueprintJson.category}`,
    )
  }

  const blueprint_id =
    typeof blueprintJson.blueprint_id === 'string' &&
    blueprintJson.blueprint_id.trim()
      ? blueprintJson.blueprint_id.trim()
      : blueprintId

  const name =
    typeof blueprintJson.name === 'string' && blueprintJson.name.trim()
      ? blueprintJson.name.trim()
      : blueprintId

  const description =
    typeof blueprintJson.description === 'string'
      ? blueprintJson.description
      : ''

  const status: BlueprintStatus =
    blueprintJson.status === 'deprecated' ? 'deprecated' : 'active'

  const tags = coerceStringArray(blueprintJson.tags)

  // Prefer schema-truth arrays, but remain deterministic if missing.
  const imagesFromJson = coerceStringArray(blueprintJson.images)
  const manualFromJson = coerceStringArray(blueprintJson.manual_files)

  const images =
    imagesFromJson.length > 0
      ? imagesFromJson
      : hasPng(category, blueprintId)
        ? [`${blueprintId}.png`]
        : []

  const manual_files =
    manualFromJson.length > 0
      ? manualFromJson
      : hasPdf(category, blueprintId)
        ? [`${blueprintId}.pdf`]
        : []

  const external_references = coerceExternalReferences(
    blueprintJson.external_references,
  )

  // librarians: derive from library.schema.json maintainers[] (truth), else deterministic fallback
  const maintainers = coerceLibrariansFromMaintainers(libraryJson.maintainers)
  const librarians =
    maintainers.length > 0
      ? maintainers
      : Array.isArray(blueprintJson.librarians)
        ? (blueprintJson.librarians as any)
        : deriveLibrarians({ loggedInUser })

  return {
    blueprint_id,
    name,
    description,
    category,
    status,
    tags,
    images,
    manual_files,
    external_references,
    librarians,
  }
}

/**
 * Unified entry point (prevents later rework):
 *  - If updateTarget is provided → blueprint:update derivation
 *  - Else → blueprint:new derivation (original behavior)
 */
export function deriveBlueprintMetadataDraft(params: {
  yamlName: string | null
  yamlDescription: string | null
  loggedInUser: string
  updateTarget?: UpdateTarget | null
}): BlueprintMetadataDraft {
  if (params.updateTarget) {
    return deriveDraftFromUpdateTarget({
      updateTarget: params.updateTarget,
      loggedInUser: params.loggedInUser,
    })
  }

  return deriveDraftFromYaml({
    yamlName: params.yamlName,
    yamlDescription: params.yamlDescription,
    loggedInUser: params.loggedInUser,
  })
}
