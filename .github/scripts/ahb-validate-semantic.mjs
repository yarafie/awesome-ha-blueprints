#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'

/* =========================================================
   Helpers
   ========================================================= */
const errors = []

function record(msg) {
  errors.push(msg)
}

function finalize() {
  if (errors.length) {
    console.error('❌  AHB semantic validation failed:\n')
    errors.forEach((e) => console.error(e + '\n'))
    process.exit(1)
  }
  console.log('✅  AHB semantic validation passed')
  process.exit(0)
}

/* =========================================================
   Entry
   ========================================================= */
const [, , branchName, diffFile] = process.argv

if (!branchName || !diffFile) {
  console.error('❌  Missing arguments')
  process.exit(1)
}

if (!branchName.startsWith('ahb/')) {
  console.log('✅  Non-AHB branch – skipping semantic validation')
  process.exit(0)
}

const category = branchName.split('/')[1]

const changedFiles = fs
  .readFileSync(diffFile, 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter(Boolean)

/* =========================================================
   Utilities
   ========================================================= */
const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'))
const readYaml = (f) => yaml.load(fs.readFileSync(f, 'utf8')) || {}
const exists = (f) => fs.existsSync(f)

/* =========================================================
   Guardrail 1: Controller integrity (controllers only)
   ========================================================= */

/**
 * library/controllers/<device_id>/device.json
 */
function validateControllerDevice(file) {
  const parts = file.split('/')
  if (parts.length !== 4) return

  const deviceId = parts[2]
  const json = readJson(file)

  if (json.device_id !== deviceId) {
    record(
      `Controller device.json device_id mismatch:
  file: ${file}
  expected device_id: ${deviceId}
  actual device_id: ${json.device_id}`,
    )
  }
}

/**
 * Controller YAML filename + internal id consistency
 */
function validateControllerYaml(file) {
  if (!file.endsWith('.yaml')) return

  const parts = file.split('/')
  if (parts[1] !== 'controllers') return
  if (parts.length < 6) return

  const deviceId = parts[2]
  const filename = path.basename(file, '.yaml')

  if (filename !== deviceId) {
    record(
      `Controller YAML filename mismatch:
  file: ${file}
  expected filename: ${deviceId}.yaml`,
    )
  }

  const content = readYaml(file)
  const internalId =
    content?.blueprint?.id || content?.blueprint?.name || content?.id

  if (internalId && internalId !== deviceId) {
    record(
      `Controller YAML internal id mismatch:
  file: ${file}
  expected id: ${deviceId}
  actual id: ${internalId}`,
    )
  }
}

/* =========================================================
   Guardrail 2: Metadata integrity (ALL categories)
   ========================================================= */

/**
 * library/<category>/<id>/<YYYY.MM.DD>/metadata.json
 */
function validateMetadata(file) {
  const parts = file.split('/')
  const category = parts[1]
  const json = readJson(file)

  let expectedVersion

  if (category === 'controllers') {
    // library/controllers/<device>/<library>/<variant>/<version>/metadata.json
    if (parts.length < 7) return
    expectedVersion = parts[5]
  } else {
    // library/<category>/<id>/<version>/metadata.json
    if (parts.length < 5) return
    expectedVersion = parts[3]
  }

  if (json.version !== expectedVersion) {
    record(
      `Metadata version mismatch:
  file: ${file}
  expected version: ${expectedVersion}
  actual version: ${json.version}`,
    )
  }

  // NOTE:
  // metadata.json never contains id — identity is path-derived
}

/* =========================================================
   Guardrail 3: Version discipline
   ========================================================= */

function validateVersionDiscipline(metadataFile) {
  const parts = metadataFile.split('/')
  const base = parts.slice(0, -2).join('/')
  const currentVersion = parts[parts.length - 2]

  if (!exists(base)) return

  const versions = fs
    .readdirSync(base)
    .filter((d) => /^\d{4}\.\d{2}\.\d{2}$/.test(d))
    .sort()

  const latest = versions[versions.length - 1]

  if (latest !== currentVersion) {
    record(
      `Modification of non-latest version detected:
  file: ${metadataFile}
  latest version: ${latest}
  modified version: ${currentVersion}`,
    )
  }
}

/* =========================================================
   Guardrail 4: Breaking-change enforcement
   ========================================================= */

function validateBreakingChange(metadataFile) {
  const json = readJson(metadataFile)
  if (!json.breaking) return

  const changelog = path.join(
    path.dirname(path.dirname(metadataFile)),
    'changelog.json',
  )

  if (!exists(changelog)) {
    record(
      `Breaking change declared but changelog.json missing:
  metadata: ${metadataFile}`,
    )
    return
  }

  const log = readJson(changelog)
  const hasBreaking = log?.changes?.some((c) => c.breaking === true)

  if (!hasBreaking) {
    record(
      `Breaking change declared but not documented in changelog:
  metadata: ${metadataFile}
  changelog: ${changelog}`,
    )
  }
}

/* =========================================================
   Guardrail 5: Compatibility (light, contract-level)
   ========================================================= */

function validateCompatibility(file) {
  if (!file.endsWith('.yaml')) return

  const content = readYaml(file)
  const events = content?.triggers || []
  const actions = content?.actions || []

  if (!Array.isArray(events) || !Array.isArray(actions)) return
  ;[...events, ...actions].forEach((e) => {
    if (typeof e !== 'string') {
      record(
        `Invalid event/action contract (must be string):
  file: ${file}`,
      )
    }
  })
}

/* =========================================================
   Execution
   ========================================================= */

for (const file of changedFiles) {
  if (!file.startsWith('library/') || !exists(file)) continue

  if (file.endsWith('/device.json') && category === 'controllers') {
    validateControllerDevice(file)
  }

  if (file.endsWith('/metadata.json')) {
    validateMetadata(file)
    validateVersionDiscipline(file)
    validateBreakingChange(file)
  }

  if (file.endsWith('.yaml') && category === 'controllers') {
    validateControllerYaml(file)
    validateCompatibility(file)
  }
}

finalize()
