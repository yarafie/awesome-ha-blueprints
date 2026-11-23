import type { ControllerLocation, FormatResult } from './controllerFormat.mjs'

export interface PackageFile {
  path: string
  kind: 'text' | 'png' | 'pdf'
  text?: string
}

export interface PackagePerson {
  id: string
  name?: string
}

export interface PackageFields {
  author: PackagePerson
  manufacturer?: string
  model?: string
  tags?: string[]
  notes?: string
  hasPdf?: boolean
  blueprintId?: string
  library?: string
  release?: string
  version?: string
  supportedHooks?: string[]
  librarians?: PackagePerson[]
  originalAuthors?: PackagePerson[]
}

export interface PackageResult {
  ok: boolean
  check: FormatResult
  problems: string[]
  about: 'file' | 'details' | null
  location: ControllerLocation | null
  files: PackageFile[]
}

export function suggestBlueprintId(manufacturer: string, model: string): string

export function guessManufacturerAndModel(modelName?: string): {
  manufacturer: string
  model: string
}

export function todayAsVersion(date?: Date): string

export function buildControllerPackage(input: {
  yamlText: string
  fields: PackageFields
  existingIds?: string[]
}): PackageResult
