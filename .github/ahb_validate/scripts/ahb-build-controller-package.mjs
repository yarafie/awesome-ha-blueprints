#!/usr/bin/env node
/* =========================================================
   AHB controller package builder (command line)
   ---------------------------------------------------------
   Builds the complete library folder for a NEW controller from
   the contributor's YAML, a picture and a few answers. The same
   builder is used by the Contributors page of the website.

   Build a package:
     node ahb-build-controller-package.mjs \
       --yaml my_remote.yaml --png my_remote.png --author octocat \
       --model X100 --tags remote,dimmer --out /tmp/package

   Options:
     --yaml <file>          the controller YAML (required)
     --png <file>           picture of the device (required)
     --pdf <file>           the device's manual (optional)
     --author <user>        GitHub user name of the contributor (required)
     --author-name <name>   display name, defaults to the user name
     --manufacturer <name>  defaults to the first word of the model name
     --model <number>       defaults to the second word of the model name
     --tags <a,b,c>         extra tags; zigbee / wifi are added for you
     --notes <file>         text for the page's Additional Notes
     --id <blueprint_id>    defaults to <manufacturer>_<model>
     --library <id>         defaults to the author
     --release <id>         defaults to awesome
     --version <date>       YYYY.MM.DD, defaults to today
     --out <folder>         where to write the package (must be empty or new)

   Prove the builder against the library:
     node ahb-build-controller-package.mjs --self-test
   For every controller it removes the lines that depend on the file's
   location, lets the builder put them back, and compares the result
   with the original file and with the real manifest.yaml.

   Exit code: 0 = package written / self-test passed, 1 = problems,
   2 = bad usage.
   ========================================================= */
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { load } from 'js-yaml'
import {
  buildControllerPackage,
  finalizeControllerYaml,
} from '../../../website/src/library/format/controllerPackage.mjs'
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

const dirs = (d) =>
  fs
    .readdirSync(d, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()

/* ---------- arguments ---------- */
const argv = process.argv.slice(2)
const opt = {}
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (a === '--self-test') opt.selfTest = true
  else if (a.startsWith('--') && i + 1 < argv.length)
    opt[a.slice(2)] = argv[++i]
  else {
    console.error(`Cannot read the option "${a}"`)
    process.exit(2)
  }
}

function usage(msg) {
  console.error(
    `${msg}\nUsage: ahb-build-controller-package.mjs --yaml <file> --png <file> --author <user> --out <folder> [--model ..] [--tags a,b] ...\n       ahb-build-controller-package.mjs --self-test`,
  )
  process.exit(2)
}

/* =========================================================
   Self-test
   ========================================================= */
const STANDARD_STARTS = [
  'Automations created with this blueprint can be connected',
  'Hooks allow to easily create controller-based automations',
  'See the list of [Hooks available for this controller]',
  '[See documentation for this controller]',
]

// the contributor's version of a library file: without the lines that
// depend on where the file lives
function asSubmission(text) {
  const lines = text.split('\n')
  const start = lines.findIndex((l) => /^ {2}description: \|/.test(l))
  let end = start + 1
  while (end < lines.length && (!lines[end].trim() || /^ {4}/.test(lines[end])))
    end++
  let block = lines.slice(start + 1, end)
  const more = block.findIndex((l) => l.trim() === '## More Info')
  if (more >= 0) block = block.slice(0, more)
  block = block.filter(
    (l) =>
      !/^\s*ℹ️ Version /.test(l) &&
      !STANDARD_STARTS.some((s) => l.trim().startsWith(s)),
  )
  const tidy = []
  for (const l of block) {
    if (!l.trim() && tidy.length && !tidy[tidy.length - 1].trim()) continue
    tidy.push(l)
  }
  while (tidy.length && !tidy[tidy.length - 1].trim()) tidy.pop()
  const rest = lines.slice(end).filter((l) => !/^ {2}source_url:/.test(l))
  return [...lines.slice(0, start + 1), ...tidy, '', ...rest].join('\n')
}

