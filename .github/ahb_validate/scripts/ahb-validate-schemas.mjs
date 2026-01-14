#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import Ajv2020 from 'ajv/dist/2020.js'
import matter from 'gray-matter'

/* =========================================================
   Setup (JSON Schema draft 2020-12)
   ========================================================= */
const ajv = new Ajv2020({
  allErrors: true,
  strict: false,
})

function fail(msg) {
  console.error(`❌     ${msg}`)
  process.exit(1)
}

function ok(msg) {
  console.log(`✅     ${msg}`)
  process.exit(0)
}

/* =========================================================
   Entry
   ========================================================= */
const [, , branchName, diffFile] = process.argv
if (!branchName || !diffFile) {
  fail('Missing arguments: <branchName> <diffFile>')
}

/*
  Schema validation applies equally to contributors and maintainers.
*/

/* =========================================================
   Load schemas
   ========================================================= */
const SCHEMA_DIR = 'website/schemas'

const JSON_SCHEMAS = {
  'blueprint.json': 'blueprint.schema.json',
  'library.json': 'library.schema.json',
  'release.json': 'release.schema.json',
  'version.json': 'version.schema.json',
  'changelog.json': 'changelog.schema.json',
  'actions.json': 'hooks.actions.schema.json',
  'hooks.json': 'hooks.mappings.schema.json',
}

const MDX_SCHEMAS = {
  index: 'index.mdx.schema.json',
  version: 'version.mdx.schema.json',
}

const compiled = {}

function loadSchema(schemaFile) {
  const fullPath = path.join(SCHEMA_DIR, schemaFile)

  if (!fs.existsSync(fullPath)) {
    fail(`Schema file not found: ${schemaFile}`)
  }

  const schema = JSON.parse(fs.readFileSync(fullPath, 'utf8'))

  if (!schema.$id) {
    fail(`Schema ${schemaFile} is missing $id`)
  }

  ajv.addSchema(schema, schema.$id)
  compiled[schemaFile] = schema
}

;[...Object.values(JSON_SCHEMAS), ...Object.values(MDX_SCHEMAS)].forEach(
  loadSchema,
)

/* =========================================================
   Read changed files (already filtered upstream)
   ========================================================= */
const changedFiles = fs
  .readFileSync(diffFile, 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter(Boolean)

/* =========================================================
   Helpers
   ========================================================= */
function isBlueprintFile(file) {
  return file.startsWith('website/docs/blueprints/')
}

/* =========================================================
   Validation
   ========================================================= */
let hasErrors = false

for (const file of changedFiles) {
  if (!isBlueprintFile(file)) continue
  if (!fs.existsSync(file)) continue

  const base = path.basename(file)

  /* ---------------- JSON ---------------- */
  if (file.endsWith('.json')) {
    const schemaFile = JSON_SCHEMAS[base]
    if (!schemaFile) continue

    const json = JSON.parse(fs.readFileSync(file, 'utf8'))
    const schema = compiled[schemaFile]

    const valid = ajv.validate(schema.$id, json)
    if (!valid) {
      hasErrors = true
      console.error(`❌     Schema errors in ${file}`)
      console.error(ajv.errors)
    } else {
      console.log(`✔     Schema OK: ${file}`)
    }
    continue
  }

  /* ---------------- MDX (frontmatter only) ---------------- */
  if (file.endsWith('.mdx')) {
    let schemaFile = null

    if (base === 'index.mdx') {
      schemaFile = MDX_SCHEMAS.index
    } else if (/^\d{4}\.\d{2}\.\d{2}\.mdx$/.test(base)) {
      schemaFile = MDX_SCHEMAS.version
    }

    if (!schemaFile) continue

    const raw = fs.readFileSync(file, 'utf8')
    const { data } = matter(raw)
    const schema = compiled[schemaFile]

    const valid = ajv.validate(schema.$id, data)
    if (!valid) {
      hasErrors = true
      console.error(`❌     MDX frontmatter schema errors in ${file}`)
      console.error(ajv.errors)
    } else {
      console.log(`✔     MDX frontmatter OK: ${file}`)
    }
  }
}

if (hasErrors) {
  fail('Schema validation failed')
}

ok('Schema validation passed')
