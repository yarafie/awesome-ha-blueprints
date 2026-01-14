#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import path from 'node:path'

/* =========================================================
   Helpers
   ========================================================= */
function fail(msg) {
  console.error(`❌     ${msg}`)
  process.exit(1)
}

function info(msg) {
  console.log(`ℹ️    ${msg}`)
}

function run(script, args) {
  const result = spawnSync('node', [script, ...args], {
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

/* =========================================================
   Entry
   ========================================================= */
const [, , branchName, diffFile] = process.argv

if (!branchName || !diffFile) {
  fail('Missing arguments: <branchName> <diffFile>')
}

/* =========================================================
   Branch role detection (EXPLICIT, NO LEGACY)
   ========================================================= */
let role = null

if (branchName.startsWith('ahb_contrib/')) {
  role = 'contributor'
} else if (branchName.startsWith('ahb_maintain/')) {
  role = 'maintainer'
} else {
  fail(
    `Invalid branch prefix.

This repository only accepts:
  - ahb_contrib/*   (contributors)
  - ahb_maintain/* (maintainers)

Found:
  ${branchName}`,
  )
}

info(`Branch role detected: ${role}`)

/* =========================================================
   Validator execution plan
   ========================================================= */
/*
  IMPORTANT:
  - Contributors are restricted to a single blueprint scope
  - Maintainers may touch multiple blueprints
  - ALL roles run schema, semantic, and stage validation
*/
const BASE = path.resolve('.github/ahb_validate/scripts')

const VALIDATORS = [
  {
    file: 'ahb-validate-branch-scope.mjs',
    when: role === 'contributor',
    args: [branchName, diffFile],
    reason:
      'Contributor branches must be limited to a single blueprint scope',
  },
  {
    file: 'ahb-validate-schemas.mjs',
    when: true,
    args: [branchName, diffFile],
  },
  {
    file: 'ahb-validate-semantic.mjs',
    when: true,
    args: [branchName, diffFile],
  },
  {
    file: 'ahb-check-stages.mjs',
    when: true,
    args: [branchName],
  },
]

/* =========================================================
   Execute
   ========================================================= */
for (const v of VALIDATORS) {
  if (!v.when) {
    info(`Skipping ${v.file} (${v.reason})`)
    continue
  }

  info(`Running ${v.file}`)
  run(path.join(BASE, v.file), v.args)
}

console.log('✅     All AHB validations passed')
process.exit(0)
