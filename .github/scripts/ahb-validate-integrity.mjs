#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'

/* ---------------- helpers ---------------- */
function fail(msg) {
  console.error(`❌ ${msg}`)
  process.exit(1)
}
function ok(msg) {
  console.log(`✅ ${msg}`)
  process.exit(0)
}

/* ---------------- entry ---------------- */
const [, , branchName, diffFile] = process.argv
if (!branchName || !diffFile) {
  fail('Missing arguments')
}
if (!branchName.startsWith('ahb/')) {
  ok('Non-AHB branch – skipping integrity validation')
}

const changedFiles = fs
  .readFileSync(diffFile, 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter(Boolean)

/* ---------------- validators ---------------- */

/**
 * library/controllers/<device_id>/device.json
 */
function validateControllerDeviceId(file) {
  const parts = file.split('/')
  if (parts.length !== 4) return

  const deviceId = parts[2]
  const json = JSON.parse(fs.readFileSync(file, 'utf8'))

  if (json.device_id !== deviceId) {
    fail(
      `Controller device.json device_id mismatch:\n` +
        `  file: ${file}\n` +
        `  expected device_id: ${deviceId}\n` +
        `  actual device_id: ${json.device_id}`,
    )
  }
}

/**
 * library/<category>/<id>/YYYY.MM.DD/metadata.json
 */
function validateMetadataVersionAndId(file) {
  const parts = file.split('/')
  if (parts.length < 5) return

  const category = parts[1]
  const entityId = parts[2]
  const date = parts[3]
  const json = JSON.parse(fs.readFileSync(file, 'utf8'))

  if (json.version !== date) {
    fail(
      `Metadata version mismatch:\n` +
        `  file: ${file}\n` +
        `  expected version: ${date}\n` +
        `  actual version: ${json.version}`,
    )
  }

  // controllers metadata does NOT require id
  if (category !== 'controllers' && json.id !== entityId) {
    fail(
      `Metadata id mismatch:\n` +
        `  file: ${file}\n` +
        `  expected id: ${entityId}\n` +
        `  actual id: ${json.id}`,
    )
  }
}

/**
 * library/controllers/<device_id>/.../<device_id>.yaml
 */
function validateControllerYaml(file) {
  const parts = file.split('/')
  if (parts[0] !== 'library' || parts[1] !== 'controllers') return
  if (!file.endsWith('.yaml')) return
  if (parts.length < 6) return

  const deviceId = parts[2]
  const filename = path.basename(file, '.yaml')

  // filename must match device_id
  if (filename !== deviceId) {
    fail(
      `Controller YAML filename mismatch:\n` +
        `  file: ${file}\n` +
        `  expected filename: ${deviceId}.yaml\n` +
        `  actual filename: ${filename}.yaml`,
    )
  }

  // internal id (if present) must match device_id
  const content = yaml.load(fs.readFileSync(file, 'utf8')) || {}
  const internalId =
    content?.blueprint?.id || content?.blueprint?.name || content?.id || null

  if (internalId && internalId !== deviceId) {
    fail(
      `Controller YAML internal id mismatch:\n` +
        `  file: ${file}\n` +
        `  expected id: ${deviceId}\n` +
        `  actual id: ${internalId}`,
    )
  }
}

/**
 * Generic folder-name ↔ id consistency for JSON files
 */
function validateJsonIdMatchesFolder(file, expectedId, label) {
  const json = JSON.parse(fs.readFileSync(file, 'utf8'))
  if (json.id !== expectedId) {
    fail(
      `${label} id mismatch:\n` +
        `  file: ${file}\n` +
        `  expected id: ${expectedId}\n` +
        `  actual id: ${json.id}`,
    )
  }
}

/* ---------------- execution ---------------- */
for (const file of changedFiles) {
  if (!file.startsWith('library/')) continue
  if (!fs.existsSync(file)) continue

  const parts = file.split('/')

  // metadata.json FIRST (avoid false matches)
  if (file.endsWith('/metadata.json')) {
    validateMetadataVersionAndId(file)
    continue
  }

  // controllers/device.json
  if (file.endsWith('/device.json')) {
    validateControllerDeviceId(file)
    continue
  }

  // controller library.json
  // library/controllers/<device>/<library>/<library>.json
  if (
    parts[1] === 'controllers' &&
    parts.length === 5 &&
    file.endsWith('.json')
  ) {
    validateJsonIdMatchesFolder(file, parts[3], 'Controller library')
    continue
  }

  // controller variant.json
  // library/controllers/<device>/<library>/<variant>/<variant>.json
  if (
    parts[1] === 'controllers' &&
    parts.length === 6 &&
    file.endsWith('.json')
  ) {
    validateJsonIdMatchesFolder(file, parts[4], 'Controller variant')
    continue
  }

  // hooks
  if (parts[1] === 'hooks' && parts.length === 4 && file.endsWith('.json')) {
    validateJsonIdMatchesFolder(file, parts[2], 'Hook')
    continue
  }

  // automations
  if (
    parts[1] === 'automations' &&
    parts.length === 4 &&
    file.endsWith('.json')
  ) {
    validateJsonIdMatchesFolder(file, parts[2], 'Automation')
    continue
  }

  // yaml
  if (file.endsWith('.yaml')) {
    validateControllerYaml(file)
  }
}

ok('Integrity validation passed')
