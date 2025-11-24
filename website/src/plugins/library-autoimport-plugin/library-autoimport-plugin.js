import fs from 'fs'
import path from 'path'

/**
 * Copies MDX + metadata.json files from library/ into the Docusaurus build folder
 * so they can be imported via routes.
 */
function copyLibraryAssets(context, content) {
  const targetRoot = path.join(outDir, 'library')
  if (!fs.existsSync(targetRoot)) {
    fs.mkdirSync(targetRoot, { recursive: true })
  }

  for (const bp of content) {
    const targetDir = path.join(targetRoot, bp.category, bp.slug)
    fs.mkdirSync(targetDir, { recursive: true })

    // Copy metadata.json
    const metaTarget = path.join(targetDir, 'metadata.json')
    fs.copyFileSync(path.join(bp.pkgDir, 'metadata.json'), metaTarget)

    // Copy MDX
    const mdxTarget = path.join(targetDir, 'blueprint.mdx')
    fs.copyFileSync(path.join(bp.pkgDir, 'blueprint.mdx'), mdxTarget)
  }

  console.log(`Copied ${content.length} blueprint packages into build output`)
}

/**
 * Auto-import blueprints from /library
 */
export default function libraryAutoImportPlugin(context) {
  return {
    name: 'library-autoimport-plugin',

    async loadContent() {
      const { siteDir } = context
      const rootDir = path.resolve(siteDir, '../library')

      if (!fs.existsSync(rootDir)) {
        console.warn(`[library] No library/ folder found at ${rootDir}`)
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

          if (!fs.existsSync(metadataPath)) continue
          if (!fs.existsSync(mdxPath)) continue

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
            console.error(
              `Invalid metadata.json inside ${pkgDir}:`,
              err.message,
            )
          }
        }
      }

      return blueprints
    },

    async contentLoaded({ content, actions }) {
      const { addRoute, createData } = actions

      // Copy static files into build
      copyLibraryAssets(context, content)

      // Generate library.json used by BlueprintIndexPage
      const jsonPath = await createData(
        'library.json',
        JSON.stringify(content, null, 2),
      )

      // Index route
      addRoute({
        path: '/library',
        exact: true,
        component:
          '../src/plugins/library-autoimport-plugin/BlueprintIndexPage.tsx',
        modules: {
          blueprints: jsonPath,
        },
      })

      // Individual blueprint routes
      for (const bp of content) {
        const metadataJson = await createData(
          `${bp.slug}-metadata.json`,
          JSON.stringify(bp.metadata, null, 2),
        )

        addRoute({
          path: `/library/${bp.category}/${bp.slug}`,
          exact: true,
          component:
            '../src/plugins/library-autoimport-plugin/BlueprintPage.tsx',
          modules: {
            metadata: metadataJson,
            mdx: bp.mdxPath,
          },
        })
      }

      console.log('Autoimport blueprint routes created')
    },
  }
}
