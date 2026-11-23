/* =========================================================
   AHB controller package builder
   ---------------------------------------------------------
   Turns a contributor's controller YAML plus a few answers
   into the complete folder the library needs:

     controllers/<blueprint_id>/
       manifest.yaml                       (generated)
       <blueprint_id>.png                  (supplied)
       <blueprint_id>.pdf                  (supplied, optional)
       <library_id>/<release_id>/
         changelog.json                    (generated)
         notes.md                          (generated, optional)
         <YYYY.MM.DD>/<blueprint_id>.yaml  (the YAML, with the version
                                            line, the links and
                                            source_url filled in)

   Like controllerFormat.mjs this module only works on text. It
   never reads or writes files, so it runs the same in Node and in
   the browser.
   ========================================================= */
import { checkControllerYaml, SITE, REPO_URL } from './controllerFormat.mjs'

const ID_RE = /^[a-z0-9]+(_[a-z0-9]+)*$/
const LIBRARY_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?-?$/
const VERSION_RE = /^\d{4}\.\d{2}\.\d{2}$/
const TAG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/
const HOOKS = ['light', 'media_player', 'cover']
const REFERENCE_ORDER = [
  'Zigbee2MQTT',
  'ZHA Quirk',
  'deCONZ Device',
  'Shelly',
  'Blakadder',
  'External',
]

/* ---------- small helpers ---------- */
const q = (s) => `'${String(s).replace(/'/g, "''")}'`

export function suggestBlueprintId(manufacturer, model) {
  return `${manufacturer} ${model}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

// "IKEA E2489 BILRESA remote ..." -> { manufacturer: 'IKEA', model: 'E2489' }
export function guessManufacturerAndModel(modelName) {
  const [manufacturer = '', model = ''] = String(modelName || '').split(/\s+/)
  return { manufacturer, model }
}

export function todayAsVersion(date = new Date()) {
  const p = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}.${p(date.getMonth() + 1)}.${p(date.getDate())}`
}

// true for the domain itself and for its subdomains, and for nothing else
// ("evilzigbee2mqtt.io" is not "zigbee2mqtt.io")
const isHost = (host, domain) => host === domain || host.endsWith(`.${domain}`)

function referenceLabel(url) {
  let host
  try {
    host = new URL(url).hostname
  } catch {
    return 'External'
  }
  if (isHost(host, 'zigbee2mqtt.io')) return 'Zigbee2MQTT'
  if (host === 'zigbee.blakadder.com') return 'Blakadder'
  if (host === 'github.com' && /deconz/i.test(url)) return 'deCONZ Device'
  if (host === 'github.com' && /zha/i.test(url)) return 'ZHA Quirk'
  if (isHost(host, 'shelly.com') || isHost(host, 'shelly.cloud'))
    return 'Shelly'
  return 'External'
}

/* =========================================================
   The blueprint YAML: fill in what depends on its location
   ========================================================= */
export function standardDescriptionParts(loc, { hooks = false } = {}) {
  const base = `${SITE}/docs/blueprints/controllers/${loc.id}`
  const here = `${base}/${loc.library}/${loc.release}/${loc.version}`
  const paragraph = hooks
    ? [
        `Automations created with this blueprint can be connected with one or more [Hooks](${SITE}/docs/blueprints/hooks) supported by this controller.`,
        'Hooks allow to easily create controller-based automations for interacting with lights, covers, media players, and potentially more.',
        `See the list of [Hooks available for this controller](${here}#available-hooks) for additional details.`,
      ]
    : [
        `[See documentation for this controller](${base}) for additional details.`,
      ]
  const moreInfo = [
    '## More Info',
    '',
    `📝 [Changelog](${here}#changelog)`,
    `📕 Full documentation regarding this blueprint is available [here](${base}).`,
    '',
    `🚀 This blueprint is part of the **[Awesome HA Blueprints](${SITE}) project**. Please consider **[leaving a star on GitHub](${REPO_URL})**! 🌟`,
  ]
  const sourceUrl = `${REPO_URL}/blob/main/website/docs/blueprints/controllers/${loc.id}/${loc.library}/${loc.release}/${loc.version}/${loc.id}.yaml`
  return {
    versionLine: `ℹ️ Version ${loc.version}`,
    paragraph,
    moreInfo,
    sourceUrl,
  }
}

