/* eslint-env node */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */

const fs = require('fs')
const path = require('path')

// Docusaurus plugin: auto-import blueprint packages from blueprints-lib/
function loadBlueprintPackages() {
  // MUST go 3 directories up, not 2
  const rootDir = path.resolve(__dirname, '../../../../blueprints-lib')

  const categories = fs.readdirSync(rootDir).filter((f) => {
    const full = path.join(rootDir, f)
    return fs.statSync(full).isDirectory()
  })

  const blueprints = []

  for (const category of categories) {
    const categoryPath = path.join(rootDir, category)

    const entries = fs.readdirSync(categoryPath).filter((f) => {
      const full = path.join(categoryPath, f)
      return fs.statSync(full).isDirectory()
    })

    for (const slug of entries) {
      const pkgDir = path.join(categoryPath, slug)
      const metadataPath = path.join(pkgDir, 'metadata.json')
      const mdxPath = path.join(pkgDir, 'blueprint.mdx')

      if (!fs.existsSync(metadataPath)) continue
      if (!fs.existsSync(mdxPath)) continue

      let metadata
      try {
        const raw = fs.readFileSync(metadataPath, 'utf8')
        metadata = JSON.parse(raw)
      } catch (err) {
        console.error(`\n❌ Invalid metadata.json in ${pkgDir}:\n`, err)
        continue // Skip this blueprint gracefully
      }

      blueprints.push({
        category,
        slug,
        path: pkgDir,
        metadata,
        mdxPath,
      })
    }
  }

  return blueprints
}

module.exports = function blueprintAutoImportPlugin(context, options) {
  return {
    name: 'blueprint-autoimport-plugin',

    async loadContent() {
      return loadBlueprintPackages()
    },

    async contentLoaded({ content, actions }) {
      const { createData, addRoute } = actions

      // Create generated JSON for use inside React components
      const dataPath = await createData(
        'blueprints-generated.json',
        JSON.stringify(content, null, 2),
      )

      // Create a single index page that lists all blueprints
      addRoute({
        path: '/blueprints',
        component: '@site/src/components/BlueprintIndexPage.jsx',
        exact: true,
        modules: {
          blueprints: dataPath,
        },
      })

      // Create routes for each blueprint individually
      for (const bp of content) {
        addRoute({
          path: `/blueprints/${bp.category}/${bp.slug}`,
          component: '@site/src/components/BlueprintPageWrapper.jsx',
          exact: true,
          modules: {
            metadata: await createData(
              `${bp.slug}-metadata.json`,
              JSON.stringify(bp.metadata, null, 2),
            ),
            mdx: bp.mdxPath,
          },
        })
      }
    },
  }
}
