#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

/* =========================================================
   Constants
   ========================================================= */
const BLUEPRINT_ROOT = 'website/docs/blueprints'

/* =========================================================
   Helpers
   ========================================================= */
function fail(msg) {
  console.error(`❌       ${msg}`)
  process.exit(1)
}

function ok(msg) {
  console.log(`✅       ${msg}`)
  process.exit(0)
}

function exists(relativePath) {
  return fs.existsSync(path.join(BLUEPRINT_ROOT, relativePath))
}

function loadRules(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function expand(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k])
}

/* =========================================================
   Entry
   ========================================================= */
const [, , branchName] = process.argv

if (
  !branchName ||
  (!branchName.startsWith('ahb_contrib/') &&
    !branchName.startsWith('ahb_maintain/'))
) {
  ok('Non-AHB branch – skipping stage checks')
}

/*
  Required branch format:
  ahb_contrib/<category>/<blueprint_id>/<library_id>/<release_id>/<YYYY.MM.DD>/author-<user>
  ahb_maintain/<category>/<blueprint_id>/<library_id>/<release_id>/<YYYY.MM.DD>/author-<user>
*/
const parts = branchName.split('/')

if (parts.length !== 7) {
  fail(
    `Invalid branch format.
Expected:
  ahb_contrib/<category>/<blueprint_id>/<library_id>/<release_id>/<YYYY.MM.DD>/author-<user>
or
  ahb_maintain/<category>/<blueprint_id>/<library_id>/<release_id>/<YYYY.MM.DD>/author-<user>

Found:
  ${branchName}`,
  )
}

const [, category, blueprint_id, library_id, release_id, version, author] =
  parts

if (!['controllers', 'hooks', 'automations'].includes(category)) {
  fail(`Unknown blueprint category: ${category}`)
}

if (!author.startsWith('author-')) {
  fail(`Invalid author segment: ${author}`)
}

/* =========================================================
   Required-files rules
   ========================================================= */
const RULES_FILE = {
  controllers: '.github/ahb_validate/required-files/controllers.json',
  hooks: '.github/ahb_validate/required-files/hooks.json',
  automations: '.github/ahb_validate/required-files/automations.json',
}[category]

if (!RULES_FILE) {
  fail(`No required-files rules defined for category: ${category}`)
}

const rules = loadRules(RULES_FILE)

/* =========================================================
   Variable expansion context
   ========================================================= */
const vars = {
  blueprint_id,
  library_id,
  release_id,
  version,

  // Compatibility aliases (intentionally supported)
  device: blueprint_id,
  library: library_id,
  variant: release_id,
  hook_id: blueprint_id,
  automation_id: blueprint_id,
  date: version,
}

/* =========================================================
   Stage validation
   ========================================================= */
const missing = {}

for (const [stage, files] of Object.entries(rules)) {
  const absent = files
    .map((f) => expand(f, vars))
    .filter((f) => !exists(f))

  if (absent.length) {
    missing[stage] = absent
  }
}

/* =========================================================
   Report
   ========================================================= */
if (Object.keys(missing).length) {
  let msg = 'Missing required blueprint files:\n\n'

  for (const [stage, files] of Object.entries(missing)) {
    msg += `${stage}:\n`
    files.forEach((f) => {
      msg += `  - ${path.join(BLUEPRINT_ROOT, f)}\n`
    })
    msg += '\n'
  }

  msg +=
    'Each blueprint submission must include all required files\n' +
    'for its blueprint, library, release, and version stages.\n'

  fail(msg)
}

ok('All required blueprint stages are present')
