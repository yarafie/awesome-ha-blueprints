/**
 * Contribution State Contract – v2 (YAML + Blueprint Metadata UI)
 * ────────────────────────────────────────────────────────────────
 *
 * Phase 1:
 *  - auth + type selection
 *
 * Phase 2:
 *  - YAML upload + parse
 *
 * Phase 3 (this file supports):
 *  - YAML parsed -> Blueprint metadata UI
 *
 * IMPORTANT:
 *  - Pure logic only (no UI, no IO, no backend)
 */

export type ContributionType =
  | 'automation:new'
  | 'controller:new'
  | 'hook:new'
  | 'blueprint:update'

export type ContributionStatus =
  | 'idle'
  | 'configured'
  | 'yaml_required'
  | 'yaml_parsed'
  | 'error'

/**
 * Minimal YAML-derived payload used by UI.
 * (We keep it light; deeper parsing can evolve later.)
 */
export interface YamlDerivedPreview {
  name: string | null
  domain: string | null
  description: string | null
  inputs: string[]
  raw: string | null
  fileName: string | null
}

export interface ContributionState {
  status: ContributionStatus
  type: ContributionType | null
  yaml: YamlDerivedPreview | null
  error: string | null
}

export type ContributionEvent =
  | { type: 'SELECT_TYPE'; contribution: ContributionType }
  | { type: 'YAML_UPLOADED'; payload: YamlDerivedPreview }
  | { type: 'YAML_ERROR'; error: string }
  | { type: 'RESET' }

export const initialContributionState: ContributionState = {
  status: 'idle',
  type: null,
  yaml: null,
  error: null,
}

export function contributionReducer(
  state: ContributionState,
  event: ContributionEvent,
): ContributionState {
  switch (event.type) {
    case 'SELECT_TYPE': {
      // Phase 2 entry rule: any new contribution requires YAML first
      return {
        status: 'yaml_required',
        type: event.contribution,
        yaml: null,
        error: null,
      }
    }

    case 'YAML_UPLOADED': {
      return {
        status: 'yaml_parsed',
        type: state.type,
        yaml: event.payload,
        error: null,
      }
    }

    case 'YAML_ERROR': {
      return {
        status: 'error',
        type: state.type,
        yaml: null,
        error: event.error,
      }
    }

    case 'RESET': {
      return initialContributionState
    }

    default:
      return state
  }
}
