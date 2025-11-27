// website/src/plugins/controller-images-plugin/controller-images-plugin.js
import path from 'path'
import { globSync } from 'glob'

export default function controllerImagesPlugin(context) {
  // Docusaurus context provides the path where the plugin's generated data lives.
  const generatedDataDir = path.join(
    context.generatedFilesDir,
    'controller-images-plugin',
  )

  return {
    name: 'controller-images-plugin',

    async loadContent() {
      const { siteDir } = context
      // All blueprint images live under: website/docs/blueprints/{category}/{id}/{id}.png
      const blueprintsDir = path.join(siteDir, 'docs', 'blueprints')
      // Find all PNG images
      const imageFiles = globSync('**/*.png', {
        cwd: blueprintsDir,
        absolute: false,
      })
      return { blueprintsDir, imageFiles }
    },

    async contentLoaded({ content, actions }) {
      const { blueprintsDir, imageFiles } = content
      const { createData, addRoute } = actions
      const mapping = {}

      for (const imageRelPath of imageFiles) {
        const absPath = path.join(blueprintsDir, imageRelPath)
        const segments = imageRelPath.split('/')

        // Expect structure: category / blueprintId / blueprintId.png
        if (segments.length < 2) {
          continue
        }

        const blueprintId = segments[1]

        // Docusaurus v3 requires adding assets via a route
        addRoute({
          path: `/assets/images/blueprints/${blueprintId}.png`,
          component: '@theme/NotFound', // unused, but required
          exact: true,
          modules: {
            image: absPath,
          },
        })
        mapping[blueprintId] = `/assets/images/blueprints/${blueprintId}.png`
      }

      await createData(
        'controllerimages.json',
        JSON.stringify(mapping, null, 2),
      )

      console.log(
        `✅  controllerImagesPlugin: processed ${imageFiles.length} controller images`,
      )
    },
  }
}
