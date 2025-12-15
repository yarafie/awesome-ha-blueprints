#!/usr/bin/env node
import fs from 'node:fs'

/* =========================================================
   Helpers
   ========================================================= */
function ok(msg) {
  console.log(`✅  ${msg}`)
  process.exit(0)
}

function fail(msg) {
  console.error(`❌  ${msg}`)
  process.exit(1)
}

function readLines(file) {
  if (!fs.existsSync(file)) return []
  return fs
    .readFileSync(file, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
}

function isDate(v) {
  return /^\d{4}\.\d{2}\.\d{2}$/.test(v)
}

function stripV(v) {
  if (!v.startsWith('v')) return null
  return v.slice(1)
}

function isSimpleId(v) {
  return /^[a-z0-9_]+$/.test(v)
}

function isLibId(v) {
  return /^[a-zA-Z0-9_-]+$/.test(v)
}

/* =========================================================
   Entry
   ========================================================= */
const [, , branchName, diffFile] = process.argv

if (!branchName || !diffFile) {
  fail('Internal error: missing arguments')
}

/* ---------------------------------------------------------
   Non-AHB branches: do nothing
   --------------------------------------------------------- */
if (!branchName.startsWith('ahb/')) {
  ok('Non-AHB branch – scope validation skipped')
}

const changedFiles = readLines(diffFile)
if (changedFiles.length === 0) {
  fail('No changed files detected')
}

/* =========================================================
   Branch parsing
   ========================================================= */
const parts = branchName.split('/')
const category = parts[1]

let allowedPrefix = ''

/* ---------------- CONTROLLERS ---------------- */
if (category === 'controllers') {
  // ahb/controllers/<device>/<library>/<variant>/vYYYY.MM.DD/author-<user>
  if (parts.length !== 7) {
    fail('Invalid AHB controllers branch format')
  }

  const [, , device, library, variant, vDate, author] = parts

  if (!isSimpleId(device)) fail(`Invalid device_id: ${device}`)
  if (!isLibId(library)) fail(`Invalid library: ${library}`)
  if (!isLibId(variant)) fail(`Invalid variant: ${variant}`)
  if (!author.startsWith('author-')) fail(`Invalid author segment: ${author}`)

  const date = stripV(vDate)
  if (!date || !isDate(date)) fail(`Invalid version: ${vDate}`)

  allowedPrefix = `library/controllers/${device}/`
} else if (category === 'hooks') {

/* ---------------- HOOKS ---------------- */
  // ahb/hooks/<hook_id>/vYYYY.MM.DD/author-<user>
  if (parts.length !== 5) {
    fail('Invalid AHB hooks branch format')
  }

  const [, , hookId, vDate, author] = parts

  if (!isSimpleId(hookId)) fail(`Invalid hook_id: ${hookId}`)
  if (!author.startsWith('author-')) fail(`Invalid author segment: ${author}`)

  const date = stripV(vDate)
  if (!date || !isDate(date)) fail(`Invalid version: ${vDate}`)

  allowedPrefix = `library/hooks/${hookId}/`
} else if (category === 'automations') {

/* ---------------- AUTOMATIONS ---------------- */
  // ahb/automations/<automation_id>/vYYYY.MM.DD/author-<user>
  if (parts.length !== 5) {
    fail('Invalid AHB automations branch format')
  }

  const [, , automationId, vDate, author] = parts

  if (!isSimpleId(automationId)) fail(`Invalid automation_id: ${automationId}`)
  if (!author.startsWith('author-')) fail(`Invalid author segment: ${author}`)

  const date = stripV(vDate)
  if (!date || !isDate(date)) fail(`Invalid version: ${vDate}`)

  allowedPrefix = `library/automations/${automationId}/`
} else {

/* ---------------- UNKNOWN ---------------- */
  fail(`Unknown AHB category: ${category}`)
}

/* =========================================================
   Enforce filesystem scope
   ========================================================= */
for (const file of changedFiles) {
  if (!file.startsWith(allowedPrefix)) {
    fail(
      `File outside allowed scope:\n${file}\n\nAllowed prefix:\n${allowedPrefix}`,
    )
  }
}

ok('AHB branch name and filesystem scope validated')
