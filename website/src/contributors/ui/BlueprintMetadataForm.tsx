/**
 * UI: BlueprintMetadataForm (Automations)
 * ──────────────────────────────────────
 *
 * Phase 3 target:
 *  - Full Blueprint Metadata UI fields, wired to locked rules
 *  - No IO / no file writes / no submission execution
 *
 * Submit will be handled by parent (payload preview only).
 */

import React, { useMemo, useState } from 'react'
import type {
  BlueprintMetadataDraft,
  ExternalReference,
} from '../state/deriveBlueprintMetadata'
import { isHttpsUrl } from '../state/deriveBlueprintMetadata'

type BlueprintStatus = 'active' | 'deprecated'

interface Props {
  draft: BlueprintMetadataDraft
  setDraft: (next: BlueprintMetadataDraft) => void

  /**
   * Permissions:
   * - If logged-in user is yarafie -> all fields editable
   */
  isOwnerOverride: boolean
}

function splitCsv(v: string): string[] {
  return v
    .split(',')
    .map((x) => x.trim())
    .filter((x) => x.length > 0)
}

function joinCsv(arr: string[]): string {
  return arr.join(', ')
}

export default function BlueprintMetadataForm({
  draft,
  setDraft,
  isOwnerOverride,
}: Props) {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [manualFile, setManualFile] = useState<File | null>(null)

  const canEditAll = isOwnerOverride

  // Locked: PNG only, renamed internally to <blueprint_id>.png
  const plannedImageName = `${draft.blueprint_id}.png`

  // Locked: PDF only, renamed internally to <blueprint_id>.pdf (optional)
  const plannedManualName = `${draft.blueprint_id}.pdf`

  const tagsCsv = useMemo(() => joinCsv(draft.tags), [draft.tags])

  const librariansDisplay = useMemo(() => {
    return draft.librarians.map((l) => l.id).join(', ')
  }, [draft.librarians])

  const externalRefsValid = useMemo(() => {
    return draft.external_references.every(
      (r) => r.label.trim().length > 0 && isHttpsUrl(r.url),
    )
  }, [draft.external_references])

  const handleTagsChange = (v: string) => {
    setDraft({ ...draft, tags: splitCsv(v) })
  }

  const handleStatusChange = (v: string) => {
    const s =
      v === 'deprecated'
        ? ('deprecated' as BlueprintStatus)
        : ('active' as BlueprintStatus)
    setDraft({ ...draft, status: s })
  }

  const addExternalRef = () => {
    const next: ExternalReference[] = [
      ...draft.external_references,
      { label: '', url: '' },
    ]
    setDraft({ ...draft, external_references: next })
  }

  const updateExternalRef = (
    idx: number,
    patch: Partial<ExternalReference>,
  ) => {
    const next = draft.external_references.map((r, i) =>
      i === idx ? { ...r, ...patch } : r,
    )
    setDraft({ ...draft, external_references: next })
  }

  const removeExternalRef = (idx: number) => {
    const next = draft.external_references.filter((_, i) => i !== idx)
    setDraft({ ...draft, external_references: next })
  }

  const onPickImage = (f: File | null) => {
    if (!f) {
      setImageFile(null)
      setDraft({ ...draft, images: [] })
      return
    }
    const ok = f.name.toLowerCase().endsWith('.png')
    if (!ok) {
      setImageFile(null)
      setDraft({ ...draft, images: [] })
      return
    }
    setImageFile(f)
    setDraft({ ...draft, images: [plannedImageName] })
  }

  const onPickManual = (f: File | null) => {
    if (!f) {
      setManualFile(null)
      setDraft({ ...draft, manual_files: [] })
      return
    }
    const ok = f.name.toLowerCase().endsWith('.pdf')
    if (!ok) {
      setManualFile(null)
      setDraft({ ...draft, manual_files: [] })
      return
    }
    setManualFile(f)
    setDraft({ ...draft, manual_files: [plannedManualName] })
  }

  return (
    <section className='container padding-vert--lg'>
      <h2>Complete Metadata</h2>

      <div
        style={{
          marginTop: 16,
          padding: 16,
          border: '1px solid var(--ifm-color-emphasis-300)',
          borderRadius: 8,
          maxWidth: 900,
        }}
      >
        <h3 style={{ marginTop: 0 }}>Blueprint Metadata (automation)</h3>

        {/* Required fields */}
        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>
              blueprint_id (derived; must be unique across
              controllers/hooks/automations)
            </div>
            <input
              value={draft.blueprint_id}
              disabled={!canEditAll}
              onChange={(e) =>
                setDraft({ ...draft, blueprint_id: e.target.value })
              }
              style={{ width: '100%', padding: 10 }}
            />
            {!canEditAll && (
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
                Derived from YAML name (lowercase, spaces → _). Only{' '}
                <strong>yarafie</strong> can override.
              </div>
            )}
          </div>

          <div>
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>
              name (from YAML)
            </div>
            <input
              value={draft.name}
              disabled={!canEditAll}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              style={{ width: '100%', padding: 10 }}
            />
            {!canEditAll && (
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
                From YAML. Only <strong>yarafie</strong> can override.
              </div>
            )}
          </div>

          <div>
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>
              description (from YAML: first complete sentence not starting with
              #)
            </div>
            <textarea
              value={draft.description}
              disabled={!canEditAll}
              onChange={(e) =>
                setDraft({ ...draft, description: e.target.value })
              }
              rows={3}
              style={{ width: '100%', padding: 10 }}
            />
            {!canEditAll && (
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
                Derived from YAML. Only <strong>yarafie</strong> can override.
              </div>
            )}
          </div>

          <div>
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>
              category (locked)
            </div>
            <input
              value={draft.category}
              disabled
              style={{ width: '100%', padding: 10 }}
            />
          </div>

          <div>
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>
              status (schema enum: active | deprecated)
            </div>
            <select
              value={draft.status}
              disabled={!canEditAll}
              onChange={(e) => handleStatusChange(e.target.value)}
              style={{ width: '100%', padding: 10 }}
            >
              <option value='active'>active</option>
              <option value='deprecated'>deprecated</option>
            </select>
            {!canEditAll && (
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
                Default <strong>active</strong>. Only <strong>yarafie</strong>{' '}
                can change.
              </div>
            )}
          </div>

          <div>
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>
              librarians (locked order; unique): EPMatt, yarafie, logged-in user
            </div>
            <input
              value={librariansDisplay}
              disabled
              style={{ width: '100%', padding: 10 }}
            />
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
              Read-only (always derived). Stored as array of objects in payload.
            </div>
          </div>

          {/* Optional fields */}
          <div>
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>
              tags (comma separated; free form)
            </div>
            <input
              value={tagsCsv}
              onChange={(e) => handleTagsChange(e.target.value)}
              style={{ width: '100%', padding: 10 }}
            />
          </div>

          <div>
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>
              images (PNG only; renamed internally to {plannedImageName})
            </div>
            <input
              type='file'
              accept='image/png'
              onChange={(e) => onPickImage(e.target.files?.[0] ?? null)}
            />
            <div style={{ marginTop: 8, fontSize: 13 }}>
              <strong>Selected:</strong> {imageFile ? imageFile.name : '—'}
              <br />
              <strong>Will be stored as:</strong>{' '}
              {draft.images.length ? draft.images[0] : '—'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>
              manual_files (optional PDF only; renamed internally to{' '}
              {plannedManualName})
            </div>
            <input
              type='file'
              accept='application/pdf'
              onChange={(e) => onPickManual(e.target.files?.[0] ?? null)}
            />
            <div style={{ marginTop: 8, fontSize: 13 }}>
              <strong>Selected:</strong> {manualFile ? manualFile.name : '—'}
              <br />
              <strong>Will be stored as:</strong>{' '}
              {draft.manual_files.length ? draft.manual_files[0] : '—'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 10 }}>
              external_references (optional; valid https links)
            </div>

            {draft.external_references.length === 0 && (
              <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 10 }}>
                No external references added.
              </div>
            )}

            {draft.external_references.map((ref, idx) => {
              const ok = ref.label.trim().length > 0 && isHttpsUrl(ref.url)
              return (
                <div
                  key={idx}
                  style={{
                    border: '1px dashed var(--ifm-color-emphasis-300)',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: 'grid', gap: 10 }}>
                    <input
                      placeholder='Label (e.g. Docs, Source, PR #123)'
                      value={ref.label}
                      onChange={(e) =>
                        updateExternalRef(idx, { label: e.target.value })
                      }
                      style={{ width: '100%', padding: 10 }}
                    />
                    <input
                      placeholder='https://example.com'
                      value={ref.url}
                      onChange={(e) =>
                        updateExternalRef(idx, { url: e.target.value })
                      }
                      style={{ width: '100%', padding: 10 }}
                    />
                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                      Status:{' '}
                      {ok
                        ? 'valid ✅'
                        : 'invalid ❌ (label + https url required)'}
                    </div>
                    <button
                      className='button button--secondary'
                      onClick={() => removeExternalRef(idx)}
                      type='button'
                      style={{ width: 'fit-content' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            })}

            <button
              className='button button--primary'
              onClick={addExternalRef}
              type='button'
              style={{ width: 'fit-content' }}
            >
              Add External Reference
            </button>

            {!externalRefsValid && draft.external_references.length > 0 && (
              <div
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  color: 'var(--ifm-color-danger)',
                }}
              >
                Some external references are invalid. Each must have a label and
                an https URL.
              </div>
            )}
          </div>

          {/* Hidden: supported_integrations (not required for automations) */}
          <div style={{ fontSize: 12, opacity: 0.65 }}>
            supported_integrations: hidden (not required for automations)
          </div>
        </div>
      </div>
    </section>
  )
}
