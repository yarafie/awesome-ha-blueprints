/**
 * Component: BlueprintImportCard
 * ────────────────────────────────────────────────────────────────
 *
 * Changelog:
 *   • Initial Version (@EPMatt)
 *   - Updated 2025.12.03 (@yarafie):
 *      1. Moved utils.ts to utils/contexts.ts
 *      2. Added variant and versions for controllers
 *   - Updated 2026.01.11 (@yarafie):
 *      3. Migrated from variant to library / release / version
 *      4. Aligned with libraryContexts + librarySupabase (DB strict)
 *   - Updated 2026.01.12 (@yarafie):
 *      5. Filter versions by physical YAML existence
 *      6. Guarantee download recording before navigation
 * ────────────────────────────────────────────────────────────────
 */
import Link from '@docusaurus/Link'
import { useEffect, useState } from 'react'
import { getBlueprintDownloads } from '@src/services/supabase/librarySupabase'
import {
  changelogsContext,
  blueprintsContext,
} from '@src/utils/libraryContexts'
import yaml from 'yaml'
import Select from 'react-select'
import type { StylesConfig } from 'react-select'

// Markdown rendering (same as Changelog.tsx)
import { marked, Renderer } from 'marked'
import { emojiMap } from '@src/utils/emojiMap'

type VersionOption = { value: string; label: string }
interface ChangelogEntry {
  date: string
  changes: Array<{
    description: string
    breaking?: boolean
    author?: string
  }>
}

// Markdown rendering (same as Changelog.tsx)
// ─────────────────────────────────────────────
// Marked v17 configuration
// ─────────────────────────────────────────────
const renderer = new Renderer()
renderer.link = ({ href, title, text }) => {
  const titleAttr = title ? ` title="${title}"` : ''
  return `<a href="${href}" target="_blank" rel="noopener noreferrer"${titleAttr}>${text}</a>`
}
marked.setOptions({
  breaks: true, // Convert line breaks to <br>
  gfm: true, // GitHub Flavored Markdown
  async: false, // required for synchronous parse() marked 17
  renderer,
})
// Emoji replacement — uses imported emojiMap
const replaceEmojiCodes = (text: string): string =>
  text.replace(/:([a-zA-Z0-9_+-]+):/g, (match) => emojiMap[match] || match)
// Markdown → HTML (inline safe)
const markdownToHtml = (markdown: string): string => {
  let html = marked.parse(replaceEmojiCodes(markdown)) as string
  html = html.replace(/^<p>/, '').replace(/<\/p>\s*$/, '')
  return html.trim()
}
const renderDescription = (description: string) => (
  <span dangerouslySetInnerHTML={{ __html: markdownToHtml(description) }} />
)

const styles = {
  header: {
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: 'var(--ifm-color-emphasis-900)',
    margin: 0,
    lineHeight: 1.2,
  },
  downloadCountBox: {
    height: '100%',
  },
  downloadCountLabel: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--ifm-color-emphasis-700)',
  },
  downloadCountValue: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--ifm-color-emphasis-900)',
  },
  versionAndButtonContainer: {},
  versionSelector: {
    flex: 1,
  },
  versionLabel: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--ifm-color-emphasis-900)',
    marginBottom: '0.625rem',
  },
  spaceY: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  maintainersContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    height: '100%',
  },
  maintainersLabel: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--ifm-color-emphasis-700)',
  },
  maintainersList: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.75rem',
    alignItems: 'center',
  },
  maintainerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  maintainerAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover' as const,
  },
  maintainerLink: {
    fontSize: '0.875rem',
    color: 'var(--ifm-color-primary)',
    textDecoration: 'none',
    fontWeight: 500,
    transition: 'opacity 0.2s ease',
  },
}
interface BlueprintImportCardProps {
  category: string
  id: string
  library: string
  release: string
}
/**
 * Formats download count with K/M suffixes
 */
function formatDownloads(num: number | null): string {
  if (num === null) return '–'
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}
/**
 * Generates a GitHub avatar URL for a GitHub username
 */
function getGitHubAvatarUrl(username: string): string {
  return `https://github.com/${username}.png`
}
/**
 * Validate that a physical YAML exists for this version
 */
