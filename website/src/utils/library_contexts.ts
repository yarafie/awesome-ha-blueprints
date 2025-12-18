/**
 * Context for accessing library YAML files
 */
export const libraryBlueprintsContext = require.context(
  '@library',
  true,
  /\.ya?ml$/,
)

/**
 * Context for accessing library changelog JSON files
 */
export const libraryChangelogsContext = require.context(
  '@library',
  true,
  /changelog\.json$/,
)

/**
 * Context for accessing library PNG files
 */
export const libraryThumbnailsContext = require.context(
  '@library',
  true,
  /\.png$/,
)

/**
 * Context for accessing library PDF files
 */
export const libraryPDFContext = require.context('@library', true, /\.pdf$/)
