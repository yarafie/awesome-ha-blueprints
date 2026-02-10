/**
 * Contribution Reducer
 * ────────────────────────────────────────────────────────────────
 *
 * Handles all contributor flow state transitions.
 */

import type {
  ContributionState,
  ContributionEvent,
  UpdateBlueprintTarget,
  ReleaseRecord,
  VersionRecord,
} from './contributionTypes'

import { blueprintsContext, jsonContext } from '@site/src/utils/libraryContexts'

export const initialContributionState: ContributionState = {
  mode: null,
  effectiveRole: 'contributor',

  // Step 2.1
  updateTarget: undefined,

  // Step 2.1.x — Release metadata
  release: undefined,

  // Step 2.1.x — Version metadata
  version: undefined,

  // Step 2.2
  uploadedYaml: undefined,
  existingYaml: undefined,
  updateType: undefined,
  updateTypeConfirmed: false,

  // Step 2.2.y — Changelog
  changelogDraft: null,

  // Step H.2
  author: null,
  authorDraftId: '',
  authorLookup: { status: 'idle' },
}

/* ──────────────────────────────────────────────────────────────── */
/* Guards                                                          */
/* ──────────────────────────────────────────────────────────────── */

function isUpdateTargetComplete(
  t: UpdateBlueprintTarget | null | undefined,
): t is UpdateBlueprintTarget {
  return (
    !!t &&
    !!t.category &&
    !!t.blueprintId &&
    !!t.libraryId &&
    !!t.releaseId &&
    !!t.version
  )
}

/* ──────────────────────────────────────────────────────────────── */
/* Loaders (LOCKED BEHAVIOR, ADDITIVE)                              */
/* ──────────────────────────────────────────────────────────────── */

function safeLoadVersion(
  updateTarget: UpdateBlueprintTarget | null | undefined,
): VersionRecord | null {
  if (!isUpdateTargetComplete(updateTarget)) return null

  const { category, blueprintId, libraryId, releaseId, version } = updateTarget

  try {
    const path = `./${category}/${blueprintId}/${libraryId}/${releaseId}/${version}/version.json`
    return jsonContext(path) as VersionRecord
  } catch {
    return null
  }
}

function safeLoadExistingYaml(
  updateTarget: UpdateBlueprintTarget | null | undefined,
): string | null {
  const versionJson = safeLoadVersion(updateTarget)
  if (!versionJson?.blueprint_file) return null

  const {
    category,
    blueprint_id,
    library_id,
    release_id,
    version,
    blueprint_file,
  } = versionJson

  try {
    const yamlPath = `./${category}/${blueprint_id}/${library_id}/${release_id}/${version}/${blueprint_file}`
    return String(blueprintsContext(yamlPath))
  } catch {
    return null
  }
}

function safeLoadRelease(
  updateTarget: UpdateBlueprintTarget | null | undefined,
): ReleaseRecord | null {
  if (!updateTarget) return null

  const { category, blueprintId, libraryId, releaseId } = updateTarget

  try {
    const path = `./${category}/${blueprintId}/${libraryId}/${releaseId}/release.json`
    return jsonContext(path) as ReleaseRecord
  } catch {
    return null
  }
}

/* ──────────────────────────────────────────────────────────────── */
/* Reducer                                                         */
/* ──────────────────────────────────────────────────────────────── */

export function contributionReducer(
  state: ContributionState,
  event: ContributionEvent,
): ContributionState {
  switch (event.type) {
    case 'SELECT_CONTRIBUTION_MODE':
      return {
        ...initialContributionState,
        mode: event.mode,
        effectiveRole: state.effectiveRole,
      }

    case 'SET_EFFECTIVE_ROLE':
      return {
        ...state,
        effectiveRole: event.role,
      }

    case 'SET_UPDATE_TARGET': {
      const version = safeLoadVersion(event.target)
      const existingYaml = safeLoadExistingYaml(event.target)
      const release = safeLoadRelease(event.target)

      return {
        ...state,
        updateTarget: event.target,

        // Resolved metadata
        version,
        release,

        // Reset downstream state
        uploadedYaml: null,
        existingYaml,

        updateType: null,
        updateTypeConfirmed: false,

        changelogDraft: null,
      }
    }

    case 'SET_UPLOADED_YAML':
      return {
        ...state,
        uploadedYaml: event.yaml,
        updateType: null,
        updateTypeConfirmed: false,
      }

    case 'SET_EXISTING_YAML':
      return {
        ...state,
        existingYaml: event.yaml,
      }

    case 'SET_UPDATE_TYPE':
      return {
        ...state,
        updateType: event.updateType,
        updateTypeConfirmed: false,
      }

    case 'CONFIRM_UPDATE_TYPE':
      return {
        ...state,
        updateTypeConfirmed: true,
      }

    case 'RESET_UPDATE_FORM_FLOW':
      return {
        ...state,

        // Fully reset everything downstream of target selection
        version: undefined,
        release: undefined,

        uploadedYaml: undefined,
        existingYaml: undefined,

        updateType: undefined,
        updateTypeConfirmed: false,

        changelogDraft: null,
      }

    /* ──────────────────────────────────────────────── */
    /* Changelog                                       */
    /* ──────────────────────────────────────────────── */

    case 'SET_CHANGELOG_DATE':
      return {
        ...state,
        changelogDraft: {
          date: event.date,
          changes: state.changelogDraft?.changes ?? [],
        },
      }

    case 'ADD_CHANGELOG_CHANGE':
      return {
        ...state,
        changelogDraft: {
          date: state.changelogDraft?.date ?? '',
          changes: [...(state.changelogDraft?.changes ?? []), event.change],
        },
      }

    case 'UPDATE_CHANGELOG_CHANGE':
      if (!state.changelogDraft) return state

      return {
        ...state,
        changelogDraft: {
          ...state.changelogDraft,
          changes: state.changelogDraft.changes.map((c, i) =>
            i === event.index ? { ...c, ...event.change } : c,
          ),
        },
      }

    case 'REMOVE_CHANGELOG_CHANGE':
      if (!state.changelogDraft) return state

      return {
        ...state,
        changelogDraft: {
          ...state.changelogDraft,
          changes: state.changelogDraft.changes.filter(
            (_, i) => i !== event.index,
          ),
        },
      }

    case 'RESET_CHANGELOG_DRAFT':
      return {
        ...state,
        changelogDraft: null,
      }

    case 'SET_CHANGELOG_BREAKING':
      return {
        ...state,
        changelogDraft: state.changelogDraft
          ? {
              ...state.changelogDraft,
              breaking: event.breaking,
            }
          : {
              date: '',
              changes: [],
              breaking: event.breaking,
            },
      }

    /* ──────────────────────────────────────────────── */
    /* Author Attribution                              */
    /* ──────────────────────────────────────────────── */

    case 'SET_AUTHOR_DRAFT_ID':
      return {
        ...state,
        authorDraftId: event.id,
        authorLookup: { status: 'idle' },
      }

    case 'AUTHOR_LOOKUP_START':
      return {
        ...state,
        authorLookup: { status: 'loading' },
      }

    case 'AUTHOR_LOOKUP_SUCCESS':
      return {
        ...state,
        author: event.author,
        authorDraftId: event.author.id,
        authorLookup: { status: 'resolved' },
      }

    case 'AUTHOR_LOOKUP_ERROR':
      return {
        ...state,
        authorLookup: {
          status: 'error',
          error: event.error,
        },
      }

    default:
      return state
  }
}
