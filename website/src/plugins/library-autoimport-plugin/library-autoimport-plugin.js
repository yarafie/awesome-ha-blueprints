import fs from 'fs'
import path from 'path'

export default function libraryAutoImportPlugin(context) {
  return {
    name: 'library-autoimport-plugin',

    async loadContent() {
      const rootDir = path.resolve(context.siteDir, '../library')
      if (!fs.existsSync(rootDir)) return []

      const categories = fs
        .readdirSync(rootDir)
        .filter((c) => fs.statSync(path.join(rootDir, c)).isDirectory())

      const blueprints = []

      for (const category of categories) {
        const catDir = path.join(rootDir, category)
        const slugs = fs
          .readdirSync(catDir)
          .filter((s) => fs.statSync(path.join(catDir, s)).isDirectory())

        for (const slug of slugs) {
          const pkgDir = path.join(catDir, slug)
          const mdxPath = path.join(pkgDir, 'blueprint.mdx')
          const metadataPath = path.join(pkgDir, 'metadata.json')

          if (!fs.existsSync(mdxPath) || !fs.existsSync(metadataPath)) continue

          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))

          blueprints.push({
            category,
            slug,
            mdxPath,
            metadata,
          })
        }
      }

      return blueprints
    },

    async contentLoaded({ content, actions }) {
      const { addRoute, createData } = actions

      const jsonPath = await createData(
        'library.json',
        JSON.stringify(content, null, 2),
      )

      addRoute({
        path: '/library',
        exact: true,
        component:
          '../src/plugins/library-autoimport-plugin/BlueprintIndexPage.tsx',
        modules: {
          blueprints: jsonPath,
        },
      })

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
    },
  }
}
