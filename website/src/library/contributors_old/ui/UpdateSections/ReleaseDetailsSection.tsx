import React from 'react'
import {
  RELEASE_STATUS_VALUES,
  RELEASE_LIMITS,
  type ReleaseStatus,
} from '../../state/schemaDomain'

export interface ReleaseDetailsSectionProps {
  isAddRelease: boolean
  isEnabled: boolean
  canOverrideAuthor: boolean
  draftReleaseId: string
  draftReleaseTitle: string
  draftReleaseDescription: string
  draftReleaseStatus: ReleaseStatus
  onChangeReleaseId: (value: string) => void
  onChangeReleaseTitle: (value: string) => void
  onChangeReleaseDescription: (value: string) => void
  onChangeReleaseStatus: (value: ReleaseStatus) => void
}

const ReleaseDetailsSection: React.FC<ReleaseDetailsSectionProps> = ({
  isAddRelease,
  isEnabled,
  canOverrideAuthor,
  draftReleaseId,
  draftReleaseTitle,
  draftReleaseDescription,
  draftReleaseStatus,
  onChangeReleaseId,
  onChangeReleaseTitle,
  onChangeReleaseDescription,
  onChangeReleaseStatus,
}) => {
  const sectionDisabled = !isEnabled
  const canEdit = isEnabled && canOverrideAuthor && isAddRelease

  return (
    <div
      className='card'
      style={{
        opacity: sectionDisabled ? 0.6 : 1,
        pointerEvents: sectionDisabled ? 'none' : 'auto',
      }}
    >
      <div className='card__body'>
        <h3>Release Details</h3>

        {sectionDisabled && (
          <div style={{ marginBottom: 12, fontSize: 13, opacity: 0.8 }}>
            Complete <strong>Change Details</strong> (minimum 50 characters) to
            unlock this section.
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
              <label className='form-label'>Release ID</label>
              <div style={{ marginTop: 6 }}>
                <input
                  className='form-control'
                  type='text'
                  maxLength={RELEASE_LIMITS.ID_MAX}
                  value={draftReleaseId}
                  disabled={!canEdit}
                  style={{ maxWidth: 220 }}
                  onChange={(e) => onChangeReleaseId(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className='form-label'>Release Status</label>
              <div style={{ marginTop: 6 }}>
                <select
                  className='form-control'
                  value={draftReleaseStatus}
                  disabled={!canEdit}
                  onChange={(e) =>
                    onChangeReleaseStatus(e.target.value as ReleaseStatus)
                  }
                >
                  {RELEASE_STATUS_VALUES.map((status) => (
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
              <label className='form-label'>Release Title</label>
              <div style={{ marginTop: 6 }}>
                <input
                  className='form-control'
                  type='text'
                  maxLength={RELEASE_LIMITS.TITLE_MAX}
                  value={draftReleaseTitle}
                  disabled={!canEdit}
                  style={{ width: '100%' }}
                  onChange={(e) => onChangeReleaseTitle(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className='form-label'>Release Description</label>
              <div style={{ marginTop: 8 }}>
                <textarea
                  className='form-control'
                  rows={5}
                  maxLength={RELEASE_LIMITS.DESCRIPTION_MAX}
                  style={{ width: '100%', resize: 'none' }}
                  value={draftReleaseDescription}
                  disabled={!canEdit}
                  onChange={(e) => onChangeReleaseDescription(e.target.value)}
                />
              </div>
              <div style={{ marginTop: 4, fontSize: 12, opacity: 0.7 }}>
                {draftReleaseDescription.length} /{' '}
                {RELEASE_LIMITS.DESCRIPTION_MAX} characters
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReleaseDetailsSection
