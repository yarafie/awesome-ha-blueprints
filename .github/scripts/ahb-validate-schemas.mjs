#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import Ajv from 'ajv'

/* ---------------- AJV SETUP ---------------- */

const ajv = new Ajv({ allErrors: true, strict: false })

function fail(msg) {
  console.error(`❌   ${msg}`)
  process.exit(1)
}

function ok(msg) {
  console.log(`✅   ${msg}`)
  process.exit(0)
}

/* ---------------- ENTRY ---------------- */

const [, , branchName, diffFile] = process.argv

if (!branchName || !diffFile) {
  fail('Missing arguments')
}

if (!branchName.startsWith('ahb/')) {
  ok('Non-AHB branch – skipping schema validation')
}

const category = branchName.split('/')[1]

/* ---------------- SCHEMA MAP ---------------- */

const SCHEMA_MAP = {
  controllers: {
    device: '.github/ahb/schemas/device.schema.json',
    library: '.github/ahb/schemas/library.schema.json',
    variant: '.github/ahb/schemas/variant.schema.json',
    metadata: '.github/ahb/schemas/version-metadata.schema.json',
  },
  hooks: {
    metadata: '.github/ahb/schemas/version-metadata.schema.json',
  },
  automations: {
    metadata: '.github/ahb/schemas/version-metadata.schema.json',
  },
}

if (!SCHEMA_MAP[category]) {
  ok(`No schemas defined for ${category}`)
}

/* ---------------- LOAD SCHEMAS (ONCE) ---------------- */

const schemas = {}

for (const [key, schemaPath] of Object.entries(SCHEMA_MAP[category])) {
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'))

  if (!schema.$id) {
    fail(`Schema ${schemaPath} is missing $id`)
  }

  // Register schema ONCE using its $id as key
  ajv.addSchema(schema, schema.$id)
  schemas[key] = schema
}

/* ---------------- CHANGED FILES ---------------- */

const changedFiles = fs
  .readFileSync(diffFile, 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter(Boolean)

/* ---------------- SCHEMA SELECTION ---------------- */
/*
  Important fix:
  Each JSON file must be validated against EXACTLY ONE schema,
  not all schemas.
*/

function selectSchemaKey(file) {
  if (category === 'controllers') {
    if (file.endsWith('/device.json')) return 'device'
    if (file.endsWith('/metadata.json')) return 'metadata'

    if (file.match(/^library\/controllers\/[^/]+\/[^/]+\/[^/]+\.json$/)) {
      return 'library'
    }

    if (
      file.match(/^library\/controllers\/[^/]+\/[^/]+\/[^/]+\/[^/]+\.json$/)
    ) {
      return 'variant'
    }
  }

  if (category === 'hooks' || category === 'automations') {
    if (file.endsWith('/metadata.json')) return 'metadata'
  }

  return null
}

/* ---------------- VALIDATION ---------------- */

let hasErrors = false

for (const file of changedFiles) {
  if (!file.endsWith('.json')) continue
  if (!file.startsWith('library/')) continue

  const schemaKey = selectSchemaKey(file)
  if (!schemaKey || !schemas[schemaKey]) continue

  const json = JSON.parse(fs.readFileSync(file, 'utf8'))
  const valid = ajv.validate(schemas[schemaKey].$id, json)

  if (!valid) {
    hasErrors = true
    console.error(`❌  Schema errors in ${file}`)
    console.error(ajv.errors)
  } else {
    console.log(`✔ Schema OK: ${file}`)
  }
}

if (hasErrors) {
  fail('Schema validation failed')
}

ok('Schema validation passed')
