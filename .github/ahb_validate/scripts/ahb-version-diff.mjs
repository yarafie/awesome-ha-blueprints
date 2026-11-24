#!/usr/bin/env node
/* =========================================================
   AHB version diff (command line)
   ---------------------------------------------------------
   Shows what really changed between two versions of a blueprint.
   GitHub cannot show this: every version is a new file in a new
   folder, so a pull request lists the whole file as added.

   The two newest versions of a release:
     pnpm version-diff ikea_e2201
     pnpm version-diff ikea_e2001_e2002_e2313 EPMatt/awesome

   Two versions you name:
     pnpm version-diff ikea_e2001_e2002_e2313 EPMatt/awesome 2026.02.18 2026.11.23

   Any two versions, also across releases or blueprints, or two files:
     pnpm version-diff ikea_e2001_e2002_e2313/EPMatt/awesome/2026.02.18 \
                       ikea_e2001_e2002_e2313/EPMatt/zhae2002/2026.11.22
     pnpm version-diff old.yaml new.yaml

   Options:
     --all       also show the lines that differ only because of the
                 version or the location of the file (the "Version" line,
                 the links, source_url); they are hidden by default
     --summary   only the summary, not the changed lines

   The blueprint id is looked up under controllers, hooks and
   automations. The files are only read, never changed or run.

   Exit code: 0 = compared, 1 = not found, 2 = bad usage.
   ========================================================= */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import {
  compareVersions,
  normalizeLocation,
} from '../../../website/src/library/format/versionCompare.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(HERE, '..', '..', '..')
const BLUEPRINTS_DIR = path.join(REPO_ROOT, 'website', 'docs', 'blueprints')
const CATEGORIES = ['controllers', 'hooks', 'automations']
const VERSION_RE = /^\d{4}\.\d{2}\.\d{2}$/

const flags = new Set(process.argv.slice(2).filter((a) => a.startsWith('--')))
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'))

function usage(msg) {
  if (msg) console.error(`${msg}\n`)
  const text = fs.readFileSync(fileURLToPath(import.meta.url), 'utf8')
  const start = text.indexOf('AHB version diff')
  const end = text.indexOf('=====', start)
  console.error(text.slice(start, end).replace(/^ {3}/gm, '').trimEnd())
  process.exit(msg ? 2 : 0)
}

function notFound(msg) {
  console.error(msg)
  process.exit(1)
}

const dirs = (d) =>
  fs.existsSync(d)
    ? fs
        .readdirSync(d, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
        .sort()
    : []

// the folder of a blueprint id, whatever its category
function blueprintDir(id) {
  for (const category of CATEGORIES) {
    const dir = path.join(BLUEPRINTS_DIR, category, id)
    if (fs.existsSync(dir)) return { category, dir }
  }
  const all = CATEGORIES.flatMap((c) => dirs(path.join(BLUEPRINTS_DIR, c)))
  const near = all.filter((n) => n.includes(id) || id.includes(n)).slice(0, 8)
  notFound(
    `No blueprint with the id "${id}".${near.length ? `\nDid you mean: ${near.join(', ')}` : ''}`,
  )
}

// every library/release of a blueprint with its versions, oldest first
function releasesOf(dir) {
  const out = []
  for (const library of dirs(dir))
    for (const release of dirs(path.join(dir, library))) {
      const versions = dirs(path.join(dir, library, release)).filter((v) =>
        VERSION_RE.test(v),
      )
      if (versions.length) out.push({ library, release, versions })
    }
  return out
}

const listReleases = (releases) =>
  releases
    .map((r) => `  ${r.library}/${r.release}   ${r.versions.join('  ')}`)
    .join('\n')

// one side of the comparison: { label, file }
function versionFile(id, library, release, version) {
  const { category, dir } = blueprintDir(id)
  const file = path.join(dir, library, release, version, `${id}.yaml`)
  if (!fs.existsSync(file)) {
    const releases = releasesOf(dir)
    notFound(
      `Not found: ${id}/${library}/${release}/${version}\nThis blueprint has:\n${listReleases(releases)}`,
    )
  }
  return { label: `${category}/${id}/${library}/${release}/${version}`, file }
}

function fromSpec(spec) {
  if (fs.existsSync(spec) && fs.statSync(spec).isFile())
    return { label: spec, file: path.resolve(spec) }
  const parts = spec.split('/')
  if (parts.length !== 4)
    usage(
      `Cannot read "${spec}": it is neither a file nor <id>/<library>/<release>/<version>.`,
    )
  return versionFile(...parts)
}

/* ---------- which two versions ---------- */
if (flags.has('--help') || !args.length)
  usage(args.length ? '' : 'Nothing to compare.')
for (const f of flags)
  if (!['--all', '--summary', '--help'].includes(f))
    usage(`Unknown option ${f}`)

let oldSide
let newSide
const secondIsRelease =
  args[1] && args[1].split('/').length === 2 && !fs.existsSync(args[1])

if (args.length === 2 && !secondIsRelease) {
  oldSide = fromSpec(args[0])
  newSide = fromSpec(args[1])
} else if (args.length === 1 || args.length === 2 || args.length === 4) {
  const id = args[0]
  const { dir } = blueprintDir(id)
  const releases = releasesOf(dir)
  let chosen
  if (args[1]) {
    const [library, release] = args[1].split('/')
    chosen = releases.find(
      (r) => r.library === library && r.release === release,
    )
    if (!chosen)
      notFound(
        `"${id}" has no release ${args[1]}. It has:\n${listReleases(releases)}`,
      )
  } else if (releases.length === 1) chosen = releases[0]
  else
    notFound(
      `"${id}" has more than one release. Add the one you mean, for example:\n  pnpm version-diff ${id} ${releases[0].library}/${releases[0].release}\nIt has:\n${listReleases(releases)}`,
    )

  let oldVersion
  let newVersion
  if (args.length === 4) [oldVersion, newVersion] = [args[2], args[3]]
  else if (chosen.versions.length < 2)
    notFound(
      `${id}/${chosen.library}/${chosen.release} has only one version (${chosen.versions[0]}), so there is nothing to compare.\nTo compare with another release, name both versions in full:\n  pnpm version-diff <id>/<library>/<release>/<version> <id>/<library>/<release>/<version>\nThis blueprint has:\n${listReleases(releases)}`,
    )
  else [oldVersion, newVersion] = chosen.versions.slice(-2)
  oldSide = versionFile(id, chosen.library, chosen.release, oldVersion)
  newSide = versionFile(id, chosen.library, chosen.release, newVersion)
} else usage('Cannot read these arguments.')

/* ---------- compare ---------- */
const oldText = fs.readFileSync(oldSide.file, 'utf8')
const newText = fs.readFileSync(newSide.file, 'utf8')
const result = compareVersions(oldText, newText)

console.log('Comparing')
console.log(`  old: ${oldSide.label}`)
console.log(`  new: ${newSide.label}`)
console.log('')
console.log('Summary')
if (result.same) {
  console.log('  The two files are identical.')
  process.exit(0)
}
const { added, removed } = result.lines
console.log(
  `  lines:   ${added} added, ${removed} removed${added + removed === 0 ? '  (no real change)' : ''}`,
)
if (result.locationLines)
  console.log(
    `           ${result.locationLines} more differ only by version or location${flags.has('--all') ? '' : ' (hidden; --all shows them)'}`,
  )
if (result.inputs) {
  const show = (head, label, keys) =>
    console.log(
      `  ${head.padEnd(9)}${keys.length} ${label}${keys.length ? `: ${keys.join(', ')}` : ''}`,
    )
  show('inputs:', 'added', result.inputs.added)
  show('', 'removed', result.inputs.removed)
  show('', 'changed', result.inputs.changed)
} else
  console.log('  inputs:  not compared (one of the files is not a blueprint)')

if (flags.has('--summary')) process.exit(0)
if (added + removed === 0 && !flags.has('--all')) process.exit(0)

/* ---------- the changed lines ---------- */
// git draws the diff. Without --all it gets copies in which the version and
// location parts are replaced by placeholders, so only real changes show.
console.log('')
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ahb-version-diff-'))
try {
  const prepare = (side, text, name) => {
    const file = path.join(tmp, name, path.basename(side.file))
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, flags.has('--all') ? text : normalizeLocation(text))
    return path.relative(tmp, file)
  }
  const a = prepare(oldSide, oldText, 'old')
  const b = prepare(newSide, newText, 'new')
  const r = spawnSync(
    'git',
    [
      '--no-pager',
      'diff',
      '--no-index',
      '--no-prefix',
      process.stdout.isTTY ? '--color' : '--no-color',
      a,
      b,
    ],
    { cwd: tmp, stdio: 'inherit' },
  )
  if (r.error) {
    console.error(
      'git is needed to show the changed lines; the summary above is complete.',
    )
    process.exit(1)
  }
} finally {
  fs.rmSync(tmp, { recursive: true, force: true })
}
process.exit(0)
