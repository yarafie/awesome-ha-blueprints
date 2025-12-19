/**
 * Context for accessing library YAML files
 */
export const libraryBlueprintsContext = require.context(
  '@librarybps',
  true,
  /\.ya?ml$/,
)

/**
 * Context for accessing library changelog JSON files
 */
export const libraryChangelogsContext = require.context(
  '@librarybps',
  true,
  /changelog\.json$/,
)

/**
 * Context for accessing library PNG files
 */
export const libraryThumbnailsContext = require.context(
  '@librarybps',
  true,
  /\.png$/,
)

/**
 * Context for accessing library PDF files
 */
export const libraryPDFContext = require.context('@librarybps', true, /\.pdf$/)
