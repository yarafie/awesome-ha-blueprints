/**
 * UpdateBlueprintSelector
 * ────────────────────────────────────────────────────────────────
 *
 * Purpose:
 *  - Step 2.1 UI for selecting an existing blueprint update target
 *  - Forces explicit drill-down to an exact filesystem location
 *
 * Canonical order (LOCKED):
 *  Category → Blueprint → Library → Release → Version
 *
 * Filesystem truth (LOCKED):
 *  <category>/<blueprint_id>/<library_id>/<release_id>/<version>/
 *
 * Design constraints:
 *  - No heuristics
 *  - No auto-selection
 *  - No defaults
 *  - YAML paths only (filename ignored)
 */

import React, { useMemo } from 'react'
import { blueprintsContext } from '@site/src/utils/libraryContexts'
import type { UpdateBlueprintTarget } from '../state/contributionTypes'

interface Props {
  value: UpdateBlueprintTarget | null
  onChange: (target: UpdateBlueprintTarget | null) => void
}

/**
 * Parse blueprint YAML paths ONLY.
 * Filename is ignored by design.
 */
function parseBlueprintTargets(): UpdateBlueprintTarget[] {
  return blueprintsContext
    .keys()
    .map((key) => {
      const parts = key.replace(/^\.\//, '').split('/')

      // <category>/<blueprint>/<library>/<release>/<version>/<file>.yaml
      if (parts.length < 6) return null

      return {
        category: parts[0] as UpdateBlueprintTarget['category'],
        blueprintId: parts[1],
        libraryId: parts[2],
        releaseId: parts[3],
        version: parts[4],
      }
    })
    .filter(Boolean) as UpdateBlueprintTarget[]
}

function Field({
  label,
  accent,
  disabled,
  children,
}: {
  label: string
  accent: string
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        paddingLeft: 10,
        borderLeft: `4px solid ${accent}`,
        opacity: disabled ? 0.55 : 1,
        minWidth: 160,
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: 0.4,
          opacity: 0.85,
        }}
      >
        {label}
      </span>
      {children}
    </div>
  )
}

const UpdateBlueprintSelector: React.FC<Props> = ({ value, onChange }) => {
  const entries = useMemo(parseBlueprintTargets, [])

  const categories = useMemo(
    () => Array.from(new Set(entries.map((e) => e.category))).sort(),
    [entries],
  )

  const blueprints = useMemo(() => {
    if (!value?.category) return []
    return Array.from(
      new Set(
        entries
          .filter((e) => e.category === value.category)
          .map((e) => e.blueprintId),
      ),
    ).sort()
  }, [entries, value?.category])

  const libraries = useMemo(() => {
    if (!value?.category || !value?.blueprintId) return []
    return Array.from(
      new Set(
        entries
          .filter(
            (e) =>
              e.category === value.category &&
              e.blueprintId === value.blueprintId,
          )
          .map((e) => e.libraryId),
      ),
    ).sort()
  }, [entries, value?.category, value?.blueprintId])

  const releases = useMemo(() => {
    if (!value?.category || !value?.blueprintId || !value?.libraryId) return []
    return Array.from(
      new Set(
        entries
          .filter(
            (e) =>
              e.category === value.category &&
              e.blueprintId === value.blueprintId &&
              e.libraryId === value.libraryId,
          )
          .map((e) => e.releaseId),
      ),
    ).sort()
  }, [entries, value?.category, value?.blueprintId, value?.libraryId])

  const versions = useMemo(() => {
    if (
      !value?.category ||
      !value?.blueprintId ||
      !value?.libraryId ||
      !value?.releaseId
    )
      return []

    return Array.from(
      new Set(
        entries
          .filter(
            (e) =>
              e.category === value.category &&
              e.blueprintId === value.blueprintId &&
              e.libraryId === value.libraryId &&
              e.releaseId === value.releaseId,
          )
          .map((e) => e.version),
      ),
    ).sort()
  }, [
    entries,
    value?.category,
    value?.blueprintId,
    value?.libraryId,
    value?.releaseId,
  ])

  return (
    <section>
      <h3>Select blueprint to update</h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 16,
          alignItems: 'end',
        }}
      >
        <Field label='Category' accent='var(--ifm-color-primary)'>
          <select
            className='form-control'
            value={value?.category ?? ''}
            onChange={(e) =>
              onChange(
                e.target.value
                  ? {
                      category: e.target
                        .value as UpdateBlueprintTarget['category'],
                      blueprintId: '',
                      libraryId: '',
                      releaseId: '',
                      version: '',
                    }
                  : null,
              )
            }
          >
            <option value=''>Category…</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label='Blueprint'
          accent='var(--ifm-color-info)'
          disabled={!value?.category}
        >
          <select
            className='form-control'
            disabled={!value?.category}
            value={value?.blueprintId ?? ''}
            onChange={(e) =>
              onChange({
                category: value!.category,
                blueprintId: e.target.value,
                libraryId: '',
                releaseId: '',
                version: '',
              })
            }
          >
            <option value=''>Blueprint…</option>
            {blueprints.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label='Library'
          accent='var(--ifm-color-success)'
          disabled={!value?.blueprintId}
        >
          <select
            className='form-control'
            disabled={!value?.blueprintId}
            value={value?.libraryId ?? ''}
            onChange={(e) =>
              onChange({
                ...value!,
                libraryId: e.target.value,
                releaseId: '',
                version: '',
              })
            }
          >
            <option value=''>Library…</option>
            {libraries.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label='Release'
          accent='var(--ifm-color-warning)'
          disabled={!value?.libraryId}
        >
          <select
            className='form-control'
            disabled={!value?.libraryId}
            value={value?.releaseId ?? ''}
            onChange={(e) =>
              onChange({
                ...value!,
                releaseId: e.target.value,
                version: '',
              })
            }
          >
            <option value=''>Release…</option>
            {releases.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label='Version'
          accent='var(--ifm-color-danger)'
          disabled={!value?.releaseId}
        >
          <select
            className='form-control'
            disabled={!value?.releaseId}
            value={value?.version ?? ''}
            onChange={(e) =>
              onChange({
                ...value!,
                version: e.target.value,
              })
            }
          >
            <option value=''>Version…</option>
            {versions.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </section>
  )
}

export default UpdateBlueprintSelector
