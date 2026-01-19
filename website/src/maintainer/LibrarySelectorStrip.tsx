/**
 * LibrarySelectorStrip
 *
 * Selector strip for traversing the physical library tree:
 * Category → Blueprint → Library → Release → Version
 *
 * Data source:
 * - webpack require.context via libraryContexts.ts
 *
 * This component implements:
 * - canonical selection state
 * - strict enable / disable gating
 * - deterministic reset rules
 * - physical tree traversal via context keys
 *
 * Read-only. No editing or mutation is performed here.
 */

import React, { useMemo, useState } from 'react'
import { panelBaseStyle, solidPanelBorder } from './panelStyles'
import { jsonContext } from '../utils/libraryContexts'
import LibraryFileViewer from './LibraryFileViewer'

type CategoryId = 'controllers' | 'hooks' | 'automations'

type LibrarySelectionState = {
  category?: CategoryId
  blueprint?: string
  library?: string
  release?: string
  version?: string
}

export default function LibrarySelectorStrip(): JSX.Element {
  const [state, setState] = useState<LibrarySelectionState>({})

  // ─────────────────────────────────────────────────────────────
  // Enable / disable rules (LOCKED)
  // ─────────────────────────────────────────────────────────────
  const blueprintEnabled = !!state.category
  const libraryEnabled = !!state.category && !!state.blueprint
  const releaseEnabled =
    !!state.category && !!state.blueprint && !!state.library
  const versionEnabled =
    !!state.category && !!state.blueprint && !!state.library && !!state.release

  const isFullySelected =
    !!state.category &&
    !!state.blueprint &&
    !!state.library &&
    !!state.release &&
    !!state.version

  // ─────────────────────────────────────────────────────────────
  // Category options (static)
  // ─────────────────────────────────────────────────────────────
  const categories: CategoryId[] = ['controllers', 'hooks', 'automations']

  // ─────────────────────────────────────────────────────────────
  // Blueprint options
  // ./<category>/<blueprint_id>/blueprint.json
  // ─────────────────────────────────────────────────────────────
  const blueprints = useMemo(() => {
    if (!state.category) return []

    return jsonContext
      .keys()
      .filter(
        (path) =>
          path.startsWith(`./${state.category}/`) &&
          path.endsWith('/blueprint.json'),
      )
      .map((path) => path.split('/')[2])
      .sort()
  }, [state.category])

  // ─────────────────────────────────────────────────────────────
  // Library options
  // ./<category>/<blueprint_id>/<library_id>/library.json
  // ─────────────────────────────────────────────────────────────
  const libraries = useMemo(() => {
    if (!state.category || !state.blueprint) return []

    return jsonContext
      .keys()
      .filter(
        (path) =>
          path.startsWith(`./${state.category}/${state.blueprint}/`) &&
          path.endsWith('/library.json'),
      )
      .map((path) => path.split('/')[3])
      .sort()
  }, [state.category, state.blueprint])

  // ─────────────────────────────────────────────────────────────
  // Release options
  // ./<category>/<blueprint_id>/<library_id>/<release_id>/release.json
  // ─────────────────────────────────────────────────────────────
  const releases = useMemo(() => {
    if (!state.category || !state.blueprint || !state.library) return []

    return jsonContext
      .keys()
      .filter(
        (path) =>
          path.startsWith(
            `./${state.category}/${state.blueprint}/${state.library}/`,
          ) && path.endsWith('/release.json'),
      )
      .map((path) => path.split('/')[4])
      .sort()
  }, [state.category, state.blueprint, state.library])

  // ─────────────────────────────────────────────────────────────
  // Version options (physical YYYY.MM.DD)
  // ./<category>/<blueprint_id>/<library_id>/<release_id>/<version>/version.json
  // ─────────────────────────────────────────────────────────────
  const versions = useMemo(() => {
    if (!state.category || !state.blueprint || !state.library || !state.release)
      return []

    return jsonContext
      .keys()
      .filter(
        (path) =>
          path.startsWith(
            `./${state.category}/${state.blueprint}/${state.library}/${state.release}/`,
          ) && path.endsWith('/version.json'),
      )
      .map((path) => path.split('/')[5])
      .filter((v) => /^\d{4}\.\d{2}\.\d{2}$/.test(v))
      .sort()
  }, [state.category, state.blueprint, state.library, state.release])

  // ─────────────────────────────────────────────────────────────
  // Reset rules (LOCKED)
  // ─────────────────────────────────────────────────────────────
  const onCategoryChange = (value: string) => {
    const category = (value || undefined) as CategoryId | undefined
    setState({
      category,
      blueprint: undefined,
      library: undefined,
      release: undefined,
      version: undefined,
    })
  }

  const onBlueprintChange = (value: string) => {
    setState((prev) => ({
      ...prev,
      blueprint: value || undefined,
      library: undefined,
      release: undefined,
      version: undefined,
    }))
  }

  const onLibraryChange = (value: string) => {
    setState((prev) => ({
      ...prev,
      library: value || undefined,
      release: undefined,
      version: undefined,
    }))
  }

  const onReleaseChange = (value: string) => {
    setState((prev) => ({
      ...prev,
      release: value || undefined,
      version: undefined,
    }))
  }

  const onVersionChange = (value: string) => {
    setState((prev) => ({
      ...prev,
      version: value || undefined,
    }))
  }

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────
  return (
    <section
      style={{
        ...panelBaseStyle,
        ...solidPanelBorder,
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Library Explorer</h3>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <Selector
          label='Category'
          value={state.category ?? ''}
          disabled={false}
          options={categories}
          onChange={onCategoryChange}
        />

        <Selector
          label='Blueprint'
          value={state.blueprint ?? ''}
          disabled={!blueprintEnabled}
          options={blueprints}
          onChange={onBlueprintChange}
          placeholder={
            blueprintEnabled ? 'Select blueprint' : 'Select category first'
          }
        />

        <Selector
          label='Library'
          value={state.library ?? ''}
          disabled={!libraryEnabled}
          options={libraries}
          onChange={onLibraryChange}
          placeholder={
            libraryEnabled ? 'Select library' : 'Select blueprint first'
          }
        />

        <Selector
          label='Release'
          value={state.release ?? ''}
          disabled={!releaseEnabled}
          options={releases}
          onChange={onReleaseChange}
          placeholder={
            releaseEnabled ? 'Select release' : 'Select library first'
          }
        />

        <Selector
          label='Version'
          value={state.version ?? ''}
          disabled={!versionEnabled}
          options={versions}
          onChange={onVersionChange}
          placeholder={
            versionEnabled ? 'Select version' : 'Select release first'
          }
        />
      </div>

      {/* Viewer gate */}
      {!isFullySelected && (
        <div style={{ marginTop: '1rem', opacity: 0.7 }}>
          Select Category → Blueprint → Library → Release → Version to view
          files.
        </div>
      )}

      {isFullySelected && (
        <LibraryFileViewer
          category={state.category}
          blueprint={state.blueprint}
          library={state.library}
          release={state.release}
          version={state.version}
        />
      )}
    </section>
  )
}

// ─────────────────────────────────────────────────────────────
// Generic selector control
// ─────────────────────────────────────────────────────────────
function Selector(props: {
  label: string
  value: string
  disabled: boolean
  options: string[]
  onChange: (value: string) => void
  placeholder?: string
}): JSX.Element {
  const { label, value, disabled, options, onChange, placeholder } = props

  return (
    <label
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
      }}
    >
      <span style={{ fontSize: '0.9rem', opacity: 0.85 }}>{label}</span>

      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        style={{
          minWidth: '220px',
          padding: '0.5rem 0.6rem',
          borderRadius: '10px',
          border: '1px solid var(--ifm-color-emphasis-300)',
          background: 'var(--ifm-background-surface-color)',
          color: 'var(--ifm-font-color-base)',
        }}
      >
        <option value=''>
          {placeholder ?? `Select ${label.toLowerCase()}`}
        </option>

        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  )
}
