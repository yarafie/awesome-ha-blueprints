/**
 * UpdateForm
 * ────────────────────────────────────────────────────────────────
 *
 * Purpose:
 *  - Root container for the Contributor Update Form flow
 *  - Collects final author attribution and displays fixed blueprint context
 *
 * Design constraints:
 *  - NO submission logic
 *  - NO reducers
 *  - NO side effects (no fetching here)
 *  - Fully controlled via props + local UI state only
 *
 * Step: H.2.C (revised — explicit author resolution)
 */

import React, { useState, useEffect, useRef } from 'react'
import type {
  ReleaseRecord,
  ChangelogEntry,
  ChangelogChange,
  ContributionEvent,
  ChangeType,
} from '../state/contributionTypes'
import {
  RELEASE_STATUS_VALUES,
  type ReleaseStatus,
  VERSION_STATUS_VALUES,
  type VersionStatus,
} from '../state/schemaDomain'

// Import Sections of Form Page
import AuthorAttributionSection from './UpdateSections/AuthorAttributionSection'
import BlueprintDetailsSection from './UpdateSections/BlueprintDetailsSection'
import ChangeDetailsSection from './UpdateSections/ChangeDetailsSection'
import ReleaseDetailsSection from './UpdateSections/ReleaseDetailsSection'
import VersionDetailsSection from './UpdateSections/VersionDetailsSection'

// Define Interfaces
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

export interface AuthorAttribution {
  id: string
  name: string
  avatarUrl?: string
  profileUrl?: string
}

export interface UpdateFormProps {
  blueprint: BlueprintContext
  release?: ReleaseRecord | null
  author: AuthorAttribution
  canOverrideAuthor: boolean
  onAuthorChange?: (author: AuthorAttribution) => void
  onBack: () => void
  onCancel?: () => void

  changelogDraft?: ChangelogEntry | null
  onChangelogEvent?: (event: ContributionEvent) => void
}

