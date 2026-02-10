import React from 'react'
import type { AuthorAttribution } from '../UpdateForm'

export interface AuthorAttributionSectionProps {
  author: AuthorAttribution
  draftAuthorId: string
  canOverrideAuthor: boolean
  isResolved: boolean
  onDraftAuthorIdChange: (value: string) => void
  onAuthorCheck?: (author: AuthorAttribution) => void
}

const AuthorAttributionSection: React.FC<AuthorAttributionSectionProps> = ({
  author,
  draftAuthorId,
  canOverrideAuthor,
  isResolved,
  onDraftAuthorIdChange,
  onAuthorCheck,
}) => {
  return (
    <div className='card'>
      <div className='card__body'>
        <h3>Author of Update</h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '96px 1fr',
            gap: 16,
            alignItems: 'start',
            maxWidth: 560,
          }}
        >
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 8,
              border: '1px solid var(--ifm-color-emphasis-300)',
              background: 'var(--ifm-background-surface-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {author.avatarUrl ? (
              <a
                href={author.profileUrl}
                target='_blank'
                rel='noopener noreferrer'
              >
                <img
                  src={author.avatarUrl}
                  alt={author.id}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </a>
            ) : (
              <span style={{ fontSize: 32, opacity: 0.4 }}>?</span>
            )}
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            <div>
              <label className='form-label'>Author ID (GitHub)</label>
              <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
                <input
                  className='form-control'
                  type='text'
                  value={draftAuthorId}
                  required
                  disabled={!canOverrideAuthor}
                  onChange={(e) => onDraftAuthorIdChange(e.target.value)}
                />
                {canOverrideAuthor && (
                  <button
                    className='button button--secondary'
                    type='button'
                    onClick={() =>
                      onAuthorCheck?.({
                        id: draftAuthorId.trim(),
                        name: author.name,
                      })
                    }
                  >
                    Check
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className='form-label'>Author Name</label>
              <div style={{ marginTop: 6 }}>
                <input
                  className='form-control'
                  type='text'
                  value={author.name}
                  required
                  disabled
                />
              </div>
            </div>

            <div style={{ fontSize: 13, opacity: 0.75 }}>
              {isResolved ? (
                <span style={{ color: 'var(--ifm-color-success)' }}>
                  ✓ GitHub user resolved
                </span>
              ) : (
                <span>Not yet verified</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthorAttributionSection
