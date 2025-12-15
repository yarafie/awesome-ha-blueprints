#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import Ajv from 'ajv'

const ajv = new Ajv({ allErrors: true, strict: false })

function fail(msg) {
  console.error(`❌  ${msg}`)
  process.exit(1)
}

function ok(msg) {
  console.log(`✅  ${msg}`)
  process.exit(0)
}

const [, , branchName, diffFile] = process.argv

if (!branchName || !diffFile) {
  fail('Missing arguments')
}

if (!branchName.startsWith('ahb/')) {
  ok('Non-AHB branch – skipping schema validation')
}

const category = branchName.split('/')[1]

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

const changedFiles = fs
  .readFileSync(diffFile, 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter(Boolean)

const schemas = {}
for (const schemaPath of Object.values(SCHEMA_MAP[category])) {
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'))
  if (!schema.$id) {
    fail(`Schema ${schemaPath} is missing $id`)
  }
  ajv.addSchema(schema)
  schemas[schema.$id] = schema
}

let hasErrors = false

for (const file of changedFiles) {
  if (!file.endsWith('.json')) continue
  if (!file.startsWith('library/')) continue

  const json = JSON.parse(fs.readFileSync(file, 'utf8'))

  for (const schema of Object.values(schemas)) {
    if (ajv.validate(schema, json)) {
      console.log(`✔ Schema OK: ${file}`)
      continue
    }

    if (ajv.errors) {
      hasErrors = true
      console.error(`❌ Schema errors in ${file}`)
      console.error(ajv.errors)
    }
  }
}

if (hasErrors) {
  fail('Schema validation failed')
}

ok('Schema validation passed')
