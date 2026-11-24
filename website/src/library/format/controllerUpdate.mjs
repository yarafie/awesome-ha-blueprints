/* =========================================================
   Controller update builder (shared)
   ---------------------------------------------------------
   Builds a NEW VERSION of a controller that is already in the
   library, from the contributor's YAML and a few answers. Used
   by the command line (ahb-contribute.mjs) and meant for the
   Contributors page.

   Nothing here touches the file system or runs the blueprint:
   the YAML is only read and edited as text.

   The contributor states which existing version the file is
   BASED ON. That version is never assumed to be the newest one.
   The new version is added to the same library and release as
   the base.

   buildControllerUpdate({
     yamlText       the contributor's YAML
     id             blueprint id, e.g. 'ikea_e2201'
     base           { library, release, version } the stated base
     versions       every existing version of this blueprint:
                    [{ library, release, version, text }]
     changelogText  changelog.json of the base's release
     manifestText   manifest.yaml of the blueprint
     fields         {
       author:       { id }        GitHub user who submits
       kind:         'fix' | 'improvement'
       description:  one line for the changelog
       breaking:     true when existing automations must be changed
       version:      optional, defaults to today (YYYY.MM.DD)
     }
   })

   result {
     ok          true when the new version can be written
     problems    [text]  what stops it
     about       'file' | 'details' | null   where the problems are
     notes       [text]  things to confirm; they do not stop it
     check       result of the format check on the finished file
     comparison  the finished file against the stated base
     closest     { library, release, version, changes } the existing
                 version the file resembles most
     suggestBreaking  true when an input was removed
     location    { id, library, release, version } of the new version
     baseCopy    { path, text }  the base, unchanged, at the new path
     files       [{ path, text }]  the new version and the changelog
   }

   baseCopy and files allow two commits back to back: first the base
   copied to the new folder without changes, then the update on top,
   so that the second commit shows what really changed.
   ========================================================= */
import YAML from 'yaml'
import { checkControllerYaml } from './controllerFormat.mjs'
import { finalizeControllerYaml, todayAsVersion } from './controllerPackage.mjs'
import { compareVersions } from './versionCompare.mjs'

const VERSION_RE = /^\d{4}\.\d{2}\.\d{2}$/
const USER_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/
const KINDS = { fix: '[Bug Fix]', improvement: '[Enhancement]' }

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
const label = (v) => `${v.library}/${v.release}/${v.version}`
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// The version a file says it is, read from its "Version" line.
export function embeddedVersion(text) {
  const m = /^\s*ℹ️ Version (\d{4}\.\d{2}\.\d{2})\s*$/m.exec(String(text))
  return m ? m[1] : null
}

// A file that was copied from the library still carries the lines of its old
// location. This points them to the new one. Returns { text, changed }.
function relocate(text, loc) {
  const pathRe = new RegExp(
    `(blueprints/controllers/${escapeRe(loc.id)})/[A-Za-z0-9_-]+/[a-z0-9_]+/\\d{4}\\.\\d{2}\\.\\d{2}`,
    'g',
  )
  let changed = 0
  const out = String(text)
    .replace(pathRe, (_, head) => {
      changed++
      return `${head}/${loc.library}/${loc.release}/${loc.version}`
    })
    .replace(/^(\s*ℹ️ Version )\d{4}\.\d{2}\.\d{2}(\s*)$/m, (_, a, b) => {
      changed++
      return `${a}${loc.version}${b}`
    })
  return { text: out, changed }
}

function usesHooks(manifestText, base) {
  try {
    const m = YAML.parse(manifestText || '')
    const hooks =
      m?.libraries?.[base.library]?.releases?.[base.release]?.supported_hooks
    return Array.isArray(hooks) && hooks.some((h) => h && h !== 'none')
  } catch {
    return false
  }
}

function appendChangelog(changelogText, entry) {
  let list
  try {
    list = JSON.parse(changelogText)
  } catch {
    return { problem: 'the changelog of this release cannot be read' }
  }
  if (!Array.isArray(list))
    return { problem: 'the changelog of this release cannot be read' }
  if (list.some((e) => isObj(e) && e.date === entry.date))
    return {
      problem: `the changelog already has an entry for ${entry.date}`,
    }
  const added = JSON.stringify([entry], null, 2)
    .split('\n')
    .slice(1, -1)
    .join('\n')
  const body = changelogText.replace(/\s*\]\s*$/, '')
  if (body === changelogText || !list.length)
    return { text: `${JSON.stringify([...list, entry], null, 2)}\n` }
  return { text: `${body},\n${added}\n]\n` }
}

