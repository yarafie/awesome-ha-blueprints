#!/usr/bin/env node
/* =========================================================
   AHB contribute (command line)
   ---------------------------------------------------------
   The command line twin of the Contributors page of the website.
   It asks the same questions in the same order, runs the same
   format check and builds the same package, because it uses the
   same shared modules (website/src/library/format).

     pnpm contribute

   Steps:
     1. What would you like to contribute?
     2. Your files
     3. Format check
     4. A few details
     5. Your package

   Every question can also be answered up front with an option, so
   the command can be used without typing anything:

     pnpm contribute --yaml my_remote.yaml --png my_remote.png \
       --author octocat --release anything --tags remote,dimmer \
       --into repo --yes

   Options:
     --yaml <file>          the controller YAML
     --png <file>           picture of the device
     --pdf <file>           the device's manual (optional; "none" to skip)
     --author <user>        your GitHub user name
     --manufacturer <name>  defaults to what is read from the YAML
     --model <number>       defaults to what is read from the YAML
     --release <name>       short name for what the blueprint handles, for
                            example anything, lights, cover
     --tags <a,b,c>         tags ("none" for no extra tags)
     --notes <text|file>    the note for the page, or a text file
                            that holds it (optional; "none" to skip)
     --into repo            write the package into this repository, ready
                            to commit and open a pull request
     --into <folder>        write the package into a new or empty folder
     --yes                  ask nothing: take the suggested values and write
                            without confirmation; answers that have no
                            suggestion must then be given as options

   Nothing is written until the last step. The YAML is only read as
   text; it is never run.

   Exit code: 0 = package written, 1 = problems, 2 = bad usage or
   cancelled.
   ========================================================= */
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import readline from 'node:readline'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import {
  buildControllerPackage,
  guessManufacturerAndModel,
} from '../../../website/src/library/format/controllerPackage.mjs'
import { checkControllerYaml } from '../../../website/src/library/format/controllerFormat.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(HERE, '..', '..', '..')
const BLUEPRINTS_DIR = path.join(REPO_ROOT, 'website', 'docs', 'blueprints')
const CONTROLLERS_DIR = path.join(BLUEPRINTS_DIR, 'controllers')
const FORMAT_PAGE =
  'https://yarafie.github.io/awesome-ha-blueprints/docs/controller-format'
const STEPS = 5

// the same choices, limits and tags as the Contributors page
const CATEGORIES = [
  {
    name: 'Controllers',
    text: 'Blueprints for remotes, buttons, dimmers and switches.',
    ready: true,
  },
  {
    name: 'Hooks',
    text: 'Blueprints that connect controllers to lights, covers and media players.',
    ready: false,
  },
  {
    name: 'Automations',
    text: 'Generic automation blueprints for other use cases.',
    ready: false,
  },
]
const INTENTS = [
  {
    name: 'A blueprint for a new device',
    text: 'The device is not in the library yet.',
    ready: true,
  },
  {
    name: 'An update to a blueprint',
    text: 'A fix or an improvement for a blueprint that is already in the library.',
    ready: false,
  },
  {
    name: 'Your own version',
    text: 'Your own take on a device that is already in the library.',
    ready: false,
  },
]
const LIMITS = { yaml: 200 * 1024, png: 1024 * 1024, pdf: 10 * 1024 * 1024 }
const SUGGESTED_TAGS = [
  'remote',
  'button',
  'dimmer',
  'switch',
  'rotary',
  'knob',
  'light',
  'media',
  'sensor',
  'wall-switch',
]

/* ---------- arguments ---------- */
const argv = process.argv.slice(2)
const opt = {}
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (a === '--') continue
  if (a === '--yes') opt.yes = true
  else if (a === '--help' || a === '-h') opt.help = true
  else if (a.startsWith('--') && i + 1 < argv.length)
    opt[a.slice(2)] = argv[++i]
  else {
    console.error(`Cannot read the option "${a}". Try: pnpm contribute --help`)
    process.exit(2)
  }
}
if (opt.help) {
  const text = fs.readFileSync(fileURLToPath(import.meta.url), 'utf8')
  const start = text.indexOf('AHB contribute')
  const end = text.indexOf('=====', start)
  console.log(text.slice(start, end).replace(/^ {3}/gm, '').trimEnd())
  process.exit(0)
}

/* ---------- asking questions ---------- */
const rl = readline.createInterface({ input: process.stdin })
const lines = []
const waiting = []
let closed = false
rl.on('line', (line) => {
  if (waiting.length) waiting.shift()(line)
  else lines.push(line)
})
rl.on('close', () => {
  closed = true
  while (waiting.length) waiting.shift()(null)
})

