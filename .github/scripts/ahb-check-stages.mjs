#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

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
  return fs.existsSync(path.resolve(p))
}
function loadRules(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}
function expand(p, vars) {
  return p.replace(/\{(\w+)\}/g, (_, k) => vars[k])
}

/* ---------------- entry ---------------- */
const [, , branchName] = process.argv

if (!branchName || !branchName.startsWith('ahb/')) {
  ok('Non-AHB branch – skipping stage checks')
}

const parts = branchName.split('/')
const category = parts[1]

/* =========================================================
   CONTROLLERS
   ========================================================= */
if (category === 'controllers') {
  if (parts.length !== 7) fail('Invalid AHB controllers branch format')

  const [, , device, library, variant, vDate] = parts
  const date = vDate.replace(/^v/, '')

  const rules = loadRules('.github/ahb/required-files.controllers.json')
  const vars = { device, library, variant, date }

  const missing = {}
  for (const [stage, files] of Object.entries(rules)) {
    const absent = files.map((f) => expand(f, vars)).filter((f) => !exists(f))
    if (absent.length) missing[stage] = absent
  }

  if (Object.keys(missing).length) {
    let msg = 'Missing required files:\n\n'
    for (const [stage, files] of Object.entries(missing)) {
      msg += `${stage}:\n`
      files.forEach((f) => (msg += `  - ${f}\n`))
    }
    fail(msg)
  }

  ok('Controllers stages validated')
}

/* =========================================================
   HOOKS
   ========================================================= */
if (category === 'hooks') {
  if (parts.length !== 5) fail('Invalid AHB hooks branch format')

  const [, , hook_id, vDate] = parts
  const date = vDate.replace(/^v/, '')

  const rules = loadRules('.github/ahb/required-files.hooks.json')
  const vars = { hook_id, date }

  const missing = {}
  for (const [stage, files] of Object.entries(rules)) {
    const absent = files.map((f) => expand(f, vars)).filter((f) => !exists(f))
    if (absent.length) missing[stage] = absent
  }

  if (Object.keys(missing).length) {
    let msg = 'Missing required files:\n\n'
    for (const [stage, files] of Object.entries(missing)) {
      msg += `${stage}:\n`
      files.forEach((f) => (msg += `  - ${f}\n`))
    }
    fail(msg)
  }

  ok('Hooks stages validated')
}

/* =========================================================
   AUTOMATIONS
   ========================================================= */
if (category === 'automations') {
  if (parts.length !== 5) fail('Invalid AHB automations branch format')

  const [, , automation_id, vDate] = parts
  const date = vDate.replace(/^v/, '')

  const rules = loadRules('.github/ahb/required-files.automations.json')
  const vars = { automation_id, date }

  const missing = {}
  for (const [stage, files] of Object.entries(rules)) {
    const absent = files.map((f) => expand(f, vars)).filter((f) => !exists(f))
    if (absent.length) missing[stage] = absent
  }

  if (Object.keys(missing).length) {
    let msg = 'Missing required files:\n\n'
    for (const [stage, files] of Object.entries(missing)) {
      msg += `${stage}:\n`
      files.forEach((f) => (msg += `  - ${f}\n`))
    }
    fail(msg)
  }

  ok('Automations stages validated')
}

fail(`Unknown AHB category: ${category}`)
