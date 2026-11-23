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
import { load, YAML11_SCHEMA, defineScalarTag } from 'js-yaml'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(HERE, '..', '..', '..')
const CONTROLLERS_DIR = path.join(
  REPO_ROOT,
  'website',
  'docs',
  'blueprints',
  'controllers',
)
const SITE = 'https://yarafie.github.io/awesome-ha-blueprints'
const REPO_URL = 'https://github.com/yarafie/awesome-ha-blueprints'

/* ---------- Home Assistant YAML tags (!input ...) ---------- */
function makeTaggedScalar(tagName) {
  return defineScalarTag(tagName, {
    resolve: (data) => ({ __ahb_tag: tagName.replace(/^!/, ''), value: data }),
    identify: () => false,
  })
}
const AHB_YAML_SCHEMA = YAML11_SCHEMA.withTags(
  makeTaggedScalar('!input'),
  makeTaggedScalar('!secret'),
  makeTaggedScalar('!include'),
)

/* ---------- Integrations ---------- */
// key used in actions_mapping and trigger ids -> display name, device filter
const INTEGRATIONS = [
  { key: 'z2m', name: 'Zigbee2MQTT', filter: 'mqtt' },
  { key: 'zha', name: 'ZHA', filter: 'zha' },
  { key: 'dcz', name: 'deCONZ', filter: 'deconz' },
  { key: 'sly', name: 'Shelly', filter: 'shelly' },
]
const NAME_ORDER = INTEGRATIONS.map((i) => i.name)
const byKey = Object.fromEntries(INTEGRATIONS.map((i) => [i.key, i.name]))
const byFilter = Object.fromEntries(INTEGRATIONS.map((i) => [i.filter, i.name]))

const SUMMARY_PREFIX =
  'Controller automation for executing any kind of action triggered by the provided '
const BLUEPRINT_KEYS = [
  'name',
  'description',
  'source_url',
  'domain',
  'homeassistant',
  'input',
]
const TOP_KEYS = [
  'blueprint',
  'variables',
  'mode',
  'max_exceeded',
  'triggers',
  'conditions',
  'actions',
]
const SECTION_COMMENTS = [
  '# Blueprint Metadata',
  '# Automation schema',
  '# Mode Block',
  '# Triggers Block',
  '# Conditions Block',
  '# Actions Block',
]
const EVENT_KINDS = [
  'short',
  'long',
  'release',
  'double',
  'triple',
  'quadruple',
  'quintuple',
  'many',
  'stop',
]

/* ---------- small helpers ---------- */
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
const sorted = (iter) => [...iter].sort()
const list = (iter) => {
  const s = new Set(iter)
  return NAME_ORDER.filter((n) => s.has(n)).join(', ')
}
const sameSet = (a, b) => a.size === b.size && [...a].every((x) => b.has(x))

// value of an !input tag, whichever way the YAML library returns it
function inputRef(v) {
  if (isObj(v) && v.__ahb_tag === 'input') return String(v.value)
  if (typeof v === 'string') return v
  return null
}

function inOrder(found, expected) {
  const idx = found.map((k) => expected.indexOf(k)).filter((i) => i >= 0)
  return idx.every((v, i) => i === 0 || idx[i - 1] < v)
}

// inputs with sections flattened: [{ key, def, section }]
function flattenInputs(input, section = null, out = []) {
  for (const [key, def] of Object.entries(input || {})) {
    if (isObj(def) && isObj(def.input)) flattenInputs(def.input, key, out)
    else out.push({ key, def: def || {}, section })
  }
  return out
}

function integrationNamesIn(text) {
  return NAME_ORDER.filter((n) => new RegExp(`\\b${n}\\b`).test(text))
}

// every `event: ahb_controller_event` in the automation, with its action
function firedEvents(node, out = new Set()) {
  if (Array.isArray(node)) node.forEach((n) => firedEvents(n, out))
  else if (isObj(node)) {
    if (node.event === 'ahb_controller_event' && isObj(node.event_data)) {
      const a = node.event_data.action
      if (typeof a === 'string' && /^[a-z0-9_]+$/.test(a)) out.add(a)
    }
    Object.values(node).forEach((n) => firedEvents(n, out))
  }
  return out
}

