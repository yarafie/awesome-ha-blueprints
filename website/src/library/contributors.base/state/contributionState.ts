/**
 * Contribution State Contract – v1.2
 * ──────────────────────────────────────────────────────────
 *
 * Purpose:
 *  - Central reducer for contributor workflow state
 *  - Tracks contribution intent and uploaded YAML lifecycle
 *
 * Phase A:
 *  - Adds updateTarget for blueprint:update flows
 *
 * Notes:
 *  - Deterministic, side-effect free
 *  - Backward compatible with existing contribution types
 */

import { blueprintsContext, jsonContext } from '../../utils/libraryContexts'

export type ContributionType =
  | 'blueprint:new'
  | 'blueprint:update'
  | 'automation:new'
  | 'controller:new'
  | 'hook:new'

export type ContributionStatus =
  | 'idle'
  | 'yaml_required'
  | 'yaml_parsed'
  | 'error'

export interface UpdateTarget {
  category: 'automations' | 'controllers' | 'hooks' | null
  blueprintId: string | null
  libraryId: string | null
  releaseId: string | null
  version: string | null
}

export interface YamlDerivedPreview {
  name: string
  description: string
  raw: string | null
  fileName: string
}

export interface ContributionState {
  contribution: ContributionType | null
  status: ContributionStatus

  /** Parsed / uploaded YAML */
  yaml: YamlDerivedPreview | null

  /** Phase A: blueprint:update */
  updateTarget: UpdateTarget | null

  /** Existing YAML resolved from filesystem */
  existingYaml: string | null

  /** Side-by-side diff (-y style) */
  rawDiff: string | null

  error: string | null
}

export type ContributionEvent =
  | { type: 'SELECT_TYPE'; contribution: ContributionType }
  | { type: 'SET_UPDATE_TARGET'; target: UpdateTarget }
  | { type: 'YAML_UPLOADED'; payload: YamlDerivedPreview }
  | { type: 'YAML_ERROR'; error: string }
  | { type: 'RESET' }

export const initialContributionState: ContributionState = {
  contribution: null,
  status: 'idle',
  updateTarget: null,
  yaml: null,
  existingYaml: null,
  rawDiff: null,
  error: null,
}

/* ────────────────────────────────────────────────────────── */
/* Helpers                                                     */
/* ────────────────────────────────────────────────────────── */

function isUpdateTargetComplete(t: UpdateTarget | null): t is {
  category: string
  blueprintId: string
  libraryId: string
  releaseId: string
  version: string
} {
  return (
    !!t &&
    !!t.category &&
    !!t.blueprintId &&
    !!t.libraryId &&
    !!t.releaseId &&
    !!t.version
  )
}

/**
 * LOCKED RULE:
 * Existing YAML is resolved ONLY via:
 *   version.json → blueprint_file
 */
function safeLoadExistingYaml(
  updateTarget: UpdateTarget | null,
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

function sideBySideDiffY(oldText: string, newText: string, width = 80): string {
  const a = oldText.replace(/\r\n/g, '\n').split('\n')
  const b = newText.replace(/\r\n/g, '\n').split('\n')
  const max = Math.max(a.length, b.length)
  const out: string[] = []

  for (let i = 0; i < max; i++) {
    const left = a[i] ?? ''
    const right = b[i] ?? ''
    let sep = ' '
    if (left && !right) sep = '<'
    else if (!left && right) sep = '>'
    else if (left !== right) sep = '|'

    const l = left.length > width ? left.slice(0, width - 1) : left
    const r = right.length > width ? right.slice(0, width - 1) : right

    out.push(l.padEnd(width, ' ') + ' ' + sep + ' ' + r)
  }

  return out.join('\n')
}

/* ────────────────────────────────────────────────────────── */
/* Reducer                                                     */
/* ────────────────────────────────────────────────────────── */

export function contributionReducer(
  state: ContributionState,
  event: ContributionEvent,
): ContributionState {
  switch (event.type) {
    case 'SELECT_TYPE':
      return {
        ...initialContributionState,
        contribution: event.contribution,
        status: 'yaml_required',
      }

    case 'SET_UPDATE_TARGET':
      return {
        ...state,
        updateTarget: event.target,
        yaml: null,
        existingYaml: null,
        rawDiff: null,
        error: null,
      }

    case 'YAML_UPLOADED': {
      const proposedRaw = event.payload.raw || ''
      const existingYaml =
        state.contribution === 'blueprint:update'
          ? safeLoadExistingYaml(state.updateTarget)
          : null

      const rawDiff =
        existingYaml && proposedRaw
          ? sideBySideDiffY(existingYaml, proposedRaw)
          : null

      return {
        ...state,
        status: 'yaml_parsed',
        yaml: event.payload,
        existingYaml,
        rawDiff,
        error: null,
      }
    }

    case 'YAML_ERROR':
      return {
        ...state,
        status: 'error',
        error: event.error,
      }

    case 'RESET':
      return initialContributionState

    default:
      return state
  }
}
