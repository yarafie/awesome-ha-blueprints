/**
 * Contribution Types
 * ────────────────────────────────────────────────────────────────
 *
 * Step 1:
 *  - Define contribution roles
 *  - Define contribution modes
 *  - Define base contribution state
 *
 * Step 2.1:
 *  - Define canonical update-blueprint target shape
 *
 * Step 2.2.1:
 *  - YAML upload (raw text only, no analysis)
 *
 * Step 2.2.2:
 *  - Load existing YAML (raw text only, no parsing)
 *
 * Step 2.2.3:
 *  - User-selected update type (Version vs Release)
 */

// ────────────────────────────────────────────────────────────────
// Step 1 — Roles & Modes
// ────────────────────────────────────────────────────────────────

export type ContributionRole = 'contributor' | 'maintainer'

export type ContributionMode =
  | 'update_blueprint'
  | 'new_controller'
  | 'new_hook'
  | 'new_automation'
  | 'update_website'

// ────────────────────────────────────────────────────────────────
// Step 2.1 — Update Blueprint Target
// ────────────────────────────────────────────────────────────────
//
// Mirrors filesystem structure exactly (LOCKED):
// <category>/<blueprint_id>/<library_id>/<release_id>/<version>/
export interface UpdateBlueprintTarget {
  category: 'controllers' | 'hooks' | 'automations'
  blueprintId: string
  libraryId: string
  releaseId: string
  version: string
}

// ────────────────────────────────────────────────────────────────
// Step 2.2.3 — Update Type (User Choice)
// ────────────────────────────────────────────────────────────────
//
// Determines whether the contribution results in:
//  - "version" → new version under existing release
//  - "release" → new release directory
//
// This may override heuristic suggestion from YAML analysis.
export type UpdateType = 'version' | 'release'

// ────────────────────────────────────────────────────────────────
// Contribution State
// ────────────────────────────────────────────────────────────────

export interface ContributionState {
  // Step 1
  mode: ContributionMode | null
  effectiveRole: ContributionRole

  // Step 2.1
  // - undefined → not applicable
  // - null      → applicable, selection not complete
  // - object    → fully resolved target
  updateTarget?: UpdateBlueprintTarget | null

  // Step 2.2.1 — Uploaded YAML
  // - undefined → not applicable
  // - null      → applicable, no YAML uploaded yet
  // - string    → raw uploaded YAML contents
  uploadedYaml?: string | null

  // Step 2.2.2 — Existing YAML
  // - undefined → not applicable
  // - null      → applicable, not loaded or failed to load
  // - string    → raw existing YAML contents
  existingYaml?: string | null

  // Step 2.2.3 — Update Type
  // - undefined → not applicable
  // - null      → applicable, not chosen yet
  // - value     → explicit user choice
  updateType?: UpdateType | null

  // Step 2.2.4 — Update Type Confirmation (ADDITIVE)
  // - false     → not confirmed yet
  // - true      → user explicitly confirmed choice
  updateTypeConfirmed?: boolean
}

// ────────────────────────────────────────────────────────────────
// Contribution Events
// ────────────────────────────────────────────────────────────────

export type ContributionEvent =
  | {
      type: 'SELECT_CONTRIBUTION_MODE'
      mode: ContributionMode
    }
  | {
      type: 'SET_EFFECTIVE_ROLE'
      role: ContributionRole
    }
  | {
      type: 'SET_UPDATE_TARGET'
      target: UpdateBlueprintTarget | null
    }
  | {
      // Step 2.2.1 — YAML upload
      type: 'SET_UPLOADED_YAML'
      yaml: string | null
    }
  | {
      // Step 2.2.2 — Existing YAML load
      type: 'SET_EXISTING_YAML'
      yaml: string | null
    }
  | {
      // Step 2.2.3 — User-selected update type
      type: 'SET_UPDATE_TYPE'
      updateType: UpdateType | null
    }
  | {
      // Step 2.2.4 — Explicit confirmation gate (ADDITIVE)
      type: 'CONFIRM_UPDATE_TYPE'
    }
