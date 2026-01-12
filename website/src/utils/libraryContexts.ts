/**
 * Library Contexts
 * ────────────────────────────────────────────────────────────────
 * Centralized webpack contexts for the Awesome-HA-Library
 * Library categories (controllers, automations, hooks).
 *
 * Paths for each category (controllers, hooks, automations):
 *   <category/<blueprint_id>/<library_id>/<release_id>/<version>/
 *   alias: { '@blueprints': path.resolve(__dirname, 'docs/blueprints'), }
 *
 * Contexts provided:
 *   • blueprintsContext → YAML's
 *   • changelogsContext → changelog.json only
 *   • pngContext        → PNG files
 *   • pdfContext        → PDF files
 *   • jsonContext       → JSON metadata
 *   • docsContext       → Docusaurus-processed MDX modules
 *
 * ────────────────────────────────────────────────────────────────
 */
/**
 * Context for accessing blueprint YAML files
 * for categories (controllers, hooks, and automations).
 *   - <category/<blueprint_id>/<library_id>/<release_id>/<version>/<blueprint_id>.yaml
 */
export const blueprintsContext = require.context(
  '@blueprints',
  true,
  /\.ya?ml$/,
)

/**
 * Context for accessing library changelog JSON files ONLY.
 * for categories (controllers, hooks, and automations).
 *   - <category/<blueprint_id>/<library_id>/<release_id>/changelog.json
 */
export const changelogsContext = require.context(
  '@blueprints',
  true,
  /changelog\.json$/,
)

/**
 * Context for accessing library blueprints PNG files
 * for categories (controllers, hooks, and automations).
 *   - <category/<blueprint_id>/<blueprint_id>.png
 */
export const pngContext = require.context('@blueprints', true, /\.png$/)

/**
 * Context for accessing library blueprint PDF files
 * for categories (controllers, hooks, and automations).
 *   - <category/<blueprint_id>/<blueprint_id>.pdf
 */
export const pdfContext = require.context('@blueprints', true, /\.pdf$/)

/**
 * Context for accessing library JSON files, excluding changelogs.
 * for categories (controllers, hooks, and automations).
 *   - <category/<blueprint_id>/blueprint.json
 *   - <category/<blueprint_id>/<library_id>/library.json
 *   - <category/<blueprint_id>/<library_id>/<release_id>/release.json
 *   - <category/<blueprint_id>/<library_id>/<release_id>/<version>/version.json
 */
export const jsonContext = require.context(
  '@blueprints',
  true,
  /^(?!.*changelog\.json$).*\.json$/,
)

/**
 * A Docusaurus-processed MDX module
 */
interface DocusaurusFrontMatter {
  title: string
  description: string
  [key: string]: unknown
}

interface DocusaurusModule {
  /** The frontmatter data from the MDX file */
  readonly frontMatter: DocusaurusFrontMatter
}

/**
 * Context for accessing MDX documentation files.
 * Returns Docusaurus-processed MDX modules that include:
 * - frontMatter: The YAML frontmatter data (title, description, etc.)
 * - toc: Table of contents extracted from headings
 * - default: The React component for the content
 * - and more
 * for categories (controllers, hooks, and automations).
 * - <category/<blueprint_id>/<library_id>/<release_id>/<blueprint_id>.mdx
 */
export const docsContext = require.context(
  '@site/docs/blueprints',
  true,
  /\.mdx$/,
) as unknown as (path: string) => DocusaurusModule
