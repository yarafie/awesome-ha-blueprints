#!/usr/bin/env node
/* =========================================================
   AHB controller format checker
   ---------------------------------------------------------
   Checks a controller blueprint YAML against the controller
   YAML format (rules C-01 .. C-55) and reports every rule
   the file breaks, in plain words.

   Usage:
     node ahb-check-controller-format.mjs --all
     node ahb-check-controller-format.mjs <file.yaml> [...]
     node ahb-check-controller-format.mjs --submission <file.yaml>

   Options:
     --all             newest version of every controller release
     --submission      the file is a contributor's submission: the
                       version line, links and source_url are written
                       by the intake, so they are not checked
     --include-legacy  also check the older "integration dropdown"
                       controllers (skipped by default)
     --info            print what was read from each file
     --json            machine-readable output
     --strict          warnings also make the run fail

   Exit code: 0 = no errors, 1 = errors found, 2 = bad usage.
   ========================================================= */
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { checkControllerYaml } from '../../../website/src/library/format/controllerFormat.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(HERE, '..', '..', '..')
const CONTROLLERS_DIR = path.join(
  REPO_ROOT,
  'website',
  'docs',
  'blueprints',
  'controllers',
)

/* ---------- where does the file live? ---------- */
function locate(file) {
  const rel = path.relative(CONTROLLERS_DIR, path.resolve(file))
  const p = rel.split(path.sep)
  if (rel.startsWith('..') || p.length !== 5) return null
  const [id, library, release, version, base] = p
  if (!/^\d{4}\.\d{2}\.\d{2}$/.test(version) || base !== `${id}.yaml`)
    return null
  return { id, library, release, version }
}

function newestVersionFiles() {
  const out = []
  const dirs = (d) =>
    fs
      .readdirSync(d, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort()
  for (const id of dirs(CONTROLLERS_DIR)) {
    for (const library of dirs(path.join(CONTROLLERS_DIR, id))) {
      for (const release of dirs(path.join(CONTROLLERS_DIR, id, library))) {
        const rd = path.join(CONTROLLERS_DIR, id, library, release)
        const versions = dirs(rd).filter((v) => /^\d{4}\.\d{2}\.\d{2}$/.test(v))
        if (!versions.length) continue
        const f = path.join(rd, versions[versions.length - 1], `${id}.yaml`)
        if (fs.existsSync(f)) out.push(f)
      }
    }
  }
  return out
}

function checkFile(file, opts) {
  const location = opts.submission ? null : locate(file)
  const res = checkControllerYaml(fs.readFileSync(file, 'utf8'), {
    location,
    includeLegacy: opts.includeLegacy,
  })
  return { file: path.relative(process.cwd(), file), ...res }
}

/* =========================================================
   Entry
   ========================================================= */
const args = process.argv.slice(2)
const flags = new Set(args.filter((a) => a.startsWith('--')))
const known = [
  '--all',
  '--submission',
  '--include-legacy',
  '--info',
  '--json',
  '--strict',
]
const badFlag = [...flags].find((f) => !known.includes(f))
let files = args.filter((a) => !a.startsWith('--'))
if (badFlag || (!files.length && !flags.has('--all'))) {
  console.error(
    `${badFlag ? `Unknown option ${badFlag}\n` : ''}Usage: ahb-check-controller-format.mjs [--all | <file.yaml> ...] [--submission] [--include-legacy] [--info] [--json] [--strict]`,
  )
  process.exit(2)
}
if (flags.has('--all')) files = files.concat(newestVersionFiles())

const opts = {
  submission: flags.has('--submission'),
  includeLegacy: flags.has('--include-legacy'),
}
const json = flags.has('--json')
const results = []
files.forEach((f, i) => {
  if (!json)
    process.stdout.write(
      `[${i + 1}/${files.length}] ${path.relative(process.cwd(), f)}\n`,
    )
  const r = fs.existsSync(f)
    ? checkFile(f, opts)
    : {
        file: f,
        status: 'checked',
        errors: [{ rule: 'C-01', msg: 'file not found' }],
        warnings: [],
        info: {},
      }
  results.push(r)
  if (json) return
  if (r.status === 'legacy')
    console.log(
      '      skipped: older "integration dropdown" format (use --include-legacy to check it)',
    )
  else if (r.status === 'free-form' && !r.errors.length)
    console.log(
      '      ok: free-form blueprint (no controller layout), only the header is checked',
    )
  else if (!r.errors.length && !r.warnings.length) console.log('      ok')
  if (r.status === 'checked' && r.info.sends_hook_events === false)
    console.log(
      '      note: sends no `ahb_controller_event`, so it is a controller without hooks',
    )
  for (const e of r.errors) console.log(`      ERROR   ${e.rule}  ${e.msg}`)
  for (const w of r.warnings) console.log(`      warning ${w.rule}  ${w.msg}`)
  if (flags.has('--info') && r.status === 'checked') {
    const n = r.info
    console.log(`      read: name            ${n.name ?? '-'}`)
    console.log(
      `      read: integrations    ${(n.integrations || []).join(', ') || '-'}`,
    )
    console.log(
      `      read: manufacturers   ${(n.manufacturers || []).join(', ') || '-'}`,
    )
    console.log(`      read: events          ${(n.events || []).length}`)
    console.log(
      `      read: hooks           ${n.sends_hook_events ? 'sends hook events' : 'no hook events'}`,
    )
    console.log(
      `      read: features        ${
        Object.entries(n.features || {})
          .filter(([, v]) => v)
          .map(([k]) => k)
          .join(', ') || 'none'
      }`,
    )
    console.log(
      `      read: reference links ${(n.reference_links || []).length}`,
    )
  }
})

const checked = results.filter((r) => r.status === 'checked')
const failed = results.filter((r) => r.errors.length)
const warned = results.filter((r) => !r.errors.length && r.warnings.length)
if (json) {
  console.log(JSON.stringify(results, null, 2))
} else {
  console.log('')
  console.log(`Files:            ${results.length}`)
  console.log(`  checked:        ${checked.length}`)
  console.log(
    `  free-form:      ${results.filter((r) => r.status === 'free-form').length}`,
  )
  console.log(
    `  legacy skipped: ${results.filter((r) => r.status === 'legacy').length}`,
  )
  console.log(`  with errors:    ${failed.length}`)
  console.log(`  warnings only:  ${warned.length}`)
  console.log(
    `  clean:          ${checked.filter((r) => !r.errors.length && !r.warnings.length).length}`,
  )
}
process.exit(failed.length || (flags.has('--strict') && warned.length) ? 1 : 0)
