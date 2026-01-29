/**
 * UI: ResolvedUpdateTargetCard
 * ─────────────────────────────────────────────────────────────
 *
 * Purpose:
 *  - Human-readable confirmation of the selected update target
 *  - Replaces schema-style metadata cards with a BlueprintPage-like view
 *
 * IMPORTANT:
 *  - Read-only
 *  - No filesystem access
 *  - Receives fully resolved JSON via props
 *  - Rendered ONLY in blueprint:update flow
 *
 * NOTE (implementation detail):
 *  - We do NOT call a “libraryContexts() function” (it doesn’t exist).
 *  - We import the exported contexts from utils/libraryContexts.ts
 *    (jsonContext / pdfContext / blueprintsContext) exactly like BlueprintPage.tsx.
 *  - jsonContext is webpack-bundled JSON, so this is still read-only UI behavior.
 */

import React, { useMemo } from 'react'
import { jsonContext } from '@src/utils/libraryContexts'

interface UpdateTarget {
  category: string
  blueprintId: string
  libraryId: string
  releaseId: string
  version: string
}

interface Props {
  updateTarget: UpdateTarget
}

function safeJson(path: string): any | null {
  try {
    return jsonContext(path)
  } catch {
    return null
  }
}

function asArray<T = any>(v: any): T[] {
  return Array.isArray(v) ? (v as T[]) : []
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 10px',
        borderRadius: 999,
        background: 'var(--ifm-background-surface-color)',
        border: '1px solid var(--ifm-color-emphasis-200)',
        fontSize: 12,
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      {children}
    </span>
  )
}

