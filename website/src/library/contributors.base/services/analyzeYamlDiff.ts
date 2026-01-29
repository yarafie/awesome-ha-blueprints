/**
 * Service: analyzeYamlDiff
 * ─────────────────────────────────────────────────────────────
 *
 * Purpose:
 *  - Deterministic, explainable YAML diff analysis
 *  - Heuristic guidance only (non-binding)
 *
 * Guarantees:
 *  - No filesystem access
 *  - No side effects
 *  - Stable output
 */

export interface YamlDiffStats {
  added: number
  removed: number
  changed: number
  totalOld: number
  totalNew: number
}

export interface YamlDiffSuggestion {
  value: 'version' | 'release'
  reason: string
}

export interface YamlDiffAnalysis {
  suggestion: YamlDiffSuggestion
  stats: YamlDiffStats
  score: number
}

function normalizeLines(text: string): string[] {
  return text.replace(/\r\n/g, '\n').split('\n')
}

export function analyzeYamlDiff(
  oldYaml: string,
  newYaml: string,
): YamlDiffAnalysis {
  const oldLines = normalizeLines(oldYaml)
  const newLines = normalizeLines(newYaml)

  const max = Math.max(oldLines.length, newLines.length)

  let added = 0
  let removed = 0
  let changed = 0

  for (let i = 0; i < max; i++) {
    const a = oldLines[i]
    const b = newLines[i]

    if (a === undefined && b !== undefined) added++
    else if (a !== undefined && b === undefined) removed++
    else if (a !== b) changed++
  }

  const totalOld = oldLines.length
  const totalNew = newLines.length

  const changeSurface = added + removed + changed

  // Heuristic baseline:
  // - prevents "0%" on small but real changes
  // - still scales for large refactors
  const baseline = Math.max(changed, Math.max(1, totalOld * 0.05))

  const score = Math.round((changeSurface / baseline) * 100)

  let suggestion: YamlDiffSuggestion

  if (score <= 15) {
    suggestion = {
      value: 'version',
      reason: 'Minor, localized changes',
    }
  } else if (score <= 40) {
    suggestion = {
      value: 'version',
      reason: 'Moderate changes, likely backward-compatible',
    }
  } else {
    suggestion = {
      value: 'release',
      reason: 'Large or structural changes detected',
    }
  }

  return {
    suggestion,
    stats: {
      added,
      removed,
      changed,
      totalOld,
      totalNew,
    },
    score,
  }
}
