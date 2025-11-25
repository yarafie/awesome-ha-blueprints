import fs from 'fs'
import path from 'path'

export function resolveBlueprintPath(category, slug) {
  const libraryRoot = path.resolve(
    __dirname,
    '../../../library',
    category,
    slug,
  )
  const oldRoot = path.resolve(__dirname, '../../../blueprints', category, slug)

  const existsInLibrary = fs.existsSync(libraryRoot)

  if (existsInLibrary) {
    return {
      root: `/library/${category}/${slug}`,
      yaml: `/library/${category}/${slug}/blueprint.yaml`,
      mdx: `/library/${category}/${slug}`,
      changelog: `/library/${category}/${slug}/changelog.json`,
      assets: `/library/${category}/${slug}/assets`,
      source: 'library',
    }
  }

  return {
    root: `/docs/blueprints/${category}/${slug}`,
    yaml: `/blueprints/${category}/${slug}/${slug}.yaml`,
    mdx: `/docs/blueprints/${category}/${slug}`,
    changelog: `/blueprints/${category}/${slug}/changelog.json`,
    assets: `/img/blueprints/${category}/${slug}`,
    source: 'old',
  }
}
