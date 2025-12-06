/**
 * Component: DevicePage.tsx
 * ────────────────────────────────────────────────────────────────
 * Description:
 *   Renders a full device page, including:
 *   • Device Image + Main device metadata
 *   • Optional device manual PDF detection
 *   • Variants table
 *   • Breaking-change indicator + info indicator with tooltip
 *
 * Changelog:
 *   • Initial Version 2025-12-03 (@yarafie)
 *
 * ────────────────────────────────────────────────────────────────
 */

import React, { useState, useRef } from 'react'
import Link from '@docusaurus/Link'
import { marked, Renderer } from 'marked'
import {
  docsContext,
  changelogsContext,
  pdfManualsContext,
} from '../../utils/contexts'
import { emojiMap } from '../../utils/emojiMap'

interface DevicePageProps {
  id: string
}

/* Markdown + Emoji ------------------------------------------------------- */
const renderer = new Renderer()
renderer.link = ({ href, title, text }) => {
  const titleAttr = title ? ` title="${title}"` : ''
  return `<a href="${href}" target="_blank" rel="noopener noreferrer"${titleAttr}>${text}</a>`
}
marked.setOptions({ breaks: true, gfm: true, renderer })

const replaceEmoji = (text: string): string =>
  text.replace(/:([a-zA-Z0-9_+-]+):/g, (match) => emojiMap[match] || match)

const mdToHtml = (md: string): string => {
  const html = marked.parse(replaceEmoji(md)) as string
  return html.replace(/^<p>|<\/p>$/g, '').trim()
}

const renderMD = (text: string) => (
  <span dangerouslySetInnerHTML={{ __html: mdToHtml(text) }} />
)

