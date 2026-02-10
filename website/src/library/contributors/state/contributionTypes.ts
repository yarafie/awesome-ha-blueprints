/**
 * Contribution Types
 * ────────────────────────────────────────────────────────────────
 *
 * Step 1:
 *  - Define contribution roles
 *  - Define contribution modes
 *
 * Step 2.1:
 *  - Canonical update-blueprint target
 *
 * Step 2.2:
 *  - YAML upload
 *  - Update type selection
 *
 * Step H.2:
 *  - Author attribution & override
 */

import type { ChangeType, ReleaseStatus, VersionStatus } from './schemaDomain'

//
// ────────────────────────────────────────────────────────────────
// Step 1 — Roles & Modes
// ────────────────────────────────────────────────────────────────
//

export type ContributionRole = 'contributor' | 'maintainer'

export type ContributionMode =
  | 'update_blueprint'
  | 'new_controller'
  | 'new_hook'
  | 'new_automation'
  | 'update_website'

//
// ────────────────────────────────────────────────────────────────
// Step 2.1 — Update Blueprint Target
// ────────────────────────────────────────────────────────────────
//

export interface UpdateBlueprintTarget {
  category: 'controllers' | 'hooks' | 'automations'
  blueprintId: string
  libraryId: string
  releaseId: string
  version: string
}

//
// ────────────────────────────────────────────────────────────────
// Step 2.2 — Update Type
// ────────────────────────────────────────────────────────────────
//

export type UpdateType = 'version' | 'release'

//
// ────────────────────────────────────────────────────────────────
// Step 2.2.x — Release Metadata (release.json)
// ────────────────────────────────────────────────────────────────
//

export interface ReleaseMaintainer {
  id: string
  name: string
  url?: string
}

export interface ExternalReference {
  label: string
  url: string
}

/**
 * Canonical release.json record
 * (schemas/release.schema.json)
 */
export interface ReleaseRecord {
  release_id: string
  library_id: string
  blueprint_id: string
  category: 'controllers' | 'hooks' | 'automations'

  title: string
  description: string

  maintainers: ReleaseMaintainer[]

  versions: string[]
  latest_version: string

  status: ReleaseStatus

  supported_hooks?: string[]
  supported_controllers?: {
    controllers: string[]
    count: number
  }
  supported_integrations?: string[]

  external_references?: ExternalReference[]
}

//
// ────────────────────────────────────────────────────────────────
// Step 2.2.x — Version Metadata (version.json)
// ────────────────────────────────────────────────────────────────
//

/**
 * Canonical version.json record
 * (schemas/version.schema.json)
 */
export interface VersionRecord {
  category: 'controllers' | 'hooks' | 'automations'
  blueprint_id: string
  library_id: string
  release_id: string

  version: string
  date: string

  title: string
  description: string

  maintainers: ReleaseMaintainer[]

  blueprint_file: string

  breaking?: boolean

  changes?: {
    description: string
    breaking?: boolean
  }[]

  external_references?: ExternalReference[]

  status: VersionStatus
}

//
// ────────────────────────────────────────────────────────────────
// Step 2.2.y — Changelog (changelog.json)
// ────────────────────────────────────────────────────────────────
//

export interface ChangelogExternalReference {
  label: string
  url: string
}

export interface ChangelogChange {
  author: string
  description: string
  type?: ChangeType
  breaking?: boolean
  external_references?: ChangelogExternalReference[]
}

export interface ChangelogEntry {
  /** YYYY.MM.DD */
  date: string
  changes: ChangelogChange[]
  breaking?: boolean
}

//
// ────────────────────────────────────────────────────────────────
// Step H.2 — Author Attribution
// ────────────────────────────────────────────────────────────────
//

export interface AuthorAttribution {
  id: string
  name: string
  avatarUrl?: string
  profileUrl?: string
}

export type AuthorLookupStatus = 'idle' | 'loading' | 'resolved' | 'error'

export interface AuthorLookupState {
  status: AuthorLookupStatus
  error?: string
}

//
// ────────────────────────────────────────────────────────────────
// Contribution State
// ────────────────────────────────────────────────────────────────
//

export interface ContributionState {
  // Step 1
  mode: ContributionMode | null
  effectiveRole: ContributionRole

  // Step 2.1
  updateTarget?: UpdateBlueprintTarget | null

  // Step 2.1.x — Resolved Release Metadata
  release?: ReleaseRecord | null

  // Step 2.2.x — Resolved Version Metadata
  version?: VersionRecord | null

  // Step 2.2.1 — Uploaded YAML
  uploadedYaml?: string | null

  // Step 2.2.2 — Existing YAML
  existingYaml?: string | null

  // Step 2.2.3 — Update Type
  updateType?: UpdateType | null

  // Step 2.2.4 — Confirmation gate
  updateTypeConfirmed?: boolean

  // Step 2.2.y — Changelog Draft
  changelogDraft?: ChangelogEntry | null

  // Step H.2 — Author Attribution
  author: AuthorAttribution | null
  authorDraftId: string
  authorLookup: AuthorLookupState
}

//
// ────────────────────────────────────────────────────────────────
// Contribution Events
// ────────────────────────────────────────────────────────────────
//

export type ContributionEvent =
  | { type: 'SELECT_CONTRIBUTION_MODE'; mode: ContributionMode }
  | { type: 'SET_EFFECTIVE_ROLE'; role: ContributionRole }
  | { type: 'SET_UPDATE_TARGET'; target: UpdateBlueprintTarget | null }
  | { type: 'SET_UPLOADED_YAML'; yaml: string | null }
  | { type: 'SET_EXISTING_YAML'; yaml: string | null }
  | { type: 'SET_UPDATE_TYPE'; updateType: UpdateType | null }
  | { type: 'CONFIRM_UPDATE_TYPE' }

  // ───────── Step 2.2.5 — Flow Reset ─────────
  | { type: 'RESET_UPDATE_FORM_FLOW' }

  // ───────── Step 2.2.y — Changelog ─────────
  | { type: 'SET_CHANGELOG_DATE'; date: string }
  | { type: 'ADD_CHANGELOG_CHANGE'; change: ChangelogChange }
  | {
      type: 'UPDATE_CHANGELOG_CHANGE'
      index: number
      change: Partial<ChangelogChange>
    }
  | { type: 'REMOVE_CHANGELOG_CHANGE'; index: number }
  | { type: 'RESET_CHANGELOG_DRAFT' }
  | { type: 'SET_CHANGELOG_BREAKING'; breaking: boolean }

  // ───────── Step H.2 — Author Attribution ─────────
  | { type: 'SET_AUTHOR_DRAFT_ID'; id: string }
  | { type: 'AUTHOR_LOOKUP_START' }
  | { type: 'AUTHOR_LOOKUP_SUCCESS'; author: AuthorAttribution }
  | { type: 'AUTHOR_LOOKUP_ERROR'; error: string }