export default function ResolvedUpdateTargetCard({ updateTarget }: Props) {
  const { category, blueprintId, libraryId, releaseId, version } = updateTarget

  /**
   * ──────────────────────────────────────────────────────────
   * Resolve JSONs (same methodology as UpdateTargetInfoCards.tsx)
   * ──────────────────────────────────────────────────────────
   */
  const { blueprintJson, libraryJson, releaseJson, versionJson } =
    useMemo(() => {
      const blueprintJson = safeJson(
        `./${category}/${blueprintId}/blueprint.json`,
      )
      const libraryJson = safeJson(
        `./${category}/${blueprintId}/${libraryId}/library.json`,
      )
      const releaseJson = safeJson(
        `./${category}/${blueprintId}/${libraryId}/${releaseId}/release.json`,
      )
      const versionJson = safeJson(
        `./${category}/${blueprintId}/${libraryId}/${releaseId}/${version}/version.json`,
      )

      return { blueprintJson, libraryJson, releaseJson, versionJson }
    }, [category, blueprintId, libraryId, releaseId, version])

  /**
   * ──────────────────────────────────────────────────────────
   * Normalize core display fields
   * ──────────────────────────────────────────────────────────
   */
  const blueprintName = blueprintJson?.name || releaseJson?.title || blueprintId

  const blueprintDescription =
    blueprintJson?.description || releaseJson?.description || ''

  const manufacturer = blueprintJson?.manufacturer || releaseJson?.manufacturer
  const model = blueprintJson?.model || releaseJson?.model

  const integrations = asArray<string>(
    libraryJson?.supported_integrations || releaseJson?.supported_integrations,
  )

  const hooks = asArray<string>(
    releaseJson?.supported_hooks || libraryJson?.supported_hooks,
  )

  const images = asArray<string>(blueprintJson?.images || releaseJson?.images)

  const externalRefs = asArray<{ label?: string; url?: string }>(
    blueprintJson?.external_references || releaseJson?.external_references,
  )

  const maintainers = asArray<any>(
    libraryJson?.maintainers || blueprintJson?.maintainers,
  )

  const librarians = asArray<any>(
    libraryJson?.librarians || blueprintJson?.librarians,
  )

  const versionDate =
    versionJson?.date ||
    versionJson?.released ||
    versionJson?.release_date ||
    ''

  const blueprintFile =
    versionJson?.blueprint_file || versionJson?.file || versionJson?.yaml || ''

  /**
   * ──────────────────────────────────────────────────────────
   * Image resolution (same public static convention)
   * ──────────────────────────────────────────────────────────
   * Your static assets are at: static/img/<category>/<file>
   * So public URL is: /awesome-ha-blueprints/img/<category>/<file>
   */
  const heroImage = images[0]
  const heroSrc = heroImage
    ? `/awesome-ha-blueprints/img/${category}/${heroImage}`
    : null

  const missingAny =
    !blueprintJson || !libraryJson || !releaseJson || !versionJson

  return (
    <section className='container padding-vert--lg'>
      <div className='card' style={{ maxWidth: 980, margin: '0 auto' }}>
        {/* ───────────────────────────────────────────── */}
        {/* Header */}
        {/* ───────────────────────────────────────────── */}
        <div className='card__header'>
          <h3 style={{ marginBottom: 6 }}>Resolved Update Target</h3>
          <p style={{ opacity: 0.75, marginBottom: 0 }}>
            {category} / {blueprintId} / {libraryId} / {releaseId} / {version}
          </p>
        </div>

        <div className='card__body'>
          {/* ───────────────────────────────────────────── */}
          {/* Defensive: if any JSON missing, show helpful context */}
          {/* ───────────────────────────────────────────── */}
          {missingAny && (
            <div
              style={{
                background: 'var(--ifm-background-surface-color)',
                border: '1px solid var(--ifm-color-emphasis-200)',
                borderRadius: 10,
                padding: 14,
                marginBottom: 18,
                opacity: 0.95,
              }}
            >
              <strong>Some metadata files could not be resolved.</strong>
              <div style={{ marginTop: 8, fontSize: 13, opacity: 0.8 }}>
                <div>blueprint.json: {blueprintJson ? 'ok' : 'missing'}</div>
                <div>library.json: {libraryJson ? 'ok' : 'missing'}</div>
                <div>release.json: {releaseJson ? 'ok' : 'missing'}</div>
                <div>version.json: {versionJson ? 'ok' : 'missing'}</div>
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────── */}
          {/* BlueprintPage-like “Overview” */}
          {/* ───────────────────────────────────────────── */}
          <div style={{ marginBottom: 18 }}>
            <h2 style={{ margin: '0 0 10px 0' }}>{blueprintName}</h2>

            {blueprintDescription && (
              <>
                <h4 style={{ margin: '12px 0 8px 0' }}>Overview</h4>
                <p style={{ opacity: 0.9, maxWidth: 860 }}>
                  {blueprintDescription}
                </p>
              </>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: heroSrc ? '340px 1fr' : '1fr',
                gap: 22,
                alignItems: 'start',
                marginTop: 14,
              }}
            >
              {heroSrc && (
                <div
                  style={{
                    borderRadius: 14,
                    overflow: 'hidden',
                    background: 'rgba(0,0,0,0.15)',
                    border: '1px solid var(--ifm-color-emphasis-200)',
                  }}
                >
                  <img
                    src={heroSrc}
                    alt={heroImage || blueprintId}
                    style={{
                      width: '100%',
                      display: 'block',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      // If static path is wrong, keep UI stable (no crash)
                      ;(e.currentTarget as HTMLImageElement).style.display =
                        'none'
                    }}
                  />
                </div>
              )}

              <div>
                <h4 style={{ marginTop: 0 }}>General Information</h4>

                <ul style={{ marginTop: 8 }}>
                  <li>
                    <strong>Category:</strong> {category}
                  </li>
                  <li>
                    <strong>Blueprint ID:</strong> {blueprintId}
                  </li>
                  {manufacturer && (
                    <li>
                      <strong>Manufacturer:</strong> {manufacturer}
                    </li>
                  )}
                  {model && (
                    <li>
                      <strong>Model:</strong> {model}
                    </li>
                  )}
                  <li>
                    <strong>Library:</strong> {libraryId}
                  </li>
                  <li>
                    <strong>Release:</strong> {releaseId}
                  </li>
                  <li>
                    <strong>Version:</strong> {version}
                  </li>
                  {versionDate && (
                    <li>
                      <strong>Date:</strong> {versionDate}
                    </li>
                  )}
                  {blueprintFile && (
                    <li>
                      <strong>Blueprint File:</strong> {blueprintFile}
                    </li>
                  )}
                </ul>

                {/* Integrations */}
                {integrations.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>
                      Supported Integrations
                    </div>
                    <div>
                      {integrations.map((x) => (
                        <Pill key={x}>{x}</Pill>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hooks */}
                {hooks.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>
                      Supported Hooks
                    </div>
                    <div>
                      {hooks.map((x) => (
                        <Pill key={x}>{x}</Pill>
                      ))}
                    </div>
                  </div>
                )}

                {/* Maintainers/Librarians */}
                {(maintainers.length > 0 || librarians.length > 0) && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>
                      Ownership
                    </div>

                    {maintainers.length > 0 && (
                      <div style={{ marginBottom: 6 }}>
                        <strong>Maintainers:</strong>{' '}
                        {maintainers
                          .map((m: any) => m?.name || m?.id || String(m))
                          .filter(Boolean)
                          .join(', ')}
                      </div>
                    )}

                    {librarians.length > 0 && (
                      <div>
                        <strong>Librarians:</strong>{' '}
                        {librarians
                          .map((m: any) => m?.name || m?.id || String(m))
                          .filter(Boolean)
                          .join(', ')}
                      </div>
                    )}
                  </div>
                )}

                {/* References */}
                {externalRefs.length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>
                      References
                    </div>
                    <ul style={{ marginTop: 0 }}>
                      {externalRefs.map((r, i) => {
                        const label = r?.label || 'Link'
                        const url = r?.url
                        if (!url) return null
                        return (
                          <li key={i}>
                            <a href={url} target='_blank' rel='noreferrer'>
                              {label}
                            </a>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ───────────────────────────────────────────── */}
          {/* Bottom “selection confirmation” (condensed) */}
          {/* ───────────────────────────────────────────── */}
          <hr />

          <div style={{ opacity: 0.9 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>
              Selected update target
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              <Pill>
                <strong>Blueprint:</strong> {blueprintId}
              </Pill>
              <Pill>
                <strong>Library:</strong> {libraryId}
              </Pill>
              <Pill>
                <strong>Release:</strong> {releaseId}
              </Pill>
              <Pill>
                <strong>Version:</strong> {version}
              </Pill>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