/* Component --------------------------------------------------------------- */
const DevicePage: React.FC<DevicePageProps> = ({ id }) => {
  const keys = (docsContext as any).keys()
  const changelogKeys = (changelogsContext as any).keys()
  const pdfKeys = (pdfManualsContext as any).keys()
  const rootRef = useRef<HTMLDivElement | null>(null)

  /* Load main MDX -------------------------------------------------------- */
  const deviceMdxPath = `./controllers/${id}/${id}.mdx`
  if (!keys.includes(deviceMdxPath)) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Device Not Found</h1>
        <p>
          Missing main MDX file: <b>{deviceMdxPath}</b>
        </p>
      </div>
    )
  }

  const { frontMatter } = docsContext(deviceMdxPath)
  const {
    title = id,
    description = '',
    manufacturer = '',
    model = '',
    model_name = '',
    tags = [],
  } = frontMatter || {}

  /* Device manual PDF detection ------------------------------------------ */
  const pdfPath = `./controllers/${id}/${id}.pdf`
  let deviceManualUrl: string | null = null
  if (pdfKeys.includes(pdfPath)) {
    try {
      const mod = pdfManualsContext(pdfPath)
      deviceManualUrl =
        typeof mod === 'string' ? mod : (mod && (mod.default as string)) || null
    } catch {
      deviceManualUrl = null
    }
  }

  /* Discover variants ---------------------------------------------------- */
  const variantFiles = keys.filter(
    (k: string) =>
      k.startsWith(`./controllers/${id}/`) &&
      k.endsWith(`/${id}.mdx`) &&
      k.split('/').length === 5,
  )

  const loadLatest = (variant: string) => {
    const p = `./controllers/${id}/${variant}/changelog.json`
    if (!changelogKeys.includes(p)) return null
    try {
      const entries = changelogsContext(p)
      const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date))
      const latest = sorted[0]
      if (!latest) return null
      return {
        date: latest.date,
        descriptions: latest.changes.map((c: any) => c.description),
        breaking: latest.changes.some((c: any) => c.breaking),
      }
    } catch {
      return null
    }
  }

  const variants = variantFiles
    .map((file: string) => {
      const variant = file.split('/')[3]
      const fm = docsContext(file).frontMatter || {}
      const latest = loadLatest(variant)
      return {
        variant,
        title: fm.title || variant,
        integrations: Array.isArray(fm.integrations) ? fm.integrations : [],
        latestVersion: latest?.date ?? '—',
        latestDescriptions: latest?.descriptions ?? [],
        latestBreaking: latest?.breaking ?? false,
        link: `/docs/blueprints/controllers/${id}/${variant}/${id}`,
      }
    })
    .sort((a, b) => a.variant.localeCompare(b.variant))

  /* Tooltip -------------------------------------------------------------- */
  const [tooltip, setTooltip] = useState({
    visible: false,
    title: '',
    lines: [] as string[],
    top: 0,
    left: 0,
  })

  /* Render --------------------------------------------------------------- */
  return (
    <div
      ref={rootRef}
      style={{
        padding: 32,
        maxWidth: 1100,
        margin: '0 auto',
        position: 'relative',
      }}
    >
      {/* Tooltip (A2 Dark Bubble) */}
      {tooltip.visible && (
        <div
          style={{
            position: 'absolute',
            top: tooltip.top,
            left: tooltip.left,
            transform: 'translate(-50%, -115%)',
            width: 'min(380px, 90vw)',
            background: 'rgba(20,20,20,0.95)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 12,
            padding: 16,
            boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
            zIndex: 999,
          }}
          onMouseLeave={() =>
            setTooltip({
              visible: false,
              title: '',
              lines: [],
              top: 0,
              left: 0,
            })
          }
        >
          <h4 style={{ marginTop: 0, marginBottom: 10 }}>{tooltip.title}</h4>
          {tooltip.lines.map((line, i) => (
            <p key={i} style={{ margin: '0 0 8px 0', lineHeight: 1.45 }}>
              • {renderMD(line)}
            </p>
          ))}
        </div>
      )}

      {/* Row 1 — Title */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: '2.4rem' }}>{title}</h1>
        <p style={{ fontSize: '1.15rem', maxWidth: 700, margin: '0 auto' }}>
          {description}
        </p>
      </div>

      {/* Row 2 + Row 3 container (900px centered) */}
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Row 2 — Image + Info */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 24,
            justifyContent: 'center',
            alignItems: 'flex-start',
            marginBottom: 40,
          }}
        >
          {/* Image */}
          <div style={{ flex: '1 1 260px', textAlign: 'center' }}>
            <img
              src={`/awesome-ha-blueprints/img/controllers/${id}.png`}
              style={{
                width: 240,
                maxWidth: '100%',
                borderRadius: 14,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            />
          </div>

          {/* Info box */}
          <div
            style={{
              flex: '1 1 300px',
              background: 'var(--ifm-background-surface)',
              padding: 20,
              borderRadius: 12,
              minWidth: 260,
            }}
          >
            <h2>Device Information</h2>
            <ul style={{ lineHeight: 1.8 }}>
              <li>
                <strong>Manufacturer:</strong> {manufacturer}
              </li>
              <li>
                <strong>Model:</strong> {model}
              </li>
              <li>
                <strong>Model Name:</strong> {model_name}
              </li>
              {deviceManualUrl && (
                <li>
                  <strong>Device Manual:</strong>{' '}
                  <a
                    href={deviceManualUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    Download PDF
                  </a>
                </li>
              )}
              {tags.length > 0 && (
                <li>
                  <strong>Tags:</strong> {tags.join(', ')}
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Row 3 — Centered Table */}
        <h2 style={{ textAlign: 'center' }}>Available Variants</h2>

        {/* table wrapper EXACTLY like download_metrics.tsx-style centering */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            marginTop: 16,
          }}
        >
          <div>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                margin: '0 auto',
              }}
            >
              <thead>
                <tr>
                  <th style={{ padding: 10, textAlign: 'left' }}>Variant</th>
                  <th style={{ padding: 10, textAlign: 'left' }}>
                    Integrations
                  </th>
                  <th style={{ padding: 10, textAlign: 'left' }}>
                    Latest Version
                  </th>
                  <th style={{ padding: 10, textAlign: 'left' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v) => (
                  <tr key={v.variant}>
                    <td style={{ padding: 10 }}>{v.variant}</td>
                    <td style={{ padding: 10 }}>{v.integrations.join(', ')}</td>

                    {/* Tooltip cell */}
                    <td
                      style={{
                        padding: 10,
                        cursor: v.latestVersion === '—' ? 'default' : 'pointer',
                        color: v.latestBreaking
                          ? 'var(--ifm-color-danger)'
                          : 'var(--ifm-color-primary)',
                        fontWeight: v.latestBreaking ? 'bold' : 'normal',
                        position: 'relative',
                      }}
                      onMouseEnter={(e) => {
                        if (v.latestVersion === '—') return
                        const root = rootRef.current
                        if (!root) return
                        const cell = e.currentTarget.getBoundingClientRect()
                        const rootRect = root.getBoundingClientRect()
                        setTooltip({
                          visible: true,
                          title: `${v.variant} — ${v.latestVersion}${
                            v.latestBreaking ? ' 🚨' : ''
                          }`,
                          lines: v.latestDescriptions,
                          top: cell.top - rootRect.top,
                          left: cell.left - rootRect.left + cell.width / 2,
                        })
                      }}
                      onMouseLeave={() =>
                        setTooltip({
                          visible: false,
                          title: '',
                          lines: [],
                          top: 0,
                          left: 0,
                        })
                      }
                    >
                      {v.latestVersion}
                      {/* Minimal "i" indicator */}
                      {v.latestVersion !== '—' && (
                        <span
                          style={{
                            marginLeft: 6,
                            display: 'inline-block',
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            background: 'var(--ifm-color-primary)',
                            color: '#fff',
                            fontSize: 10,
                            textAlign: 'center',
                            lineHeight: '14px',
                            fontWeight: 'bold',
                          }}
                        >
                          i
                        </span>
                      )}

                      {/* BREAKING icon */}
                      {v.latestBreaking && (
                        <span style={{ marginLeft: 6 }}>🚨</span>
                      )}
                    </td>

                    <td style={{ padding: 10 }}>
                      <Link to={v.link}>View →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DevicePage
