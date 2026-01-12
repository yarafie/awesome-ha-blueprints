import React from 'react'
import Link from '@docusaurus/Link'
import { ArrowRight } from 'react-bootstrap-icons'

/* -------------------------------------------------- */
/* Integration colors (shared with BlueprintPage)     */
/* -------------------------------------------------- */
const INTEGRATION_COLORS: Record<string, string> = {
  zha: '#2563eb', // blue
  zigbee2mqtt: '#16a34a', // green
  z2m: '#16a34a', // green (alias)
  deconz: '#ea580c', // orange
  shelly: '#dc2626', // red
}

/* Normalize integration names → color keys */
const normalizeIntegrationKey = (raw: string): string => {
  const k = raw.trim().toLowerCase()
  if (k === 'zigbee2mqtt') return 'zigbee2mqtt'
  if (k === 'z2m') return 'z2m'
  if (k === 'zha') return 'zha'
  if (k === 'deconz') return 'deconz'
  if (k === 'shelly') return 'shelly'
  return k
}

/* -------------------------------------------------- */
/* Types                                             */
/* -------------------------------------------------- */
interface BlueprintJson {
  blueprint_id: string
  name: string
  description?: string
  category: string
  model_name?: string
  images: string[]
}

interface BlueprintItemProps {
  category: string
  blueprint: BlueprintJson
  supportedIntegrations?: string[]
}

/* -------------------------------------------------- */
/* Component                                         */
/* -------------------------------------------------- */
const BlueprintItem: React.FC<BlueprintItemProps> = ({
  category,
  blueprint,
  supportedIntegrations,
}) => {
  const title =
    category === 'controllers' && blueprint.model_name
      ? blueprint.model_name
      : blueprint.name

  const imageSrc =
    blueprint.images?.length > 0
      ? `/awesome-ha-blueprints/img/${category}/${blueprint.images[0]}`
      : null

  return (
    <Link
      to={`/docs/blueprints/${category}/${blueprint.blueprint_id}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '96px 1fr auto',
          gap: 20,
          padding: 16,
          borderRadius: 14,
          backgroundColor: 'rgba(127,127,127,0.06)',
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}
      >
        {/* Image */}
        {imageSrc && (
          <img
            src={imageSrc}
            alt={title}
            style={{
              width: 96,
              height: 96,
              objectFit: 'cover',
              borderRadius: 10,
              flexShrink: 0,
            }}
          />
        )}

        {/* Text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{title}</div>

          {/* Supported integrations pills */}
          {category === 'controllers' &&
            supportedIntegrations &&
            supportedIntegrations.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap',
                }}
              >
                {supportedIntegrations.map((integration) => {
                  const key = normalizeIntegrationKey(integration)
                  const color = INTEGRATION_COLORS[key] ?? '#6b7280'

                  return (
                    <span
                      key={integration}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 600,
                        backgroundColor: color,
                        color: '#ffffff',
                        lineHeight: 1.4,
                        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.15)',
                      }}
                    >
                      {integration}
                    </span>
                  )
                })}
              </div>
            )}
        </div>

        {/* CTA */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontWeight: 600,
            color: 'var(--ifm-color-primary)',
            whiteSpace: 'nowrap',
          }}
        >
          <span>View details</span>
          <ArrowRight size={18} />
        </div>
      </div>
    </Link>
  )
}

export default BlueprintItem
