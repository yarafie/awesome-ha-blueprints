import React from 'react'

export interface BlueprintContext {
  category: 'controllers' | 'hooks' | 'automations'
  blueprint_id: string
  blueprint_title: string
  library_id: string
  release_id: string
  release_title: string
  version_id: string
  version_title: string
  update_type: 'add_version' | 'add_release'
}

export interface BlueprintDetailsSectionProps {
  blueprint: BlueprintContext
}

const BlueprintDetailsSection: React.FC<BlueprintDetailsSectionProps> = ({
  blueprint,
}) => {
  const isAddRelease = blueprint.update_type === 'add_release'

  return (
    <div className='card'>
      <div className='card__body'>
        <h3>Blueprint Details</h3>

        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>
            <strong>Current Action:</strong>{' '}
            {isAddRelease ? 'Add New Release' : 'Add New Version'}
          </div>

          <div>
            <strong>Category:</strong> {blueprint.category}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              columnGap: 32,
              rowGap: 8,
              marginTop: 8,
              maxWidth: 520,
            }}
          >
            <div style={{ display: 'grid', gap: 8 }}>
              <div>
                <div>
                  <strong>Blueprint ID:</strong> {blueprint.blueprint_id}
                </div>
                <div style={{ fontSize: 13, opacity: 0.7 }}>
                  {blueprint.blueprint_title}
                </div>
              </div>
              <div>
                <strong>Library ID:</strong> {blueprint.library_id}
              </div>
            </div>

            <div style={{ display: 'grid', gap: 8 }}>
              <div>
                <div>
                  <strong>Release ID:</strong> {blueprint.release_id}
                </div>
                <div style={{ fontSize: 13, opacity: 0.7 }}>
                  {blueprint.release_title}
                </div>
              </div>
              <div>
                <div>
                  <strong>Version ID:</strong> {blueprint.version_id}
                </div>
                <div style={{ fontSize: 13, opacity: 0.7 }}>
                  {blueprint.version_title}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlueprintDetailsSection
