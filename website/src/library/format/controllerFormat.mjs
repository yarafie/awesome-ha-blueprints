/* =========================================================
   AHB controller format: the rules (C-01 .. C-55)
   ---------------------------------------------------------
   One source for the controller YAML format, shared by
     - the command line checker
       (.github/ahb_validate/scripts/ahb-check-controller-format.mjs)
     - the Contributors page of the website

   This module only looks at text. It never reads files, never
   prints and never exits, so it runs the same in Node and in the
   browser.

   checkControllerYaml(text, options) returns
     {
       status:   'checked' | 'legacy' | 'free-form',
       errors:   [{ rule, msg }],
       warnings: [{ rule, msg }],
       info:     what was read from the file (name, integrations, ...)
     }

   options
     location       { id, library, release, version } when the file
                    already has its place in the library. Leave it out
                    for a contributor's submission: the version line,
                    links and source_url are then not checked.
     includeLegacy  also check the older "integration dropdown"
                    controllers (skipped by default)
   ========================================================= */
import YAML from 'yaml'

export const SITE = 'https://yarafie.github.io/awesome-ha-blueprints'
export const REPO_URL = 'https://github.com/yarafie/awesome-ha-blueprints'

/* ---------- Integrations ---------- */
// key used in actions_mapping and trigger ids -> display name, device filter
export const INTEGRATIONS = [
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

/* =========================================================
   The check
   ========================================================= */
export function checkControllerYaml(text, opts = {}) {
  const res = {
    status: 'checked',
    errors: [],
    warnings: [],
    info: {},
  }
  const err = (rule, msg) => res.errors.push({ rule, msg })
  const warn = (rule, msg) => res.warnings.push({ rule, msg })
  const loc = opts.location || null

  // ---- C-01 valid YAML, valid blueprint header
  let doc
  try {
    doc = YAML.parse(text, { logLevel: 'error' })
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
    // every link into the controllers documentation, found without turning
    // the site address into a pattern
    const prefix = `${SITE}/docs/blueprints/controllers/`
    const links = desc
      .split(prefix)
      .slice(1)
      .map((rest) => prefix + rest.match(/^[^)\s]*/)[0])
    const bad = links.filter((l) => l !== base && !l.startsWith(`${here}#`))
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
  // the on/off options are named <button>_long_loop_enabled and
  // <button>_double_press_enabled
  for (const k of inputKeys) {
    const m = k.match(/^(.+_(?:long_loop|double_press))(_exposed)?$/)
    if (m) warn('C-41', `\`${k}\` should be named \`${m[1]}_enabled\``)
  }
  res.info.features = {
    text_helper: inputKeys.includes('helper_last_controller_event'),
    virtual_double_press: inputKeys.some((k) =>
      /_double_press(_enabled|_exposed)?$/.test(k),
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
