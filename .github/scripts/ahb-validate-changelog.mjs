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

/* ---------------- entry ---------------- */
const [, , branchName, diffFile] = process.argv

if (!branchName || !diffFile) {
  fail('Missing arguments')
}

if (!branchName.startsWith('ahb/')) {
  ok('Non-AHB branch – skipping changelog validation')
}

if (!fs.existsSync(diffFile)) {
  fail(`Diff file not found: ${diffFile}`)
}

const changedFiles = fs
  .readFileSync(diffFile, 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter(Boolean)

/* ---------------- grouping ---------------- */
const controllers = new Map()
const hooks = new Map()
const automations = new Map()

function mark(map, key, file) {
  if (!map.has(key)) {
    map.set(key, { changed: [], changelogTouched: false })
  }
  const entry = map.get(key)
  entry.changed.push(file)
  if (file.endsWith('changelog.json')) {
    entry.changelogTouched = true
  }
}

/* ---------------- classify changes ---------------- */
for (const file of changedFiles) {
  if (!file.startsWith('library/')) continue

  const parts = file.split('/')

  // library/controllers/<device>/...
  if (parts[1] === 'controllers' && parts.length >= 3) {
    const device = parts[2]
    mark(controllers, device, file)
    continue
  }

  // library/hooks/<hook_id>/...
  if (parts[1] === 'hooks' && parts.length >= 3) {
    const hookId = parts[2]
    mark(hooks, hookId, file)
    continue
  }

  // library/automations/<automation_id>/...
  if (parts[1] === 'automations' && parts.length >= 3) {
    const automationId = parts[2]
    mark(automations, automationId, file)
  }
}

/* ---------------- validation ---------------- */
function validateGroup(kind, map, changelogPathFn) {
  for (const [id, info] of map.entries()) {
    const nonChangelogChanges = info.changed.filter(
      (f) => !f.endsWith('changelog.json'),
    )

    // Only enforce if *something other than the changelog* changed
    if (nonChangelogChanges.length === 0) continue

    if (!info.changelogTouched) {
      fail(
        `${kind} "${id}" modified without changelog update.\n` +
          `Expected changelog:\n  ${changelogPathFn(id)}\n` +
          `Changed files:\n` +
          nonChangelogChanges.map((f) => `  - ${f}`).join('\n'),
      )
    }
  }
}

/* ---------------- enforce ---------------- */
validateGroup(
  'Controller',
  controllers,
  (id) => `library/controllers/${id}/changelog.json`,
)

validateGroup('Hook', hooks, (id) => `library/hooks/${id}/changelog.json`)

validateGroup(
  'Automation',
  automations,
  (id) => `library/automations/${id}/changelog.json`,
)

ok('Changelog validation passed')
