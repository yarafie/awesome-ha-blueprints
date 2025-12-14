import fs from 'node:fs'
import path from 'node:path'

function fail(msg) {
  console.error(`❌ ${msg}`)
  process.exit(1)
}

function ok(msg) {
  console.log(`✅ ${msg}`)
  process.exit(0)
}

const [, , branchName] = process.argv

// Skip non-AHB branches
if (!branchName || !branchName.startsWith('ahb/')) {
  console.log('ℹ️  Non-AHB branch, skipping stage checks.')
  process.exit(0)
}

// ahb/controllers/<device>/<library>/<variant>/vYYYY.MM.DD/author-<user>
const parts = branchName.split('/')
if (parts.length !== 7 || parts[1] !== 'controllers') {
  fail('Invalid AHB controllers branch format')
}

const device = parts[2]
const library = parts[3]
const variant = parts[4]
const vDate = parts[5]
const date = vDate.startsWith('v') ? vDate.slice(1) : null

if (!date) fail('Invalid version segment')

const rulesPath = '.github/ahb/required-files.controllers.json'
const rules = JSON.parse(fs.readFileSync(rulesPath, 'utf8'))

const substitutions = { device, library, variant, date }

function expand(p) {
  return p.replace(/\{(\w+)\}/g, (_, k) => substitutions[k])
}

const missing = {}

for (const [stage, files] of Object.entries(rules)) {
  const absent = files
    .map(expand)
    .filter((f) => !fs.existsSync(path.resolve(f)))
  if (absent.length) missing[stage] = absent
}

if (Object.keys(missing).length === 0) {
  ok('All AHB controller stages satisfied')
}

console.log('❌ Missing required files:')
for (const [stage, files] of Object.entries(missing)) {
  console.log(`\n${stage}:`)
  files.forEach((f) => console.log(`  - ${f}`))
}

process.exit(1)
