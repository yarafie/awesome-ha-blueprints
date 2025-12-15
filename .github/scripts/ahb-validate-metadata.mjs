#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import Ajv from 'ajv'

const ajv = new Ajv({ allErrors: true })

function loadSchema(p) {
  return ajv.compile(JSON.parse(fs.readFileSync(p, 'utf8')))
}
function fail(msg) {
  console.error(`❌  ${msg}`)
  process.exit(1)
}
function ok(msg) {
  console.log(`✅  ${msg}`)
  process.exit(0)
}

const [, , branchName] = process.argv
if (!branchName || !branchName.startsWith('ahb/')) {
  ok('Non-AHB branch – skipping metadata validation')
}

const schemas = {
  device: loadSchema('.github/ahb/schemas/device.schema.json'),
  library: loadSchema('.github/ahb/schemas/library.schema.json'),
  variant: loadSchema('.github/ahb/schemas/variant.schema.json'),
  version: loadSchema('.github/ahb/schemas/version-metadata.schema.json'),
}

const filesToCheck = [
  { glob: /device\.json$/, schema: schemas.device },
  { glob: /\/[^/]+\.json$/, schema: schemas.library },
  { glob: /\/[^/]+\/[^/]+\.json$/, schema: schemas.variant },
  { glob: /metadata\.json$/, schema: schemas.version },
]

const changed = fs.readFileSync('changed_files.txt', 'utf8').split('\n')

for (const file of changed) {
  if (!file || !fs.existsSync(file)) continue
  const rule = filesToCheck.find((r) => r.glob.test(file))
  if (!rule) continue

  const data = JSON.parse(fs.readFileSync(file, 'utf8'))
  const valid = rule.schema(data)
  if (!valid) {
    fail(
      `Schema validation failed for ${file}:\n${ajv.errorsText(rule.schema.errors)}`,
    )
  }
}

ok('Metadata schema validation passed')