const todayVersionId = () => {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}.${mm}.${dd}`
}

const MIN_CHANGE_DESCRIPTION_LENGTH = 50

const UpdateForm: React.FC<UpdateFormProps> = ({
  blueprint,
  release,
  author,
  canOverrideAuthor,
  onAuthorChange,
  onBack,
  onCancel,
  changelogDraft,
  onChangelogEvent,
}) => {
  const [draftAuthorId, setDraftAuthorId] = useState(author.id)

  const isAddRelease = blueprint.update_type === 'add_release'

  const [draftReleaseId, setDraftReleaseId] = useState(
    isAddRelease ? '' : blueprint.release_id,
  )
  const [draftReleaseTitle, setDraftReleaseTitle] = useState('')
  const [draftReleaseDescription, setDraftReleaseDescription] = useState('')
  const [draftReleaseStatus, setDraftReleaseStatus] = useState<ReleaseStatus>(
    RELEASE_STATUS_VALUES[0],
  )

  const [draftVersionId] = useState(todayVersionId())
  const [draftVersionTitle, setDraftVersionTitle] = useState('')
  const [draftVersionDescription, setDraftVersionDescription] = useState('')
  const [draftVersionStatus, setDraftVersionStatus] = useState<VersionStatus>(
    VERSION_STATUS_VALUES[0],
  )

  // ────────────────────────────────────────────────────────────────
  // Change Details (changelog)
  // ────────────────────────────────────────────────────────────────

  const [draftChangeDescription, setDraftChangeDescription] = useState('')
  const [draftChangeType, setDraftChangeType] = useState<ChangeType | ''>('')

  const change0 = changelogDraft?.changes?.[0]

  const changeDescriptionValue =
    typeof change0?.description === 'string'
      ? change0.description
      : draftChangeDescription

  const changeTypeValue =
    typeof change0?.type === 'string' ? change0.type : draftChangeType

  const isBreaking = Boolean(changelogDraft?.breaking)

  const isChangeDetailsValid =
    changeDescriptionValue.trim().length >= MIN_CHANGE_DESCRIPTION_LENGTH

  // Prevent re-applying defaults on every keystroke
  const defaultsAppliedRef = useRef(false)

  // ────────────────────────────────────────────────────────────────
  // AUTO-DEFAULTS FROM CHANGE DETAILS (SAFE, ONE-TIME)
  // ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isChangeDetailsValid) return
    if (defaultsAppliedRef.current) return

    const authorId = author.id
    const changeDesc = changeDescriptionValue
    const baseReleaseTitle = release?.title ?? blueprint.release_title
    const baseVersionTitle = blueprint.version_title || blueprint.release_title

    if (isAddRelease) {
      setDraftReleaseId(authorId)

      setDraftReleaseTitle(`${baseReleaseTitle} - [A Release by ${authorId}]`)

      setDraftReleaseDescription(changeDesc)

      setDraftVersionTitle(
        `${baseReleaseTitle} — [Initial Version by ${authorId}]`,
      )

      setDraftVersionDescription(changeDesc)
    } else {
      setDraftVersionTitle(
        `${baseVersionTitle} - [Updated Version by ${authorId}]`,
      )

      setDraftVersionDescription(changeDesc)
    }

    defaultsAppliedRef.current = true
  }, [
    isChangeDetailsValid,
    isAddRelease,
    author.id,
    blueprint.release_id,
    blueprint.version_id,
    changeDescriptionValue,
  ])

  function ensureChangelogInitialized(next: {
    description?: string
    type?: ChangeType
  }) {
    if (!onChangelogEvent) return

    const date = changelogDraft?.date ?? ''

    if (!changelogDraft || !date) {
      onChangelogEvent({
        type: 'SET_CHANGELOG_DATE',
        date: date || todayVersionId(),
      })
    }

    if (!changelogDraft?.changes?.length) {
      const initial: ChangelogChange = {
        author: author.id,
        description: next.description ?? '',
        ...(next.type ? { type: next.type } : null),
      }

      onChangelogEvent({
        type: 'ADD_CHANGELOG_CHANGE',
        change: initial,
      })
    }
  }

  function handleChangeDescription(nextDescription: string) {
    defaultsAppliedRef.current = false

    if (!onChangelogEvent) {
      setDraftChangeDescription(nextDescription)
      return
    }

    if (!changelogDraft?.changes?.length) {
      ensureChangelogInitialized({
        description: nextDescription,
        type:
          changeTypeValue === '' ? undefined : (changeTypeValue as ChangeType),
      })
      return
    }

    onChangelogEvent({
      type: 'UPDATE_CHANGELOG_CHANGE',
      index: 0,
      change: { description: nextDescription },
    })
  }

  function handleChangeType(nextType: ChangeType | '') {
    if (!onChangelogEvent) {
      setDraftChangeType(nextType)
      return
    }

    const normalizedType = nextType === '' ? undefined : nextType

    if (!changelogDraft?.changes?.length) {
      ensureChangelogInitialized({
        description: changeDescriptionValue,
        type: normalizedType,
      })
      return
    }

    onChangelogEvent({
      type: 'UPDATE_CHANGELOG_CHANGE',
      index: 0,
      change: { type: normalizedType },
    })
  }

  function handleBreakingToggle(next: boolean) {
    if (!onChangelogEvent) return

    onChangelogEvent({
      type: 'SET_CHANGELOG_BREAKING',
      breaking: next,
    })
  }

  useEffect(() => {
    setDraftAuthorId(author.id)
  }, [author.id])

  useEffect(() => {
    if (!isAddRelease && release) {
      setDraftReleaseTitle(release.title)
      setDraftReleaseDescription(release.description)
      setDraftReleaseStatus(release.status)
    }
  }, [isAddRelease, release])

  const isResolved = Boolean(author.avatarUrl)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <AuthorAttributionSection
        author={author}
        draftAuthorId={draftAuthorId}
        canOverrideAuthor={canOverrideAuthor}
        isResolved={isResolved}
        onDraftAuthorIdChange={setDraftAuthorId}
        onAuthorCheck={onAuthorChange}
      />

      <BlueprintDetailsSection blueprint={blueprint} />

      <ChangeDetailsSection
        changelogDraft={changelogDraft}
        changeDescriptionValue={changeDescriptionValue}
        changeTypeValue={changeTypeValue}
        isBreaking={isBreaking}
        isValid={isChangeDetailsValid}
        onChangeDescription={handleChangeDescription}
        onChangeType={handleChangeType}
        onToggleBreaking={handleBreakingToggle}
      />

      <ReleaseDetailsSection
        isAddRelease={isAddRelease}
        isEnabled={isChangeDetailsValid}
        canOverrideAuthor={canOverrideAuthor}
        draftReleaseId={draftReleaseId}
        draftReleaseTitle={draftReleaseTitle}
        draftReleaseDescription={draftReleaseDescription}
        draftReleaseStatus={draftReleaseStatus}
        onChangeReleaseId={setDraftReleaseId}
        onChangeReleaseTitle={setDraftReleaseTitle}
        onChangeReleaseDescription={setDraftReleaseDescription}
        onChangeReleaseStatus={setDraftReleaseStatus}
      />

      <VersionDetailsSection
        isAddRelease={isAddRelease}
        isEnabled={isChangeDetailsValid}
        canOverrideAuthor={canOverrideAuthor}
        isBreaking={isBreaking}
        draftVersionId={draftVersionId}
        draftVersionTitle={draftVersionTitle}
        draftVersionDescription={draftVersionDescription}
        draftVersionStatus={draftVersionStatus}
        onChangeVersionTitle={setDraftVersionTitle}
        onChangeVersionDescription={setDraftVersionDescription}
        onChangeVersionStatus={setDraftVersionStatus}
      />

      <div className='card'>
        <div
          className='card__body'
          style={{ display: 'flex', justifyContent: 'space-between' }}
        >
          <button className='button button--secondary' onClick={onBack}>
            Back
          </button>

          {onCancel && (
            <button className='button button--secondary' onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default UpdateForm
