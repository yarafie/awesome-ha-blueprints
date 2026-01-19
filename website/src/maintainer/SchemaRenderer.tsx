/**
 * SchemaRenderer
 *
 * Read-only schema-driven renderer for JSON objects.
 *
 * Goals:
 * - Present JSON as labeled fields (not raw blobs)
 * - Use schema ordering, descriptions, and required flags
 * - Support common JSON types: string, number, boolean, array, object
 *
 * Non-goals (for now):
 * - Full JSON Schema evaluation (allOf/if/then/else/refs)
 * - Editing
 * - Validation beyond required key presence
 */

import React from 'react'

type JsonSchema = {
  title?: string
  description?: string
  type?: string
  required?: string[]
  properties?: Record<string, JsonSchemaProperty>
  items?: JsonSchemaProperty
  enum?: unknown[]
  $ref?: string
  additionalProperties?: boolean
  $defs?: Record<string, JsonSchemaProperty>
}

type JsonSchemaProperty = {
  title?: string
  description?: string
  type?: string
  required?: string[]
  properties?: Record<string, JsonSchemaProperty>
  items?: JsonSchemaProperty
  enum?: unknown[]
  format?: string
  pattern?: string
  $ref?: string
}

interface SchemaRendererProps {
  title: string
  schema: JsonSchema
  data: unknown
}

export default function SchemaRenderer({
  title,
  schema,
  data,
}: SchemaRendererProps): JSX.Element {
  const obj = isPlainObject(data) ? (data as Record<string, unknown>) : {}

  const properties = schema.properties ?? {}
  const required = new Set(schema.required ?? [])

  return (
    <section
      style={{
        marginTop: '1rem',
        border: '1px solid var(--ifm-color-emphasis-300)',
        borderRadius: '12px',
        padding: '1.25rem',
        background: 'var(--ifm-background-surface-color)',
      }}
    >
      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: 0 }}>{title}</h4>
        {schema.description ? (
          <div style={{ marginTop: '0.25rem', opacity: 0.75 }}>
            {schema.description}
          </div>
        ) : null}
      </div>

      <dl
        style={{
          display: 'grid',
          gridTemplateColumns: 'max-content 1fr',
          columnGap: '1rem',
          rowGap: '0.75rem',
          margin: 0,
        }}
      >
        {Object.entries(properties).map(([key, propSchema]) => {
          const value = obj[key]
          const isMissing = value === undefined
          const isReq = required.has(key)

          return (
            <React.Fragment key={key}>
              <dt
                style={{
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  opacity: isMissing && isReq ? 1 : 0.9,
                }}
                title={key}
              >
                {propSchema.title ?? key}
                {isReq ? (
                  <span style={{ marginLeft: '0.35rem', opacity: 0.6 }}>*</span>
                ) : null}
              </dt>

              <dd style={{ margin: 0 }}>
                <ValueView
                  value={value}
                  schema={propSchema}
                  missingRequired={isMissing && isReq}
                />
                {propSchema.description ? (
                  <div style={{ marginTop: '0.25rem', opacity: 0.7 }}>
                    {propSchema.description}
                  </div>
                ) : null}
              </dd>
            </React.Fragment>
          )
        })}
      </dl>
    </section>
  )
}

function ValueView(props: {
  value: unknown
  schema: JsonSchemaProperty
  missingRequired: boolean
}): JSX.Element {
  const { value, schema, missingRequired } = props

  if (value === undefined) {
    return (
      <span
        style={{
          color: missingRequired ? 'var(--ifm-color-danger)' : undefined,
        }}
      >
        {missingRequired ? 'Missing (required)' : '—'}
      </span>
    )
  }

  // Basic primitives
  if (typeof value === 'string') return <span>{value}</span>
  if (typeof value === 'number') return <span>{value}</span>
  if (typeof value === 'boolean') return <span>{value ? 'Yes' : 'No'}</span>

  // Arrays
  if (Array.isArray(value)) {
    if (value.length === 0) return <span>—</span>

    // array of primitives → comma list
    if (value.every((v) => isPrimitive(v))) {
      return <span>{value.map(String).join(', ')}</span>
    }

    // array of objects → mini cards
    return (
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        {value.map((item, idx) => (
          <div
            key={idx}
            style={{
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: '10px',
              padding: '0.6rem 0.75rem',
              background: 'var(--ifm-background-color)',
            }}
          >
            {isPlainObject(item) ? (
              <MiniObjectView
                obj={item as Record<string, unknown>}
                schema={schema.items}
              />
            ) : (
              <pre style={{ margin: 0, overflowX: 'auto' }}>
                {safeStringify(item)}
              </pre>
            )}
          </div>
        ))}
      </div>
    )
  }

  // Objects
  if (isPlainObject(value)) {
    return (
      <div
        style={{
          border: '1px solid var(--ifm-color-emphasis-300)',
          borderRadius: '10px',
          padding: '0.6rem 0.75rem',
          background: 'var(--ifm-background-color)',
        }}
      >
        <MiniObjectView
          obj={value as Record<string, unknown>}
          schema={schema}
        />
      </div>
    )
  }

  // Fallback
  return (
    <pre style={{ margin: 0, overflowX: 'auto' }}>{safeStringify(value)}</pre>
  )
}

function MiniObjectView(props: {
  obj: Record<string, unknown>
  schema?: JsonSchemaProperty
}): JSX.Element {
  const { obj, schema } = props
  const properties = schema?.properties ?? null
  const required = new Set(schema?.required ?? [])

  // If we have properties in schema, render in that order; otherwise render keys alphabetically.
  const entries: Array<[string, unknown, JsonSchemaProperty | undefined]> =
    properties
      ? Object.keys(properties).map((k) => [k, obj[k], properties[k]])
      : Object.keys(obj)
          .sort()
          .map((k) => [k, obj[k], undefined])

  return (
    <dl
      style={{
        display: 'grid',
        gridTemplateColumns: 'max-content 1fr',
        columnGap: '0.75rem',
        rowGap: '0.35rem',
        margin: 0,
      }}
    >
      {entries.map(([k, v, s]) => {
        const isMissing = v === undefined
        const isReq = required.has(k)

        return (
          <React.Fragment key={k}>
            <dt style={{ fontWeight: 600, opacity: 0.85 }} title={k}>
              {s?.title ?? k}
              {isReq ? (
                <span style={{ marginLeft: '0.35rem', opacity: 0.6 }}>*</span>
              ) : null}
            </dt>
            <dd style={{ margin: 0 }}>
              {v === undefined ? (
                <span
                  style={{
                    color:
                      isMissing && isReq
                        ? 'var(--ifm-color-danger)'
                        : undefined,
                  }}
                >
                  {isMissing && isReq ? 'Missing (required)' : '—'}
                </span>
              ) : isPrimitive(v) ? (
                <span>
                  {typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v)}
                </span>
              ) : (
                <pre style={{ margin: 0, overflowX: 'auto' }}>
                  {safeStringify(v)}
                </pre>
              )}
            </dd>
          </React.Fragment>
        )
      })}
    </dl>
  )
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function isPrimitive(v: unknown): v is string | number | boolean | null {
  return (
    v === null ||
    typeof v === 'string' ||
    typeof v === 'number' ||
    typeof v === 'boolean'
  )
}

function safeStringify(v: unknown): string {
  try {
    return JSON.stringify(v, null, 2)
  } catch {
    return String(v)
  }
}
