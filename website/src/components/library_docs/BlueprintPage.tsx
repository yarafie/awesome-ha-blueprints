/**
 * Component: BlueprintPage
 * ────────────────────────────────────────────────────────────────
 *
 * Purpose:
 * Section renderer for Blueprint documentation pages.
 *
 * Design:
 * - MDX defines document structure (headings, TOC)
 * - This component renders section CONTENT only
 * - Safe to render multiple times per page
 *
 * Sections:
 * - overview   → Blueprint metadata, images, manuals, references
 * - libraries  → Libraries and releases listing
 *
 * LOCKED:
 * Types strictly reflect JSON schemas in /schemas
 *
 * ────────────────────────────────────────────────────────────────
 */
import React, { useEffect, useState } from 'react'
import Link from '@docusaurus/Link'
import { BoxArrowUpRight, InfoCircle } from 'react-bootstrap-icons'
import {
  jsonContext,
  changelogsContext,
  pdfContext,
} from '@src/utils/libraryContexts'
// MARKDOWN SUPPORT
import { marked, Renderer } from 'marked'
import { emojiMap } from '@src/utils/emojiMap'
// DOWNLOAD METRICS
import { getBlueprintDownloads } from '@src/services/supabase/librarySupabase'
/* ------------------------------------------------------------------ */
/* Schema-aligned Types (LOCKED)                                       */
/* ------------------------------------------------------------------ */
type Category = 'controllers' | 'hooks' | 'automations'
interface Librarian {
  id: string
  name: string
  url?: string
}
interface ExternalReference {
  label: string
  url: string
}
/* blueprint.schema.json */
interface BlueprintJson {
  blueprint_id: string
  name: string
  description: string
  category: Category
  status: 'active' | 'deprecated'
  librarians: Librarian[]
  images: string[]
  tags?: string[]
  manual_files?: string[]
  external_references?: ExternalReference[]
  manufacturer?: string
  model?: string
  model_name?: string
}
/* library.schema.json */
interface LibraryJson {
  library_id: string
  blueprint_id: string
  title: string
  description: string
  maintainers: Librarian[]
  releases: string[]
  category: Category
  status: 'active' | 'deprecated'
  supported_integrations?: string[]
}
/* release.schema.json */
interface ReleaseJson {
  release_id: string
  library_id: string
  blueprint_id: string
  category: Category
  title: string
  maintainers: Librarian[]
  description: string
  versions: string[]
  latest_version: string
  status: 'active' | 'deprecated'
  supported_hooks?: string[] // (surgical) optional, used only for controllers
}
/* changelog.schema.json */
interface ChangelogChange {
  author?: string
  description: string
  breaking?: boolean
}
interface ChangelogEntry {
  date: string
  changes: ChangelogChange[]
}
/* ------------------------------------------------------------------ */
type RenderSection = 'overview' | 'libraries'
interface BlueprintPageProps {
  category: Category
  id: string
  render: RenderSection
}
/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */
const integrationColors: Record<string, string> = {
  zha: '#2563eb',
  zigbee2mqtt: '#16a34a',
  z2m: '#16a34a',
  deconz: '#ea580c',
  shelly: '#dc2626',
}
const normalizeIntegrationKey = (raw: string): string => {
  const k = raw.trim().toLowerCase()
  if (k === 'zigbee2mqtt') return 'zigbee2mqtt'
  if (k === 'z2m') return 'z2m'
  if (k === 'zha') return 'zha'
  if (k === 'deconz') return 'deconz'
  if (k === 'shelly') return 'shelly'
  return k
}
/* ------------------------------------------------------------------ */
/* Hooks pills + tooltip (surgical add)                                */
/* ------------------------------------------------------------------ */
const hookColors: Record<string, string> = {
  light: '#7c3aed',
  cover: '#0f766e',
  media_player: '#b45309',
  automations: '#6d28d9',
}
const hookDescriptions: Record<string, string> = {
  light:
    'Control lights: on/off, brightness, color temperature, RGB (where supported).',
  cover: 'Control covers: open/close/stop and tilt (where supported).',
  media_player:
    'Control media players: volume, play/pause, next/previous track.',
}
const humanizeHookLabel = (hookId: string): string =>
  hookId
    .split('_')
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
/* ------------------------------------------------------------------ */
/* Markdown helpers (copied verbatim from Changelog.tsx)               */
/* ------------------------------------------------------------------ */
// MARKDOWN SUPPORT (surgical)
const renderer = new Renderer()
renderer.link = ({ href, title, text }) => {
  const titleAttr = title ? ` title="${title}"` : ''
  return `<a href="${href}" target="_blank" rel="noopener noreferrer"${titleAttr}>${text}</a>`
}
marked.setOptions({
  breaks: true,
  gfm: true,
  async: false,
  renderer,
})
const replaceEmojiCodes = (text: string): string => {
  return text.replace(
    /:([a-zA-Z0-9_+-]+):/g,
    (match) => emojiMap[match] || match,
  )
}
const markdownToHtml = (markdown: string): string => {
  const withEmojis = replaceEmojiCodes(markdown)
  let html = marked.parse(withEmojis) as string
  html = html.replace(/^<p>/, '').replace(/<\/p>\s*$/, '')
  return html.trim()
}
/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
const BlueprintPage: React.FC<BlueprintPageProps> = ({
  category,
  id,
  render,
}) => {
  const [blueprint, setBlueprint] = useState<BlueprintJson | null>(null)
  const [libraries, setLibraries] = useState<
    {
      libraryId: string
      library: LibraryJson
      releases: {
        releaseId: string
        release: ReleaseJson
        changelog: ChangelogEntry[] | null
      }[]
    }[]
  >([])
  const [openInfo, setOpenInfo] = useState<string | null>(null)
  const [downloadCount, setDownloadCount] = useState<number | null>(null)

  // (surgical) tooltip state for hook pills
  const [hookTip, setHookTip] = useState<{
    open: boolean
    title: string
    text: string
    x: number
    y: number
  }>({ open: false, title: '', text: '', x: 0, y: 0 })

  // (surgical) resolved hook descriptions from their own blueprint.json
  const [resolvedHookDescs, setResolvedHookDescs] = useState<
    Record<string, string>
  >({})

  useEffect(() => {
    const hooksToLoad = ['light', 'cover', 'media_player']
    const fetchedDescs: Record<string, string> = {}
    hooksToLoad.forEach((h) => {
      try {
        const data = jsonContext(`./hooks/${h}/blueprint.json`) as BlueprintJson
        if (data?.description) fetchedDescs[h] = data.description
      } catch {
        /* fallback used later */
      }
    })
    setResolvedHookDescs(fetchedDescs)
  }, [])

  // (surgical) close tooltip on outside click / scroll / escape
  useEffect(() => {
    if (!hookTip.open) return
    const onDocDown = () => setHookTip((s) => ({ ...s, open: false }))
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setHookTip((s) => ({ ...s, open: false }))
    }
    window.addEventListener('click', onDocDown)
    window.addEventListener('scroll', onDocDown, true)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('click', onDocDown)
      window.removeEventListener('scroll', onDocDown, true)
      window.removeEventListener('keydown', onKey)
    }
  }, [hookTip.open])

  /* ---------------------------------------------------------------- */
  /* Load blueprint.json                                              */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    try {
      const data = jsonContext(
        `./${category}/${id}/blueprint.json`,
      ) as BlueprintJson
      setBlueprint(
        data.blueprint_id === id && data.category === category ? data : null,
      )
    } catch {
      setBlueprint(null)
    }
  }, [category, id])

  /* ---------------------------------------------------------------- */
  /* Load total blueprint downloads                                   */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    getBlueprintDownloads(category, id).then((count) => {
      setDownloadCount(count)
    })
  }, [category, id])

  /* ---------------------------------------------------------------- */
  /* Discover libraries, releases, changelogs                          */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (!blueprint) return
    const keys = (jsonContext as any).keys()
    const basePath = `./${category}/${id}/`
    const libraryIds = Array.from(
      new Set(
        keys
          .filter(
            (k: string) =>
              k.startsWith(basePath) && k.endsWith('/library.json'),
          )
          .map((k: string) => k.replace(basePath, '').split('/')[0]),
      ),
    )
    const loaded = libraryIds.map((libraryId) => {
      const library = jsonContext(
        `${basePath}${libraryId}/library.json`,
      ) as LibraryJson
      const releaseIds = Array.from(
        new Set(
          keys
            .filter(
              (k: string) =>
                k.startsWith(`${basePath}${libraryId}/`) &&
                k.endsWith('/release.json'),
            )
            .map((k: string) => k.replace(basePath, '').split('/')[1]),
        ),
      )
      const releases = releaseIds.map((releaseId) => {
        const release = jsonContext(
          `${basePath}${libraryId}/${releaseId}/release.json`,
        ) as ReleaseJson
        let changelog: ChangelogEntry[] | null = null
        try {
          changelog = changelogsContext(
            `${basePath}${libraryId}/${releaseId}/changelog.json`,
          ) as ChangelogEntry[]
        } catch {
          /* optional changelog – absence is valid */
        }
        return { releaseId, release, changelog }
      })
      return { libraryId, library, releases }
    })
    setLibraries(loaded)
  }, [blueprint, category, id])

  if (!blueprint) return null

  /* ---------------------------------------------------------------- */
  /* Overview                                                         */
  /* ---------------------------------------------------------------- */
  if (render === 'overview') {
    let manualUrl: string | null = null
    if (blueprint.manual_files?.length) {
      const pdfPath = `./${category}/${id}/${blueprint.manual_files[0]}`
      if ((pdfContext as any).keys().includes(pdfPath)) {
        const mod = pdfContext(pdfPath)
        manualUrl =
          typeof mod === 'string' ? mod : (mod?.default as string) || null
      }
    }
    return (
      <>
        <p style={{ maxWidth: 820 }}>{blueprint.description}</p>
        <div
          style={{
            display: 'flex',
            gap: 32,
            marginTop: 24,
            flexWrap: 'wrap',
            alignItems: 'flex-start',
          }}
        >
          <img
            src={`/awesome-ha-blueprints/img/${category}/${blueprint.images[0]}`}
            style={{
              width: 260,
              borderRadius: 12,
              boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
            }}
          />
          <div style={{ flex: 1, minWidth: 320 }}>
            <h4>General Information</h4>
            <ul style={{ lineHeight: 1.9 }}>
              {blueprint.manufacturer && (
                <li>
                  <strong>Manufacturer:</strong> {blueprint.manufacturer}
                </li>
              )}
              {blueprint.model_name && (
                <li>
                  <strong>Model:</strong> {blueprint.model_name}
                </li>
              )}
              {manualUrl && (
                <li>
                  <strong>Manual:</strong>{' '}
                  <a href={manualUrl} target='_blank' rel='noopener noreferrer'>
                    Download PDF
                  </a>
                </li>
              )}
              <li>
                <strong>Total Downloads:</strong>{' '}
                {downloadCount === null ? '—' : downloadCount.toLocaleString()}
              </li>
            </ul>
            {blueprint.external_references &&
              blueprint.external_references.length > 0 && (
                <>
                  <h4>References</h4>
                  <ul>
                    {blueprint.external_references.map((r) => (
                      <li key={r.url}>
                        <a
                          href={r.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          style={{
                            display: 'inline-flex',
                            gap: 6,
                            alignItems: 'center',
                          }}
                        >
                          {r.label}
                          <BoxArrowUpRight size={14} />
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
          </div>
        </div>
      </>
    )
  }

  /* ---------------------------------------------------------------- */
  /* Libraries                                                        */
  /* ---------------------------------------------------------------- */
  if (render === 'libraries') {
    return (
      <>
        {/* (surgical) floating tooltip with Theme Awareness */}
        {hookTip.open && (
          <div
            style={{
              position: 'fixed',
              left: hookTip.x,
              top: hookTip.y,
              transform: 'translate(-50%, calc(-100% - 14px))',
              background: 'var(--ifm-background-surface-color)',
              color: 'var(--ifm-color-content)',
              padding: '10px 12px',
              borderRadius: 8,
              fontSize: 12,
              minWidth: 140,
              maxWidth: 300,
              zIndex: 9999,
              boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
              pointerEvents: 'none',
              lineHeight: 1.4,
              textAlign: 'left',
              border: '1px solid var(--ifm-color-emphasis-300)',
            }}
          >
            <div
              style={{
                fontWeight: 'bold',
                fontSize: 13,
                marginBottom: 6,
                borderBottom: '1px solid var(--ifm-color-emphasis-300)',
                paddingBottom: 4,
              }}
            >
              {hookTip.title}
            </div>
            <div>{hookTip.text}</div>

            {/* Arrow Tip Outer (Border) */}
            <div
              style={{
                position: 'absolute',
                bottom: -7,
                left: '50%',
                transform: 'translateX(-50%)',
                borderLeft: '7px solid transparent',
                borderRight: '7px solid transparent',
                borderTop: '7px solid var(--ifm-color-emphasis-300)',
              }}
            />

            {/* Arrow Tip Inner (Fill) */}
            <div
              style={{
                position: 'absolute',
                bottom: -6,
                left: '50%',
                transform: 'translateX(-50%)',
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid var(--ifm-background-surface-color)',
              }}
            />
          </div>
        )}

        {libraries.map((lib) => (
          <div
            key={lib.libraryId}
            style={{
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: 8,
              padding: 16,
              marginBottom: 24,
            }}
          >
            <strong>{lib.library.title}</strong>
            <p>{lib.library.description}</p>
            {/* Supported integrations pills */}
            {lib.library.supported_integrations &&
              lib.library.supported_integrations.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap',
                    marginBottom: 12,
                  }}
                >
                  {lib.library.supported_integrations.map((i) => {
                    const key = normalizeIntegrationKey(i)
                    return (
                      <span
                        key={i}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 999,
                          fontSize: 12,
                          color: '#fff',
                          background: integrationColors[key] ?? '#6b7280',
                        }}
                      >
                        {i}
                      </span>
                    )
                  })}
                </div>
              )}
            {/* Releases */}
            <div
              style={{
                marginTop: 16,
                paddingLeft: 12,
                borderLeft: '3px solid var(--ifm-color-emphasis-200)',
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 8,
                  color: 'var(--ifm-color-content-secondary)',
                }}
              >
                Releases
              </div>
              {lib.releases.map((rel) => {
                const key = `${lib.libraryId}:${rel.releaseId}`
                const latestEntry = rel.changelog?.[rel.changelog.length - 1]
                const hasBreakingChange =
                  latestEntry?.changes.some((c) => c.breaking) ?? false
                const supportedHooks =
                  category === 'controllers'
                    ? (rel.release.supported_hooks ?? [])
                    : []
                const hookOrder = ['light', 'cover', 'media_player']
                const orderedSupportedHooks = supportedHooks
                  .slice()
                  .sort((a, b) => {
                    const ia = hookOrder.indexOf(a)
                    const ib = hookOrder.indexOf(b)
                    if (ia === -1 && ib === -1) return a.localeCompare(b)
                    if (ia === -1) return 1
                    if (ib === -1) return -1
                    return ia - ib
                  })

                const showHookTip = (
                  hookId: string,
                  e: React.MouseEvent<HTMLElement>,
                ) => {
                  e.stopPropagation()
                  const rect = (
                    e.currentTarget as HTMLElement
                  ).getBoundingClientRect()
                  const title = humanizeHookLabel(hookId)
                  const text =
                    resolvedHookDescs[hookId] ||
                    hookDescriptions[hookId] ||
                    `Hook explanation for ${title}.`
                  const x = rect.left + rect.width / 2
                  const y = rect.top
                  setHookTip({ open: true, title, text, x, y })
                }
                const hideHookTip = () =>
                  setHookTip((s) => ({ ...s, open: false }))

                return (
                  <div
                    key={rel.releaseId}
                    style={{
                      marginBottom: 20,
                      display: 'flex',
                      alignItems: 'stretch', // ensures columns match height
                      justifyContent: 'space-between',
                      gap: 24,
                    }}
                  >
                    {/* Left Column: Info Content */}
                    <div style={{ flex: 1 }}>
                      <strong>{rel.release.title}</strong>
                      {/* Supported hooks pills */}
                      {supportedHooks.length > 0 && (
                        <div
                          style={{
                            display: 'flex',
                            gap: 8,
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            marginTop: 6,
                            marginBottom: 6,
                          }}
                        >
                          <span style={{ fontSize: 13, fontWeight: 600 }}>
                            Supported Hooks:
                          </span>
                          {orderedSupportedHooks.map((h) => (
                            <span
                              key={h}
                              role='button'
                              tabIndex={0}
                              onMouseEnter={(e) => showHookTip(h, e)}
                              onMouseLeave={hideHookTip}
                              onClick={(e) => {
                                e.stopPropagation()
                                if (e.nativeEvent)
                                  e.nativeEvent.stopImmediatePropagation()
                                const rect = (
                                  e.currentTarget as HTMLElement
                                ).getBoundingClientRect()
                                const title = humanizeHookLabel(h)
                                const text =
                                  resolvedHookDescs[h] ||
                                  hookDescriptions[h] ||
                                  `Hook explanation for ${title}.`
                                const x = rect.left + rect.width / 2
                                const y = rect.top
                                setHookTip((s) => ({
                                  open: !(s.open && s.title === title),
                                  title,
                                  text,
                                  x,
                                  y,
                                }))
                              }}
                              onFocus={(e) => showHookTip(h, e as any)}
                              onBlur={hideHookTip}
                              style={{
                                padding: '4px 10px',
                                borderRadius: 999,
                                fontSize: 12,
                                color: '#fff',
                                background: hookColors[h] ?? '#475569',
                                cursor: 'help',
                                userSelect: 'none',
                              }}
                            >
                              {humanizeHookLabel(h)}
                            </span>
                          ))}
                        </div>
                      )}
                      <div
                        style={{
                          fontSize: 14,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <span>
                          Latest: {rel.release.latest_version} ·{' '}
                          {rel.release.status}
                        </span>
                        {hasBreakingChange && (
                          <span
                            style={{
                              color: '#dc2626',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            🚨 Breaking Change
                          </span>
                        )}
                        {latestEntry && (
                          <button
                            type='button'
                            title='View changelog details'
                            onClick={() =>
                              setOpenInfo(openInfo === key ? null : key)
                            }
                            style={{
                              border: 'none',
                              background: 'transparent',
                              padding: 2,
                              cursor: 'pointer',
                              color: 'var(--ifm-color-primary)',
                            }}
                          >
                            <InfoCircle size={14} />
                          </button>
                        )}
                      </div>
                      {openInfo === key && latestEntry && (
                        <div
                          style={{
                            marginTop: 8,
                            padding: 12,
                            borderRadius: 8,
                            background: 'var(--ifm-background-surface-color)',
                            border: '1px solid var(--ifm-color-emphasis-300)',
                            fontSize: 13,
                          }}
                        >
                          <div>
                            <strong>Date:</strong> {latestEntry.date}{' '}
                            {hasBreakingChange && (
                              <span
                                style={{
                                  color: '#dc2626',
                                  fontWeight: 600,
                                  marginLeft: 8,
                                }}
                              >
                                🚨 Breaking Change
                              </span>
                            )}
                          </div>
                          <ul style={{ marginTop: 8 }}>
                            {latestEntry.changes.map((c, i) => (
                              <li key={i}>
                                <strong>{c.author ?? 'Unknown'}:</strong>{' '}
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: markdownToHtml(c.description),
                                  }}
                                />
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Centered View Link */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingLeft: 24,
                        borderLeft: '1px solid var(--ifm-color-emphasis-200)',
                        minWidth: 140,
                        textAlign: 'center',
                      }}
                    >
                      <Link
                        to={`/docs/blueprints/${category}/${id}/${lib.libraryId}/${rel.releaseId}/${rel.release.latest_version}`}
                        style={{ fontWeight: 600 }}
                      >
                        View release →
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </>
    )
  }
  return null
}
export default BlueprintPage
