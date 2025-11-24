import type { ComponentType } from 'react'

interface DocusaurusFrontMatter {
  readonly id?: string
  readonly title?: string
  readonly sidebar_label?: string
  readonly slug?: string
  readonly description?: string
  readonly [key: string]: unknown
}

export interface DocusaurusModule {
  readonly frontMatter: DocusaurusFrontMatter
  readonly toc: {
    readonly value: string
    readonly id: string
    readonly level: number
  }[]
  readonly default: ComponentType<Record<string, unknown>>
  readonly [key: string]: unknown
}

/**
 * Legacy blueprint contexts (blueprints/ tree).
 * These are still used by existing docs/components.
 */
export const changelogsContext = require.context(
  '@blueprints',
  true,
  /^\.\/[^/]+\/[^/]+\/changelog\.json$/,
  'lazy',
) as unknown as (path: string) => unknown

export const blueprintsContext = require.context(
  '@blueprints',
  true,
  /^\.\/[^/]+\/[^/]+\/[^/]+\.ya?ml$/,
  'lazy',
) as unknown as (path: string) => unknown

/**
 * New library contexts (library/ tree).
 * One package per directory: library/<category>/<slug>/...
 */
export const libraryMetadataContext = require.context(
  '@library',
  true,
  /^\.\/[^/]+\/[^/]+\/metadata\.json$/,
  'lazy',
) as unknown as (path: string) => unknown

export const libraryChangelogsContext = require.context(
  '@library',
  true,
  /^\.\/[^/]+\/[^/]+\/changelog\.json$/,
  'lazy',
) as unknown as (path: string) => unknown

export const libraryBlueprintsContext = require.context(
  '@library',
  true,
  /^\.\/[^/]+\/[^/]+\/(?:blueprint|versions\/[^/]+)\.ya?ml$/,
  'lazy',
) as unknown as (path: string) => unknown

export type BlueprintSource =
  | { system: 'library'; category: string; id: string }
  | { system: 'legacy'; category: string; id: string }

/**
 * Resolve where a given blueprint lives.
 * If a package exists in the new library, prefer that.
 * Otherwise, fall back to the legacy blueprints tree.
 */
export function resolveBlueprintSource(
  category: string,
  id: string,
): BlueprintSource | null {
  try {
    const libraryKeys =
      (
        libraryMetadataContext as unknown as { keys?: () => string[] }
      ).keys?.() || []
    const libMetaKey = `./${category}/${id}/metadata.json`
    if (libraryKeys.includes(libMetaKey)) {
      return { system: 'library', category, id }
    }
  } catch {
    // ignore and try legacy
  }

  try {
    const legacyKeys =
      (blueprintsContext as unknown as { keys?: () => string[] }).keys?.() || []
    const legacyYamlKey = `./${category}/${id}/${id}.yaml`
    if (legacyKeys.includes(legacyYamlKey)) {
      return { system: 'legacy', category, id }
    }
  } catch {
    // ignore
  }

  return null
}

/**
 * Context for accessing MDX documentation files.
 * Returns Docusaurus-processed MDX modules that include:
 * - frontMatter: The YAML frontmatter data (title, description, etc.)
 * - toc: Table of contents extracted from headings
 * - default: The React component for the content
 * - and more
 */
export const docsContext = require.context(
  '@site/docs/blueprints',
  true,
  /\.mdx$/,
) as unknown as (path: string) => DocusaurusModule
