#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import Ajv from 'ajv'

/* ---------------- helpers ---------------- */
function fail(msg) {
  console.error(`❌  ${msg}`)
  process.exit(1)
}
function ok(msg) {
  console.log(`✅  ${msg}`)
  process.exit(0)
}
function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}
function fileExists(file) {
  return fs.existsSync(file)
}
function isDateFolder(v) {
  return /^\d{4}\.\d{2}\.\d{2}$/.test(v)
}
function stripV(vDate) {
  return typeof vDate === 'string' ? vDate.replace(/^v/, '') : ''
}
function pushError(errors, file, message, details) {
  const lines = []
  lines.push(message)
  if (details && details.length) {
    details.forEach((d) => lines.push(`  - ${d}`))
  }
  errors.push({ file, message: lines.join('\n') })
}

/* ---------------- entry ---------------- */
const [, , branchName, diffFile] = process.argv
if (!branchName || !diffFile) {
  fail('Missing arguments')
}
if (!branchName.startsWith('ahb/')) {
  ok('Non-AHB branch – skipping semantic validation')
}

/* ---------------- read changed files ---------------- */
const changedFiles = fs
  .readFileSync(diffFile, 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter(Boolean)

/* ---------------- AJV setup + schemas ---------------- */
const ajv = new Ajv({ allErrors: true, strict: false })

const SCHEMA_PATHS = {
  device: '.github/ahb/schemas/device.schema.json',
  library: '.github/ahb/schemas/library.schema.json',
  variant: '.github/ahb/schemas/variant.schema.json',
  version: '.github/ahb/schemas/version-metadata.schema.json',
}

const schemaByName = {}
const schemaIdAdded = new Set()

for (const [name, schemaPath] of Object.entries(SCHEMA_PATHS)) {
  if (!fileExists(schemaPath)) {
    fail(`Missing schema file: ${schemaPath}`)
  }
  const schema = readJson(schemaPath)
  if (!schema.$id) {
    fail(`Schema ${schemaPath} is missing $id`)
  }
  if (!schemaIdAdded.has(schema.$id)) {
    ajv.addSchema(schema, schema.$id)
    schemaIdAdded.add(schema.$id)
  }
  schemaByName[name] = schema
}

function validateWithSchema(errors, file, schemaName, json) {
  const schema = schemaByName[schemaName]
  if (!schema) return

  const valid = ajv.validate(schema, json)
  if (valid) return

  const details = (ajv.errors || []).map((e) => {
    const p = e.instancePath ? `at ${e.instancePath}` : 'at <root>'
    return `${p}: ${e.message}`
  })
  pushError(errors, file, `Schema validation failed (${schemaName})`, details)
}

/* ---------------- semantic routing ---------------- */
/**
 * Decide which schema applies based on exact canonical paths.
 * (This avoids the old “try every schema against every file” problem.)
 */
function detectSchemaForFile(file) {
  const parts = file.split('/')

  // library/controllers/<device>/device.json
  if (
    parts[0] === 'library' &&
    parts[1] === 'controllers' &&
    parts.length === 4 &&
    parts[3] === 'device.json'
  ) {
    return { schema: 'device' }
  }

  // library/controllers/<device>/<library>/<library>.json
  if (
    parts[0] === 'library' &&
    parts[1] === 'controllers' &&
    parts.length === 5 &&
    parts[4] === `${parts[3]}.json`
  ) {
    return { schema: 'library' }
  }

  // library/controllers/<device>/<library>/<variant>/<variant>.json
  if (
    parts[0] === 'library' &&
    parts[1] === 'controllers' &&
    parts.length === 6 &&
    parts[5] === `${parts[4]}.json`
  ) {
    return { schema: 'variant' }
  }

  // hooks: library/hooks/<hook>/<hook>.json
  if (
    parts[0] === 'library' &&
    parts[1] === 'hooks' &&
    parts.length === 4 &&
    parts[3] === `${parts[2]}.json`
  ) {
    return { schema: 'library' } // hooks use the "library" schema shape (id + maintainers)
  }

  // automations: library/automations/<automation>/<automation>.json
  if (
    parts[0] === 'library' &&
    parts[1] === 'automations' &&
    parts.length === 4 &&
    parts[3] === `${parts[2]}.json`
  ) {
    return { schema: 'library' } // automations use the "library" schema shape (id + maintainers)
  }

  // metadata.json:
  // controllers: library/controllers/<device>/<library>/<variant>/YYYY.MM.DD/metadata.json  (len 7)
  // hooks:       library/hooks/<id>/YYYY.MM.DD/metadata.json                             (len 5)
  // automations: library/automations/<id>/YYYY.MM.DD/metadata.json                       (len 5)
  if (parts[parts.length - 1] === 'metadata.json') {
    return { schema: 'version' }
  }

  return null
}

/* ---------------- integrity rules ---------------- */
function validateDeviceJsonIntegrity(errors, file) {
  // library/controllers/<device_id>/device.json
  const parts = file.split('/')
  const deviceId = parts[2]
  const json = readJson(file)

  // canonical: device.schema.json uses device_id
  if (json.device_id !== deviceId) {
    pushError(errors, file, 'Controller device.json device_id mismatch', [
      `expected device_id: ${deviceId}`,
      `actual device_id: ${json.device_id}`,
    ])
  }
}

function validateLibraryJsonIntegrity(errors, file, expectedId, label) {
  const json = readJson(file)
  if (json.id !== expectedId) {
    pushError(errors, file, `${label} id mismatch`, [
      `expected id: ${expectedId}`,
      `actual id: ${json.id}`,
    ])
  }
}

function validateVariantJsonIntegrity(errors, file, expectedId) {
  const json = readJson(file)
  if (json.id !== expectedId) {
    pushError(errors, file, 'Controller variant id mismatch', [
      `expected id: ${expectedId}`,
      `actual id: ${json.id}`,
    ])
  }
}

function validateMetadataIntegrity(errors, file) {
  // metadata.json must match its YYYY.MM.DD folder
  const parts = file.split('/')
  const date = parts[parts.length - 2]
  if (!isDateFolder(date)) {
    pushError(errors, file, 'metadata.json is not inside a YYYY.MM.DD folder', [
      `found folder: ${date}`,
    ])
    return
  }

  const json = readJson(file)
  if (json.version !== date) {
    pushError(errors, file, 'metadata.json version mismatch', [
      `expected version: ${date}`,
      `actual version: ${json.version}`,
    ])
  }

  // Optional: if "id" exists for hooks/automations metadata, ensure matches folder id
  const category = parts[1]
  const entityId = parts[2]
  if (
    category !== 'controllers' &&
    json.id !== undefined &&
    json.id !== entityId
  ) {
    pushError(errors, file, 'metadata.json id mismatch', [
      `expected id: ${entityId}`,
      `actual id: ${json.id}`,
    ])
  }
}

function validateControllerYamlIntegrity(errors, file) {
  // library/controllers/<device_id>/.../<device_id>.yaml
  const parts = file.split('/')
  if (parts[0] !== 'library' || parts[1] !== 'controllers') return

  const deviceId = parts[2]
  const filename = path.basename(file, '.yaml')

  if (filename !== deviceId) {
    pushError(errors, file, 'Controller YAML filename mismatch', [
      `expected filename: ${deviceId}.yaml`,
      `actual filename: ${filename}.yaml`,
    ])
  }

  // NOTE: Intentionally not parsing YAML content (no js-yaml dependency).
  // If later you want to enforce an internal id field, we can add a safe regex-based check.
}

/* ---------------- execution ---------------- */
const errors = []

for (const file of changedFiles) {
  if (!file.startsWith('library/')) continue
  if (!fileExists(file)) continue

  // YAML integrity (controllers only)
  if (file.endsWith('.yaml')) {
    validateControllerYamlIntegrity(errors, file)
    continue
  }

  // JSON schema + integrity
  if (file.endsWith('.json')) {
    const route = detectSchemaForFile(file)
    if (route) {
      const json = readJson(file)
      validateWithSchema(errors, file, route.schema, json)
    }

    const parts = file.split('/')

    // device.json integrity
    if (file.endsWith('/device.json')) {
      validateDeviceJsonIntegrity(errors, file)
      continue
    }

    // controller library.json integrity
    if (
      parts[0] === 'library' &&
      parts[1] === 'controllers' &&
      parts.length === 5 &&
      file.endsWith('.json')
    ) {
      validateLibraryJsonIntegrity(errors, file, parts[3], 'Controller library')
      continue
    }

    // controller variant.json integrity
    if (
      parts[0] === 'library' &&
      parts[1] === 'controllers' &&
      parts.length === 6 &&
      file.endsWith('.json')
    ) {
      validateVariantJsonIntegrity(errors, file, parts[4])
      continue
    }

    // hooks top json integrity: library/hooks/<id>/<id>.json
    if (parts[0] === 'library' && parts[1] === 'hooks' && parts.length === 4) {
      validateLibraryJsonIntegrity(errors, file, parts[2], 'Hook')
      continue
    }

    // automations top json integrity: library/automations/<id>/<id>.json
    if (
      parts[0] === 'library' &&
      parts[1] === 'automations' &&
      parts.length === 4
    ) {
      validateLibraryJsonIntegrity(errors, file, parts[2], 'Automation')
      continue
    }

    // metadata.json integrity
    if (file.endsWith('/metadata.json')) {
      validateMetadataIntegrity(errors, file)
      continue
    }
  }
}

/* ---------------- report ---------------- */
if (errors.length) {
  let msg = 'Semantic validation failed:\n\n'
  // Group by file for readability
  const byFile = new Map()
  for (const e of errors) {
    if (!byFile.has(e.file)) byFile.set(e.file, [])
    byFile.get(e.file).push(e.message)
  }

  for (const [file, msgs] of byFile.entries()) {
    msg += `${file}\n`
    msgs.forEach((m) => {
      const lines = m.split('\n')
      msg += `  - ${lines[0]}\n`
      for (let i = 1; i < lines.length; i++) {
        msg += `    ${lines[i]}\n`
      }
    })
    msg += '\n'
  }

  fail(msg.trimEnd())
}

ok('Semantic validation passed')
