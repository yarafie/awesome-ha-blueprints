#!/usr/bin/env node

/**
 * Build-time generator for blueprint metadata files.
 *
 * Reads manifest.yaml + changelog.json + directory structure and generates
 * all derived JSON/MDX files that Docusaurus and the React components expect.
 *
 * Source of truth: manifest.yaml (per blueprint) + changelog.json (per release)
 * Generated: blueprint.json, index.mdx, library.json, release.json, version.json, <version>.mdx
 */

import fs from 'node:fs'
import path from 'node:path'
import { globSync } from 'glob'
import YAML from 'yaml'

const BLUEPRINTS_DIR = path.resolve(import.meta.dirname, '../docs/blueprints')
const TEMPLATES_DIR = path.resolve(import.meta.dirname, 'templates')

// ── Templates ───────────────────────────────────────────────────────────────

const TEMPLATES = {
  index: fs.readFileSync(path.join(TEMPLATES_DIR, 'index.mdx.tmpl'), 'utf-8'),
  controllerNoHooks: fs.readFileSync(
    path.join(TEMPLATES_DIR, 'controller-no-hooks.mdx.tmpl'),
    'utf-8',
  ),
  controllerWithHooks: fs.readFileSync(
    path.join(TEMPLATES_DIR, 'controller-with-hooks.mdx.tmpl'),
    'utf-8',
  ),
  hook: fs.readFileSync(path.join(TEMPLATES_DIR, 'hook.mdx.tmpl'), 'utf-8'),
  automation: fs.readFileSync(
    path.join(TEMPLATES_DIR, 'automation.mdx.tmpl'),
    'utf-8',
  ),
}

/** Replace all {{key}} placeholders in a template string. */
function renderTemplate(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) =>
    key in vars ? vars[key] : match,
  )
}

// ── Requirement ID mapping ──────────────────────────────────────────────────

const INTEGRATION_TO_REQUIREMENT_ID = {
  zigbee2mqtt: 'zigbee2mqtt',
  zha: 'zha',
  deconz: 'deconz',
  shelly: 'shelly',
}

/** Canonical order for integrations in generated text/frontmatter. */
const CANONICAL_INTEGRATION_ORDER = ['Zigbee2MQTT', 'ZHA', 'deCONZ', 'Shelly']

/** Canonical order for hook sections (matches original docs convention). */
const CANONICAL_HOOK_ORDER = ['light', 'media_player', 'cover']

// ── Standard hook descriptions ──────────────────────────────────────────────

const HOOK_DESCRIPTIONS = {
  light:
    'This Hook blueprint allows to build a controller-based automation to control a light. Supports brightness and color control both for white temperature and rgb lights.',
  media_player:
    'This Hook blueprint allows to build a controller-based automation to control a media player. Supports volume setting, play/pause and track selection.',
  cover:
    'This Hook blueprint allows to build a controller-based automation to control a cover. Supports opening, closing and tilting the cover.',
}

// ── Standard text blocks for flag-driven content ──────────────────────────

const STANDARD_LONG_PRESS_PARAGRAPH =
  'In addition of being able to provide custom actions for every kind of button press supported by the remote, the blueprint allows to loop the long press actions while the corresponding button is being held. Once released, the loop stops. This is useful when holding down a button should result in a continuous action (such as lowering the volume of a media player, or controlling a light brightness).'

const STANDARD_VDP_DESCRIPTION_PARAGRAPH =
  'The blueprint also adds support for virtual double button press events, which are not exposed by the controller itself.'

const STANDARD_VDP_HOOKS_NOTE = `:::note Virtual double press actions
Some of the following mappings might include actions for virtual double press events, which are disabled by default.
If you are using a hook mapping which provides an action for a virtual double press event, please make sure to enable support for virtual double press on the corresponding buttons with the corresponding blueprint input.
:::`

const STANDARD_INPUT_TEXT_REQUIREMENT = `<Requirement name='Input Text Integration' required>

This integration provides the entity which must be provided to the blueprint in the **Helper - Last Controller Event** input. Learn more about this helper by reading the dedicated section in the [Additional Notes](#helper---last-controller-event).

[Input Text Integration Docs](https://www.home-assistant.io/integrations/input_text/)

</Requirement>`

const STANDARD_HELPER_PARAGRAPH =
  "The `helper_last_controller_event` (Helper - Last Controller Event) input serves as a permanent storage area for the automation. The stored info is used to implement the blueprint's core functionality. To learn more about the helper, how it's used and why it's required, you can read the dedicated section in the [Controllers-Hooks Ecosystem documentation](/docs/controllers-hooks-ecosystem#helper---last-controller-event-input).\n\nThe helper is used to store the last controller event, allowing the blueprint to distinguish between different controller actions that the integration alone may not differentiate."

const STANDARD_VDP_ADDITIONAL_NOTE =
  "It's also important to note that the controller doesn't natively support double press events. Instead , this blueprint provides virtual double press events. You can read more about them in the [general Controllers-Hooks Ecosystem documentation](/docs/controllers-hooks-ecosystem#virtual-events)."

// ── Integration helpers ────────────────────────────────────────────────────

/** Filter out 'input_text' and sort in canonical order. */
function getActualIntegrations(integrations) {
  const actual = (integrations || []).filter(
    (i) => i.toLowerCase() !== 'input_text',
  )
  return actual.sort((a, b) => {
    const aIdx = CANONICAL_INTEGRATION_ORDER.indexOf(a)
    const bIdx = CANONICAL_INTEGRATION_ORDER.indexOf(b)
    if (aIdx === -1 && bIdx === -1) return 0
    if (aIdx === -1) return 1
    if (bIdx === -1) return -1
    return aIdx - bIdx
  })
}

/** Check if 'input_text' is in the integrations list. */
function hasInputText(integrations) {
  return (integrations || []).some((i) => i.toLowerCase() === 'input_text')
}

// ── Notes.md parsing ───────────────────────────────────────────────────────

/** Parse a notes.md file into sections by ### headers. */
function parseNoteSections(content) {
  if (!content) return []
  const sections = []
  let current = null
  for (const line of content.split('\n')) {
    if (line.startsWith('### ')) {
      if (current) sections.push(current)
      current = { title: line.slice(4).trim(), content: '' }
    } else if (current) {
      current.content += line + '\n'
    }
  }
  if (current) sections.push(current)
  for (const s of sections) {
    s.content = s.content.trim()
  }
  return sections
}

/** Build the complete Additional Notes section from manifest flags + notes.md. */
function buildAdditionalNotesSection(manifest, releaseDir) {
  const integrations = manifest.supported_integrations || []
  const hasIT = hasInputText(integrations)
  const hasVDP = manifest.has_virtual_double_press || false

  const notesPath = path.join(releaseDir, 'notes.md')
  let notesContent = ''
  if (fs.existsSync(notesPath)) {
    notesContent = fs.readFileSync(notesPath, 'utf-8').trim()
  }

  const noteSections = parseNoteSections(notesContent)

  if (!hasIT && !hasVDP && noteSections.length === 0) return ''

  let section = '## Additional Notes\n\n'

  // Helper subsection (from input_text flag)
  if (hasIT) {
    section += '### Helper - Last Controller Event\n\n'
    section += STANDARD_HELPER_PARAGRAPH + '\n\n'
  }

  // Virtual double press subsection (from flag)
  if (hasVDP) {
    section += '### Virtual double press events\n\n'
    section += STANDARD_VDP_ADDITIONAL_NOTE + '\n\n'
  }

  // Remaining sections from notes.md
  const remaining = noteSections.filter(
    (s) => s.title !== 'Virtual double press events',
  )
  for (const s of remaining) {
    section += `### ${s.title}\n\n${s.content}\n\n`
  }

  return section
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function readYaml(filePath) {
  return YAML.parse(fs.readFileSync(filePath, 'utf-8'))
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n')
}

function writeText(filePath, text) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, text)
}

/** List immediate subdirectories of a directory. */
function subdirs(dir) {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
}

/** Check if a version directory name matches YYYY.MM.DD pattern. */
function isVersionDir(name) {
  return /^\d{4}\.\d{2}\.\d{2}$/.test(name)
}

/** Convert version string "2026.04.09" to ISO date "2026-04-09". */
function versionToDate(version) {
  return version.replace(/\./g, '-')
}

/** Sort version strings descending (newest first). */
function sortVersionsDesc(versions) {
  return [...versions].sort((a, b) => b.localeCompare(a))
}

/** Get release-specific config, falling back to manifest-level defaults. */
function getReleaseConfig(manifest, releaseId) {
  const releaseOverride = manifest.releases?.[releaseId] || {}
  return {
    supported_hooks:
      releaseOverride.supported_hooks || manifest.supported_hooks || [],
    supported_integrations:
      releaseOverride.supported_integrations ||
      manifest.supported_integrations ||
      [],
    supported_controllers:
      releaseOverride.supported_controllers ||
      manifest.supported_controllers ||
      null,
  }
}

// ── File generators ─────────────────────────────────────────────────────────

function generateBlueprintJson(manifest, category, blueprintId, blueprintDir) {
  const hasImage = fs.existsSync(path.join(blueprintDir, `${blueprintId}.png`))
  const hasPdf = fs.existsSync(path.join(blueprintDir, `${blueprintId}.pdf`))

  const result = {
    name: manifest.name,
    category,
    blueprint_id: blueprintId,
    description: manifest.description,
    librarians: manifest.librarians,
    images: hasImage ? [`${blueprintId}.png`] : [],
    status: manifest.status || 'active',
  }

  // Controller-specific fields
  if (category === 'controllers') {
    result.manufacturer = manifest.manufacturer
    result.model = manifest.model
    result.model_name = manifest.model_name
  }

  result.tags = manifest.tags || []
  result.external_references = manifest.external_references || []
  result.manual_files = hasPdf ? [`${blueprintId}.pdf`] : []

  return result
}

function buildFrontmatter(fields) {
  return Object.entries(fields)
    .map(([k, v]) => {
      // Quote values that YAML would parse as numbers to preserve string type
      if (typeof v === 'string' && /^\d+$/.test(v)) {
        return `${k}: '${v}'`
      }
      return `${k}: ${v}`
    })
    .join('\n')
}

function generateIndexMdx(manifest, category, blueprintId) {
  const fields = {
    blueprint_id: blueprintId,
    category,
    title: manifest.name,
    description: manifest.description,
  }

  if (category === 'controllers') {
    fields.manufacturer = manifest.manufacturer
    fields.model = manifest.model
    fields.model_name = manifest.model_name
  }

  return renderTemplate(TEMPLATES.index, {
    frontmatter: buildFrontmatter(fields),
    category,
    id: blueprintId,
  })
}

function generateLibraryJson(
  manifest,
  category,
  blueprintId,
  libraryId,
  releaseIds,
) {
  const singular =
    category === 'controllers'
      ? 'controller'
      : category === 'hooks'
        ? 'hook'
        : 'automation'
  const capitalSingular = singular.charAt(0).toUpperCase() + singular.slice(1)

  // Controllers: "wobondar controller library"
  // Hooks/Automations: "EPMatt hook library for light"
  const title =
    category === 'controllers'
      ? `${libraryId} ${singular} library`
      : `${libraryId} ${singular} library for ${blueprintId}`

  const result = {
    library_id: libraryId,
    blueprint_id: blueprintId,
    title,
    description: `${capitalSingular} blueprint library for ${blueprintId} maintained by ${libraryId}.`,
    maintainers: manifest.maintainers,
    releases: releaseIds,
    category,
    status: manifest.status || 'active',
  }

  // Aggregate integrations from all releases in this library
  const allIntegrations = new Set()
  for (const rid of releaseIds) {
    const rc = getReleaseConfig(manifest, rid)
    if (rc.supported_integrations) {
      for (const i of getActualIntegrations(rc.supported_integrations)) {
        allIntegrations.add(i)
      }
    }
  }
  if (allIntegrations.size > 0) {
    result.supported_integrations = [...allIntegrations]
  }

  return result
}

function generateReleaseJson(
  manifest,
  category,
  blueprintId,
  libraryId,
  releaseId,
  versions,
  releaseConfig,
) {
  const sortedVersions = sortVersionsDesc(versions)
  const latestVersion = sortedVersions[0]

  const result = {
    release_id: releaseId,
    library_id: libraryId,
    blueprint_id: blueprintId,
    category,
    title: manifest.name,
    maintainers: manifest.maintainers,
    description: manifest.description,
    versions,
    latest_version: latestVersion,
    status: manifest.status || 'active',
  }

  if (category === 'controllers' && releaseConfig.supported_hooks) {
    result.supported_hooks = releaseConfig.supported_hooks
    result.supported_integrations = getActualIntegrations(
      releaseConfig.supported_integrations,
    )
  }

  if (category === 'hooks' && releaseConfig.supported_controllers) {
    result.supported_controllers = releaseConfig.supported_controllers
  }

  return result
}

function generateVersionJson(
  manifest,
  category,
  blueprintId,
  libraryId,
  releaseId,
  version,
) {
  return {
    version,
    date: versionToDate(version),
    blueprint_id: blueprintId,
    library_id: libraryId,
    release_id: releaseId,
    category,
    title: manifest.name,
    description: manifest.description,
    maintainers: manifest.maintainers,
    blueprint_file: `${blueprintId}.yaml`,
    status: manifest.status || 'active',
  }
}

// ── Version MDX generation ──────────────────────────────────────────────────

function buildVersionFrontmatter(manifest, category) {
  const fields = {
    title: manifest.name,
    description: manifest.description,
  }

  if (category === 'controllers') {
    fields.manufacturer = manifest.manufacturer
    fields.model = manifest.model
    fields.model_name = manifest.model_name
    const actualIntegrations = getActualIntegrations(
      manifest.supported_integrations,
    )
    fields.integrations = `[${actualIntegrations.join(', ')}]`
  }

  return buildFrontmatter(fields)
}

function buildRequirements(integrations) {
  return integrations
    .map((integ) => {
      const reqId = INTEGRATION_TO_REQUIREMENT_ID[integ.toLowerCase()]
      return reqId ? `<Requirement id='${reqId}'/>` : null
    })
    .filter(Boolean)
    .join('\n')
}

function buildHooksSections(hooksData, id, library, release) {
  if (!hooksData) return ''
  // Sort hooks in canonical order (light, media_player, cover)
  const sorted = [...hooksData.hooks].sort((a, b) => {
    const aIdx = CANONICAL_HOOK_ORDER.indexOf(a.hook)
    const bIdx = CANONICAL_HOOK_ORDER.indexOf(b.hook)
    if (aIdx === -1 && bIdx === -1) return 0
    if (aIdx === -1) return 1
    if (bIdx === -1) return -1
    return aIdx - bIdx
  })
  return sorted
    .map((h) => {
      const desc = HOOK_DESCRIPTIONS[h.hook] || ''
      return `### ${h.label}

${desc}

<SupportedHooks
  category='controllers'
  id='${id}'
  library='${library}'
  release='${release}'
  hook='${h.hook}'
/>`
    })
    .join('\n\n')
}

function generateDefaultVersionMdx(
  manifest,
  category,
  blueprintId,
  libraryId,
  releaseId,
  hooksData,
  releaseConfig,
  releaseDir,
) {
  const hooks = releaseConfig.supported_hooks
  const hasHooks = hooks && hooks.length > 0 && hooks[0] !== 'none'
  const integrations = manifest.supported_integrations || []
  const actualIntegrations = getActualIntegrations(integrations)

  // Build flag-driven description extra paragraphs
  let descriptionExtra = ''
  if (manifest.has_long_press_loop) {
    descriptionExtra += '\n' + STANDARD_LONG_PRESS_PARAGRAPH + '\n'
  }
  if (manifest.has_virtual_double_press) {
    descriptionExtra += '\n' + STANDARD_VDP_DESCRIPTION_PARAGRAPH + '\n'
  }

  const vars = {
    frontmatter: buildVersionFrontmatter(manifest, category),
    id: blueprintId,
    library: libraryId,
    release: releaseId,
    description: manifest.description,
    model_name: manifest.model_name || '',
    integrations_csv: actualIntegrations.join(', '),
    multi_integration_note:
      hasHooks && actualIntegrations.length > 1
        ? ' Just specify the integration used to connect the remote to Home Assistant when setting up the automation, and the blueprint will take care of all the rest.'
        : '',
    requirements: buildRequirements(actualIntegrations),
    hooks_sections: buildHooksSections(
      hooksData,
      blueprintId,
      libraryId,
      releaseId,
    ),
    description_extra: descriptionExtra,
    input_text_requirement: hasInputText(integrations)
      ? '\n' + STANDARD_INPUT_TEXT_REQUIREMENT
      : '',
    virtual_double_press_note:
      manifest.has_virtual_double_press && hasHooks
        ? STANDARD_VDP_HOOKS_NOTE + '\n\n'
        : '',
    additional_notes_section: buildAdditionalNotesSection(manifest, releaseDir),
  }

  if (category === 'controllers') {
    const template = hasHooks
      ? TEMPLATES.controllerWithHooks
      : TEMPLATES.controllerNoHooks
    return renderTemplate(template, vars)
  }

  if (category === 'hooks') {
    return renderTemplate(TEMPLATES.hook, vars)
  }

  return renderTemplate(TEMPLATES.automation, vars)
}

