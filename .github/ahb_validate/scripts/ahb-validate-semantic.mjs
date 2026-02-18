#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'

/* =========================================================
   Home Assistant YAML tags
   ---------------------------------------------------------
   js-yaml does not recognize HA blueprint tags like !input.
   We extend the schema so semantic validation can parse
   blueprint YAML without failing on these tags.
   ========================================================= */

function makeTaggedScalar(tagName) {
  return new yaml.Type(tagName, {
    kind: 'scalar',
    resolve: (data) => data !== null && data !== undefined,
    construct: (data) => ({ __ahb_tag: tagName.replace(/^!/, ''), value: data }),
  })
}

// Minimal set needed for HA blueprints (extend if you start using more)
const AHB_YAML_SCHEMA = yaml.DEFAULT_SCHEMA.extend([
  makeTaggedScalar('!input'),
  makeTaggedScalar('!secret'),
  makeTaggedScalar('!include'),
])

/* =========================================================
   Error collection
   ========================================================= */
const errors = []

function record(msg) {
  errors.push(msg)
}

function finalize() {
  if (errors.length) {
    console.error('❌       AHB semantic validation failed:\n')
    errors.forEach((e) => console.error(e + '\n'))
    process.exit(1)
  }
  console.log('✅       AHB semantic validation passed')
  process.exit(0)
}

/* =========================================================
   Helpers
   ========================================================= */
const exists = (f) => fs.existsSync(f)
const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'))
const readYaml = (f) =>
  yaml.load(fs.readFileSync(f, 'utf8'), { schema: AHB_YAML_SCHEMA }) || {}

function isVersionDirName(v) {
  return /^\d{4}\.\d{2}\.\d{2}$/.test(v)
}

function toIsoDate(version) {
  // YYYY.MM.DD → YYYY-MM-DD
  return version.replace(/\./g, '-')
}

function listDirs(base) {
  if (!exists(base)) return []
  return fs
    .readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
}

/* =========================================================
   Identity parsing (Library Tree v2.0)
   ========================================================= */
function parseIdentity(file) {
  const parts = file.split('/').filter(Boolean)

  // website/docs/blueprints/<category>/...
  if (
    parts[0] !== 'website' ||
    parts[1] !== 'docs' ||
    parts[2] !== 'blueprints'
  ) {
    return null
  }

  const category = parts[3]
  if (!['controllers', 'hooks', 'automations'].includes(category)) return null

  const blueprintId = parts[4]
  const out = { category, blueprintId }

  // blueprint-level
  if (parts.length === 6) {
    out.level = 'blueprint'
    out.filename = parts[5]
    return out
  }

  // library-level
  if (parts.length === 7) {
    out.level = 'library'
    out.libraryId = parts[5]
    out.filename = parts[6]
    return out
  }

  // release-level
  if (parts.length === 8) {
    out.level = 'release'
    out.libraryId = parts[5]
    out.releaseId = parts[6]
    out.filename = parts[7]
    return out
  }

  // version-level
  if (parts.length === 9) {
    out.level = 'version'
    out.libraryId = parts[5]
    out.releaseId = parts[6]
    out.version = parts[7]
    out.filename = parts[8]
    return out
  }

  return null
}

/* =========================================================
   Entry
   ========================================================= */
const [, , branchName, diffFile] = process.argv

if (!branchName || !diffFile) {
  console.error('❌       Missing arguments')
  process.exit(1)
}

/*
  Semantic validation applies to:
    - ahb_contrib/*
    - ahb_maintain/*
*/
if (
  !branchName.startsWith('ahb_contrib/') &&
  !branchName.startsWith('ahb_maintain/')
) {
  console.log('✅       Non-AHB branch – skipping semantic validation')
  process.exit(0)
}

const changedFiles = fs
  .readFileSync(diffFile, 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter(Boolean)

/* =========================================================
   Guardrails
   ========================================================= */
function validateLatestVersion(identity, file) {
  if (identity.level !== 'version') return

  const base = path.join(
    'website/docs/blueprints',
    identity.category,
    identity.blueprintId,
    identity.libraryId,
    identity.releaseId,
  )

  const versions = listDirs(base).filter(isVersionDirName)
  if (!versions.length) return

  const latest = versions.sort().slice(-1)[0]
  if (identity.version !== latest) {
    record(
      `Modification of non-latest version detected:
  file: ${file}
  latest version: ${latest}
  modified version: ${identity.version}`,
    )
  }
}

function validateBlueprintJson(identity, file) {
  const json = readJson(file)

  if (json.blueprint_id !== identity.blueprintId) {
    record(
      `blueprint.json blueprint_id mismatch:
  file: ${file}
  expected: ${identity.blueprintId}
  actual: ${json.blueprint_id}`,
    )
  }

  if (json.category !== identity.category) {
    record(
      `blueprint.json category mismatch:
  file: ${file}
  expected: ${identity.category}
  actual: ${json.category}`,
    )
  }
}

function validateLibraryJson(identity, file) {
  const json = readJson(file)

  if (json.library_id !== identity.libraryId) {
    record(
      `library.json library_id mismatch:
  file: ${file}
  expected: ${identity.libraryId}
  actual: ${json.library_id}`,
    )
  }

  if (Array.isArray(json.releases)) {
    const base = path.join(
      'website/docs/blueprints',
      identity.category,
      identity.blueprintId,
      identity.libraryId,
    )

    const dirs = listDirs(base)

    dirs.forEach((d) => {
      if (!json.releases.includes(d)) {
        record(
          `library.json missing release entry:
  file: ${file}
  release directory exists: ${d}`,
        )
      }
    })

    json.releases.forEach((r) => {
      if (!dirs.includes(r)) {
        record(
          `library.json release does not exist on disk:
  file: ${file}
  missing directory: ${r}`,
        )
      }
    })
  }
}

function validateReleaseJson(identity, file) {
  const json = readJson(file)

  if (Array.isArray(json.versions)) {
    const base = path.join(
      'website/docs/blueprints',
      identity.category,
      identity.blueprintId,
      identity.libraryId,
      identity.releaseId,
    )

    const dirs = listDirs(base).filter(isVersionDirName)

    dirs.forEach((d) => {
      if (!json.versions.includes(d)) {
        record(
          `release.json missing version entry:
  file: ${file}
  version directory exists: ${d}`,
        )
      }
    })

    json.versions.forEach((v) => {
      if (!dirs.includes(v)) {
        record(
          `release.json version does not exist on disk:
  file: ${file}
  missing directory: ${v}`,
        )
      }
    })

    if (json.latest_version) {
      const latest = [...json.versions].sort().slice(-1)[0]
      if (json.latest_version !== latest) {
        record(
          `release.json latest_version mismatch:
  file: ${file}
  expected: ${latest}
  actual: ${json.latest_version}`,
        )
      }
    }
  }
}

function validateVersionJson(identity, file) {
  const json = readJson(file)

  if (json.version !== identity.version) {
    record(
      `version.json version mismatch:
  file: ${file}
  expected: ${identity.version}
  actual: ${json.version}`,
    )
  }

  if (json.date && json.date !== toIsoDate(identity.version)) {
    record(
      `version.json date mismatch:
  file: ${file}
  expected: ${toIsoDate(identity.version)}
  actual: ${json.date}`,
    )
  }

  const expectedYaml = `${identity.blueprintId}.yaml`
  if (json.blueprint_file && json.blueprint_file !== expectedYaml) {
    record(
      `version.json blueprint_file mismatch:
  file: ${file}
  expected: ${expectedYaml}
  actual: ${json.blueprint_file}`,
    )
  }
}

function validateBlueprintYaml(identity, file) {
  const expected = `${identity.blueprintId}.yaml`

  if (path.basename(file) !== expected) {
    record(
      `Blueprint YAML filename mismatch:
  file: ${file}
  expected filename: ${expected}`,
    )
  }

  try {
    readYaml(file)
  } catch (e) {
    record(
      `Blueprint YAML parse error:
  file: ${file}
  error: ${String(e)}`,
    )
  }
}

/* =========================================================
   Execution
   ========================================================= */
for (const file of changedFiles) {
  if (!exists(file)) continue

  const identity = parseIdentity(file)
  if (!identity) continue

  validateLatestVersion(identity, file)

  if (identity.level === 'blueprint' && file.endsWith('blueprint.json')) {
    validateBlueprintJson(identity, file)
    continue
  }

  if (identity.level === 'library' && file.endsWith('library.json')) {
    validateLibraryJson(identity, file)
    continue
  }

  if (identity.level === 'release' && file.endsWith('release.json')) {
    validateReleaseJson(identity, file)
    continue
  }

  if (identity.level === 'version' && file.endsWith('version.json')) {
    validateVersionJson(identity, file)
    continue
  }

  if (identity.level === 'version' && file.endsWith('.yaml')) {
    validateBlueprintYaml(identity, file)
    continue
  }
}

finalize()