// Returns { text } or { problems: [...] }. The YAML is edited as text, so
// everything the contributor wrote (comments, spacing) stays as it is.
export function finalizeControllerYaml(text, loc, options = {}) {
  const problems = []
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const start = lines.findIndex((l) => /^ {2}description: \|[-+]?\s*$/.test(l))
  if (start < 0)
    return {
      problems: [
        'the description must be written as a block: `description: |` followed by indented lines',
      ],
    }
  let end = start + 1
  while (end < lines.length && (!lines[end].trim() || /^ {4}/.test(lines[end])))
    end++
  const block = lines.slice(start + 1, end)
  while (block.length && !block[block.length - 1].trim()) block.pop()

  if (block.some((l) => /^\s*ℹ️ Version /.test(l)))
    problems.push('remove the "ℹ️ Version" line; it is filled in for you')
  if (block.some((l) => l.trim() === '## More Info'))
    problems.push('remove the "## More Info" block; it is filled in for you')
  if (lines.some((l) => /^ {2}source_url:/.test(l)))
    problems.push('remove `source_url`; it is filled in for you')
  if (!block.length || !/^ {4}# /.test(block[0]))
    problems.push('the description must start with `# ` + the blueprint name')
  if (problems.length) return { problems }

  const parts = standardDescriptionParts(loc, options)
  const rest = block.slice(1)
  while (rest.length && !rest[0].trim()) rest.shift()
  // the standard paragraph goes right after the "Supports ..." line; any
  // further text of the contributor stays below it
  const supports = rest.findIndex((l) => l.trim().startsWith('Supports '))
  const cut = supports < 0 ? rest.length : supports + 1
  const intro = rest.slice(0, cut)
  const extra = rest.slice(cut)
  while (extra.length && !extra[0].trim()) extra.shift()
  const ind = (l) => (l ? `    ${l}` : '')
  const newBlock = [
    block[0],
    '',
    ind(parts.versionLine),
    '',
    ...intro,
    '',
    ...parts.paragraph.map(ind),
    '',
    ...(extra.length ? [...extra, ''] : []),
    ...parts.moreInfo.map(ind),
    '',
    `  source_url: ${parts.sourceUrl}`,
  ]
  const after = lines.slice(end)
  while (after.length && !after[0].trim()) after.shift()
  return {
    text: [...lines.slice(0, start + 1), ...newBlock, ...after].join('\n'),
  }
}

/* =========================================================
   manifest.yaml and changelog.json
   ========================================================= */
export function buildManifestText(m) {
  const out = []
  const person = (p, pad) => [
    `${pad}- id: ${q(p.id)}`,
    `${pad}  name: ${q(p.name || p.id)}`,
  ]
  out.push(`name: ${q(m.name)}`)
  out.push(`description: ${q(m.description)}`)
  out.push('librarians:')
  m.librarians.forEach((p) => out.push(...person(p, '  ')))
  out.push('libraries:')
  out.push(`  ${m.library}:`)
  out.push('    maintainers:')
  m.maintainers.forEach((p) => out.push(...person(p, '      ')))
  out.push('    original_authors:')
  m.originalAuthors.forEach((p) => out.push(...person(p, '      ')))
  out.push('    releases:')
  out.push(`      ${m.release}:`)
  out.push('        supported_hooks:')
  m.supportedHooks.forEach((h) => out.push(`          - ${q(h)}`))
  if (m.features.text_helper) out.push('    requires_helper: true')
  if (m.features.long_press_loop) out.push('    has_long_press_loop: true')
  if (m.features.virtual_double_press)
    out.push('    has_virtual_double_press: true')
  out.push('    supported_integrations:')
  m.integrations.forEach((i) => out.push(`      - ${q(i)}`))
  out.push(`manufacturer: ${q(m.manufacturer)}`)
  out.push(`model: ${q(m.model)}`)
  out.push(`model_name: ${q(m.modelName)}`)
  if (m.tags.length) {
    out.push('tags:')
    m.tags.forEach((t) => out.push(`  - ${q(t)}`))
  }
  if (m.references.length) {
    out.push('external_references:')
    m.references.forEach((r) =>
      out.push(`  - label: ${q(r.label)}`, `    url: ${q(r.url)}`),
    )
  }
  return `${out.join('\n')}\n`
}

export function buildChangelogText(version, authorId) {
  const entry = [
    {
      date: version,
      changes: [
        {
          author: `@${authorId}`,
          description: 'Initial blueprint version 🎉.',
          breaking: false,
        },
      ],
    },
  ]
  return `${JSON.stringify(entry, null, 2)}\n`
}

/* =========================================================
   The package
   ---------------------------------------------------------
   input
     yamlText   the contributor's YAML
     fields     {
       author:       { id, name }   GitHub user who submits
       manufacturer, model          e.g. 'IKEA', 'E2489'
       tags:         ['dimmer', ...]
       notes:        optional text for the page's Additional Notes
       hasPdf:       true when a manual is supplied
       blueprintId:  optional, suggested from manufacturer + model
       library:      optional, defaults to the author's id
       release:      optional, defaults to 'awesome'
       version:      optional, defaults to today
       supportedHooks: optional, defaults to none
       librarians:   optional, defaults to yarafie
       originalAuthors: optional, defaults to the author
     }
     existingIds  ids of the controllers already in the library

   result
     { ok, check, problems, location, files }
     files: [{ path, kind: 'text' | 'png' | 'pdf', text? }]
   ========================================================= */
export function buildControllerPackage({ yamlText, fields, existingIds = [] }) {
  const problems = []
  const check = checkControllerYaml(yamlText)
  if (check.status !== 'checked' || check.errors.length)
    return { ok: false, check, problems, location: null, files: [] }

  if (/#\s*CHANGE\b/.test(yamlText) || /ACME X100/.test(yamlText)) {
    problems.push(
      'the file still contains parts of the starter template: remove its "CHANGE" comments and replace the example name "ACME X100"',
    )
    return { ok: false, check, problems, location: null, files: [] }
  }

  const f = fields || {}
  const info = check.info
  const guess = guessManufacturerAndModel(info.model_name)
  const author = f.author || {}
  const manufacturer = (f.manufacturer ?? guess.manufacturer).trim()
  const model = (f.model ?? guess.model).trim()
  const id = (f.blueprintId || suggestBlueprintId(manufacturer, model)).trim()
  const library = (f.library || author.id || '').trim()
  const release = (f.release || 'awesome').trim()
  const version = (f.version || todayAsVersion()).trim()
  const hooks = (f.supportedHooks || []).filter((h) => h !== 'none')
  const tags = [...new Set((f.tags || []).map((t) => String(t).trim()))].filter(
    Boolean,
  )

  if (!author.id) problems.push('the author (GitHub user name) is missing')
  if (!manufacturer) problems.push('the manufacturer is missing')
  if (!model) problems.push('the model number is missing')
  if (!ID_RE.test(id))
    problems.push(
      `the blueprint id "${id}" may only contain lowercase letters, digits and single underscores`,
    )
  else if (existingIds.includes(id))
    problems.push(
      `a controller with the id "${id}" already exists; submit a new version of it instead`,
    )
  if (!LIBRARY_RE.test(library))
    problems.push(`"${library}" is not a valid library id (GitHub user name)`)
  if (!ID_RE.test(release))
    problems.push(
      `the release id "${release}" may only contain lowercase letters, digits and single underscores`,
    )
  if (!VERSION_RE.test(version))
    problems.push(`the version "${version}" must be written as YYYY.MM.DD`)
  const badTags = tags.filter((t) => !TAG_RE.test(t))
  if (badTags.length)
    problems.push(
      `tags may only contain lowercase letters, digits and dashes: ${badTags.join(', ')}`,
    )
  const badHooks = hooks.filter((h) => !HOOKS.includes(h))
  if (badHooks.length) problems.push(`unknown hooks: ${badHooks.join(', ')}`)
  if (problems.length)
    return { ok: false, check, problems, location: null, files: [] }

  const location = { id, library, release, version }
  const final = finalizeControllerYaml(yamlText, location, {
    hooks: hooks.length > 0,
  })
  if (final.problems)
    return { ok: false, check, problems: final.problems, location, files: [] }

  // the finished file must pass every rule, including those about its location
  const finalCheck = checkControllerYaml(final.text, { location })
  if (finalCheck.errors.length)
    return {
      ok: false,
      check: finalCheck,
      problems: ['the finished blueprint does not pass the format check'],
      location,
      files: [],
    }

  const zigbee = info.integrations.some((i) =>
    ['Zigbee2MQTT', 'ZHA', 'deCONZ'].includes(i),
  )
  const autoTags = [
    ...(zigbee ? ['zigbee'] : []),
    ...(info.integrations.includes('Shelly') ? ['wifi'] : []),
  ]
  const me = { id: author.id, name: author.name || author.id }
  const manifest = buildManifestText({
    name: info.name,
    description: info.summary,
    librarians: f.librarians || [{ id: 'yarafie', name: 'yarafie' }],
    library,
    release,
    maintainers: [me],
    originalAuthors: f.originalAuthors || [me],
    supportedHooks: hooks.length ? hooks : ['none'],
    features: info.features,
    integrations: info.integrations,
    manufacturer,
    model,
    modelName: info.model_name,
    tags: [...new Set([...autoTags, ...tags])],
    references: (info.reference_links || [])
      .map((url) => ({ label: referenceLabel(url), url }))
      .sort(
        (x, y) =>
          REFERENCE_ORDER.indexOf(x.label) - REFERENCE_ORDER.indexOf(y.label),
      ),
  })

  const root = `controllers/${id}`
  const rel = `${root}/${library}/${release}`
  const files = [
    { path: `${root}/manifest.yaml`, kind: 'text', text: manifest },
    { path: `${root}/${id}.png`, kind: 'png' },
    ...(f.hasPdf ? [{ path: `${root}/${id}.pdf`, kind: 'pdf' }] : []),
    {
      path: `${rel}/changelog.json`,
      kind: 'text',
      text: buildChangelogText(version, author.id),
    },
    ...(f.notes && f.notes.trim()
      ? [{ path: `${rel}/notes.md`, kind: 'text', text: `${f.notes.trim()}\n` }]
      : []),
    { path: `${rel}/${version}/${id}.yaml`, kind: 'text', text: final.text },
  ]
  return { ok: true, check: finalCheck, problems: [], location, files }
}
