#!/usr/bin/env node
import fs from 'node:fs'

/* ---------------- helpers ---------------- */
function fail(msg) {
  console.error(`❌  ${msg}`)
  process.exit(1)
}

function ok(msg) {
  console.log(`✅  ${msg}`)
  process.exit(0)
}

function exists(p) {
  return fs.existsSync(p)
}

/* ---------------- entry ---------------- */
const [, , branchName] = process.argv

if (!branchName) {
  fail('Missing branch name')
}

if (!branchName.startsWith('ahb/')) {
  ok('Non-AHB branch – skipping stage checks')
}

const parts = branchName.split('/')
const category = parts[1]

/* =========================================================
   CONTROLLERS
   ========================================================= */
if (category === 'controllers') {
  // ahb/controllers/<device>/<library>/<variant>/vYYYY.MM.DD/author-<user>
  if (parts.length !== 7) {
    fail('Invalid AHB controllers branch format')
  }

  const [, , device, library, variant, vDate] = parts
  const date = vDate.replace(/^v/, '')
  const base = `library/controllers/${device}`

  const required = {
    stage_1: [`${base}/device.mdx`],
    stage_2: [`${base}/device.json`],
    stage_3: [
      `${base}/${library}/${library}.mdx`,
      `${base}/${library}/${library}.json`,
    ],
    stage_4: [
      `${base}/${library}/${variant}/${variant}.mdx`,
      `${base}/${library}/${variant}/${variant}.json`,
      `${base}/${library}/${variant}/changelog.json`,
    ],
    stage_5: [
      `${base}/${library}/${variant}/${date}/${device}.yaml`,
      `${base}/${library}/${variant}/${date}/metadata.json`,
    ],
  }

  const missing = {}

  for (const [stage, files] of Object.entries(required)) {
    const absent = files.filter((f) => !exists(f))
    if (absent.length > 0) {
      missing[stage] = absent
    }
  }

  if (Object.keys(missing).length > 0) {
    let msg = 'Missing required files:\n\n'
    for (const [stage, files] of Object.entries(missing)) {
      msg += `${stage}:\n`
      files.forEach((f) => {
        msg += `  - ${f}\n`
      })
    }
    fail(msg)
  }

  ok('Controllers stages validated')
}

/* =========================================================
   HOOKS
   ========================================================= */
if (category === 'hooks') {
  // ahb/hooks/<hook_id>/vYYYY.MM.DD/author-<user>
  if (parts.length !== 5) {
    fail('Invalid AHB hooks branch format')
  }

  const [, , hookId, vDate] = parts
  const date = vDate.replace(/^v/, '')
  const base = `library/hooks/${hookId}`

  const required = {
    stage_1: [
      `${base}/${hookId}.mdx`,
      `${base}/${hookId}.json`,
      `${base}/changelog.json`,
    ],
    stage_2: [
      `${base}/${date}/${hookId}.yaml`,
      `${base}/${date}/metadata.json`,
    ],
  }

  const missing = {}

  for (const [stage, files] of Object.entries(required)) {
    const absent = files.filter((f) => !exists(f))
    if (absent.length > 0) {
      missing[stage] = absent
    }
  }

  if (Object.keys(missing).length > 0) {
    let msg = 'Missing required files:\n\n'
    for (const [stage, files] of Object.entries(missing)) {
      msg += `${stage}:\n`
      files.forEach((f) => {
        msg += `  - ${f}\n`
      })
    }
    fail(msg)
  }

  ok('Hooks stages validated')
}

/* =========================================================
   AUTOMATIONS
   ========================================================= */
if (category === 'automations') {
  // ahb/automations/<automation_id>/vYYYY.MM.DD/author-<user>
  if (parts.length !== 5) {
    fail('Invalid AHB automations branch format')
  }

  const [, , automationId, vDate] = parts
  const date = vDate.replace(/^v/, '')
  const base = `library/automations/${automationId}`

  const required = {
    stage_1: [
      `${base}/${automationId}.mdx`,
      `${base}/${automationId}.json`,
      `${base}/changelog.json`,
    ],
    stage_2: [
      `${base}/${date}/${automationId}.yaml`,
      `${base}/${date}/metadata.json`,
    ],
  }

  const missing = {}

  for (const [stage, files] of Object.entries(required)) {
    const absent = files.filter((f) => !exists(f))
    if (absent.length > 0) {
      missing[stage] = absent
    }
  }

  if (Object.keys(missing).length > 0) {
    let msg = 'Missing required files:\n\n'
    for (const [stage, files] of Object.entries(missing)) {
      msg += `${stage}:\n`
      files.forEach((f) => {
        msg += `  - ${f}\n`
      })
    }
    fail(msg)
  }

  ok('Automations stages validated')
}

fail(`Unknown AHB category: ${category}`)
