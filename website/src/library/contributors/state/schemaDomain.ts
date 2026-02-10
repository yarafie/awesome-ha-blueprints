/**
 * schemaDomain.ts
 *
 * Single bridge between JSON Schemas and application code.
 * UI, reducers, and components MUST NOT hardcode schema-defined values.
 *
 * Shared structural fields (category, blueprint_id, library_id, release_id, version_id)
 * are intentionally NOT exported here.
 */

import releaseSchema from '@schemas/release.schema.json'
import versionSchema from '@schemas/version.schema.json'
import changelogSchema from '@schemas/changelog.schema.json'

/* ────────────────────────────── */
/* Release schema bindings        */
/* ────────────────────────────── */

export const RELEASE_STATUS_VALUES = releaseSchema.properties.status
  .enum as readonly string[]

export type ReleaseStatus = (typeof RELEASE_STATUS_VALUES)[number]

export const RELEASE_LIMITS = {
  ID_MAX: 64,
  TITLE_MAX: 120,
  DESCRIPTION_MAX: 500,
} as const

/* ────────────────────────────── */
/* Version schema bindings        */
/* ────────────────────────────── */

export const VERSION_STATUS_VALUES = versionSchema.properties.status
  .enum as readonly string[]

export type VersionStatus = (typeof VERSION_STATUS_VALUES)[number]

export const VERSION_LIMITS = {
  TITLE_MAX: 120,
  DESCRIPTION_MAX: 500,
} as const

// ADDITIVE — version.schema.json patterns
export const VERSION_VERSION_PATTERN = versionSchema.properties.version
  .pattern as string

export const VERSION_DATE_FORMAT = versionSchema.properties.date
  .format as string

/* ────────────────────────────── */
/* Changelog schema bindings      */
/* ────────────────────────────── */

export const CHANGE_TYPE_VALUES = changelogSchema.items.properties.changes.items
  .properties.type.enum as readonly string[]

export type ChangeType = (typeof CHANGE_TYPE_VALUES)[number]

export const CHANGELOG_LIMITS = {
  DESCRIPTION_MAX: 500,
} as const

// ADDITIVE — changelog.schema.json date pattern
export const CHANGELOG_DATE_PATTERN = changelogSchema.items.properties.date
  .pattern as string