export function buildControllerUpdate({
  yamlText,
  id,
  base,
  versions = [],
  changelogText = '[]',
  manifestText = '',
  fields = {},
}) {
  const problems = []
  const details = []
  const notes = []
  const result = (extra = {}) => ({
    ok: false,
    problems: [...problems, ...details],
    about: problems.length ? 'file' : details.length ? 'details' : null,
    notes,
    check: null,
    comparison: null,
    closest: null,
    suggestBreaking: false,
    location: null,
    baseCopy: null,
    files: [],
    ...extra,
  })

  // ---- the stated base
  const baseVersion = versions.find(
    (v) =>
      v.library === base?.library &&
      v.release === base?.release &&
      v.version === base?.version,
  )
  if (!baseVersion) {
    problems.push(
      `the version this update is based on was not found: ${base ? label(base) : 'none given'}`,
    )
    return result()
  }
  const inRelease = versions
    .filter((v) => v.library === base.library && v.release === base.release)
    .map((v) => v.version)
    .sort()
  const newest = inRelease[inRelease.length - 1]

  // ---- the new version
  const version = String(fields.version || todayAsVersion()).trim()
  if (!VERSION_RE.test(version))
    details.push(`the version "${version}" must look like YYYY.MM.DD`)
  else if (version <= newest)
    details.push(
      `${base.library}/${base.release} already has version ${newest}; a new version must be newer than that, and ${version} is not`,
    )
  const location = { id, library: base.library, release: base.release, version }

  // ---- the file
  const text = String(yamlText).replace(/\r\n/g, '\n')
  const carries = {
    version: embeddedVersion(text) !== null,
    moreInfo: /^\s*## More Info\s*$/m.test(text),
    sourceUrl: /^ {2}source_url:/m.test(text),
  }
  const carried = Object.values(carries).filter(Boolean).length
  let finished = null
  if (carried === 3) {
    finished = relocate(text, location).text
  } else if (carried === 0) {
    const done = finalizeControllerYaml(text, location, {
      hooks: usesHooks(manifestText, base),
    })
    if (done.problems) problems.push(...done.problems)
    else finished = done.text
  } else {
    problems.push(
      'the file has only some of the lines that are filled in for you (the "ℹ️ Version" line, the "## More Info" block, `source_url`); keep all three as they are in the library version, or remove all three',
    )
  }
  if (finished === null) return result({ location })

  // ---- format check on the finished file
  const baseCheck = checkControllerYaml(baseVersion.text)
  const check = checkControllerYaml(finished, { location })
  if (check.status === 'legacy')
    problems.push(
      'this file uses the older "integration dropdown" format; an update must convert the controller to the Controller YAML format',
    )
  else if (check.status === 'free-form' && baseCheck.status !== 'free-form')
    problems.push(
      'this file has neither a `controller_device` input nor an `actions_mapping`, but the version it is based on is a controller on the standard layout',
    )
  // an error that the base version already has is still to be fixed (a
  // blueprint is brought up to the format when it is updated), but it is
  // marked, so the contributor knows it does not come from their change
  const inherited = new Set(
    checkControllerYaml(baseVersion.text, {
      location: { id, ...base },
    }).errors.map((e) => `${e.rule} ${e.msg}`),
  )
  for (const e of check.errors)
    problems.push(
      `${e.rule}  ${e.msg}${inherited.has(`${e.rule} ${e.msg}`) ? ' (already so in the version you based this on)' : ''}`,
    )

  // ---- against the stated base, and against every other version
  const comparison = compareVersions(baseVersion.text, finished)
  if (comparison.lines.added + comparison.lines.removed === 0)
    problems.push(
      `the file does not differ from ${label(base)}, apart from its version and location`,
    )
  let closest = null
  for (const v of versions) {
    const c = compareVersions(v.text, finished)
    const changes = c.lines.added + c.lines.removed
    if (!closest || changes < closest.changes)
      closest = {
        library: v.library,
        release: v.release,
        version: v.version,
        changes,
      }
  }
  const baseChanges = comparison.lines.added + comparison.lines.removed
  if (closest && closest.changes < baseChanges)
    notes.push(
      `you stated ${label(base)} as the base (${baseChanges} lines differ), but the file is closer to ${label(closest)} (${closest.changes} lines differ)`,
    )
  const own = embeddedVersion(text)
  if (own && own !== base.version)
    notes.push(
      `the file's own "Version" line says ${own}, but you stated ${base.version} as the base`,
    )
  const newer = inRelease.filter((v) => v > base.version)
  if (newer.length)
    notes.push(
      `${base.library}/${base.release} has ${newer.length === 1 ? 'a newer version' : 'newer versions'} than your base (${newer.join(', ')}); ${newer.length === 1 ? 'its' : 'their'} changes are not in your file unless you added them yourself`,
    )
  const before = baseCheck.info?.integrations || []
  const after = check.info?.integrations || []
  if (before.join() !== after.join() && after.length)
    notes.push(
      `the supported integrations change from ${before.join(', ') || 'none'} to ${after.join(', ')}; manifest.yaml is not updated for you and needs the same change`,
    )

  // ---- the answers
  const author = String(fields.author?.id || '').trim()
  if (!USER_RE.test(author))
    details.push(`"${author}" is not a valid GitHub user name`)
  const kind = KINDS[fields.kind]
  if (!kind) details.push('say whether this is a fix or an improvement')
  let description = String(fields.description || '')
    .replace(/\s+/g, ' ')
    .trim()
  if (description.length < 10)
    details.push(
      'the description for the changelog is missing or too short: say in one line what changed',
    )
  else if (!/[.!?)]$/.test(description)) description += '.'

  // ---- changelog
  let changelog = null
  if (kind && !details.length) {
    const done = appendChangelog(changelogText, {
      date: version,
      changes: [
        {
          author: `@${author}`,
          description: `${kind} ${description} ([@${author}](https://github.com/${author}))`,
          breaking: Boolean(fields.breaking),
        },
      ],
    })
    if (done.problem) details.push(done.problem)
    else changelog = done.text
  }

  const dir = `controllers/${id}/${base.library}/${base.release}`
  const yamlPath = `${dir}/${version}/${id}.yaml`
  const ok = !problems.length && !details.length && changelog !== null
  return result({
    ok,
    check,
    comparison,
    closest,
    suggestBreaking: Boolean(comparison.inputs?.removed.length),
    location,
    baseCopy: ok ? { path: yamlPath, text: baseVersion.text } : null,
    files: ok
      ? [
          { path: yamlPath, text: finished },
          { path: `${dir}/changelog.json`, text: changelog },
        ]
      : [],
  })
}
