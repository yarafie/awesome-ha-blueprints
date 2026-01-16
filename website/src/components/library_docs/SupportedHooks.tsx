/**
 * Component: SupportedHooks
 * ────────────────────────────────────────────────────────────────
 *
 * Purpose:
 *   Renders supported hook mappings for a controller release,
 *   scoped to a single hook (e.g. light, cover, media_player).
 *
 * Data Source:
 *   - hooks.json (release-level)
 *   - changelog.json (for version resolution only)
 *
 * Design (LOCKED):
 *   - No ReleaseContext
 *   - No filesystem scanning
 *   - URL (?version=YYYY.MM.DD) is authoritative
 *   - Same refresh / reload semantics as BlueprintImportCard.tsx
 *   - Pure render: deterministic from props + URL
 *
 * Scope:
 *   Controllers → Hooks
 *
 * ────────────────────────────────────────────────────────────────
 */
import React from 'react'
import Link from '@docusaurus/Link'
import { jsonContext, changelogsContext } from '../../utils/libraryContexts'

/* ────────────────────────────────────────────────────────────── */
/* Types                                                         */
/* ────────────────────────────────────────────────────────────── */

interface HookMapping {
  event: string
  event_label: string
  action: string
  action_label: string
  mode?: 'single' | 'continuous'
  virtual?: boolean
}

interface MappingOption {
  label?: string
  mappings: HookMapping[]
}

interface HookEntry {
  hook: string
  label: string
  mapping_options: Record<string, MappingOption>
}

interface HooksJson {
  controller: string
  library_id: string
  release_id: string
  hooks: HookEntry[]
}

interface ChangelogEntry {
  date: string
}

interface SupportedHooksProps {
  category: 'controllers'
  id: string
  library: string
  release: string
  hook: string
}

/* ────────────────────────────────────────────────────────────── */
/* Helpers                                                       */
/* ────────────────────────────────────────────────────────────── */

function getVersionFromUrl(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const url = new URL(window.location.href)
    const v = url.searchParams.get('version')
    if (!v) return null
    if (!/^\d{4}\.\d{2}\.\d{2}$/.test(v)) return null
    return v
  } catch {
    return null
  }
}

function loadReleaseVersions(
  category: string,
  id: string,
  library: string,
  release: string,
): string[] {
  try {
    const path = `./${category}/${id}/${library}/${release}/changelog.json`
    const parsed = changelogsContext(path) as unknown as ChangelogEntry[]
    if (!parsed || parsed.length === 0) return []
    return parsed.map((entry) => entry.date).sort((a, b) => b.localeCompare(a))
  } catch {
    return []
  }
}

/* ────────────────────────────────────────────────────────────── */
/* Component                                                     */
/* ────────────────────────────────────────────────────────────── */

const SupportedHooks: React.FC<SupportedHooksProps> = ({
  category,
  id,
  library,
  release,
  hook,
}) => {
  if (category !== 'controllers') return null

  /* Resolve version (URL-driven, fallback to latest) */
  const versions = loadReleaseVersions(category, id, library, release)
  if (versions.length === 0) return null

  const urlVersion = getVersionFromUrl()
  const resolvedVersion =
    urlVersion && versions.includes(urlVersion) ? urlVersion : versions[0]

  void resolvedVersion // intentional: forces re-render on version change

  /* Load hooks.json (release-level) */
  let hooksJson: HooksJson
  try {
    hooksJson = jsonContext(
      `./${category}/${id}/${library}/${release}/hooks.json`,
    ) as HooksJson
  } catch {
    return null
  }

  const hookEntry = hooksJson.hooks.find((h) => h.hook === hook)
  if (!hookEntry) return null

  return (
    <div className='supported-hooks'>
      {Object.entries(hookEntry.mapping_options).map(([optionKey, option]) => (
        <div key={optionKey} style={{ marginBottom: '1rem' }}>
          <h4>
            {option.label ?? `(${optionKey.replace(/_/g, ' ')}) Mapping`}{' '}
            Mapping
          </h4>
          <ul>
            {option.mappings.map((m, idx) => (
              <li key={`${m.event}-${idx}`}>
                {m.event_label} → {m.action_label}
                {m.virtual && (
                  <>
                    {' '}
                    <code style={{ fontSize: '0.75rem' }}>Virtual</code>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div style={{ marginTop: '0.5rem' }}>
        <Link to={`/docs/blueprints/hooks/${hook}`}>
          {hookEntry.label} Hook docs
        </Link>
      </div>
    </div>
  )
}

export default SupportedHooks
