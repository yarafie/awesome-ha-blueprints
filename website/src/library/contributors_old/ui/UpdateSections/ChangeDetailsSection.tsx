import React from 'react'
import type { ChangeType } from '../../state/contributionTypes'
import { CHANGE_TYPE_VALUES, CHANGELOG_LIMITS } from '../../state/schemaDomain'

export interface ChangeDetailsSectionProps {
  changeDescriptionValue: string
  changeTypeValue: ChangeType | ''
  isBreaking: boolean
  isValid: boolean
  onChangeDescription: (value: string) => void
  onChangeType: (value: ChangeType | '') => void
  onToggleBreaking: (value: boolean) => void
}

const MIN_DESCRIPTION_LENGTH = 50

const InfoIcon = () => (
  <svg
    width='14'
    height='14'
    viewBox='0 0 24 24'
    aria-hidden='true'
    style={{ display: 'block' }}
  >
    <circle cx='12' cy='12' r='10' fill='currentColor' opacity='0.12' />
    <path d='M11 10h2v6h-2zm0-4h2v2h-2z' fill='currentColor' />
  </svg>
)

const InfoToolTip: React.FC<{ text: string }> = ({ text }) => (
  <span
    className='contributorsTooltip'
    tabIndex={0}
    role='button'
    aria-label='Help'
  >
    <InfoIcon />
    <span className='contributorsTooltip__content'>{text}</span>
  </span>
)

const ChangeDetailsSection: React.FC<ChangeDetailsSectionProps> = ({
  changeDescriptionValue,
  changeTypeValue,
  isBreaking,
  isValid,
  onChangeDescription,
  onChangeType,
  onToggleBreaking,
}) => {
  const length = changeDescriptionValue.length
  const isTooShort = length > 0 && length < MIN_DESCRIPTION_LENGTH

  return (
    <div className='card'>
      <div className='card__body'>
        <h3>Change Details</h3>

        <div style={{ display: 'grid', gap: 18, maxWidth: 720 }}>
          {/* Change Description */}
          <div>
            <label className='form-label'>
              Change Description
              <InfoToolTip
                text={
                  'Describe the big picture of your update and why it should be accepted.\n' +
                  'If it fixes a bug or resolves a feature request, include closes #XXXX.\n' +
                  'For breaking changes, provide migration guidance.'
                }
              />
            </label>

            <textarea
              className='form-control'
              rows={4}
              required
              minLength={MIN_DESCRIPTION_LENGTH}
              maxLength={CHANGELOG_LIMITS.DESCRIPTION_MAX}
              style={{ width: '100%', resize: 'none', marginTop: 8 }}
              value={changeDescriptionValue}
              onChange={(e) => onChangeDescription(e.target.value)}
            />

            <div style={{ marginTop: 4, fontSize: 12, opacity: 0.7 }}>
              {length} / {CHANGELOG_LIMITS.DESCRIPTION_MAX} characters
            </div>

            {isTooShort && (
              <div
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  color: 'var(--ifm-color-danger)',
                }}
              >
                Change description must be at least {MIN_DESCRIPTION_LENGTH}{' '}
                characters.
              </div>
            )}
          </div>

          {/* Breaking */}
          <div>
            <label className='form-label'>
              Breaking Change
              <InfoToolTip
                text={
                  'Mark this if the update breaks existing users.\n' +
                  'Describe what breaks, why, and how to migrate.'
                }
              />
            </label>

            <label
              style={{
                display: 'flex',
                gap: 8,
                marginTop: 6,
                alignItems: 'center',
              }}
            >
              <input
                type='checkbox'
                checked={isBreaking}
                onChange={(e) => onToggleBreaking(e.target.checked)}
              />
              This update introduces a breaking change
            </label>
          </div>

          {/* Change Type */}
          <div style={{ maxWidth: 260 }}>
            <label className='form-label'>Change Type (optional)</label>
            <select
              className='form-control'
              value={changeTypeValue}
              onChange={(e) =>
                onChangeType((e.target.value as ChangeType) || '')
              }
              style={{ marginTop: 6 }}
            >
              <option value=''>— Select type —</option>
              {CHANGE_TYPE_VALUES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {!isValid && (
            <div style={{ fontSize: 13, color: 'var(--ifm-color-danger)' }}>
              Change Details must be completed before continuing.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChangeDetailsSection
