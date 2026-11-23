import React from 'react'
import {
  VERSION_STATUS_VALUES,
  VERSION_LIMITS,
  type VersionStatus,
} from '../../state/schemaDomain'

export interface VersionDetailsSectionProps {
  isAddRelease: boolean
  isEnabled: boolean
  canOverrideAuthor: boolean
  isBreaking: boolean
  draftVersionId: string
  draftVersionTitle: string
  draftVersionDescription: string
  draftVersionStatus: VersionStatus
  onChangeVersionTitle: (value: string) => void
  onChangeVersionDescription: (value: string) => void
  onChangeVersionStatus: (value: VersionStatus) => void
}

const VersionDetailsSection: React.FC<VersionDetailsSectionProps> = ({
  isAddRelease,
  isEnabled,
  canOverrideAuthor,
  isBreaking,
  draftVersionId,
  draftVersionTitle,
  draftVersionDescription,
  draftVersionStatus,
  onChangeVersionTitle,
  onChangeVersionDescription,
  onChangeVersionStatus,
}) => {
  const sectionDisabled = !isEnabled
  const canEdit = isEnabled && canOverrideAuthor

  return (
    <div
      className='card'
      style={{
        opacity: sectionDisabled ? 0.6 : 1,
        pointerEvents: sectionDisabled ? 'none' : 'auto',
      }}
    >
      <div className='card__body'>
        <h3>{isAddRelease ? 'Initial Version Details' : 'Version Details'}</h3>

        {sectionDisabled && (
          <div style={{ marginBottom: 12, fontSize: 13, opacity: 0.8 }}>
            Complete <strong>Change Details</strong> (minimum 50 characters) to
            unlock this section.
          </div>
        )}

        {isEnabled && isBreaking && (
          <div
            style={{
              marginBottom: 12,
              padding: '10px 12px',
              borderRadius: 6,
              background: 'var(--ifm-color-warning-contrast-background)',
              color: 'var(--ifm-color-warning-contrast-foreground)',
              fontSize: 13,
            }}
          >
            <strong>Breaking change:</strong> This version contains breaking
            changes. See <strong>Change Details</strong> for migration guidance.
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '240px 1fr',
            columnGap: 24,
            rowGap: 18,
            alignItems: 'start',
          }}
        >
          <div style={{ display: 'grid', gap: 18 }}>
            <div>
              <label className='form-label'>Version ID</label>
              <div style={{ marginTop: 6 }}>
                <input
                  className='form-control'
                  type='text'
                  value={draftVersionId}
                  disabled={!canEdit}
                  style={{ maxWidth: 220 }}
                />
              </div>
            </div>

            <div>
              <label className='form-label'>Version Status</label>
              <div style={{ marginTop: 6 }}>
                <select
                  className='form-control'
                  value={draftVersionStatus}
                  disabled={!canEdit}
                  onChange={(e) =>
                    onChangeVersionStatus(e.target.value as VersionStatus)
                  }
                >
                  {VERSION_STATUS_VALUES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 18 }}>
            <div>
              <label className='form-label'>Version Title</label>
              <div style={{ marginTop: 6 }}>
                <input
                  className='form-control'
                  type='text'
                  maxLength={VERSION_LIMITS.TITLE_MAX}
                  value={draftVersionTitle}
                  disabled={!canEdit}
                  style={{ width: '100%' }}
                  onChange={(e) => onChangeVersionTitle(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className='form-label'>Version Description</label>
              <div style={{ marginTop: 8 }}>
                <textarea
                  className='form-control'
                  rows={5}
                  maxLength={VERSION_LIMITS.DESCRIPTION_MAX}
                  style={{ width: '100%', resize: 'none' }}
                  value={draftVersionDescription}
                  disabled={!canEdit}
                  onChange={(e) => onChangeVersionDescription(e.target.value)}
                />
              </div>
              <div style={{ marginTop: 4, fontSize: 12, opacity: 0.7 }}>
                {draftVersionDescription.length} /{' '}
                {VERSION_LIMITS.DESCRIPTION_MAX} characters
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VersionDetailsSection
