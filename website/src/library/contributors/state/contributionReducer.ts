/**
 * Contribution Reducer
 * ────────────────────────────────────────────────────────────────
 *
 * Step 1:
 *  - Role selection
 *  - Mode selection
 *
 * Step 2.1:
 *  - Update target selection
 *
 * Step 2.2.1:
 *  - YAML upload (raw text only)
 *
 * Step 2.2.2:
 *  - Load existing YAML (raw text only)
 *
 * Step 2.2.3:
 *  - User-selected update type (Version vs Release)
 */

import type {
  ContributionState,
  ContributionEvent,
  UpdateBlueprintTarget,
} from './contributionTypes'

import { blueprintsContext, jsonContext } from '@site/src/utils/libraryContexts'

export const initialContributionState: ContributionState = {
  mode: null,
  effectiveRole: 'contributor',

  // Step 2.1
  updateTarget: undefined,

  // Step 2.2.1
  uploadedYaml: undefined,

  // Step 2.2.2
  existingYaml: undefined,

  // Step 2.2.3
  updateType: undefined,

  // Step 2.2.4 (ADDITIVE)
  updateTypeConfirmed: false,
}

// ────────────────────────────────────────────────────────────────
// Step 2.2.2 — Existing YAML loader (contributors.base methodology)
// ────────────────────────────────────────────────────────────────
//
// LOCKED RULE:
// Existing YAML is resolved ONLY via:
//   version.json → blueprint_file
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

function safeLoadExistingYaml(
  updateTarget: UpdateBlueprintTarget | null | undefined,
): string | null {
  if (!isUpdateTargetComplete(updateTarget)) return null

  const { category, blueprintId, libraryId, releaseId, version } = updateTarget

  try {
    const versionJsonPath = `./${category}/${blueprintId}/${libraryId}/${releaseId}/${version}/version.json`
    const versionJson = jsonContext(versionJsonPath) as {
      blueprint_file?: string
    }

    if (!versionJson?.blueprint_file) return null

    const yamlPath = `./${category}/${blueprintId}/${libraryId}/${releaseId}/${version}/${versionJson.blueprint_file}`
    return String(blueprintsContext(yamlPath))
  } catch {
    return null
  }
}

export function contributionReducer(
  state: ContributionState,
  event: ContributionEvent,
): ContributionState {
  switch (event.type) {
    case 'SELECT_CONTRIBUTION_MODE':
      return {
        ...state,
        mode: event.mode,

        // Reset downstream state when mode changes
        updateTarget: event.mode === 'update_blueprint' ? null : undefined,

        // Step 2.2.1
        uploadedYaml: undefined,

        // Step 2.2.2
        existingYaml: undefined,

        // Step 2.2.3
        updateType: undefined,

        // Step 2.2.4 (ADDITIVE)
        updateTypeConfirmed: false,
      }

    case 'SET_EFFECTIVE_ROLE':
      return {
        ...state,
        effectiveRole: event.role,
      }

    case 'SET_UPDATE_TARGET': {
      const existingYaml = safeLoadExistingYaml(event.target)

      return {
        ...state,
        updateTarget: event.target,

        // Reset YAML + update type when target changes
        uploadedYaml: null,
        updateType: null,

        // Step 2.2.4 (ADDITIVE)
        updateTypeConfirmed: false,

        // Step 2.2.2 — Deterministic local resolve/load
        existingYaml,
      }
    }

    case 'SET_UPLOADED_YAML':
      return {
        ...state,
        uploadedYaml: event.yaml,

        // Changing uploaded YAML invalidates downstream decisions
        updateType: null,

        // Step 2.2.4 (ADDITIVE)
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

        // Step 2.2.3 — Explicit user choice
        updateType: event.updateType,

        // Step 2.2.4 (ADDITIVE)
        updateTypeConfirmed: false,
      }

    // Step 2.2.4 — Explicit confirmation gate (ADDITIVE)
    case 'CONFIRM_UPDATE_TYPE':
      return {
        ...state,
        updateTypeConfirmed: true,
      }

    default:
      return state
  }
}
