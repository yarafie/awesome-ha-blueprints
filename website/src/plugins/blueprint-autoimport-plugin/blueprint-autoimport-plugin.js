/* eslint-env node */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */

const fs = require('fs')
const path = require('path')

/**
 * Scan blueprints-lib and collect packages.
 * rootDir is something like /.../awesome-ha-blueprints/blueprints-lib
 */
function loadBlueprintPackages(rootDir) {
  if (!fs.existsSync(rootDir)) {
    console.warn(
      `[blueprint-autoimport-plugin] Skipping: no blueprints-lib dir at ${rootDir}`,
    )
    return []
  }

  const categories = fs
    .readdirSync(rootDir)
    .filter((f) => fs.statSync(path.join(rootDir, f)).isDirectory())

  const blueprints = []

  for (const category of categories) {
    const categoryPath = path.join(rootDir, category)
    const entries = fs
      .readdirSync(categoryPath)
      .filter((f) => fs.statSync(path.join(categoryPath, f)).isDirectory())

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
        continue
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

/**
 * Docusaurus content plugin for auto-importing blueprint packages.
 */
module.exports = function blueprintAutoImportPlugin(context, options) {
  // context.siteDir === <repo-root>/website
  const rootDir = path.resolve(context.siteDir, '..', 'blueprints-lib')

  return {
    name: 'blueprint-autoimport-plugin',

    async loadContent() {
      return loadBlueprintPackages(rootDir)
    },

    async contentLoaded({ content, actions }) {
      const { createData, addRoute } = actions
      const blueprints = content || []

      // 1. Generate a JSON index for the library page
      const indexPath = await createData(
        'blueprints-lib-index.json',
        JSON.stringify(
          blueprints.map((bp) => ({
            category: bp.category,
            slug: bp.slug,
            metadata: bp.metadata,
          })),
          null,
          2,
        ),
      )

      // Route: /library (index page)
      // NOTE: "blueprints" becomes a direct prop on the component
      addRoute({
        path: '/library',
        component: '@site/src/components/library_docs/BlueprintIndexPage.tsx',
        exact: true,
        modules: {
          blueprints: indexPath,
        },
      })

      // 2. Per-blueprint routes
      await Promise.all(
        blueprints.map(async (bp) => {
          const metadataPath = await createData(
            `blueprints-lib/${bp.category}-${bp.slug}-metadata.json`,
            JSON.stringify(bp.metadata, null, 2),
          )

          const mdxSource = fs.readFileSync(bp.mdxPath, 'utf8')
          const mdxPath = await createData(
            `blueprints-lib/${bp.category}-${bp.slug}.mdx`,
            mdxSource,
          )

          // Each key in "modules" becomes a prop on the React component
          addRoute({
            path: `/library/${bp.category}/${bp.slug}`,
            component:
              '@site/src/components/library_docs/BlueprintPageWrapper.tsx',
            exact: true,
            modules: {
              metadata: metadataPath, // passed as prop "metadata"
              Content: mdxPath, // passed as prop "Content"
            },
          })
        }),
      )
    },
  }
}
