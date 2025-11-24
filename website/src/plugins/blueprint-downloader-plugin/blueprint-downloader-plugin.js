import fs from 'fs'
import path from 'path'
import { globSync } from 'glob'

export default function hybridDownloaderPlugin(context) {
  const siteDir = context.siteDir
  const legacyRoot = path.resolve(siteDir, '../blueprints')
  const libraryRoot = path.resolve(siteDir, '../library')

  function loadLibraryBlueprints() {
    if (!fs.existsSync(libraryRoot)) return []

    // library/<category>/<slug>/versions/*.yaml
    const patterns = globSync('*/**/versions/*.yaml', { cwd: libraryRoot })

    const bps = []
    for (const file of patterns) {
      const parts = file.split('/')
      if (parts.length < 4) continue

      const category = parts[0]
      const slug = parts[1]
      const versionFile = parts.slice(2).join('/')
      const yamlPath = path.join(libraryRoot, category, slug, versionFile)

      const metadataPath = path.join(
        libraryRoot,
        category,
        slug,
        'metadata.json',
      )
      const changelogPath = path.join(
        libraryRoot,
        category,
        slug,
        'changelog.json',
      )

      const metadata = fs.existsSync(metadataPath)
        ? JSON.parse(fs.readFileSync(metadataPath, 'utf8'))
        : {}

      const changelog = fs.existsSync(changelogPath)
        ? JSON.parse(fs.readFileSync(changelogPath, 'utf8'))
        : []

      bps.push({
        source: 'library',
        category,
        id: slug,
        yamlPath,
        metadata,
        changelog,
      })
    }

    return bps
  }

  function loadLegacyBlueprints() {
    if (!fs.existsSync(legacyRoot)) return []

    // blueprints/<category>/<id>.yaml
    const patterns = globSync('*/**/*.yaml', { cwd: legacyRoot })

    const bps = []
    for (const file of patterns) {
      const parts = file.split('/')
      if (parts.length < 2) continue

      const category = parts[0]
      const id = parts[1].replace('.yaml', '')
      const yamlPath = path.join(legacyRoot, file)

      const changelogPath = path.join(
        legacyRoot,
        category,
        id,
        'changelog.json',
      )
      const changelog = fs.existsSync(changelogPath)
        ? JSON.parse(fs.readFileSync(changelogPath, 'utf8'))
        : []

      bps.push({
        source: 'legacy',
        category,
        id,
        yamlPath,
        metadata: {},
        changelog,
      })
    }

    return bps
  }

  return {
    name: 'hybrid-blueprint-downloader',

    async loadContent() {
      const library = loadLibraryBlueprints()
      const legacy = loadLegacyBlueprints()

      // Merge:
      // If library + legacy both contain same category/id, library wins.
      const merged = {}

      for (const bp of legacy) {
        merged[`${bp.category}/${bp.id}`] = bp
      }
      for (const bp of library) {
        merged[`${bp.category}/${bp.id}`] = bp
      }

      const finalList = Object.values(merged)
      console.log(`📦 Hybrid downloader loaded: ${finalList.length} blueprints`)
      return finalList
    },

    async contentLoaded({ content: blueprints, actions }) {
      const { addRoute } = actions

      for (const bp of blueprints) {
        addRoute({
          path: `/awesome-ha-blueprints/blueprints/${bp.category}/${bp.id}`,
          component:
            '../src/plugins/blueprint-downloader-plugin/download-blueprint.tsx',
          exact: true,
          modules: {
            yamlPath: bp.yamlPath,
          },
          // Pass metadata to React page
          props: {
            category: bp.category,
            id: bp.id,
            source: bp.source, // library OR legacy
            metadata: bp.metadata,
            changelog: bp.changelog,
          },
        })
      }

      console.log('✅ Hybrid downloader routes created')
    },
  }
}
