/**
 * Component: ContributionTypeSelector
 * ────────────────────────────────────────────────────────────────
 *
 * Purpose:
 *  - Allow authenticated contributors to select a contribution type
 *  - No backend / no IO
 */
import React from 'react'
import type { ContributionType } from '../state/contributionState'

interface Props {
  disabled: boolean
  onSelect: (type: ContributionType) => void
}

const options: {
  type: ContributionType
  label: string
  description: string
}[] = [
  {
    type: 'automation:new',
    label: 'New Automation',
    description: 'Submit a brand new automation blueprint',
  },
  {
    type: 'controller:new',
    label: 'New Controller',
    description: 'Add support for a new physical controller device',
  },
  {
    type: 'hook:new',
    label: 'New Hook',
    description: 'Create a reusable hook blueprint',
  },
  {
    type: 'blueprint:update',
    label: 'Update Existing Blueprint',
    description: 'Improve or fix an existing blueprint',
  },
]

const ContributionTypeSelector: React.FC<Props> = ({ disabled, onSelect }) => {
  return (
    <section className='container padding-vert--lg'>
      <h2>Choose Contribution Type</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
          marginTop: 16,
          maxWidth: 900,
        }}
      >
        {options.map((opt) => (
          <button
            key={opt.type}
            disabled={disabled}
            onClick={() => onSelect(opt.type)}
            style={{
              textAlign: 'left',
              padding: 16,
              borderRadius: 8,
              border: '1px solid var(--ifm-color-emphasis-300)',
              background: 'var(--ifm-background-color)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.6 : 1,
            }}
          >
            <strong>{opt.label}</strong>
            <p style={{ marginTop: 6, fontSize: 14, opacity: 0.8 }}>
              {opt.description}
            </p>
          </button>
        ))}
      </div>
    </section>
  )
}

export default ContributionTypeSelector
