import React from 'react'

type ContributionType =
  | 'blueprint:update'
  | 'automation:new'
  | 'controller:new'
  | 'hook:new'

interface Props {
  disabled: boolean
  onSelect: (type: ContributionType) => void
}

const ContributionTypeSelector: React.FC<Props> = ({ disabled, onSelect }) => {
  return (
    <section className='container padding-vert--lg'>
      <h2 style={{ marginBottom: 8 }}>Choose Contribution Type</h2>

      {/* Primary option */}
      <div
        style={{
          marginBottom: 24,
          padding: 16,
          border: '2px solid var(--ifm-color-primary)',
          borderRadius: 8,
        }}
      >
        <h3>Update Existing Blueprint</h3>
        <p>Improve or fix an existing blueprint</p>
        <button
          className='button button--primary'
          disabled={disabled}
          onClick={() => onSelect('blueprint:update')}
        >
          Update Blueprint
        </button>
      </div>

      {/* Secondary options */}
      <div className='row'>
        <div className='col col--4'>
          <div className='card'>
            <div className='card__body'>
              <h4>New Automation</h4>
              <p>Submit a brand new automation blueprint</p>
              <button
                className='button button--secondary'
                disabled={disabled}
                onClick={() => onSelect('automation:new')}
              >
                Create Automation
              </button>
            </div>
          </div>
        </div>

        <div className='col col--4'>
          <div className='card'>
            <div className='card__body'>
              <h4>New Controller</h4>
              <p>Add support for a new physical controller</p>
              <button
                className='button button--secondary'
                disabled={disabled}
                onClick={() => onSelect('controller:new')}
              >
                Create Controller
              </button>
            </div>
          </div>
        </div>

        <div className='col col--4'>
          <div className='card'>
            <div className='card__body'>
              <h4>New Hook</h4>
              <p>Create a reusable hook blueprint</p>
              <button
                className='button button--secondary'
                disabled={disabled}
                onClick={() => onSelect('hook:new')}
              >
                Create Hook
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContributionTypeSelector
