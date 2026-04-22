#!/usr/bin/env node

/**
 * Generate manifest.yaml from fixed sources only.
 *
 * Sources of truth:
 * - directory structure: category/blueprint_id/library_id/release_id/version/
 * - blueprint.json at blueprint root (top-level shared metadata only)
 * - changelog.json at release level (used for validation / release existence)
 * - hooks.json at controller release level (fixed mapping source)
 * - blueprint YAML files under version directories (behavior + integrations)
 *
 * Maintainers source priority:
 * - release.json.maintainers
 * - library.json.maintainers
 * - fallback to [{ id: libraryId, name: libraryId }]
 *
 * This script intentionally does NOT read generated files such as:
 * - manifest.yaml
 * - version.json
 * - generated MDX
 *
 * Usage:
 *   node scripts/generate-manifest-from-fixed-sources.mjs [--dry-run] [--force]
 *
 * Optional:
 *   node scripts/generate-manifest-from-fixed-sources.mjs --force --blueprint controllers/ikea_e2001_e2002
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import YAML from 'yaml'

const BLUEPRINTS_DIR = path.resolve(import.meta.dirname, '../docs/blueprints')
const DRY_RUN = process.argv.includes('--dry-run')
const FORCE = process.argv.includes('--force')

const blueprintArgIndex = process.argv.indexOf('--blueprint')
const BLUEPRINT_FILTER =
  blueprintArgIndex !== -1 ? process.argv[blueprintArgIndex + 1] : null

const VERSION_DIR_RE = /^\d{4}\.\d{2}\.\d{2}$/

const CANONICAL_INTEGRATION_ORDER = ['Zigbee2MQTT', 'ZHA', 'deCONZ', 'Shelly']
const CANONICAL_HOOK_ORDER = ['light', 'media_player', 'cover']

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function safeReadJson(filePath) {
  if (!fs.existsSync(filePath)) return null
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch {
    return null
  }
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf-8')
}

function exists(filePath) {
  return fs.existsSync(filePath)
}

function subdirs(dir) {
  if (!exists(dir)) return []
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => !name.startsWith('.') && name !== 'node_modules')
}

function isVersionDir(name) {
  return VERSION_DIR_RE.test(name)
}

function sortObjectKeys(obj) {
  return Object.fromEntries(
    Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)),
  )
}

function sortUniqueStrings(values, preferredOrder = null) {
  const unique = [...new Set((values || []).filter(Boolean))]
  if (!preferredOrder) return unique.sort((a, b) => a.localeCompare(b))
  return unique.sort((a, b) => {
    const ai = preferredOrder.indexOf(a)
    const bi = preferredOrder.indexOf(b)
    if (ai === -1 && bi === -1) return a.localeCompare(b)
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })
}

function writeYaml(filePath, data) {
  const content = YAML.stringify(data, {
    lineWidth: 0,
    defaultKeyType: 'PLAIN',
    defaultStringType: 'QUOTE_DOUBLE',
  })
  fs.writeFileSync(filePath, content)
}

function normalizeTopLevelMetadata(blueprintJson, category) {
  const manifest = {
    name: blueprintJson.name,
    description: blueprintJson.description,
    librarians: blueprintJson.librarians,
    libraries: {},
  }

  if (category === 'controllers') {
    manifest.manufacturer = blueprintJson.manufacturer
    manifest.model = blueprintJson.model
    manifest.model_name = blueprintJson.model_name
  }

  if (blueprintJson.tags?.length) {
    manifest.tags = blueprintJson.tags
  }

  if (blueprintJson.external_references?.length) {
    manifest.external_references = blueprintJson.external_references
  }

  if (blueprintJson.status && blueprintJson.status !== 'active') {
    manifest.status = blueprintJson.status
  }

  return manifest
}

function collectYamlFilesForRelease(releaseDir) {
  const files = []
  for (const version of subdirs(releaseDir).filter(isVersionDir)) {
    const versionDir = path.join(releaseDir, version)
    const yamlFiles = fs
      .readdirSync(versionDir, { withFileTypes: true })
      .filter((d) => d.isFile() && d.name.endsWith('.yaml'))
      .map((d) => path.join(versionDir, d.name))
    files.push(...yamlFiles)
  }
  return files.sort()
}

function extractSelectorIntegrationsFromControllerYaml(rawYaml) {
  const found = []

  const mapping = {
    mqtt: 'Zigbee2MQTT',
    zha: 'ZHA',
    deconz: 'deCONZ',
    shelly: 'Shelly',
  }

  for (const match of rawYaml.matchAll(
    /^\s*-\s*integration:\s*([A-Za-z0-9_.-]+)\s*$/gm,
  )) {
    const key = match[1].toLowerCase()
    if (mapping[key]) {
      found.push(mapping[key])
    }
  }

  return sortUniqueStrings(found, CANONICAL_INTEGRATION_ORDER)
}

function extractTriggerIntegrationsFromControllerYaml(rawYaml) {
  const found = []

  // Zigbee2MQTT
  if (
    /^\s*-\s*trigger:\s*device\b[\s\S]{0,500}?^\s*domain:\s*mqtt\s*$/gim.test(
      rawYaml,
    )
  ) {
    found.push('Zigbee2MQTT')
  }

  // ZHA
  if (
    /^\s*-\s*trigger:\s*event\b[\s\S]{0,500}?^\s*event_type:\s*zha_event\s*$/gim.test(
      rawYaml,
    ) ||
    /^\s*event_type:\s*$[\s\S]{0,160}?^\s*-\s*zha_event\s*$/gim.test(rawYaml)
  ) {
    found.push('ZHA')
  }

  // deCONZ
  if (
    /^\s*-\s*trigger:\s*event\b[\s\S]{0,500}?^\s*event_type:\s*deconz_event\s*$/gim.test(
      rawYaml,
    ) ||
    /^\s*event_type:\s*$[\s\S]{0,160}?^\s*-\s*deconz_event\s*$/gim.test(rawYaml)
  ) {
    found.push('deCONZ')
  }

  // Shelly
  if (
    /^\s*-\s*trigger:\s*event\b[\s\S]{0,500}?^\s*event_type:\s*shelly\.click\s*$/gim.test(
      rawYaml,
    ) ||
    /^\s*event_type:\s*$[\s\S]{0,160}?^\s*-\s*shelly\.click\s*$/gim.test(
      rawYaml,
    )
  ) {
    found.push('Shelly')
  }

  return sortUniqueStrings(found, CANONICAL_INTEGRATION_ORDER)
}

function inferRequiresHelper(rawYaml) {
  return (
    /helper_last_controller_event\s*:/i.test(rawYaml) ||
    /Helper\s*-\s*Last Controller Event/i.test(rawYaml)
  )
}

function inferHasVirtualDoublePress(rawYaml) {
  return (
    /virtual double/i.test(rawYaml) ||
    /double press options/i.test(rawYaml) ||
    /enable .*double press event/i.test(rawYaml) ||
    /button_[a-z_]+_double\s*:/i.test(rawYaml) ||
    /\bDOUBLE press\b/i.test(rawYaml)
  )
}

function inferHasLongPressLoop(rawYaml) {
  return (
    /loop an action on a button long press/i.test(rawYaml) ||
    /enable looping until release/i.test(rawYaml) ||
    /maximum loop repeats/i.test(rawYaml) ||
    /long press options/i.test(rawYaml) ||
    /until it receives a release action/i.test(rawYaml) ||
    /(brightness|volume|color)_[a-z_]*repeat/i.test(rawYaml)
  )
}

function inferReleaseBehavior(yamlFiles) {
  const release = {
    supported_integrations: [],
    requires_helper: false,
    has_long_press_loop: false,
    has_virtual_double_press: false,
  }

  for (const yamlFile of yamlFiles) {
    const rawYaml = readText(yamlFile)

    const selectorIntegrations =
      extractSelectorIntegrationsFromControllerYaml(rawYaml)
    const triggerIntegrations =
      extractTriggerIntegrationsFromControllerYaml(rawYaml)

    const finalIntegrations =
      selectorIntegrations.length > 0
        ? selectorIntegrations
        : triggerIntegrations

    release.supported_integrations.push(...finalIntegrations)

    if (inferRequiresHelper(rawYaml)) release.requires_helper = true
    if (inferHasLongPressLoop(rawYaml)) release.has_long_press_loop = true
    if (inferHasVirtualDoublePress(rawYaml)) {
      release.has_virtual_double_press = true
    }
  }

  release.supported_integrations = sortUniqueStrings(
    release.supported_integrations,
    CANONICAL_INTEGRATION_ORDER,
  )

  return release
}

function readReleaseChangelog(releaseDir) {
  const changelogPath = path.join(releaseDir, 'changelog.json')
  if (!exists(changelogPath)) return []
  return readJson(changelogPath)
}

function validateReleaseHasVersionCoverage(
  releaseId,
  versions,
  changelogEntries,
) {
  if (versions.length === 0) {
    throw new Error(`Release '${releaseId}' has no version directories.`)
  }

  if (!Array.isArray(changelogEntries) || changelogEntries.length === 0) return
}

function readSupportedHooksForControllerRelease(releaseDir) {
  const hooksPath = path.join(releaseDir, 'hooks.json')
  if (!exists(hooksPath)) return ['none']

  const hooksJson = readJson(hooksPath)
  const hooks = (hooksJson.hooks || []).map((h) => h.hook).filter(Boolean)
  return sortUniqueStrings(hooks, CANONICAL_HOOK_ORDER)
}

function buildHookControllerIndex() {
  const index = new Map()
  const controllersDir = path.join(BLUEPRINTS_DIR, 'controllers')
  if (!exists(controllersDir)) return index

  for (const blueprintId of subdirs(controllersDir)) {
    const blueprintDir = path.join(controllersDir, blueprintId)
    for (const libraryId of subdirs(blueprintDir)) {
      const libraryDir = path.join(blueprintDir, libraryId)
      for (const releaseId of subdirs(libraryDir)) {
        const releaseDir = path.join(libraryDir, releaseId)
        const hooksPath = path.join(releaseDir, 'hooks.json')
        if (!exists(hooksPath)) continue

        const hooksJson = readJson(hooksPath)
        for (const hookDef of hooksJson.hooks || []) {
          if (!hookDef?.hook) continue
          const arr = index.get(hookDef.hook) || []
          arr.push(blueprintId)
          index.set(hookDef.hook, arr)
        }
      }
    }
  }

  for (const [hook, controllers] of index.entries()) {
    index.set(hook, sortUniqueStrings(controllers))
  }

  return index
}

function resolveMaintainers(libraryDir, releaseDir, libraryId) {
  const releaseJson = safeReadJson(path.join(releaseDir, 'release.json'))
  if (releaseJson?.maintainers?.length) {
    return releaseJson.maintainers
  }

  const libraryJson = safeReadJson(path.join(libraryDir, 'library.json'))
  if (libraryJson?.maintainers?.length) {
    return libraryJson.maintainers
  }

  return [{ id: libraryId, name: libraryId }]
}

function deriveLibraryNode({
  category,
  blueprintId,
  libraryId,
  libraryDir,
  hookControllerIndex,
}) {
  const releaseIds = subdirs(libraryDir)
  const libraryNode = {
    maintainers: [{ id: libraryId, name: libraryId }],
    releases: {},
  }

  const releaseIntegrationSets = []
  let libraryRequiresHelper = false
  let libraryHasLongPressLoop = false
  let libraryHasVirtualDoublePress = false
  let resolvedMaintainers = null

  for (const releaseId of releaseIds) {
    const releaseDir = path.join(libraryDir, releaseId)
    const versions = subdirs(releaseDir).filter(isVersionDir)
    if (versions.length === 0) continue

    const changelogEntries = readReleaseChangelog(releaseDir)
    validateReleaseHasVersionCoverage(releaseId, versions, changelogEntries)

    const maintainers = resolveMaintainers(libraryDir, releaseDir, libraryId)
    if (!resolvedMaintainers && maintainers?.length) {
      resolvedMaintainers = maintainers
    }

    const releaseNode = {}

    if (category === 'controllers') {
      const yamlFiles = collectYamlFilesForRelease(releaseDir)
      const inferred = inferReleaseBehavior(yamlFiles)

      releaseNode.supported_hooks =
        readSupportedHooksForControllerRelease(releaseDir)

      releaseIntegrationSets.push({
        releaseId,
        integrations: inferred.supported_integrations,
      })

      if (inferred.requires_helper) libraryRequiresHelper = true
      if (inferred.has_long_press_loop) libraryHasLongPressLoop = true
      if (inferred.has_virtual_double_press) libraryHasVirtualDoublePress = true
    }

    if (category === 'hooks') {
      const controllers = hookControllerIndex.get(blueprintId) || []
      releaseNode.supported_controllers = {
        controllers,
        count: controllers.length,
      }
    }

    libraryNode.releases[releaseId] = releaseNode
  }

  libraryNode.maintainers = resolvedMaintainers || [
    { id: libraryId, name: libraryId },
  ]

  if (libraryRequiresHelper) libraryNode.requires_helper = true
  if (libraryHasLongPressLoop) libraryNode.has_long_press_loop = true
  if (libraryHasVirtualDoublePress) libraryNode.has_virtual_double_press = true

  const uniqueSerializedSets = sortUniqueStrings(
    releaseIntegrationSets.map((r) => JSON.stringify(r.integrations)),
  )

  if (uniqueSerializedSets.length === 1 && releaseIntegrationSets.length > 0) {
    const common = JSON.parse(uniqueSerializedSets[0])
    if (common.length > 0) {
      libraryNode.supported_integrations = common
    }
  } else {
    for (const { releaseId, integrations } of releaseIntegrationSets) {
      if (integrations.length > 0) {
        libraryNode.releases[releaseId].supported_integrations = integrations
      }
    }
  }

  libraryNode.releases = sortObjectKeys(libraryNode.releases)
  return libraryNode
}

function buildManifest(blueprintDir, category, hookControllerIndex) {
  const blueprintJsonPath = path.join(blueprintDir, 'blueprint.json')
  if (!exists(blueprintJsonPath)) {
    throw new Error(`Missing blueprint.json in ${blueprintDir}`)
  }

  const blueprintJson = readJson(blueprintJsonPath)
  const manifest = normalizeTopLevelMetadata(blueprintJson, category)

  for (const libraryId of subdirs(blueprintDir)) {
    const libraryDir = path.join(blueprintDir, libraryId)
    const libraryNode = deriveLibraryNode({
      category,
      blueprintId: path.basename(blueprintDir),
      libraryId,
      libraryDir,
      hookControllerIndex,
    })

    if (Object.keys(libraryNode.releases).length === 0) continue
    manifest.libraries[libraryId] = libraryNode
  }

  manifest.libraries = sortObjectKeys(manifest.libraries)
  return manifest
}

function shouldProcessBlueprint(category, blueprintId) {
  if (!BLUEPRINT_FILTER) return true
  return `${category}/${blueprintId}` === BLUEPRINT_FILTER
}

function main() {
  if (DRY_RUN) {
    console.log('DRY RUN — no files will be written\n')
  }

  console.log('Generating manifest.yaml from fixed sources...\n')

  const hookControllerIndex = buildHookControllerIndex()
  const categories = ['controllers', 'hooks', 'automations']
  let count = 0

  for (const category of categories) {
    const categoryDir = path.join(BLUEPRINTS_DIR, category)
    if (!exists(categoryDir)) continue

    for (const blueprintId of subdirs(categoryDir)) {
      if (!shouldProcessBlueprint(category, blueprintId)) continue

      const blueprintDir = path.join(categoryDir, blueprintId)
      const manifestPath = path.join(blueprintDir, 'manifest.yaml')

      if (!FORCE && exists(manifestPath)) {
        console.log(
          `  ${category}/${blueprintId} — skipping (manifest.yaml already exists)`,
        )
        continue
      }

      const manifest = buildManifest(
        blueprintDir,
        category,
        hookControllerIndex,
      )
      console.log(`  ${category}/${blueprintId}`)

      if (DRY_RUN) {
        console.log('    Would write: manifest.yaml')
      } else {
        writeYaml(manifestPath, manifest)
        console.log('    Wrote: manifest.yaml')
      }

      count++
    }
  }

  console.log(
    `\nDone! Generated ${count} manifest(s).${DRY_RUN ? ' (dry run)' : ''}`,
  )
}

main()
