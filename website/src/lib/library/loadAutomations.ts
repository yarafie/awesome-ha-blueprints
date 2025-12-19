export interface AutomationMetadata {
  automation_id: string
  name: string
  summary: string
  maintainers: string[]
  variants: string[]
  domain: 'automation'
  category: string
  tags: string[]
  status: 'stable' | 'test' | 'development' | 'deprecated'
}

/**
 * Webpack static import of all automation metadata JSON files.
 * This runs at build time, not runtime.
 */
const context = require.context(
  '@librarybps/automations',
  true,
  /\/([a-z0-9_]+)\/\1\.json$/,
)

export function loadAutomations(): AutomationMetadata[] {
  return context
    .keys()
    .filter((k) => !k.includes('/_')) // ignore _example_* folders
    .map((key) => context(key) as AutomationMetadata)
    .sort((a, b) => a.name.localeCompare(b.name))
}
