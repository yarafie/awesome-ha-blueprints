/**
 * UI: UpdateTargetInfoCards
 * ─────────────────────────────────────────────
 *
 * Purpose:
 *  - Read-only display of resolved update target context
 *  - Source of truth: filesystem JSON only
 *
 * Ordering rule (LOCKED):
 *  - Keys are rendered in the exact order defined in the
 *    corresponding *.schema.json file
 *
 * Shown AFTER version selection
 * Shown BEFORE YAML upload
 *
 * No edits. No uploads. No side effects.
 */
import React from 'react'
import { jsonContext } from '../../utils/libraryContexts'
import type { UpdateTarget } from '../services/deriveBlueprintMetadata'

import blueprintSchema from '@schemas/blueprint.schema.json'
import librarySchema from '@schemas/library.schema.json'
import releaseSchema from '@schemas/release.schema.json'
import versionSchema from '@schemas/version.schema.json'

interface Props {
  updateTarget: UpdateTarget
}

function safeLoad(path: string): any | null {
  try {
    return jsonContext(path)
  } catch {
    return null
  }
}

function getSchemaOrderedKeys(schema: any): string[] {
  if (!schema?.properties) return []
  return Object.keys(schema.properties)
}

function renderValue(
  key: string,
  value: any,
  ctx: { category: string; blueprintId: string },
) {
  if (value == null) return null

  // Arrays
  if (Array.isArray(value)) {
    if (key === 'external_references') {
      return (
        <ul>
          {value.map((r, i) => (
            <li key={i}>
              <strong>{r.label}</strong> —{' '}
              <a href={r.url} target='_blank' rel='noreferrer'>
                {r.url}
              </a>
            </li>
          ))}
        </ul>
      )
    }

    if (key === 'images') {
      return (
        <ul>
          {value.map((img: string, i: number) => {
            const src = `/awesome-ha-blueprints/img/${ctx.category}/${img}`
            return (
              <li key={i}>
                <img
                  src={src}
                  alt={img}
                  style={{ maxWidth: 120, display: 'block' }}
                />
                <span>{img}</span>
              </li>
            )
          })}
        </ul>
      )
    }

    if (key === 'manual_files') {
      return (
        <ul>
          {value.map((f: string, i: number) => (
            <li key={i}>📄 {f}</li>
          ))}
        </ul>
      )
    }

    if (key === 'librarians' || key === 'maintainers') {
      return (
        <ul>
          {value.map((m: any, i: number) => (
            <li key={i}>
              {m.name} ({m.id})
            </li>
          ))}
        </ul>
      )
    }

    return <span>{value.join(', ')}</span>
  }

  if (typeof value === 'object') {
    return <pre style={{ margin: 0 }}>{JSON.stringify(value, null, 2)}</pre>
  }

  return <span>{String(value)}</span>
}

function Card({
  title,
  data,
  schema,
  ctx,
}: {
  title: string
  data: Record<string, any> | null
  schema: any
  ctx: { category: string; blueprintId: string }
}) {
  if (!data) {
    return (
      <div className='card margin-bottom--md'>
        <div className='card__header'>
          <h3>{title}</h3>
        </div>
        <div className='card__body'>
          <em>Missing or unreadable</em>
        </div>
      </div>
    )
  }

  const orderedKeys = getSchemaOrderedKeys(schema)

  return (
    <div className='card margin-bottom--md'>
      <div className='card__header'>
        <h3>{title}</h3>
      </div>
      <div className='card__body'>
        {orderedKeys.map((key) =>
          key in data ? (
            <div key={key} style={{ marginBottom: 10 }}>
              <strong>{key}:</strong>
              <div>{renderValue(key, data[key], ctx)}</div>
            </div>
          ) : null,
        )}
      </div>
    </div>
  )
}

export default function UpdateTargetInfoCards({ updateTarget }: Props) {
  const { category, blueprintId, libraryId, releaseId, version } = updateTarget

  const blueprintJson = safeLoad(`./${category}/${blueprintId}/blueprint.json`)
  const libraryJson = safeLoad(
    `./${category}/${blueprintId}/${libraryId}/library.json`,
  )
  const releaseJson = safeLoad(
    `./${category}/${blueprintId}/${libraryId}/${releaseId}/release.json`,
  )
  const versionJson = safeLoad(
    `./${category}/${blueprintId}/${libraryId}/${releaseId}/${version}/version.json`,
  )

  const ctx = { category, blueprintId }

  return (
    <section className='container padding-vert--lg'>
      <Card
        title='Blueprint Information'
        data={blueprintJson}
        schema={blueprintSchema}
        ctx={ctx}
      />
      <Card
        title='Library Information'
        data={libraryJson}
        schema={librarySchema}
        ctx={ctx}
      />
      <Card
        title='Release Information'
        data={releaseJson}
        schema={releaseSchema}
        ctx={ctx}
      />
      <Card
        title='Version Information'
        data={versionJson}
        schema={versionSchema}
        ctx={ctx}
      />
    </section>
  )
}
