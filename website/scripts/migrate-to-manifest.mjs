#!/usr/bin/env node

/**
 * Migration script: extract manifest.yaml + docs.mdx from existing blueprint files.
 *
 * New manifest shape:
 * blueprint -> libraries -> releases
 *
 * For each blueprint, reads the existing JSON/MDX files and produces:
 * 1. manifest.yaml — single source of truth for metadata
 * 2. docs.mdx — release-level custom docs body (only if content differs from default template)
 *
 * Usage: node scripts/migrate-to-manifest.mjs [--dry-run] [--force]
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import YAML from 'yaml'

const BLUEPRINTS_DIR = path.resolve(import.meta.dirname, '../docs/blueprints')

const DRY_RUN = process.argv.includes('--dry-run')
const FORCE = process.argv.includes('--force')

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function subdirs(dir) {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => !name.startsWith('.') && name !== 'node_modules')
}

function isVersionDir(name) {
  return /^\d{4}\.\d{2}\.\d{2}$/.test(name)
}

function uniqueById(items) {
  const map = new Map()
  for (const item of items || []) {
    if (!item || !item.id) continue
    map.set(item.id, item)
  }
  return [...map.values()]
}

function sortObjectKeys(obj) {
  return Object.fromEntries(
    Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)),
  )
}

function pickReleaseFields(category, releaseJson, libraryJson) {
  const result = {}

  const releaseIntegrations = releaseJson.supported_integrations || []
  const libraryIntegrations = libraryJson?.supported_integrations || []
  if (
    releaseIntegrations.length > 0 &&
    JSON.stringify(releaseIntegrations) !== JSON.stringify(libraryIntegrations)
  ) {
    result.supported_integrations = releaseIntegrations
  }

  if (category === 'controllers' && (releaseJson.supported_hooks || []).length > 0) {
    result.supported_hooks = releaseJson.supported_hooks
  }

  if (category === 'hooks' && releaseJson.supported_controllers) {
    result.supported_controllers = releaseJson.supported_controllers
  }

  return result
}

function extractManifest(blueprintDir, category) {
  const blueprintJson = readJson(path.join(blueprintDir, 'blueprint.json'))

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

  const libraryIds = subdirs(blueprintDir)

  for (const libraryId of libraryIds) {
    const libraryDir = path.join(blueprintDir, libraryId)
    const libraryJsonPath = path.join(libraryDir, 'library.json')
    const libraryJson = fs.existsSync(libraryJsonPath)
      ? readJson(libraryJsonPath)
      : {}

    const releaseIds = subdirs(libraryDir)
    const libraryNode = {
      maintainers: uniqueById(libraryJson.maintainers || []),
      releases: {},
    }

    if ((libraryJson.supported_integrations || []).length > 0) {
      libraryNode.supported_integrations = libraryJson.supported_integrations
    }

    for (const releaseId of releaseIds) {
      const releaseDir = path.join(libraryDir, releaseId)
      const versions = subdirs(releaseDir).filter(isVersionDir)
      if (versions.length === 0) continue

      const releaseJsonPath = path.join(releaseDir, 'release.json')
      const releaseJson = fs.existsSync(releaseJsonPath)
        ? readJson(releaseJsonPath)
        : {}

      if (libraryNode.maintainers.length === 0 && releaseJson.maintainers?.length) {
        libraryNode.maintainers = uniqueById(releaseJson.maintainers)
      }

      const releaseNode = pickReleaseFields(category, releaseJson, libraryJson)
      libraryNode.releases[releaseId] = releaseNode
    }

    libraryNode.releases = sortObjectKeys(libraryNode.releases)
    manifest.libraries[libraryId] = libraryNode
  }

  manifest.libraries = sortObjectKeys(manifest.libraries)
  return manifest
}

function extractDocsMdx(blueprintDir, libraryId, releaseId) {
  const releaseDir = path.join(blueprintDir, libraryId, releaseId)
  const versions = subdirs(releaseDir).filter(isVersionDir)
  if (versions.length === 0) return null

  const latestVersion = versions.sort().reverse()[0]
  const mdxPath = path.join(releaseDir, latestVersion, `${latestVersion}.mdx`)
  if (!fs.existsSync(mdxPath)) return null

  const content = fs.readFileSync(mdxPath, 'utf-8')
  const firstFence = content.indexOf('---')
  const secondFence = content.indexOf('---', firstFence + 3)
  if (firstFence !== 0 || secondFence === -1) return content

  return content.slice(secondFence + 3).trimStart()
}

function migrateBlueprint(blueprintDir, category, blueprintId) {
  console.log(`  ${category}/${blueprintId}`)

  const manifest = extractManifest(blueprintDir, category)
  const manifestPath = path.join(blueprintDir, 'manifest.yaml')
  const yamlContent = YAML.stringify(manifest, {
    lineWidth: 0,
    defaultKeyType: 'PLAIN',
    defaultStringType: 'QUOTE_DOUBLE',
  })

  if (DRY_RUN) {
    console.log('    Would write: manifest.yaml')
  } else {
    fs.writeFileSync(manifestPath, yamlContent)
    console.log('    Wrote: manifest.yaml')
  }

  for (const libraryId of Object.keys(manifest.libraries)) {
    const libraryDir = path.join(blueprintDir, libraryId)

    for (const releaseId of Object.keys(manifest.libraries[libraryId].releases)) {
      const body = extractDocsMdx(blueprintDir, libraryId, releaseId)
      if (!body) continue

      const docsPath = path.join(libraryDir, releaseId, 'docs.mdx')
      if (DRY_RUN) {
        console.log(`    Would write: ${libraryId}/${releaseId}/docs.mdx`)
      } else {
        fs.writeFileSync(docsPath, body)
        console.log(`    Wrote: ${libraryId}/${releaseId}/docs.mdx`)
      }
    }
  }
}

function main() {
  if (DRY_RUN) {
    console.log('DRY RUN — no files will be written\n')
  }

  console.log('Migrating existing blueprints to manifest.yaml...\n')

  const categories = ['controllers', 'hooks', 'automations']
  let count = 0

  for (const category of categories) {
    const categoryDir = path.join(BLUEPRINTS_DIR, category)
    if (!fs.existsSync(categoryDir)) continue

    for (const blueprintId of subdirs(categoryDir)) {
      const blueprintDir = path.join(categoryDir, blueprintId)
      const manifestPath = path.join(blueprintDir, 'manifest.yaml')

      if (!FORCE && fs.existsSync(manifestPath)) {
        console.log(`  ${category}/${blueprintId} — skipping (manifest.yaml already exists)`)
        continue
      }

      if (!fs.existsSync(path.join(blueprintDir, 'blueprint.json'))) {
        console.log(`  ${category}/${blueprintId} — skipping (no blueprint.json)`)
        continue
      }

      migrateBlueprint(blueprintDir, category, blueprintId)
      count++
    }
  }

  console.log(`\nDone! Migrated ${count} blueprint(s).${DRY_RUN ? ' (dry run)' : ''}`)
}

main()