// raw text of a block that starts at `startRe` and ends at the next line
// whose indentation is not deeper than the start line
function rawBlock(text, startRe) {
  const lines = text.split('\n')
  const start = lines.findIndex((l) => startRe.test(l))
  if (start < 0) return ''
  const indent = lines[start].search(/\S/)
  const out = [lines[start]]
  for (let i = start + 1; i < lines.length; i++) {
    const l = lines[i]
    if (l.trim() && l.search(/\S/) <= indent && !l.trim().startsWith('#')) break
    out.push(l)
  }
  return out.join('\n')
}

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

/* =========================================================
   The check
   ========================================================= */
function checkFile(file, opts) {
  const res = {
    file: path.relative(process.cwd(), file),
    status: 'checked',
    errors: [],
    warnings: [],
    info: {},
  }
  const err = (rule, msg) => res.errors.push({ rule, msg })
  const warn = (rule, msg) => res.warnings.push({ rule, msg })
  const loc = opts.submission ? null : locate(file)

  // ---- C-01 valid YAML, valid blueprint header
  let text, doc
  try {
    text = fs.readFileSync(file, 'utf8')
    doc = load(text, { schema: AHB_YAML_SCHEMA })
  } catch (e) {
    err(
      'C-01',
      `the file is not valid YAML: ${String(e.message).split('\n')[0]}`,
    )
    return res
  }
  const bp = isObj(doc) ? doc.blueprint : null
  if (!isObj(bp)) {
    err('C-01', 'there is no `blueprint:` block at the top of the file')
    return res
  }
  if (bp.domain !== 'automation')
    err('C-01', '`blueprint.domain` must be `automation`')

  // ---- C-02 name and description
  const name = typeof bp.name === 'string' ? bp.name : ''
  const desc = typeof bp.description === 'string' ? bp.description : ''
  if (!name) err('C-02', '`blueprint.name` is missing')
  if (!desc) err('C-02', '`blueprint.description` is missing')

  // ---- scope
  if (loc && loc.release === 'anything') {
    res.status = 'free-form'
    return res
  }
  const inputs = flattenInputs(bp.input)
  const inputKeys = inputs.map((i) => i.key)
  if (inputKeys[0] === 'integration' && !opts.includeLegacy) {
    res.status = 'legacy'
    return res
  }
  if (!name || !desc) return res

  // ---- C-03 name
  const modelName = name.startsWith('Controller - ')
    ? name.slice('Controller - '.length)
    : ''
  if (!modelName)
    err('C-03', `the name must start with "Controller - " (found "${name}")`)
  res.info.name = name
  res.info.model_name = modelName

  // ---- C-04 blueprint keys
  const bkeys = Object.keys(bp)
  if (bkeys.includes('author')) err('C-04', 'remove the `author` key')
  const unknown = bkeys.filter(
    (k) => !BLUEPRINT_KEYS.includes(k) && k !== 'author',
  )
  if (unknown.length)
    err('C-04', `unexpected keys in \`blueprint:\`: ${unknown.join(', ')}`)
  if (!inOrder(bkeys, BLUEPRINT_KEYS))
    err(
      'C-04',
      `the \`blueprint:\` keys must come in this order: ${BLUEPRINT_KEYS.join(', ')}`,
    )

  // ---- C-05 minimum version
  if (!isObj(bp.homeassistant) || !bp.homeassistant.min_version)
    err('C-05', '`homeassistant.min_version` is missing')

  // ---- C-06 top-level keys
  const top = Object.keys(doc)
  for (const [old, now] of [
    ['trigger', 'triggers'],
    ['condition', 'conditions'],
    ['action', 'actions'],
  ]) {
    if (top.includes(old)) err('C-06', `use \`${now}:\` instead of \`${old}:\``)
  }
  for (const k of [
    'variables',
    'mode',
    'max_exceeded',
    'triggers',
    'actions',
  ]) {
    if (!top.includes(k) && !top.includes(k.replace(/s$/, '')))
      err('C-06', `the top-level key \`${k}:\` is missing`)
  }
  if (!inOrder(top, TOP_KEYS))
    err(
      'C-06',
      `the top-level keys must come in this order: ${TOP_KEYS.join(', ')}`,
    )
  const extraTop = top.filter(
    (k) =>
      !TOP_KEYS.includes(k) && !['trigger', 'condition', 'action'].includes(k),
  )
  if (extraTop.length)
    warn('C-06', `extra top-level keys: ${extraTop.join(', ')}`)
  const triggers = Array.isArray(doc.triggers)
    ? doc.triggers
    : Array.isArray(doc.trigger)
      ? doc.trigger
      : []
  if (triggers.some((t) => isObj(t) && 'platform' in t))
    err('C-06', 'triggers must use `trigger:` instead of `platform:`')

  // ---- C-07 mode
  if (doc.max_exceeded !== 'silent')
    err('C-07', '`max_exceeded` must be `silent`')
  if (!['single', 'restart'].includes(doc.mode))
    err('C-07', '`mode` must be `single` or `restart`')

  // ---- C-08 section comments
  const missingComments = SECTION_COMMENTS.filter((c) => !text.includes(c))
  if (missingComments.length)
    warn('C-08', `missing section comments: ${missingComments.join(', ')}`)

  // ---- C-10 .. C-13 description
  const dl = desc
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  if (dl[0] !== `# ${name}`)
    err(
      'C-10',
      'the first line of the description must be `# ` + the blueprint name',
    )
  const summary = dl.find(
    (l, i) => i > 0 && !l.startsWith('#') && !/^ℹ️ Version /.test(l),
  )
  const wantSummary = `${SUMMARY_PREFIX}${modelName}.`
  if (!summary || !summary.startsWith(wantSummary))
    err('C-11', `the summary must start with: "${wantSummary}"`)
  res.info.summary = wantSummary

  const supportsLine = dl.find((l) => l.startsWith('Supports '))
  let descInts = null
  if (!supportsLine) {
    err('C-12', 'the description needs a line "Supports <integrations>."')
  } else {
    const found = integrationNamesIn(supportsLine)
    descInts = new Set(found)
    const want = `Supports ${NAME_ORDER.filter((n) => descInts.has(n)).join(', ')}.`
    if (!found.length)
      err('C-12', `no known integration named in "${supportsLine}"`)
    else if (supportsLine !== want)
      err('C-12', `the line must read "${want}" (found "${supportsLine}")`)
  }

  if (loc) {
    const base = `${SITE}/docs/blueprints/controllers/${loc.id}`
    const here = `${base}/${loc.library}/${loc.release}/${loc.version}`
    if (!dl.includes(`ℹ️ Version ${loc.version}`))
      err(
        'C-13',
        `the description must contain the line "ℹ️ Version ${loc.version}"`,
      )
    if (!dl.includes('## More Info'))
      err('C-13', 'the description must contain the "## More Info" block')
    const wantUrl = `${REPO_URL}/blob/main/website/docs/blueprints/controllers/${loc.id}/${loc.library}/${loc.release}/${loc.version}/${loc.id}.yaml`
    if (bp.source_url !== wantUrl)
      err('C-13', '`source_url` does not point to this file')
    const links = desc.match(
      new RegExp(`${SITE}/docs/blueprints/controllers/[^)\\s]*`, 'g'),
    )
    const bad = (links || []).filter(
      (l) => l !== base && !l.startsWith(`${here}#`),
    )
    if (bad.length)
      err(
        'C-13',
        `documentation links do not point to this version: ${bad.join(', ')}`,
      )
  }

  // ---- C-20 .. C-23 device input
  const dev = inputs.find((i) => i.key === 'controller_device')
  let labelInts = null
  let filterInts = null
  if (inputKeys[0] !== 'controller_device' || !dev) {
    err('C-20', 'the first input must be `controller_device`')
  } else {
    const sel = isObj(dev.def.selector) ? dev.def.selector.device : null
    if (!isObj(sel))
      err('C-20', '`controller_device` must use a `device` selector')
    else if (sel.multiple !== false)
      err('C-20', '`controller_device` must have `multiple: false`')
    if (dev.def.default !== '')
      err('C-20', "`controller_device` must have `default: ''`")

    const label = String(dev.def.name || '')
    const m = label.match(/^\(Required\) \((.+)\) Controller Device$/)
    const old = label.match(/^\((.+) Required\) Controller Device$/)
    if (!m && !old) {
      err(
        'C-21',
        `the device label must read "(Required) (<integrations>) Controller Device" (found "${label}")`,
      )
    } else {
      const found = integrationNamesIn((m || old)[1])
      labelInts = new Set(found)
      const want = `(Required) (${NAME_ORDER.filter((n) => labelInts.has(n)).join(', ')}) Controller Device`
      if (label !== want)
        warn(
          'C-21',
          `the device label should read "${want}" (found "${label}")`,
        )
    }

    const filter = isObj(sel) && Array.isArray(sel.filter) ? sel.filter : []
    filterInts = new Set()
    for (const f of filter) {
      if (!isObj(f)) continue
      const n = byFilter[f.integration]
      if (!n)
        err(
          'C-22',
          `unknown integration in the device filter: ${f.integration}`,
        )
      else filterInts.add(n)
      if (!f.manufacturer || !f.model)
        err(
          'C-22',
          `a ${f.integration} filter entry lacks \`manufacturer\` or \`model\``,
        )
    }
    if (!filter.length) err('C-22', 'the device filter is empty')
    const devText = rawBlock(text, /^\s{4}controller_device:\s*$/)
    const n = (devText.match(/#\s*source:\s*https?:\/\//g) || []).length
    if (filterInts.size && n < filterInts.size)
      warn(
        'C-23',
        `the device filter has ${n} "# source:" link(s) for ${filterInts.size} integration(s)`,
      )
    res.info.manufacturers = sorted(
      new Set(filter.filter(isObj).map((f) => String(f.manufacturer))),
    )
  }

  // ---- C-30 .. C-33 events and action inputs
  const actionInputs = inputs.filter((i) => i.key.startsWith('action_'))
  const inputEvents = new Set(actionInputs.map((i) => i.key.slice(7)))
  const labels = {}
  for (const { key, def } of actionInputs) {
    const ev = key.slice(7)
    const sel = isObj(def.selector) ? def.selector : {}
    if (!('action' in sel))
      err('C-30', `\`${key}\` must use an \`action\` selector`)
    if (!Array.isArray(def.default) || def.default.length)
      err('C-30', `\`${key}\` must have \`default: []\``)
    const label = String(def.name || '')
    if (!label.startsWith('(Optional) '))
      err('C-31', `the label of \`${key}\` must start with "(Optional) "`)
    labels[ev] = label.replace(/^\(Optional\) /, '')
    const kind = ev.split('_').pop()
    if (!/^(button|rotate)(_|$)/.test(ev))
      warn(
        'C-30',
        `event \`${ev}\` does not start with \`button_\` or \`rotate_\``,
      )
    else if (ev.startsWith('button_') && !EVENT_KINDS.includes(kind))
      warn(
        'C-30',
        `event \`${ev}\` does not end in a known kind (${EVENT_KINDS.join(', ')})`,
      )
  }
  if (!actionInputs.length) err('C-30', 'there are no `action_<event>` inputs')
  const fired = firedEvents(doc.actions ?? doc.action)
  const notFired = sorted(inputEvents).filter((e) => !fired.has(e))
  const noInput = sorted(fired).filter((e) => !inputEvents.has(e))
  if (notFired.length)
    err(
      'C-33',
      `these events have an input but are never fired as \`ahb_controller_event\`: ${notFired.join(', ')}`,
    )
  if (noInput.length)
    err(
      'C-33',
      `these events are fired but have no \`action_<event>\` input: ${noInput.join(', ')}`,
    )
  res.info.events = sorted(inputEvents).map((e) => ({
    event: e,
    label: labels[e],
  }))

  // ---- C-40 .. C-42 sections and option inputs
  const sections = [...new Set(inputs.map((i) => i.section).filter(Boolean))]
  for (const s of sections) {
    if (!s.endsWith('_section'))
      err('C-41', `section \`${s}\` must end in \`_section\``)
  }
  res.info.features = {
    text_helper: inputKeys.includes('helper_last_controller_event'),
    virtual_double_press: inputKeys.some((k) =>
      /_double_press(_enabled)?$/.test(k),
    ),
    long_press_loop: inputKeys.some((k) => /_max_loop_repeats$/.test(k)),
  }

  // ---- C-50 .. C-55 variables, mapping, triggers
  const vars = isObj(doc.variables) ? doc.variables : {}
  if (inputRef(vars.controller_id) !== 'controller_device')
    err('C-50', '`variables.controller_id` must be `!input controller_device`')
  if (vars.integration_id !== '{{ trigger.id.split("-")[0] }}')
    err(
      'C-50',
      '`variables.integration_id` must be \'{{ trigger.id.split("-")[0] }}\'',
    )

  const am = isObj(vars.actions_mapping) ? vars.actions_mapping : null
  let mapInts = null
  if (!am) {
    err('C-51', '`variables.actions_mapping` is missing')
  } else {
    mapInts = new Set()
    for (const [k, block] of Object.entries(am)) {
      if (!byKey[k]) {
        err(
          'C-51',
          `unknown key \`${k}\` in \`actions_mapping\` (allowed: ${INTEGRATIONS.map((i) => i.key).join(', ')})`,
        )
        continue
      }
      mapInts.add(byKey[k])
      const strangers = Object.keys(isObj(block) ? block : {}).filter(
        (e) => !inputEvents.has(e),
      )
      if (strangers.length)
        err(
          'C-53',
          `\`actions_mapping.${k}\` has entries that are not events of this blueprint: ${strangers.join(', ')}`,
        )
    }
    const amText = rawBlock(text, /^\s{2}actions_mapping:\s*$/)
    const n = (amText.match(/#\s*source:\s*https?:\/\//g) || []).length
    if (n < mapInts.size)
      warn(
        'C-52',
        `\`actions_mapping\` has ${n} "# source:" link(s) for ${mapInts.size} integration(s)`,
      )
    res.info.reference_links = sorted(
      new Set(
        (text.match(/#\s*source:\s*(https?:\/\/\S+)/g) || []).map((l) =>
          l.replace(/#\s*source:\s*/, ''),
        ),
      ),
    )
  }

  const keys = INTEGRATIONS.map((i) => i.key).join('|')
  const idRe = new RegExp(`^(${keys})-[a-z0-9]+(-[a-z0-9]+)*$`)
  const badIds = triggers
    .filter(isObj)
    .map((t) => t.id)
    .filter((id) => typeof id !== 'string' || !idRe.test(id))
  if (badIds.length)
    err(
      'C-54',
      `${badIds.length} trigger(s) lack an id of the form \`<integration>-<event-words>\`${badIds[0] ? `, for example \`${badIds[0]}\`` : ''}`,
    )
  const trigInts = new Set(
    triggers
      .filter(isObj)
      .map((t) => byKey[String(t.id).split('-')[0]])
      .filter(Boolean),
  )

  const places = [
    ['the device label', labelInts],
    ['the "Supports" line', descInts],
    ['the device filter', filterInts],
    ['`actions_mapping`', mapInts],
    ['the trigger ids', trigInts],
  ].filter(([, s]) => s)
  if (places.some(([, s]) => !sameSet(s, places[0][1])))
    err(
      'C-55',
      `the integrations disagree: ${places.map(([n, s]) => `${n}: ${list(s) || 'none'}`).join('; ')}`,
    )
  if (mapInts) res.info.integrations = NAME_ORDER.filter((n) => mapInts.has(n))

  return res
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
      '      ok: free-form release, only the blueprint header is checked',
    )
  else if (!r.errors.length && !r.warnings.length) console.log('      ok')
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