function firstDifference(a, b) {
  const x = a.split('\n')
  const y = b.split('\n')
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    if (x[i] !== y[i])
      return `line ${i + 1}: built "${(x[i] ?? '').trim().slice(0, 70)}" / library "${(y[i] ?? '').trim().slice(0, 70)}"`
  }
  return ''
}

function selfTest() {
  const targets = []
  for (const id of dirs(CONTROLLERS_DIR)) {
    for (const library of dirs(path.join(CONTROLLERS_DIR, id))) {
      for (const release of dirs(path.join(CONTROLLERS_DIR, id, library))) {
        const rd = path.join(CONTROLLERS_DIR, id, library, release)
        const versions = dirs(rd).filter((v) => /^\d{4}\.\d{2}\.\d{2}$/.test(v))
        if (versions.length)
          targets.push({ id, library, release, version: versions.pop() })
      }
    }
  }
  const count = { yamlSame: 0, yamlDiff: 0, manSame: 0, manDiff: 0, skipped: 0 }
  targets.forEach((loc, i) => {
    const name = `${loc.id}/${loc.library}/${loc.release}`
    console.log(`[${i + 1}/${targets.length}] ${name}`)
    const file = path.join(
      CONTROLLERS_DIR,
      loc.id,
      loc.library,
      loc.release,
      loc.version,
      `${loc.id}.yaml`,
    )
    const original = fs.readFileSync(file, 'utf8')
    const status = checkControllerYaml(original, { location: loc }).status
    if (status !== 'checked') {
      console.log(`      skipped (${status})`)
      count.skipped++
      return
    }
    const hooks = original.includes('#available-hooks')

    // 1. the YAML: take the location lines out, let the builder put them back
    const submission = asSubmission(original)
    const rebuilt = finalizeControllerYaml(submission, loc, { hooks })
    if (rebuilt.text === original) {
      console.log('      yaml      identical to the library file')
      count.yamlSame++
    } else {
      console.log(
        `      yaml      DIFFERENT  ${rebuilt.problems ? rebuilt.problems.join('; ') : firstDifference(rebuilt.text, original)}`,
      )
      count.yamlDiff++
    }

    // 2. the manifest: build it from the YAML plus the real answers
    const manifestFile = path.join(CONTROLLERS_DIR, loc.id, 'manifest.yaml')
    const realText = fs.readFileSync(manifestFile, 'utf8')
    const real = load(realText)
    const libs = Object.keys(real.libraries || {})
    const lib = real.libraries?.[loc.library]
    if (libs.length !== 1 || Object.keys(lib?.releases || {}).length !== 1) {
      console.log('      manifest  skipped (several libraries or releases)')
      return
    }
    const pkg = buildControllerPackage({
      yamlText: submission,
      fields: {
        author: lib.maintainers[0],
        manufacturer: real.manufacturer,
        model: real.model,
        tags: real.tags || [],
        blueprintId: loc.id,
        library: loc.library,
        release: loc.release,
        version: loc.version,
        supportedHooks: lib.releases[loc.release].supported_hooks || [],
        librarians: real.librarians,
        originalAuthors: lib.original_authors,
      },
    })
    if (!pkg.ok) {
      const why = pkg.problems.length
        ? pkg.problems.join('; ')
        : `${pkg.check.errors.length} format error(s), e.g. ${pkg.check.errors[0].rule}`
      console.log(`      manifest  not built: ${why}`)
      return
    }
    const built = pkg.files.find((f) => f.path.endsWith('manifest.yaml')).text
    if (built === realText) {
      console.log('      manifest  identical to the library file')
      count.manSame++
    } else {
      const a = new Set(built.split('\n'))
      const b = new Set(realText.split('\n'))
      const onlyBuilt = [...a].filter((l) => !b.has(l))
      const onlyReal = [...b].filter((l) => !a.has(l))
      console.log(
        onlyBuilt.length + onlyReal.length
          ? `      manifest  ${onlyBuilt.length + onlyReal.length} line(s) differ`
          : '      manifest  same lines in a different order',
      )
      onlyBuilt
        .slice(0, 4)
        .forEach((l) => console.log(`          built:   ${l.trim()}`))
      onlyReal
        .slice(0, 4)
        .forEach((l) => console.log(`          library: ${l.trim()}`))
      count.manDiff++
    }
  })
  console.log('')
  console.log(`Controllers:                 ${targets.length}`)
  console.log(`  skipped (legacy/free-form): ${count.skipped}`)
  console.log(`  yaml rebuilt identically:   ${count.yamlSame}`)
  console.log(`  yaml rebuilt differently:   ${count.yamlDiff}`)
  console.log(`  manifest identical:         ${count.manSame}`)
  console.log(`  manifest with differences:  ${count.manDiff}`)
  return 0
}

