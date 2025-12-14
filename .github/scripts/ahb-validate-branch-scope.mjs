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

const parts = branchName.split('/')
const category = parts[1]

let allowedPrefix = ''

/* ---------------- controllers ---------------- */
if (category === 'controllers') {
  // ahb/controllers/<device>/<library>/<variant>/vYYYY.MM.DD/author-<user>
  if (parts.length !== 7) {
    fail('Invalid controllers branch format')
  }

  const [, , device, library, variant, vDate, author] = parts

  if (!isSimpleId(device)) fail(`Invalid device_id: ${device}`)
  if (!isLibId(library)) fail(`Invalid library: ${library}`)
  if (!isLibId(variant)) fail(`Invalid variant: ${variant}`)
  if (!author.startsWith('author-')) fail(`Invalid author segment: ${author}`)

  const date = stripV(vDate)
  if (!date || !isDate(date)) fail(`Invalid version: ${vDate}`)

  // 🔑 device root is allowed (stage files)
  allowedPrefix = `library/controllers/${device}/`
} else if (category === 'hooks') {

/* ---------------- hooks ---------------- */
  if (parts.length !== 5) fail('Invalid hooks branch format')

  const [, , hookId, vDate, author] = parts

  if (!isSimpleId(hookId)) fail(`Invalid hook_id: ${hookId}`)
  if (!author.startsWith('author-')) fail(`Invalid author segment: ${author}`)

  const date = stripV(vDate)
  if (!date || !isDate(date)) fail(`Invalid version: ${vDate}`)

  allowedPrefix = `library/hooks/${hookId}/`
} else if (category === 'automations') {

/* ---------------- automations ---------------- */
  if (parts.length !== 5) fail('Invalid automations branch format')

  const [, , automationId, vDate, author] = parts

  if (!isSimpleId(automationId)) fail(`Invalid automation_id: ${automationId}`)
  if (!author.startsWith('author-')) fail(`Invalid author segment: ${author}`)

  const date = stripV(vDate)
  if (!date || !isDate(date)) fail(`Invalid version: ${vDate}`)

  allowedPrefix = `library/automations/${automationId}/`
} else {
  fail(`Unknown AHB category: ${category}`)
}

/* ---------------- enforce scope ---------------- */
for (const file of changedFiles) {
  if (!file.startsWith(allowedPrefix)) {
    fail(
      `File outside allowed scope:\n${file}\n\nAllowed prefix:\n${allowedPrefix}`,
    )
  }
}

ok('AHB branch name and filesystem scope validated.')
