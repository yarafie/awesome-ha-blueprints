/* =========================================================
   Version comparison (shared)
   ---------------------------------------------------------
   Compares two versions of a blueprint as text. Used by the
   command line (ahb-version-diff.mjs) and meant for the
   "update a blueprint" flow of the Contributors page.

   Nothing here touches the file system or runs the blueprints:
   the YAML is only read.

   normalizeLocation(text)
     Every version carries a few lines that differ only because
     of where the file lives: the "Version" line and the links
     that contain library / release / version. This replaces
     those parts with fixed placeholders, so that such lines no
     longer show up as changes.

   compareVersions(oldText, newText)
     -> {
          same:          true when the files are identical
          lines:         { added, removed }   real changes
          locationLines: lines that differ only by version/location
          inputs:        { added: [], removed: [], changed: [] }
                         null when one of the files cannot be read
                         as a blueprint
        }
   ========================================================= */
import YAML from 'yaml'

const LOCATION_RE =
  /(blueprints\/(?:controllers|hooks|automations)\/[a-z0-9_]+)\/[A-Za-z0-9_-]+\/[a-z0-9_]+\/\d{4}\.\d{2}\.\d{2}/g
const VERSION_LINE_RE = /(Version )\d{4}\.\d{2}\.\d{2}/g

export function normalizeLocation(text) {
  return String(text)
    .replace(LOCATION_RE, '$1/<library>/<release>/<version>')
    .replace(VERSION_LINE_RE, '$1<version>')
}

// number of lines only in a and only in b (longest common subsequence)
function countChanges(a, b) {
  let start = 0
  while (start < a.length && start < b.length && a[start] === b[start]) start++
  let endA = a.length
  let endB = b.length
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--
    endB--
  }
  const x = a.slice(start, endA)
  const y = b.slice(start, endB)
  let prev = new Int32Array(y.length + 1)
  let cur = new Int32Array(y.length + 1)
  for (let i = 1; i <= x.length; i++) {
    for (let j = 1; j <= y.length; j++)
      cur[j] =
        x[i - 1] === y[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1])
    ;[prev, cur] = [cur, prev]
  }
  const common = prev[y.length]
  return { removed: x.length - common, added: y.length - common }
}

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

// every input of a blueprint by key, sections included
function readInputs(text) {
  let doc
  try {
    doc = YAML.parse(text, { logLevel: 'error' })
  } catch {
    return null
  }
  if (!isObj(doc) || !isObj(doc.blueprint)) return null
  const out = new Map()
  const walk = (input) => {
    for (const [key, def] of Object.entries(input || {})) {
      if (isObj(def) && isObj(def.input)) walk(def.input)
      else out.set(key, JSON.stringify(def ?? {}))
    }
  }
  walk(doc.blueprint.input)
  return out
}

export function compareVersions(oldText, newText) {
  const oldLines = String(oldText).split('\n')
  const newLines = String(newText).split('\n')
  const raw = countChanges(oldLines, newLines)
  const lines = countChanges(
    oldLines.map(normalizeLocation),
    newLines.map(normalizeLocation),
  )

  let inputs = null
  const before = readInputs(oldText)
  const after = readInputs(newText)
  if (before && after) {
    inputs = {
      added: [...after.keys()].filter((k) => !before.has(k)),
      removed: [...before.keys()].filter((k) => !after.has(k)),
      changed: [...after.keys()].filter(
        (k) => before.has(k) && before.get(k) !== after.get(k),
      ),
    }
  }

  return {
    same: oldText === newText,
    lines,
    locationLines: Math.max(
      raw.added - lines.added,
      raw.removed - lines.removed,
    ),
    inputs,
  }
}
