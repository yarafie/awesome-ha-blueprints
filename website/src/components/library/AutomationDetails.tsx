import React from 'react'
import LibraryChangelog from './LibraryChangelog'

interface AutomationMetadata {
  automation_id: string
  name: string
  summary: string
  maintainers: string[]
  variants: string[]
  category: string
  tags: string[]
  status: string
}

interface VersionEntry {
  variant: string
  version: string
  yaml: string
}

/* ---------- loaders ---------- */

// automation-level metadata
const automationContext = require.context(
  '@librarybps/automations',
  true,
  /\/[a-z0-9_]+\/[a-z0-9_]+\.json$/,
)

// all yaml files
const yamlContext = require.context('@librarybps/automations', true, /\.yaml$/)

export default function AutomationDetails({
  automationId,
}: {
  automationId: string
}): JSX.Element {
  /* ---------- load automation.json ---------- */
  const automation: AutomationMetadata = automationContext(
    `./${automationId}/${automationId}.json`,
  )
  /* ---------- resolve image ---------- */
  const image = `/awesome-ha-blueprints/img/automation/${automationId}.png`

  /* ---------- collect versions ---------- */
  const versions: VersionEntry[] = []

  yamlContext.keys().forEach((key) => {
    // ./simple_safe_scheduler/EPMatt/EPMatt/2025.12.16/simple_safe_scheduler.yaml
    const match = key.match(
      new RegExp(
        `^\\./${automationId}/([^/]+)/\\1/(\\d{4}\\.\\d{2}\\.\\d{2})/${automationId}\\.yaml$`,
      ),
    )
    if (!match) return

    const [, variant, version] = match
    versions.push({
      variant,
      version,
      yaml: yamlContext(key),
    })
  })

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
        <img
          src={image}
          alt={automation.name}
          style={{ width: 96, height: 96, objectFit: 'contain' }}
        />
        <div>
          <h1>{automation.name}</h1>
          <p>{automation.summary}</p>
          <div style={{ fontSize: '0.9em', opacity: 0.8 }}>
            Category: {automation.category} · Maintainers:{' '}
            {automation.maintainers.join(', ')}
          </div>
        </div>
      </div>

      {/* Variants + versions */}
      <h2>Variants & Versions</h2>

      {automation.variants.map((variant) => (
        <div key={variant} style={{ marginBottom: '1.5rem' }}>
          <h3>{variant}</h3>
          <ul>
            {versions
              .filter((v) => v.variant === variant)
              .sort((a, b) => b.version.localeCompare(a.version))
              .map((v) => (
                <li key={v.version}>
                  {v.version} —{' '}
                  <a href={v.yaml} download>
                    Download YAML
                  </a>
                </li>
              ))}
          </ul>
        </div>
      ))}

      {/* Changelog */}
      <h2>Changelog</h2>
      <LibraryChangelog
        category='automation'
        id={automationId}
        variant={automation.variants[0]}
      />
    </div>
  )
}
