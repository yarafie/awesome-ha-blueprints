#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

/* ---------------- helpers ---------------- */
function fail(msg) {
  console.error(`❌   ${msg}`)
  process.exit(1)
}

function ok(msg) {
  console.log(`✅   ${msg}`)
  process.exit(0)
}

/* ---------------- entry ---------------- */
const [, , branchName, diffFile] = process.argv

if (!branchName || !diffFile) {
  fail('Missing arguments')
}

if (!branchName.startsWith('ahb/')) {
  ok('Non-AHB branch – skipping integrity validation')
}

const changedFiles = fs
  .readFileSync(diffFile, 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter(Boolean)

/* ---------------- validators ---------------- */

function validateControllerDeviceId(file) {
  // library/controllers/<device_id>/device.json
  const parts = file.split('/')
  if (parts.length !== 4) return

  const deviceId = parts[2]
  const json = JSON.parse(fs.readFileSync(file, 'utf8'))

  if (json.id !== deviceId) {
    fail(
      `Controller device.json id mismatch:\n` +
        `  file: ${file}\n` +
        `  expected id: ${deviceId}\n` +
        `  actual id: ${json.id}`,
    )
  }
}

function validateMetadataVersionAndId(file) {
  // library/<category>/<id>/YYYY.MM.DD/metadata.json
  const parts = file.split('/')
  if (parts.length < 5) return

  const category = parts[1]
  const entityId = parts[2]
  const date = parts[3]

  const json = JSON.parse(fs.readFileSync(file, 'utf8'))

  if (json.version !== date) {
    fail(
      `Metadata version mismatch:\n` +
        `  file: ${file}\n` +
        `  expected version: ${date}\n` +
        `  actual version: ${json.version}`,
    )
  }

  if (category !== 'controllers' && json.id !== entityId) {
    fail(
      `Metadata id mismatch:\n` +
        `  file: ${file}\n` +
        `  expected id: ${entityId}\n` +
        `  actual id: ${json.id}`,
    )
  }
}

/* ---------------- execution ---------------- */

for (const file of changedFiles) {
  if (!file.endsWith('.json')) continue
  if (!file.startsWith('library/')) continue
  if (!fs.existsSync(file)) continue

  if (file.endsWith('/device.json')) {
    validateControllerDeviceId(file)
    continue
  }

  if (file.endsWith('/metadata.json')) {
    validateMetadataVersionAndId(file)
  }
}

ok('Integrity validation passed')
