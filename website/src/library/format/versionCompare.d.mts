export interface VersionComparison {
  same: boolean
  lines: { added: number; removed: number }
  locationLines: number
  inputs: { added: string[]; removed: string[]; changed: string[] } | null
}

export function normalizeLocation(text: string): string
export function compareVersions(
  oldText: string,
  newText: string,
): VersionComparison
