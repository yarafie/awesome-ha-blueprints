// This utility is now PURE. No __dirname, no filesystem.
// It only returns the correct URL path for blueprints.

export function resolveBlueprintPath(category, id) {
  // If library version exists, plugin sets window.__LIBRARY_BLUEPRINTS__
  const key = `${category}/${id}`
  const libExists =
    typeof window !== 'undefined' &&
    window.__LIBRARY_BLUEPRINTS__ &&
    window.__LIBRARY_BLUEPRINTS__.has(key)

  if (libExists) {
    return `/awesome-ha-blueprints/library/${category}/${id}`
  }

  // Fallback to legacy
  return `/awesome-ha-blueprints/docs/blueprints/${category}/${id}`
}