function hasBlueprintYaml(
  category: string,
  id: string,
  library: string,
  release: string,
  version: string,
): boolean {
  try {
    blueprintsContext(
      `./${category}/${id}/${library}/${release}/${version}/${id}.yaml`,
    )
    return true
  } catch {
    return false
  }
}
/**
 * Loads and extracts maintainers from blueprint YAML
 */
function loadBlueprintMaintainers(
  category: string,
  id: string,
  library: string,
  release: string,
  version: string,
): string[] {
  try {
    const content = blueprintsContext(
      `./${category}/${id}/${library}/${release}/${version}/${id}.yaml`,
    )
    const parsed = yaml.parse(content) as {
      variables?: { ahb_maintainers?: string[] }
    }
    if (
      parsed?.variables?.ahb_maintainers &&
      Array.isArray(parsed.variables.ahb_maintainers)
    ) {
      return parsed.variables.ahb_maintainers
    }
    return []
  } catch {
    return []
  }
}
/**
 * Loads and extracts versions from changelog.json (release-level),
 * filtered to versions that have a physical YAML.
 */
function loadReleaseVersions(
  category: string,
  id: string,
  library: string,
  release: string,
): { versions: string[]; latestVersion: string } | null {
  try {
    const parsed = changelogsContext(
      `./${category}/${id}/${library}/${release}/changelog.json`,
    ) as unknown as ChangelogEntry[]
    if (!parsed || parsed.length === 0) {
      return null
    }
    const versions = parsed
      .map((entry) => entry.date)
      .filter((v) => hasBlueprintYaml(category, id, library, release, v))
      .sort((a, b) => b.localeCompare(a))
    if (versions.length === 0) return null
    return {
      versions,
      latestVersion: versions[0],
    }
  } catch {
    return null
  }
}
function loadReleaseChangelogEntries(
  category: string,
  id: string,
  library: string,
  release: string,
): ChangelogEntry[] {
  try {
    const parsed = changelogsContext(
      `./${category}/${id}/${library}/${release}/changelog.json`,
    ) as unknown as ChangelogEntry[]
    if (!parsed || parsed.length === 0) return []
    return parsed
      .filter((entry) =>
        hasBlueprintYaml(category, id, library, release, entry.date),
      )
      .sort((a, b) => b.date.localeCompare(a.date))
  } catch {
    return []
  }
}
function summarizeChangesToOneLine(
  changes: Array<{ description: string }>,
  maxLen = 160,
): string {
  const joined = (changes ?? [])
    .map((c) => (c?.description ?? '').trim())
    .filter(Boolean)
    .join('; ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!joined) return '—'
  return joined.length > maxLen ? `${joined.slice(0, maxLen)}…` : joined
}
function extractAuthorFromChanges(
  changes: Array<{ author?: string; description: string }>,
): string {
  const explicit = changes?.find((c) => c.author)?.author
  if (explicit && explicit.trim()) return explicit.trim()
  const firstDesc = changes?.find((c) => c?.description)?.description ?? ''
  const paren = firstDesc.match(/\(@([^)]+)\)/)?.[1]
  if (paren && paren.trim()) return `@${paren.trim().replace(/^@/, '')}`
  const at = firstDesc.match(/@([A-Za-z0-9_-]+)/)?.[0]
  return at ?? '—'
}
// ────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────
function BlueprintImportCard({
  category,
  id,
  library,
  release,
}: BlueprintImportCardProps) {
  const [downloadCount, setDownloadCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [versions, setVersions] = useState<string[]>([])
  const [selectedVersion, setSelectedVersion] = useState<string>('latest')
  const [isLoadingVersions, setIsLoadingVersions] = useState<boolean>(true)
  const [maintainers, setMaintainers] = useState<string[]>([])
  const [isLoadingMaintainers, setIsLoadingMaintainers] =
    useState<boolean>(true)
  const [changelogEntries, setChangelogEntries] = useState<ChangelogEntry[]>([])
  useEffect(() => {
    let isMounted = true
    const urlVersion =
      typeof window !== 'undefined'
        ? new URL(window.location.href).searchParams.get('version')
        : null
    const result = loadReleaseVersions(category, id, library, release)
    const entries = loadReleaseChangelogEntries(category, id, library, release)
    if (!isMounted) return
    if (result) {
      const effectiveVersion =
        urlVersion && result.versions.includes(urlVersion)
          ? urlVersion
          : result.latestVersion
      setVersions(result.versions)
      setSelectedVersion(effectiveVersion)
      setChangelogEntries(entries)
    } else {
      setVersions([])
      setSelectedVersion('latest')
      setChangelogEntries([])
    }
    setIsLoadingVersions(false)
    return () => {
      isMounted = false
    }
  }, [category, id, library, release])
  useEffect(() => {
    let isMounted = true
    if (!selectedVersion || selectedVersion === 'latest') {
      if (!isMounted) return
      setMaintainers([])
      setIsLoadingMaintainers(false)
      return () => {
        isMounted = false
      }
    }
    const maintainersList = loadBlueprintMaintainers(
      category,
      id,
      library,
      release,
      selectedVersion,
    )
    if (!isMounted) return
    setMaintainers(maintainersList)
    setIsLoadingMaintainers(false)
    return () => {
      isMounted = false
    }
  }, [category, id, library, release, selectedVersion])
  useEffect(() => {
    let isCancelled = false
    setIsLoading(true)
    const versionParam =
      selectedVersion && selectedVersion !== 'latest' ? selectedVersion : null
    getBlueprintDownloads(category, id, library, release, versionParam)
      .then((count) => {
        if (!isCancelled) setDownloadCount(count)
      })
      .catch(() => {
        if (!isCancelled) setDownloadCount(null)
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false)
      })
    return () => {
      isCancelled = true
    }
  }, [category, id, library, release, selectedVersion])
  const versionParam = versions.length > 0 ? selectedVersion : 'latest'
  const blueprintUrl = `/awesome-ha-blueprints/blueprints/${category}/${id}?library=${library}&release=${release}&version=${versionParam}`
  const versionOptions: VersionOption[] =
    versions.length > 0
      ? versions.map((version) => ({
          value: version,
          label: version,
        }))
      : [{ value: 'latest', label: 'latest' }]
  const selectStyles: StylesConfig<VersionOption, false> = {
    control: (provided, state) => ({
      ...provided,
      padding: '0.5rem 0.75rem',
      fontSize: '0.9375rem',
      border: `1px solid ${
        state.isFocused
          ? 'var(--ifm-color-primary)'
          : 'var(--ifm-color-emphasis-300)'
      }`,
      borderRadius: 'var(--ifm-global-radius)',
      backgroundColor: 'var(--ifm-background-color)',
      color: 'var(--ifm-color-emphasis-900)',
      cursor: 'pointer',
      transition: 'border-color 0.2s ease',
      boxShadow: state.isFocused
        ? '0 0 0 1px var(--ifm-color-primary)'
        : 'none',
    }),
    valueContainer: (provided) => ({
      ...provided,
      backgroundColor: 'var(--ifm-background-color)',
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      backgroundColor: 'var(--ifm-background-color)',
    }),
    dropdownIndicator: (provided, state) => ({
      ...provided,
      color: state.isFocused
        ? 'var(--ifm-color-emphasis-900)'
        : 'var(--ifm-color-emphasis-600)',
      ':hover': {
        color: 'var(--ifm-color-emphasis-900)',
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? 'var(--ifm-color-primary)'
        : state.isFocused
          ? 'var(--ifm-color-emphasis-100)'
          : 'var(--ifm-background-surface-color)',
      color: state.isSelected
        ? 'var(--ifm-color-primary-contrast-background)'
        : 'var(--ifm-color-emphasis-900)',
      cursor: 'pointer',
      padding: '0.625rem 0.875rem',
      fontSize: '0.9375rem',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'var(--ifm-color-emphasis-900)',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'var(--ifm-background-color)',
      border: '1px solid var(--ifm-color-emphasis-300)',
      borderRadius: 'var(--ifm-global-radius)',
      boxShadow: 'var(--ifm-global-shadow-md)',
      zIndex: 9999,
    }),
    menuList: (provided) => ({
      ...provided,
      backgroundColor: 'var(--ifm-background-color)',
      padding: 0,
    }),
    input: (provided) => ({
      ...provided,
      color: 'var(--ifm-color-emphasis-900)',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: 'var(--ifm-color-emphasis-600)',
    }),
  }
  return (
    <>
      <style>{`
        .version-and-button-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        @media (min-width: 996px) {
          .version-and-button-container {
            flex-direction: row;
            align-items: flex-end;
            gap: 1rem;
          }
          .version-selector-wrapper {
            flex: 1;
          }
          .download-button-wrapper {
            flex: 1;
          }
        }
      `}</style>
      <div className='container'>
        <div className='row'>
          {/* Maintainers */}
          {isLoadingMaintainers ? (
            <div
              className='col col--6 margin-bottom--md'
              style={styles.maintainersContainer}
            >
              <span style={styles.maintainersLabel}>Maintainers</span>
              <p style={{ margin: 0, color: 'var(--ifm-color-emphasis-600)' }}>
                Loading maintainers…
              </p>
            </div>
          ) : maintainers.length > 0 ? (
            <div
              className='col col--6 margin-bottom--md'
              style={styles.maintainersContainer}
            >
              <span style={styles.maintainersLabel}>Maintainers</span>
              <div style={styles.maintainersList}>
                {maintainers.map((username) => (
                  <div key={username} style={styles.maintainerItem}>
                    <img
                      src={getGitHubAvatarUrl(username)}
                      alt={`${username} avatar`}
                      style={styles.maintainerAvatar}
                    />
                    <a
                      href={`https://github.com/${username}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      style={styles.maintainerLink}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.8'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1'
                      }}
                    >
                      {username}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className='col col--6 margin-bottom--md'></div>
          )}
          {/* Total Downloads */}
          <div
            className='col col--6 margin-bottom--md'
            style={styles.downloadCountBox}
          >
            <span style={styles.downloadCountLabel}>Total Downloads</span>
            <div
              className='blueprint-download-value'
              style={styles.downloadCountValue}
            >
              {isLoading ? '…' : formatDownloads(downloadCount)}
            </div>
          </div>
        </div>
        {/* Version Selector and Import Button */}
        {isLoadingVersions ? (
          <div className='row'>
            <div
              className='col col--6 margin-bottom--md'
              style={styles.versionSelector}
            >
              <label htmlFor='version-select' style={styles.maintainersLabel}>
                Versions
              </label>
              <p style={{ margin: 0, color: 'var(--ifm-color-emphasis-600)' }}>
                Loading versions…
              </p>
            </div>
          </div>
        ) : (
          <div
            className='row version-and-button-container'
            style={styles.versionAndButtonContainer}
          >
            <div
              className='col col--6 margin-bottom--md'
              style={styles.versionSelector}
            >
              <label htmlFor='version-select' style={styles.maintainersLabel}>
                Download
              </label>
              <Select
                inputId='version-select'
                value={
                  versionOptions.find(
                    (option) => option.value === versionParam,
                  ) || (versionOptions.length > 0 ? versionOptions[0] : null)
                }
                onChange={(option) => {
                  if (!option || typeof window === 'undefined') return
                  const newVersion = option.value
                  setSelectedVersion(newVersion)
                  try {
                    const url = new URL(window.location.href)
                    url.searchParams.set('version', newVersion)
                    url.searchParams.set('library', library)
                    url.searchParams.set('release', release)
                    window.location.href = url.toString()
                  } catch {
                    const searchParams = new URLSearchParams(
                      typeof window !== 'undefined'
                        ? window.location.search
                        : '',
                    )
                    searchParams.set('version', newVersion)
                    searchParams.set('library', library)
                    searchParams.set('release', release)
                    if (typeof window !== 'undefined') {
                      window.location.search = searchParams.toString()
                    }
                  }
                }}
                options={versionOptions}
                styles={selectStyles}
                isSearchable={false}
                menuPortalTarget={
                  typeof document !== 'undefined' ? document.body : undefined
                }
                menuPosition='fixed'
                formatOptionLabel={(option) => {
                  const isLatest = option.value === versions[0]
                  return (
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'center',
                      }}
                    >
                      <span>{option.label}</span>
                      {isLatest && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '999px',
                            background: 'var(--ifm-color-emphasis-200)',
                            color: 'var(--ifm-color-emphasis-700)',
                            fontWeight: 500,
                          }}
                        >
                          latest
                        </span>
                      )}
                    </div>
                  )
                }}
              />
            </div>
            {/* Import Button */}
            <div className='col col--6 download-button-wrapper margin-bottom--md'>
              <Link
                to={blueprintUrl}
                onClick={() => {
                  // Recording is handled by the /blueprints/... download route (library-download-blueprint.tsx).
                  window.location.href = blueprintUrl
                }}
              >
                <img
                  src='https://my.home-assistant.io/badges/blueprint_import.svg'
                  alt='Import to Home Assistant'
                />
              </Link>
            </div>
          </div>
        )}
        {/* Available Versions */}
        {versions.length > 0 && (
          <div className='row margin-top--md margin-bottom--md'>
            <div className='col col--12'>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.875rem',
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '0.5rem',
                        borderBottom: '1px solid var(--ifm-color-emphasis-300)',
                        color: 'var(--ifm-color-emphasis-700)',
                        fontWeight: 600,
                      }}
                    >
                      Version
                    </th>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '0.5rem',
                        borderBottom: '1px solid var(--ifm-color-emphasis-300)',
                        color: 'var(--ifm-color-emphasis-700)',
                        fontWeight: 600,
                      }}
                    >
                      Author
                    </th>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '0.5rem',
                        borderBottom: '1px solid var(--ifm-color-emphasis-300)',
                        color: 'var(--ifm-color-emphasis-700)',
                        fontWeight: 600,
                      }}
                    >
                      Status
                    </th>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '0.5rem',
                        borderBottom: '1px solid var(--ifm-color-emphasis-300)',
                        color: 'var(--ifm-color-emphasis-700)',
                        fontWeight: 600,
                      }}
                    >
                      Summary
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {versions.map((version, index) => {
                    const isLatest = index === 0
                    const entry = changelogEntries.find(
                      (e) => e.date === version,
                    )
                    const author = entry
                      ? extractAuthorFromChanges(entry.changes)
                      : '—'
                    const summary = entry
                      ? summarizeChangesToOneLine(entry.changes)
                      : '—'
                    const isBreaking = entry
                      ? entry.changes.some((c) => c.breaking)
                      : false
                    return (
                      <tr key={version}>
                        {/* Version */}
                        <td
                          style={{
                            padding: '0.5rem',
                            borderBottom:
                              '1px solid var(--ifm-color-emphasis-200)',
                            color: 'var(--ifm-color-emphasis-900)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {version}
                        </td>
                        {/* Author */}
                        <td
                          style={{
                            padding: '0.5rem',
                            borderBottom:
                              '1px solid var(--ifm-color-emphasis-200)',
                            minWidth: '80px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {author !== '—' ? (
                            (() => {
                              const username = author.replace('@', '')
                              return (
                                <a
                                  href={`https://github.com/${username}`}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.45rem',
                                    color: 'var(--ifm-color-primary)',
                                    textDecoration: 'none',
                                    fontSize: '0.85rem',
                                    fontWeight: 500,
                                  }}
                                >
                                  <img
                                    src={`https://github.com/${username}.png`}
                                    alt={`${username} avatar`}
                                    style={{
                                      width: '22px',
                                      height: '22px',
                                      borderRadius: '50%',
                                      objectFit: 'cover',
                                    }}
                                  />
                                  <span>{username}</span>
                                </a>
                              )
                            })()
                          ) : (
                            <span
                              style={{ color: 'var(--ifm-color-emphasis-500)' }}
                            >
                              —
                            </span>
                          )}
                        </td>
                        {/* Status */}
                        <td
                          style={{
                            padding: '0.5rem',
                            borderBottom:
                              '1px solid var(--ifm-color-emphasis-200)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {isLatest && (
                            <span
                              style={{
                                fontSize: '0.7rem',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '999px',
                                background: 'var(--ifm-color-emphasis-200)',
                                color: 'var(--ifm-color-emphasis-700)',
                                fontWeight: 500,
                                marginRight: '0.35rem',
                                verticalAlign: 'middle',
                              }}
                            >
                              latest
                            </span>
                          )}
                          {isBreaking && (
                            <span
                              title='Breaking change'
                              style={{ verticalAlign: 'middle' }}
                            >
                              🚨
                            </span>
                          )}
                        </td>
                        {/* Summary */}
                        <td
                          style={{
                            padding: '0.5rem',
                            borderBottom:
                              '1px solid var(--ifm-color-emphasis-200)',
                            color: 'var(--ifm-color-emphasis-900)',
                          }}
                        >
                          {renderDescription(summary)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
export default BlueprintImportCard
