/**
 * Service: analyzeYamlDiff
 * ─────────────────────────────────────────────────────────────
 *
 * Step 2.2.6
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

export type YamlUpdateSuggestion = 'version' | 'release'
export type YamlSuggestionConfidence = 'high' | 'medium' | 'low'

export interface YamlDiffAnalysis {
  stats: YamlDiffStats
  score: number

  // Existing shape kept
  suggestion: {
    value: YamlUpdateSuggestion
    reason: string
  }

  /**
   * Compatibility fields (YamlAnalysis.tsx already probes these keys):
   * - suggestionType / suggestionReason
   * - scorePct
   */
  suggestionType?: YamlUpdateSuggestion
  suggestionReason?: string
  scorePct?: number
}

function normalizeLines(text: string): string[] {
  return (text || '').replace(/\r\n/g, '\n').split('\n')
}

/**
 * Lightweight semantic weighting for YAML lines.
 * No parsing, deterministic, explainable.
 */
function classifyLineWeight(line: string): number {
  const l = line.trim()

  if (!l) return 0 // empty
  if (l.startsWith('#')) return 0 // comment

  if (/^(name|description|domain):/.test(l)) return 0.25
  if (/^input:/.test(l)) return 0.75
  if (/^selector:/.test(l)) return 0.75

  if (/^trigger:/.test(l)) return 1.5
  if (/^condition:/.test(l)) return 1.25
  if (/^action:/.test(l)) return 1.5
  if (/service:/.test(l)) return 1.5

  return 1
}

/**
 * LCS length (Longest Common Subsequence) for arrays of strings.
 * O(n*m) time and memory — acceptable for blueprint-sized YAML.
 */
function lcsLength(a: string[], b: string[]): number {
  const n = a.length
  const m = b.length

  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(m + 1).fill(0),
  )

  for (let i = 1; i <= n; i++) {
    const ai = a[i - 1]
    for (let j = 1; j <= m; j++) {
      if (ai === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }

  return dp[n][m]
}

function confidenceFromScore(score: number): YamlSuggestionConfidence {
  if (score <= 20 || score >= 60) return 'high'
  if (score <= 30 || score >= 45) return 'medium'
  return 'low'
}

export function analyzeYamlDiff(
  oldYaml: string,
  newYaml: string,
): YamlDiffAnalysis {
  const oldLines = normalizeLines(oldYaml)
  const newLines = normalizeLines(newYaml)

  const totalOld = oldLines.length
  const totalNew = newLines.length

  // LCS gives insertion/deletion resilience
  const common = lcsLength(oldLines, newLines)

  const removedRaw = totalOld - common
  const addedRaw = totalNew - common

  const changed = Math.min(removedRaw, addedRaw)
  const removed = removedRaw - changed
  const added = addedRaw - changed

  // Weighted impact
  const weightedOld = oldLines.reduce((s, l) => s + classifyLineWeight(l), 0)
  const weightedNew = newLines.reduce((s, l) => s + classifyLineWeight(l), 0)

  const weightedSurface = added * 1 + removed * 1 + changed * 1.25

  const baseline = Math.max(1, Math.max(weightedOld, weightedNew))
  const score = Math.round((weightedSurface / baseline) * 100)

  const confidence = confidenceFromScore(score)

  let suggestion: YamlDiffAnalysis['suggestion']

  if (score <= 20) {
    suggestion = {
      value: 'version',
      reason: `Minor, localized changes detected (${confidence} confidence)`,
    }
  } else if (score <= 40) {
    suggestion = {
      value: 'version',
      reason: `Moderate changes, likely backward-compatible (${confidence} confidence)`,
    }
  } else {
    suggestion = {
      value: 'release',
      reason: `Large or structural changes detected (${confidence} confidence)`,
    }
  }

  return {
    stats: {
      added,
      removed,
      changed,
      totalOld,
      totalNew,
    },
    score,

    // Primary result
    suggestion,

    // Compatibility fields
    suggestionType: suggestion.value,
    suggestionReason: suggestion.reason,
    scorePct: score,
  }
}
