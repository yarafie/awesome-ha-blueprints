import fs from 'node:fs'
import path from 'node:path'

/* ---------------- helpers ---------------- */
function ok(msg) {
  console.log(`✅ ${msg}`)
  process.exit(0)
}

function fail(msg) {
  console.error(`❌ ${msg}`)
  process.exit(1)
}

function getAllChangedFiles() {
  const out = []
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f)
      if (fs.lstatSync(full).isDirectory()) walk(full)
      else out.push(full.replace(/\\/g, '/'))
    }
  }
  walk('.')
  return out
}

function isDate(v) {
  return /^\d{4}\.\d{2}\.\d{2}$/.test(v)
}

function stripV(v) {
  if (!/^v\d{4}\.\d{2}\.\d{2}$/.test(v)) return null
  return v.slice(1)
}

function isSimpleId(v) {
  return /^[a-z0-9_]+$/.test(v)
}

function isLibId(v) {
  return /^[a-zA-Z0-9_-]+$/.test(v)
}

/* ---------------- entry ---------------- */
const [, , branchName] = process.argv

if (!branchName) fail('Missing branch name')

// Non-AHB skip
if (!branchName.startsWith('ahb/')) {
  console.log('ℹ️  Non-AHB branch – skipping scope')
  process.exit(0)
}

const parts = branchName.split('/')
const category = parts[1]

if (category !== 'controllers') {
  ok('Non-controller AHB branch, skipping scope check')
}

// Expect format: ahb/controllers/<device>/<library>/<variant>/vDATE/author
if (parts.length !== 7) {
  fail('Invalid AHB controllers branch format')
}

const device = parts[2]
const library = parts[3]
const variant = parts[4]
const vDate = parts[5]
const author = parts[6]

if (!isSimpleId(device)) fail(`Invalid device_id: ${device}`)
if (!isLibId(library)) fail(`Invalid library: ${library}`)
if (!isLibId(variant)) fail(`Invalid variant: ${variant}`)
if (!author.startsWith('author-')) fail(`Invalid author segment: ${author}`)

const date = stripV(vDate)
if (!date || !isDate(date)) fail(`Invalid version segment: ${vDate}`)

// Allowed device prefix
const allowedPrefixes = [`library/controllers/${device}/`]

// Get all changed files in working directory
const changedFiles = getAllChangedFiles()

for (const file of changedFiles) {
  if (!allowedPrefixes.some((p) => file.startsWith(p))) {
    fail(
      `File outside allowed scope:\n${file}\n\nAllowed prefixes:\n${allowedPrefixes.join(
        '\n',
      )}`,
    )
  }
}

ok('Scope validation passed.')
