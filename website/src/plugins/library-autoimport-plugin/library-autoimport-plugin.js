import fs from 'fs'
import path from 'path'
import fsExtra from 'fs-extra'

export default function libraryAutoImportPlugin(context) {
  return {
    name: 'library-autoimport-plugin',

    async loadContent() {
      const { siteDir } = context
      const rootDir = path.resolve(siteDir, '../library')
      if (!fs.existsSync(rootDir)) return []

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
            blueprints.push({ category, slug, pkgDir, metadata, mdxPath })
          } catch {
            continue
          }
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
        path: '/awesome-ha-blueprints/library',
        exact: true,
        component:
          '../src/plugins/library-autoimport-plugin/BlueprintIndexPage.tsx',
        modules: { blueprints: jsonPath },
      })

      for (const bp of content) {
        const metadataJson = await createData(
          `${bp.slug}-metadata.json`,
          JSON.stringify(bp.metadata, null, 2),
        )

        addRoute({
          path: `/awesome-ha-blueprints/library/${bp.category}/${bp.slug}`,
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

    async postBuild({ outDir }) {
      const { siteDir } = context
      const src = path.resolve(siteDir, '../library')
      const dest = path.join(outDir, 'library')

      if (fs.existsSync(src)) {
        await fsExtra.copy(src, dest)
        console.log(`[library] Copied library → ${dest}`)
      }
    },
  }
}