function nextLine() {
  if (lines.length) return Promise.resolve(lines.shift())
  if (closed) return Promise.resolve(null)
  return new Promise((resolve) => waiting.push(resolve))
}

function cancelled(msg) {
  console.log(`\n${msg}\nNothing was written.`)
  process.exit(2)
}

// one question; an empty answer takes the default
// with --yes nothing is asked: the default is taken, an optional question is
// skipped, and a question that needs an answer stops the command
async function ask(question, fallback = '', optional = false) {
  if (opt.yes) {
    if (fallback || optional) {
      console.log(`      ${question}: ${fallback || '(none)'}`)
      return fallback
    }
    console.log(
      `      ${question}: no answer given.\n\nWith --yes every answer without a suggestion must come from an option; see: pnpm contribute --help\nNothing was written.`,
    )
    process.exit(2)
  }
  process.stdout.write(`      ${question}${fallback ? ` [${fallback}]` : ''}: `)
  const answer = await nextLine()
  if (answer === null) {
    process.stdout.write('\n')
    cancelled('The input ended before all questions were answered.')
  }
  if (!process.stdin.isTTY) process.stdout.write(`${answer}\n`)
  return answer.trim() || fallback
}

// a numbered list in which only the ready choices can be picked
async function choose(options) {
  const width = Math.max(...options.map((o) => o.name.length))
  options.forEach((o, i) => {
    const mark = o.ready ? `${i + 1})` : ' -'
    const soon = o.ready ? '' : '  (coming soon)'
    console.log(`      ${mark} ${o.name.padEnd(width)}  ${o.text}${soon}`)
  })
  const ready = options.map((o, i) => (o.ready ? i + 1 : 0)).filter(Boolean)
  // with --yes, a question that has only one possible answer is not asked
  if (opt.yes && ready.length === 1) return options[ready[0] - 1]
  for (;;) {
    const answer = await ask('Your choice', String(ready[0]))
    const n = Number(answer)
    if (ready.includes(n)) return options[n - 1]
    if (options[n - 1]) console.log('      That one is not available yet.')
    else console.log(`      Please answer with ${ready.join(' or ')}.`)
  }
}

