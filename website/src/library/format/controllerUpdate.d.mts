import type { FormatResult } from './controllerFormat.mjs'
import type { VersionComparison } from './versionCompare.mjs'

export interface VersionRef {
  library: string
  release: string
  version: string
}

export interface ExistingVersion extends VersionRef {
  text: string
}

export interface UpdateFields {
  author: { id: string }
  kind: 'fix' | 'improvement'
  description: string
  breaking?: boolean
  version?: string
}

export interface UpdateResult {
  ok: boolean
  problems: string[]
  about: 'file' | 'details' | null
  notes: string[]
  check: FormatResult | null
  comparison: VersionComparison | null
  closest: (VersionRef & { changes: number }) | null
  suggestBreaking: boolean
  location: (VersionRef & { id: string }) | null
  baseCopy: { path: string; text: string } | null
  files: { path: string; text: string }[]
}

export function embeddedVersion(text: string): string | null
export function buildControllerUpdate(input: {
  yamlText: string
  id: string
  base: VersionRef
  versions: ExistingVersion[]
  changelogText?: string
  manifestText?: string
  fields: UpdateFields
}): UpdateResult
