import fs from 'fs'
import path from 'path'

/**
 * Recursively copies all assets from /library into /website/build/library
 */
function copyLibraryAssets(siteDir) {
  const librarySrc = path.resolve(siteDir, '../library')
  const outDir = path.join(siteDir, 'build', 'library')

  if (!fs.existsSync(librarySrc)) {
    console.warn('⚠️  Library folder not found:', librarySrc)
    return
  }

  const copyRecursive = (src, dest) => {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })

    for (const entry of fs.readdirSync(src)) {
      const srcPath = path.join(src, entry)
      const destPath = path.join(dest, entry)
      const stat = fs.statSync(srcPath)

      if (stat.isDirectory()) {
        copyRecursive(srcPath, destPath)
      } else {
        fs.copyFileSync(srcPath, destPath)
      }
    }
  }

  copyRecursive(librarySrc, outDir)
}

/**
 * Auto-imports blueprint packages from /library
 * Generates:
 *   /library
 *   /library/<category>/<slug>
 */
export default function libraryAutoImportPlugin(context) {
  return {
    name: 'library-autoimport-plugin',

    async loadContent() {
      const rootDir = path.resolve(context.siteDir, '../library')

      if (!fs.existsSync(rootDir)) {
        console.warn('⚠️ No library folder found:', rootDir)
        return []
      }

      const categories = fs
        .readdirSync(rootDir)
        .filter((c) => fs.statSync(path.join(rootDir, c)).isDirectory())

      const blueprints = []

      for (const category of categories) {
        const categoryDir = path.join(rootDir, category)
        const slugs = fs
          .readdirSync(categoryDir)
          .filter((s) => fs.statSync(path.join(categoryDir, s)).isDirectory())

        for (const slug of slugs) {
          const pkgDir = path.join(categoryDir, slug)
          const metadataPath = path.join(pkgDir, 'metadata.json')
          const mdxPath = path.join(pkgDir, 'blueprint.mdx')

          if (!fs.existsSync(metadataPath) || !fs.existsSync(mdxPath)) {
            continue
          }

          try {
            const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))

            blueprints.push({
              category,
              slug,
              pkgDir,
              metadata,
              mdxPath,
            })
          } catch (err) {
            console.error(`❌ Invalid metadata.json in: ${pkgDir}`, err.message)
          }
        }
      }

      return blueprints
    },

    async contentLoaded({ content, actions }) {
      const { addRoute, createData } = actions
      const siteDir = context.siteDir

      // ------------------------------------------------------------
      // COPY LIBRARY FILES INTO BUILD
      // ------------------------------------------------------------
      copyLibraryAssets(siteDir)

      // ------------------------------------------------------------
      // CREATE DATA FILE
      // ------------------------------------------------------------
      const jsonPath = await createData(
        'library.json',
        JSON.stringify(content, null, 2),
      )

      // ------------------------------------------------------------
      // /library INDEX PAGE
      // (Docusaurus automatically adds baseUrl: "/awesome-ha-blueprints")
      // ------------------------------------------------------------
      addRoute({
        path: '/library',
        exact: true,
        component:
          '@site/src/plugins/library-autoimport-plugin/BlueprintIndexPage.tsx',
        modules: {
          blueprints: jsonPath,
        },
      })

      // ------------------------------------------------------------
      // /library/<category>/<slug>
      // ------------------------------------------------------------
      for (const bp of content) {
        const metadataJson = await createData(
          `${bp.slug}-metadata.json`,
          JSON.stringify(bp.metadata, null, 2),
        )

        addRoute({
          path: `/library/${bp.category}/${bp.slug}`,
          exact: true,
          component:
            '@site/src/plugins/library-autoimport-plugin/BlueprintPage.tsx',
          modules: {
            metadata: metadataJson,
            mdx: bp.mdxPath,
          },
        })
      }

      console.log(`✅ Autoimport blueprint routes created (${content.length})`)
    },
  }
}
