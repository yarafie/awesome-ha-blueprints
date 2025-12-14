import fs from 'node:fs'

/* ---------------- helpers ---------------- */
function ok(msg) {
  console.log(`✅ ${msg}`)
  process.exit(0)
}

function fail(msg) {
  console.error(`❌ ${msg}`)
  process.exit(1)
}

function readLines(path) {
  if (!fs.existsSync(path)) return []
  return fs
    .readFileSync(path, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
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
const [, , branchName, diffFile] = process.argv

if (!branchName || !diffFile) {
  fail('Internal error: missing arguments')
}

/* -------- HARD SKIP for non-AHB branches -------- */
if (!branchName.startsWith('ahb/')) {
  console.log('ℹ️  Non-AHB branch detected. Skipping validation.')
  process.exit(0)
}

const changedFiles = readLines(diffFile)
if (changedFiles.length === 0) {
  fail('No changed files detected')
}

// ahb/controllers/<device>/<library>/<variant>/vYYYY.MM.DD/author-<user>
const parts = branchName.split('/')
const category = parts[1]

if (category !== 'controllers') {
  fail(`Unsupported AHB category: ${category}`)
}

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
if (!date || !isDate(date)) {
  fail(`Invalid version segment: ${vDate}`)
}

/* ---------------- scope enforcement ---------------- */
/**
 * IMPORTANT:
 * Controller submissions are allowed to touch ANY file under:
 *
 *   library/controllers/<device>/**
 *
 * This enables incremental stage completion:
 * - device.json
 * - device.mdx
 * - library files
 * - variant files
 * - version files
 */
const allowedPrefixes = [`library/controllers/${device}/`]

for (const file of changedFiles) {
  if (!allowedPrefixes.some((p) => file.startsWith(p))) {
    fail(
      `File outside allowed scope:\n${file}\n\nAllowed prefixes:\n${allowedPrefixes.join(
        '\n',
      )}`,
    )
  }
}

ok('AHB branch name and filesystem scope validated.')
