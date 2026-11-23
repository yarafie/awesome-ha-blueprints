/**
 * ContributionTypeStep
 * ────────────────────────────────────────────────────────────────
 *
 * Purpose:
 *  - Step 1 UI for choosing contribution type
 *
 * Design:
 *  - Mirrors legacy ContributionTypeSelector layout
 *  - One primary card (enabled)
 *  - Secondary cards (disabled / Coming Soon)
 *
 * Notes:
 *  - Uses Docusaurus grid & card primitives intentionally
 *  - Owns only its internal structure
 */

import React from 'react'
import type { ContributionMode } from '../state/contributionTypes'

interface Props {
  onSelect: (mode: ContributionMode) => void
}

const ContributionTypeStep: React.FC<Props> = ({ onSelect }) => {
  return (
    <>
      {/* Section title */}
      <h2
        style={{
          marginBottom: 16,
        }}
      >
        Choose Contribution Type
      </h2>

      {/* Row 1 – Primary option */}
      <div className='card margin-bottom--md'>
        <div className='card__body'>
          <h3>Update Existing Blueprint</h3>
          <p>Improve or fix an existing blueprint</p>
          <button
            className='button button--primary'
            onClick={() => onSelect('update_blueprint')}
          >
            Update Blueprint
          </button>
        </div>
      </div>

      {/* Row 2 – Secondary options (disabled / coming soon) */}
      <div className='row margin-bottom--sm' style={{ alignItems: 'stretch' }}>
        <div className='col col--4'>
          <div className='card' style={{ height: '100%' }}>
            <div
              className='card__body'
              style={{ display: 'flex', flexDirection: 'column', opacity: 0.5 }}
            >
              <h3>New Controller - Coming Soon</h3>
              <p>Add support for a new physical controller</p>
              <button
                className='button button--secondary'
                style={{ marginTop: 'auto' }}
                disabled
              >
                Create Controller
              </button>
            </div>
          </div>
        </div>

        <div className='col col--4'>
          <div className='card' style={{ height: '100%' }}>
            <div
              className='card__body'
              style={{ display: 'flex', flexDirection: 'column', opacity: 0.5 }}
            >
              <h3>New Hook - Coming Soon</h3>
              <p>Create a reusable hook blueprint</p>
              <button
                className='button button--secondary'
                style={{ marginTop: 'auto' }}
                disabled
              >
                Create Hook
              </button>
            </div>
          </div>
        </div>

        <div className='col col--4'>
          <div className='card' style={{ height: '100%' }}>
            <div
              className='card__body'
              style={{ display: 'flex', flexDirection: 'column', opacity: 0.5 }}
            >
              <h3>New Automation - Coming Soon</h3>
              <p>Submit a brand new automation blueprint</p>
              <button
                className='button button--secondary'
                style={{ marginTop: 'auto' }}
                disabled
              >
                Create Automation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3 – Other updates (disabled / coming soon) */}
      <div className='card'>
        <div
          className='card__body'
          style={{ display: 'flex', flexDirection: 'column', opacity: 0.5 }}
        >
          <h3>Update General Website Files - Coming Soon</h3>
          <p>Additional contribution types (e.g. docs or specfic code).</p>
          <button
            className='button button--secondary'
            style={{ marginTop: 'auto' }}
            disabled
          >
            Update General Website Files
          </button>
        </div>
      </div>
    </>
  )
}

export default ContributionTypeStep
