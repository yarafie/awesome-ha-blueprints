/**
 * Component: YamlPreview
 * ────────────────────────────────────────────────────────────────
 *
 * Purpose:
 *  - Display parsed YAML metadata
 *  - Preserve formatting and spacing exactly as provided
 */
import React from 'react'
import type { ParsedYaml } from './YamlUpload'

interface Props {
  yaml: ParsedYaml
}

const YamlPreview: React.FC<Props> = ({ yaml }) => {
  return (
    <section className='container padding-vert--lg'>
      <h2>YAML Preview</h2>

      <div style={{ marginTop: 12 }}>
        <strong>Name:</strong> {yaml.name ?? '—'}
      </div>

      <div style={{ marginTop: 8 }}>
        <strong>Domain:</strong> {yaml.domain ?? '—'}
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>Description:</strong>
        <div
          style={{
            marginTop: 8,
            padding: 12,
            border: '1px solid var(--ifm-color-emphasis-300)',
            borderRadius: 6,
            whiteSpace: 'pre-wrap',
            lineHeight: 1.6,
          }}
        >
          {yaml.description ?? '—'}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>Inputs:</strong>
        {yaml.inputs.length === 0 ? (
          <div style={{ marginTop: 6 }}>—</div>
        ) : (
          <ul style={{ marginTop: 6 }}>
            {yaml.inputs.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export default YamlPreview
