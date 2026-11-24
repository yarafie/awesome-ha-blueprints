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

   An update to a blueprint that is already in the library:

     pnpm contribute --update ikea_e2201 --base EPMatt/awesome/2026.08.09 \
       --yaml my_e2201.yaml --author octocat --kind fix \
       --description "ZHA: the Down button release is detected again" \
       --breaking no --into repo --yes

   You state which existing version your file is based on. Written into
   this repository, the update becomes two commits back to back: first
   that version copied to the new folder without changes, then your
   update, so that the second commit shows what really changed.

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

     --update <id>          update this controller instead of adding one
     --base <l/r/v>         the version your file is based on, written as
                            <library>/<release>/<version>
     --kind <kind>          fix or improvement
     --description <text>   what changed, in one line for the changelog
     --breaking <yes|no>    whether existing automations must be changed
     --maintainer           name the branch ahb_maintain/... instead of
                            ahb_contrib/... (maintainers of the library)
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
import {
  checkControllerYaml,
  REPO_URL,
} from '../../../website/src/library/format/controllerFormat.mjs'
import { buildControllerUpdate } from '../../../website/src/library/format/controllerUpdate.mjs'

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
    ready: true,
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
  else if (a === '--maintainer') opt.maintainer = true
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

// a text as one argument of a shell command
const quoted = (text) => `'${String(text).replace(/'/g, `'\\''`)}'`

// the two commands that send a branch as a pull request. The repository is
// named explicitly: in a fork, gh would otherwise suggest the parent of this
// repository as the target. The text of the pull request is left empty; the
// commits say what changed.
function printSendCommands(branch, title) {
  const repo = REPO_URL.replace('https://github.com/', '')
  console.log('To send it as a pull request:')
  console.log(`  git push -u origin ${branch}`)
  console.log(
    `  gh pr create --repo ${repo} --base main --title ${quoted(title)} --body ''`,
  )
}

const MAINTAINER_NOTE =
  '      Note: ahb_maintain/ branches are accepted only from maintainers of the\n      repository. A pull request from anyone else fails its checks; leave out\n      --maintainer to get an ahb_contrib/ branch.'

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
   An update to a blueprint
   ---------------------------------------------------------
   A new version of a controller that is already in the library.
   The contributor states which existing version the file is based
   on; it is never assumed to be the newest one. Written into this
   repository, the result is two commits back to back: first the
   base copied to the new folder without changes, then the update,
   so that the second commit shows what really changed.
   ========================================================= */
const git = (args, options = {}) =>
  execFileSync('git', args, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  }).trim()

// every version of a controller: [{ library, release, version, text }]
function versionsOf(id) {
  const out = []
  const root = path.join(CONTROLLERS_DIR, id)
  for (const library of dirs(root).sort())
    for (const release of dirs(path.join(root, library)).sort())
      for (const version of dirs(path.join(root, library, release)).sort()) {
        const file = path.join(root, library, release, version, `${id}.yaml`)
        if (/^\d{4}\.\d{2}\.\d{2}$/.test(version) && fs.existsSync(file))
          out.push({
            library,
            release,
            version,
            text: fs.readFileSync(file, 'utf8'),
          })
      }
  return out
}

async function askYesNo(question, fallback) {
  for (;;) {
    const answer = (await ask(`${question} (y/n)`, fallback)).toLowerCase()
    if (/^y(es)?$/.test(answer)) return true
    if (/^no?$/.test(answer)) return false
  }
}

async function updateFlow() {
  // ---- 2
  step(2, 'The blueprint and your file')
  const ids = dirs(CONTROLLERS_DIR)
  let id = opt.update
  for (;;) {
    if (id === undefined)
      id = await ask('Blueprint id of the controller, for example ikea_e2201')
    if (ids.includes(id)) break
    const near = ids.filter((n) => id && (n.includes(id) || id.includes(n)))
    console.log(
      `      No controller with the id "${id}".${near.length ? ` Did you mean: ${near.slice(0, 8).join(', ')}` : ''}`,
    )
    if (opt.update !== undefined) return 1
    id = undefined
  }
  const versions = versionsOf(id)
  if (!versions.length) {
    console.log(`      ERROR   "${id}" has no versions to base an update on`)
    return 1
  }
  const name = (v) => `${v.library}/${v.release}/${v.version}`
  console.log('      Which version is your file based on?')
  versions.forEach((v, i) => {
    const last = !versions.some(
      (o) =>
        o.library === v.library &&
        o.release === v.release &&
        o.version > v.version,
    )
    console.log(
      `      ${String(i + 1).padStart(2)}) ${v.library}/${v.release}  ${v.version}${last ? '  (newest of this release)' : ''}`,
    )
  })
  let base
  if (opt.base !== undefined) {
    base = versions.find((v) => name(v) === opt.base)
    if (!base) {
      console.log(
        `      ERROR   --base ${opt.base} is not one of these; write it as <library>/<release>/<version>`,
      )
      return 1
    }
  } else
    for (;;) {
      // no suggestion on purpose: the base must be stated, not assumed
      const n = Number(await ask('Number of the version'))
      if (versions[n - 1]) {
        base = versions[n - 1]
        break
      }
      console.log(
        `      Please answer with a number from 1 to ${versions.length}.`,
      )
    }
  console.log(`      -> based on ${name(base)}`)
  const yaml = await askFile(
    'yaml',
    'Your updated blueprint, YAML file',
    opt.yaml,
    false,
  )
  const yamlText = yaml.data.toString('utf8')

  const releaseDir = path.join(CONTROLLERS_DIR, id, base.library, base.release)
  const changelogFile = path.join(releaseDir, 'changelog.json')
  const build = (fields) =>
    buildControllerUpdate({
      yamlText,
      id,
      base,
      versions,
      changelogText: fs.existsSync(changelogFile)
        ? fs.readFileSync(changelogFile, 'utf8')
        : '[]',
      manifestText: fs.readFileSync(
        path.join(CONTROLLERS_DIR, id, 'manifest.yaml'),
        'utf8',
      ),
      fields,
    })

  // ---- 3
  step(3, 'Format check and comparison')
  // a first run with stand-in answers: it tells everything about the file
  const first = build({
    author: { id: 'octocat' },
    kind: 'fix',
    description: 'stand-in for the first check',
  })
  if (first.check)
    for (const w of first.check.warnings)
      console.log(`      remark  ${w.rule}  ${capital(w.msg)}`)
  if (first.about === 'file') {
    for (const p of first.problems) console.log(`      ERROR   ${capital(p)}`)
    console.log(
      `\n${first.problems.length} to fix. The rules are described here:\n${FORMAT_PAGE}\nNothing was written.`,
    )
    return 1
  }
  if (first.about === 'details') {
    // the stand-in answers are fine, so this is about the version itself
    for (const p of first.problems) console.log(`      ERROR   ${capital(p)}`)
    console.log('\nNothing was written.')
    return 1
  }
  const warnings = first.check.warnings.length
  console.log(
    `      Your blueprint follows the format${warnings ? `, with ${warnings} remark(s)` : ''}.`,
  )
  const c = first.comparison
  console.log(`      Compared with ${name(base)}:`)
  console.log(
    `        lines:   ${c.lines.added} added, ${c.lines.removed} removed`,
  )
  if (c.inputs)
    for (const [label, keys] of Object.entries(c.inputs))
      console.log(
        `        ${label === 'added' ? 'inputs: ' : '        '} ${keys.length} ${label}${keys.length ? `: ${keys.join(', ')}` : ''}`,
      )
  if (first.notes.length) {
    console.log('      Please check:')
    for (const n of first.notes) console.log(`        - ${capital(n)}`)
    if (!opt.yes && !(await askYesNo('Is that what you intend?', '')))
      cancelled('Stopped, so that you can choose another base or file.')
  }

  // ---- 4
  step(4, 'A few details')
  const preset = { ...opt }
  const last = {
    author: defaultAuthor(),
    kind: '',
    description: '',
    breaking: first.suggestBreaking ? 'y' : 'n',
  }
  if (first.suggestBreaking)
    console.log(
      '      An input was removed, so existing automations may need changes.',
    )
  let result
  for (;;) {
    const author =
      preset.author ?? (await ask('Your GitHub user name', last.author))
    let kind = preset.kind
    if (kind === undefined) {
      console.log('      1) A fix   2) An improvement')
      do kind = await ask('Your choice', last.kind)
      while (!['1', '2', 'fix', 'improvement'].includes(kind))
    }
    kind = { 1: 'fix', 2: 'improvement' }[kind] ?? kind
    let description = preset.description
    if (description === undefined)
      do
        description = await ask(
          'What changed, in one line for the changelog',
          last.description,
        )
      while (!description)
    const breakingAnswer =
      preset.breaking ??
      ((await askYesNo(
        'Do existing automations have to be changed',
        last.breaking,
      ))
        ? 'y'
        : 'n')
    const breaking = /^y(es)?$/i.test(breakingAnswer)
    Object.assign(last, {
      author,
      kind,
      description,
      breaking: breaking ? 'y' : 'n',
    })

    result = build({ author: { id: author }, kind, description, breaking })
    if (result.ok) break
    for (const p of result.problems) console.log(`      ERROR   ${capital(p)}`)
    const allPreset = ['author', 'kind', 'description'].every(
      (k) => preset[k] !== undefined,
    )
    if (result.about === 'file' || allPreset || opt.yes) {
      console.log('\nNothing was written.')
      return 1
    }
    console.log('      Please answer again (Enter keeps your last answer).')
    for (const k of ['author', 'kind', 'description', 'breaking'])
      delete preset[k]
  }
  const loc = result.location
  console.log(
    `      New version ${loc.version} of ${id}, in ${loc.library}/${loc.release}, based on ${base.version}`,
  )

  // ---- 5
  step(5, 'Your package')
  printTree(result.files)

  let into = opt.into
  if (!into) {
    console.log('      Where should it go?')
    const where = await choose([
      {
        name: 'This repository',
        text: 'As two commits: the base copied without changes, then your update.',
        ready: true,
      },
      { name: 'A separate folder', text: 'To look at it first.', ready: true },
    ])
    into =
      where.name === 'This repository'
        ? 'repo'
        : await ask('Folder', '~/ahb-package')
  }

  if (into !== 'repo') {
    const baseDir = path.resolve(plain(into))
    if (fs.existsSync(baseDir) && fs.readdirSync(baseDir).length) {
      console.log(`      ERROR   ${baseDir} is not empty`)
      return 1
    }
    if (!opt.yes && !(await askYesNo(`Write 2 files into ${baseDir}?`, 'y')))
      cancelled('Cancelled.')
    result.files.forEach((f, i) => {
      const target = path.join(baseDir, f.path)
      fs.mkdirSync(path.dirname(target), { recursive: true })
      fs.writeFileSync(target, f.text)
      console.log(`      (${i + 1}/${result.files.length}) written ${f.path}`)
    })
    console.log(
      `\nDone. This update is based on ${name(base)}.\nTo see what changed:\n  pnpm version-diff ${path.join(CONTROLLERS_DIR, id, base.library, base.release, base.version, `${id}.yaml`)} ${path.join(baseDir, result.files[0].path)}`,
    )
    return 0
  }

  // ---- into this repository, as two commits
  const rel = (p) => path.posix.join('website/docs/blueprints', p)
  const yamlRel = rel(result.files[0].path)
  const changelogRel = rel(result.files[1].path)
  let branch
  try {
    branch = git(['rev-parse', '--abbrev-ref', 'HEAD'])
    if (git(['diff', '--cached', '--name-only'])) {
      console.log(
        '      ERROR   Some changes are already staged for commit. Commit or unstage them first.',
      )
      return 1
    }
    if (git(['status', '--porcelain', '--', changelogRel])) {
      console.log(
        `      ERROR   ${changelogRel} has changes that are not committed.`,
      )
      return 1
    }
  } catch (err) {
    console.log(`      ERROR   git could not be used here: ${err.message}`)
    return 1
  }
  if (fs.existsSync(path.join(REPO_ROOT, yamlRel))) {
    console.log(`      ERROR   ${yamlRel} already exists`)
    return 1
  }
  // the automatic checks of a pull request read the branch name
  const newBranch = `${opt.maintainer ? 'ahb_maintain' : 'ahb_contrib'}/controllers/${id}/${loc.library}/${loc.release}/${loc.version}/author-${last.author}`
  const kindLabel = last.kind === 'fix' ? '[Bug Fix]' : '[Enhancement]'
  const first1 = `[${id}] Copy ${base.library}/${base.release} ${base.version} as ${loc.version} (no changes)`
  const second = `[${id}] ${loc.library}/${loc.release} ${loc.version}: ${kindLabel} ${last.description}`
  let switchBranch = false
  if (opt.maintainer) console.log(MAINTAINER_NOTE)
  if (branch !== newBranch) {
    const onMain = branch === 'main' || branch === 'master'
    console.log(
      `      You are on ${branch}. The automatic checks of a pull request read the\n      branch name, which should be:\n        ${newBranch}`,
    )
    if (
      opt.yes ||
      (await askYesNo('Create that branch and switch to it?', 'y'))
    )
      switchBranch = true
    else if (onMain) cancelled('Cancelled: an update is not committed on main.')
  }
  console.log(`      Two commits on ${switchBranch ? newBranch : branch}:`)
  console.log(`        1. ${first1}`)
  console.log(`        2. ${second}`)
  if (!opt.yes && !(await askYesNo('Make these two commits?', 'y')))
    cancelled('Cancelled.')

  let done = 0
  try {
    if (switchBranch) git(['switch', '-c', newBranch])
    const target = path.join(REPO_ROOT, yamlRel)
    fs.mkdirSync(path.dirname(target), { recursive: true })

    fs.writeFileSync(target, result.baseCopy.text)
    git(['add', '--', yamlRel])
    git(['commit', '-m', first1, '--', yamlRel])
    done = 1
    console.log(`      (1/2) committed: the base, copied without changes`)

    fs.writeFileSync(target, result.files[0].text)
    fs.writeFileSync(path.join(REPO_ROOT, changelogRel), result.files[1].text)
    git(['add', '--', yamlRel, changelogRel])
    git(['commit', '-m', second, '--', yamlRel, changelogRel])
    done = 2
    console.log(`      (2/2) committed: your update`)
  } catch (err) {
    console.log(
      `      ERROR   git stopped after ${done} of 2 commits:\n${String(err.stderr || err.message).trim()}`,
    )
    console.log(
      '\nLook at the state with "git status" and "git log --oneline -3" before you go on.',
    )
    return 1
  }

  console.log('\nDone.')
  console.log('To see what really changed (the second commit):')
  console.log('  git show HEAD')
  console.log('To look at the result:')
  console.log('  pnpm docs:build')
  console.log(
    '  (the build may change library_report.md; leave that file out of your branch)',
  )
  printSendCommands(switchBranch ? newBranch : branch, second)
  return 0
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
  // --update names the intent; with --yes and no --update it is a new device
  const intent =
    opt.update !== undefined
      ? INTENTS[1]
      : opt.yes
        ? INTENTS[0]
        : await choose(INTENTS)
  console.log(`      -> ${category.name} - ${intent.name}`)

  // ---- 2
  if (intent === INTENTS[1]) return updateFlow()

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
    const newBranch = `${opt.maintainer ? 'ahb_maintain' : 'ahb_contrib'}/controllers/${loc.id}/${loc.library}/${loc.release}/${loc.version}/author-${loc.library}`
    const title = `[${loc.id}] New controller: ${info.model_name || loc.id}`
    if (opt.maintainer) console.log(MAINTAINER_NOTE)
    console.log('To look at the result:')
    console.log('  pnpm docs:build')
    console.log(
      '  (the build may change library_report.md; leave that file out of your branch)',
    )
    console.log('To commit it on a branch with the name the checks expect:')
    console.log(`  git switch -c ${newBranch}`)
    console.log(`  git add ${rel}`)
    console.log(`  git commit -m ${quoted(title)}`)
    printSendCommands(newBranch, title)
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