// ── Main generator ──────────────────────────────────────────────────────────

function processBlueprint(manifestPath) {
  const manifest = readYaml(manifestPath)
  const blueprintDir = path.dirname(manifestPath)
  const blueprintId = path.basename(blueprintDir)
  const category = path.basename(path.dirname(blueprintDir))

  console.log(`  ${category}/${blueprintId}`)

  // 1. Generate blueprint.json
  const blueprintJson = generateBlueprintJson(
    manifest,
    category,
    blueprintId,
    blueprintDir,
  )
  writeJson(path.join(blueprintDir, 'blueprint.json'), blueprintJson)

  // 2. Generate index.mdx
  const indexMdx = generateIndexMdx(manifest, category, blueprintId)
  writeText(path.join(blueprintDir, 'index.mdx'), indexMdx)

  // 3. Walk library/release/version structure
  for (const libraryId of subdirs(blueprintDir)) {
    const libraryDir = path.join(blueprintDir, libraryId)
    const releaseIds = subdirs(libraryDir)

    // Generate library.json
    const libraryJson = generateLibraryJson(
      manifest,
      category,
      blueprintId,
      libraryId,
      releaseIds,
    )
    writeJson(path.join(libraryDir, 'library.json'), libraryJson)

    for (const releaseId of releaseIds) {
      const releaseDir = path.join(libraryDir, releaseId)

      // Discover version directories
      const versions = subdirs(releaseDir).filter(isVersionDir)
      if (versions.length === 0) continue

      // Read hooks.json if it exists (controllers only)
      let hooksData = null
      const hooksPath = path.join(releaseDir, 'hooks.json')
      if (fs.existsSync(hooksPath)) {
        hooksData = readJson(hooksPath)
      }

      // Resolve per-release config (with fallback to manifest defaults)
      const releaseConfig = getReleaseConfig(manifest, releaseId)

      // Generate release.json
      const releaseJson = generateReleaseJson(
        manifest,
        category,
        blueprintId,
        libraryId,
        releaseId,
        versions,
        releaseConfig,
      )
      writeJson(path.join(releaseDir, 'release.json'), releaseJson)

      // Check for docs.mdx override
      const docsOverridePath = path.join(releaseDir, 'docs.mdx')
      const hasDocsOverride = fs.existsSync(docsOverridePath)

      // Build version MDX content (shared across all versions of this release)
      let versionMdxContent
      if (hasDocsOverride) {
        const docsBody = fs.readFileSync(docsOverridePath, 'utf-8')
        const frontmatter = buildVersionFrontmatter(manifest, category)
        versionMdxContent = `---\n${frontmatter}\n---\n${docsBody}`
      } else {
        versionMdxContent = generateDefaultVersionMdx(
          manifest,
          category,
          blueprintId,
          libraryId,
          releaseId,
          hooksData,
          releaseConfig,
          releaseDir,
        )
      }

      for (const version of versions) {
        const versionDir = path.join(releaseDir, version)

        // Generate version.json
        const versionJson = generateVersionJson(
          manifest,
          category,
          blueprintId,
          libraryId,
          releaseId,
          version,
        )
        writeJson(path.join(versionDir, 'version.json'), versionJson)

        // Generate <version>.mdx
        writeText(path.join(versionDir, `${version}.mdx`), versionMdxContent)
      }
    }
  }
}

function main() {
  console.log('Generating blueprint files from manifests...\n')

  const manifests = globSync('**/manifest.yaml', { cwd: BLUEPRINTS_DIR })

  if (manifests.length === 0) {
    console.log('No manifest.yaml files found. Nothing to generate.')
    return
  }

  console.log(`Found ${manifests.length} manifest(s):\n`)

  for (const rel of manifests) {
    processBlueprint(path.join(BLUEPRINTS_DIR, rel))
  }

  console.log(`\nDone! Generated files for ${manifests.length} blueprint(s).`)
}

main()