/* =========================================================
   Build a package
   ========================================================= */
function build() {
  for (const k of ['yaml', 'png', 'author', 'out'])
    if (!opt[k]) usage(`Missing --${k}`)
  for (const k of ['yaml', 'png', 'pdf', 'notes'])
    if (opt[k] && !fs.existsSync(opt[k])) usage(`File not found: ${opt[k]}`)

  console.log('[1/4] Reading the files')
  const yamlText = fs.readFileSync(opt.yaml, 'utf8')
  const png = fs.readFileSync(opt.png)
  if (png.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') {
    console.log(`      ERROR  ${opt.png} is not a PNG picture`)
    return 1
  }
  const pdf = opt.pdf ? fs.readFileSync(opt.pdf) : null
  if (pdf && pdf.subarray(0, 5).toString() !== '%PDF-') {
    console.log(`      ERROR  ${opt.pdf} is not a PDF file`)
    return 1
  }

  console.log('[2/4] Checking the format and building the package')
  const pkg = buildControllerPackage({
    yamlText,
    existingIds: dirs(CONTROLLERS_DIR),
    fields: {
      author: { id: opt.author, name: opt['author-name'] || opt.author },
      manufacturer: opt.manufacturer,
      model: opt.model,
      tags: (opt.tags || '').split(',').filter(Boolean),
      notes: opt.notes ? fs.readFileSync(opt.notes, 'utf8') : '',
      hasPdf: Boolean(pdf),
      blueprintId: opt.id,
      library: opt.library,
      release: opt.release,
      version: opt.version,
    },
  })
  for (const e of pkg.check.errors)
    console.log(`      ERROR   ${e.rule}  ${e.msg}`)
  for (const w of pkg.check.warnings)
    console.log(`      warning ${w.rule}  ${w.msg}`)
  for (const p of pkg.problems) console.log(`      ERROR   ${p}`)
  if (pkg.check.status !== 'checked')
    console.log(
      '      ERROR   this file uses the older "integration dropdown" format; new controllers must follow the Controller YAML format',
    )
  if (!pkg.ok) {
    console.log('\nNo package was written.')
    return 1
  }

  console.log('[3/4] Writing the package')
  if (fs.existsSync(opt.out) && fs.readdirSync(opt.out).length) {
    console.log(`      ERROR  ${opt.out} is not empty`)
    return 1
  }
  pkg.files.forEach((f, i) => {
    const target = path.join(opt.out, f.path)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    if (f.kind === 'png') fs.writeFileSync(target, png)
    else if (f.kind === 'pdf') fs.writeFileSync(target, pdf)
    else fs.writeFileSync(target, f.text)
    console.log(`      (${i + 1}/${pkg.files.length}) ${f.path}`)
  })

  console.log('[4/4] Done')
  const l = pkg.location
  console.log(`      blueprint id: ${l.id}`)
  console.log(
    `      location:     ${l.id}/${l.library}/${l.release}/${l.version}`,
  )
  console.log(
    `\nTo add it to the library, copy ${path.join(opt.out, 'controllers', l.id)} into website/docs/blueprints/controllers/`,
  )
  return 0
}

if (!argv.length) usage('Nothing to do.')
process.exit(opt.selfTest ? selfTest() : build())