const step = (n, title) => console.log(`\n[${n}/${STEPS}] ${title}`)
const size = (bytes) =>
  bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 * 1024
      ? `${Math.round(bytes / 1024)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
const plain = (file) => file.replace(/^~(?=$|\/)/, process.env.HOME || '~')
const dirs = (d) =>
  fs
    .readdirSync(d, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
const capital = (text) => text.charAt(0).toUpperCase() + text.slice(1)

/* ---------- reading one file ---------- */
// returns { file, data } or a string that says what is wrong
function readFile(kind, file) {
  const full = path.resolve(plain(file))
  if (!fs.existsSync(full) || !fs.statSync(full).isFile())
    return `File not found: ${file}`
  const data = fs.readFileSync(full)
  if (data.length > LIMITS[kind])
    return `${path.basename(full)} is ${size(data.length)}; the limit is ${size(LIMITS[kind])}`
  if (kind === 'png') {
    if (data.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a')
      return `${path.basename(full)} is not a PNG picture`
  } else if (kind === 'pdf') {
    if (data.subarray(0, 5).toString() !== '%PDF-')
      return `${path.basename(full)} is not a PDF file`
  } else if (!/\.ya?ml$/i.test(full))
    return `${path.basename(full)} is not a YAML file (.yaml)`
  return { file: full, data }
}

// asks for a file until a usable one is given; `preset` comes from an option
async function askFile(kind, question, preset, optional) {
  const skip = (v) => optional && (!v || v.toLowerCase() === 'none')
  if (preset !== undefined) {
    if (skip(preset)) return null
    const result = readFile(kind, preset)
    if (typeof result === 'string') {
      console.log(`      ERROR  ${result}`)
      process.exit(1)
    }
    console.log(`      ${question}: ${preset}`)
    return result
  }
  for (;;) {
    const answer = await ask(question, '', optional)
    if (skip(answer)) return null
    if (!answer) continue
    const result = readFile(kind, answer)
    if (typeof result !== 'string') return result
    console.log(`      ${result}`)
  }
}

function defaultAuthor() {
  for (const [cmd, args] of [
    ['gh', ['api', 'user', '-q', '.login']],
    ['git', ['config', '--get', 'github.user']],
  ]) {
    try {
      const out = execFileSync(cmd, args, {
        encoding: 'utf8',
        timeout: 5000,
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim()
      if (out) return out
    } catch {
      // not installed or not signed in: ask instead
    }
  }
  return ''
}

function printTree(files) {
  let shown = []
  for (const f of [...files].sort((a, b) => a.path.localeCompare(b.path))) {
    const parts = f.path.split('/')
    parts.slice(0, -1).forEach((part, depth) => {
      if (shown[depth] !== part) {
        console.log(`      ${'  '.repeat(depth)}${part}/`)
        shown = shown.slice(0, depth)
        shown[depth] = part
      }
    })
    console.log(`      ${'  '.repeat(parts.length - 1)}${parts.at(-1)}`)
  }
}

/* =========================================================
   The five steps
   ========================================================= */
async function main() {
  console.log('Awesome HA Library - Contribute')
  console.log(
    'Choose what you would like to contribute. Your blueprint is checked as\nyou go and everything else the library needs is prepared for you.',
  )

  // ---- 1
  step(1, 'What would you like to contribute?')
  const category = await choose(CATEGORIES)
  console.log(`      ${category.name}: what would you like to add?`)
  const intent = await choose(INTENTS)
  console.log(`      -> ${category.name} - ${intent.name}`)

  // ---- 2
  step(2, 'Your files')
  const yaml = await askFile('yaml', 'Blueprint, YAML file', opt.yaml, false)
  const png = await askFile(
    'png',
    'Picture of the device, PNG file',
    opt.png,
    false,
  )
  const pdf = await askFile(
    'pdf',
    'Device manual, PDF file (optional, Enter to skip)',
    opt.pdf,
    true,
  )
  const yamlText = yaml.data.toString('utf8')

  // ---- 3
  step(3, 'Format check')
  const check = checkControllerYaml(yamlText)
  if (check.status === 'legacy') {
    console.log(
      '      ERROR   This file uses the older "integration dropdown" format. New controllers must follow the Controller YAML format.',
    )
    console.log(`      ${FORMAT_PAGE}`)
    return 1
  }
  if (check.status === 'free-form') {
    console.log(
      '      This looks like a standalone blueprint: it has no `controller_device`\n      input and no `actions_mapping`, so it is not built on the controller\n      layout. Nothing is wrong with it, but a package cannot be prepared for\n      it yet. To add a controller, see the Controller YAML format:',
    )
    console.log(`      ${FORMAT_PAGE}`)
    return 1
  }
  for (const e of check.errors)
    console.log(`      ERROR   ${e.rule}  ${capital(e.msg)}`)
  for (const w of check.warnings)
    console.log(`      remark  ${w.rule}  ${capital(w.msg)}`)
  if (check.errors.length) {
    console.log(
      `\n${check.errors.length} to fix. The rules are described here:\n${FORMAT_PAGE}\nNothing was written.`,
    )
    return 1
  }
  console.log(
    `      Your blueprint follows the format${check.warnings.length ? `, with ${check.warnings.length} remark(s)` : ''}.`,
  )
  const info = check.info
  const read = [
    info.model_name || info.name,
    ...(info.integrations || []),
    info.events ? `${info.events.length} events` : null,
    info.sends_hook_events ? 'works with hooks' : 'no hooks',
    info.features?.long_press_loop ? 'long press loop' : null,
    info.features?.virtual_double_press ? 'virtual double press' : null,
    info.features?.text_helper ? 'text helper' : null,
  ].filter(Boolean)
  console.log(`      Read from your file: ${read.join(' | ')}`)

  // ---- 4
  step(4, 'A few details')
  const guess = guessManufacturerAndModel(info.model_name || '') || {}
  const existingIds = dirs(CONTROLLERS_DIR)
  const preset = { ...opt }
  let pkg
  let notesText = ''
  // what Enter gives: first the suggestions, after a problem the last answers
  const last = {
    author: defaultAuthor(),
    manufacturer: guess.manufacturer || '',
    model: guess.model || '',
    release: '',
    tags: '',
    notes: '',
  }
  for (;;) {
    const author =
      preset.author ?? (await ask('Your GitHub user name', last.author))
    const manufacturer =
      preset.manufacturer ?? (await ask('Manufacturer', last.manufacturer))
    const model = preset.model ?? (await ask('Model number', last.model))
    let release = preset.release
    if (release === undefined) {
      console.log(
        '      Release name: a short name for what your blueprint handles, for\n      example "anything" for general purpose, "lights" or "cover".',
      )
      do release = await ask('Release name', last.release)
      while (!release)
    }
    release = release.toLowerCase().replace(/[\s-]+/g, '_')
    if (preset.tags === undefined)
      console.log(`      Suggested tags: ${SUGGESTED_TAGS.join(', ')}`)
    const tagsAnswer =
      preset.tags ??
      (await ask('Tags, separated by commas (Enter for none)', last.tags, true))
    const tags =
      tagsAnswer.toLowerCase() === 'none'
        ? []
        : tagsAnswer
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
    const notesFile =
      preset.notes ??
      (await ask(
        'Notes for the page: your text, or a text file (optional, Enter to skip)',
        last.notes,
        true,
      ))
    notesText = ''
    if (notesFile && notesFile.toLowerCase() !== 'none') {
      const full = path.resolve(plain(notesFile))
      if (fs.existsSync(full) && fs.statSync(full).isFile())
        notesText = fs.readFileSync(full, 'utf8')
      else notesText = notesFile
    }
    Object.assign(last, {
      author,
      manufacturer,
      model,
      release,
      tags: tagsAnswer,
      notes: notesFile,
    })

    pkg = buildControllerPackage({
      yamlText,
      existingIds,
      fields: {
        author: { id: author, name: author },
        manufacturer,
        model,
        release,
        tags,
        notes: notesText,
        hasPdf: Boolean(pdf),
      },
    })
    if (pkg.ok) break
    for (const p of pkg.problems) console.log(`      ERROR   ${capital(p)}`)
    // a problem with the file itself, or answers that came from options,
    // cannot be solved by asking again
    const allPreset = ['author', 'manufacturer', 'model', 'release'].every(
      (k) => preset[k] !== undefined,
    )
    if (pkg.about === 'file' || allPreset || opt.yes) {
      console.log('\nNothing was written.')
      return 1
    }
    console.log('      Please answer again (Enter keeps your last answer).')
    for (const k of [
      'author',
      'manufacturer',
      'model',
      'release',
      'tags',
      'notes',
    ])
      delete preset[k]
  }
  const loc = pkg.location
  console.log(
    `      Blueprint id ${loc.id}, published as ${loc.library}/${loc.release}, version ${loc.version}`,
  )

  // ---- 5
  step(5, 'Your package')
  printTree(pkg.files)

  let into = opt.into
  if (!into) {
    console.log('      Where should the package go?')
    const where = await choose([
      {
        name: 'This repository',
        text: 'Ready to commit and open a pull request.',
        ready: true,
      },
      { name: 'A separate folder', text: 'To look at it first.', ready: true },
    ])
    into =
      where.name === 'This repository'
        ? 'repo'
        : await ask('Folder', '~/ahb-package')
  }
  const inRepo = into === 'repo'
  const base = inRepo ? BLUEPRINTS_DIR : path.resolve(plain(into))
  if (inRepo && fs.existsSync(path.join(CONTROLLERS_DIR, loc.id))) {
    console.log(
      `      ERROR   controllers/${loc.id} already exists in this repository`,
    )
    return 1
  }
  if (!inRepo && fs.existsSync(base) && fs.readdirSync(base).length) {
    console.log(`      ERROR   ${base} is not empty`)
    return 1
  }
  if (!opt.yes) {
    const ok = await ask(
      `Write ${pkg.files.length} files into ${base}? (y/n)`,
      'y',
    )
    if (!/^y(es)?$/i.test(ok)) cancelled('Cancelled.')
  }
  pkg.files.forEach((f, i) => {
    const target = path.join(base, f.path)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    if (f.kind === 'png') fs.writeFileSync(target, png.data)
    else if (f.kind === 'pdf') fs.writeFileSync(target, pdf.data)
    else fs.writeFileSync(target, f.text)
    console.log(`      (${i + 1}/${pkg.files.length}) written ${f.path}`)
  })

  console.log('\nDone.')
  if (inRepo) {
    const rel = `website/docs/blueprints/controllers/${loc.id}`
    console.log('To look at the result and send it:')
    console.log('  pnpm docs:build')
    console.log(`  git switch -c add/${loc.id}`)
    console.log(`  git add ${rel}`)
    console.log(
      `  git commit -m "[New Controller] ${info.model_name || loc.id}"`,
    )
    console.log('  then push the branch to your fork and open a pull request')
  } else {
    console.log(
      `To add it to the library, copy ${path.join(base, 'controllers', loc.id)}\ninto website/docs/blueprints/controllers/ of your clone.`,
    )
  }
  return 0
}

main().then(
  (code) => {
    rl.close()
    process.exit(code)
  },
  (err) => {
    console.error(
      `\nUnexpected problem: ${err.message}\nNothing may have been written; check with "git status".`,
    )
    process.exit(1)
  },
)
