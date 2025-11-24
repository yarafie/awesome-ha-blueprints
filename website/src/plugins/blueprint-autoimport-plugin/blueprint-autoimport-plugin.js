/* eslint-env node */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */

const fs = require('fs')
const path = require('path')

/**
 * Discover all blueprint packages under blueprints-lib/
 * Layout:
 *   blueprints-lib/
 *     controllers/
 *       ikea_e2001_e2002/
 *         metadata.json
 *         blueprint.mdx
 */
function loadBlueprintPackages() {
  // const rootDir = path.resolve(__dirname, '../../../../blueprints-lib')
  // const rootDir = path.resolve(__dirname, 'blueprints-lib')
  const rootDir = path.join(process.cwd(), '../blueprints-lib')

  // If the folder does not exist, return an empty list instead of crashing
  if (!fs.existsSync(rootDir)) {
    console.warn(
      `[blueprint-autoimport-plugin] Skipping: ${rootDir} does not exist.`,
    )
    return []
  }

  const categories = fs
    .readdirSync(rootDir)
    .filter((f) => fs.statSync(path.join(rootDir, f)).isDirectory())

  /** @type {Array<{
   *   category: string;
   *   slug: string;
   *   metadata: any;
   *   mdxPath: string;
   * }>} */
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

      if (!fs.existsSync(metadataPath) || !fs.existsSync(mdxPath)) {
        continue
      }

      let metadata
      try {
        const raw = fs.readFileSync(metadataPath, 'utf8')
        metadata = JSON.parse(raw)
      } catch (err) {
        console.error(
          `\n❌  Invalid metadata.json in ${pkgDir}, skipping this blueprint.\n`,
          err,
        )
        continue
      }

      blueprints.push({
        category,
        slug,
        metadata,
        mdxPath,
      })
    }
  }

  return blueprints
}

/**
 * Docusaurus plugin
 */
module.exports = function blueprintAutoImportPlugin(context, options) {
  return {
    name: 'blueprint-autoimport-plugin',

    async loadContent() {
      // Discover all blueprint packages once
      return loadBlueprintPackages()
    },

    async contentLoaded({ content, actions }) {
      const { addRoute } = actions

      if (!content || content.length === 0) {
        // Nothing to do, but don't fail the build
        console.warn(
          '[blueprint-autoimport-plugin] No blueprints discovered. Library routes will be empty.',
        )
        return
      }

      // 1) Blueprint Library index page: /blueprints
      //    We pass a plain JS array as the `blueprints` prop.
      const indexBlueprints = content.map((bp) => ({
        category: bp.category,
        slug: bp.slug,
        metadata: bp.metadata,
      }))

      addRoute({
        path: '/blueprints',
        exact: true,
        component: '@site/src/components/library_docs/BlueprintIndexPage',
        // `modules` become props on the React component (blueprints)
        modules: {
          blueprints: indexBlueprints,
        },
      })

      // 2) Detail page for each blueprint: /blueprints/:category/:slug
      //    We pass metadata directly, and tell Webpack to import the MDX file.
      for (const bp of content) {
        addRoute({
          path: `/blueprints/${bp.category}/${bp.slug}`,
          exact: true,
          component: '@site/src/components/library_docs/BlueprintPageWrapper',
          modules: {
            metadata: bp.metadata,
            // MDX file is imported by Webpack. The component will receive
            // a compiled React component in the `mdx` prop.
            mdx: {
              __import: true,
              path: bp.mdxPath,
            },
          },
        })
      }

      console.log(
        `[blueprint-autoimport-plugin] Registered ${content.length} blueprint routes.`,
      )
    },
  }
}
