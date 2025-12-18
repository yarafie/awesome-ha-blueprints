// Automation-level metadata contract
// Mirrors website/library_schemas/automation.schema.json exactly

export type AutomationStatus = 'stable' | 'experimental' | 'deprecated'

export interface AutomationMetadata {
  /**
   * Canonical automation identifier.
   * Must match the directory name under library/automations/.
   */
  automation_id: string

  /**
   * Human-readable automation name.
   */
  name: string

  /**
   * Short, index-level summary used in listings and cards.
   * Not full documentation.
   */
  summary: string

  /**
   * Maintainers / authors of this automation.
   * Typically GitHub usernames.
   */
  maintainers: string[]

  /**
   * List of available variants for this automation.
   * Maps to subdirectories under <automation_id>/.
   */
  variants: string[]

  /**
   * Blueprint domain.
   * Locked to 'automation' by schema.
   */
  domain: 'automation'

  /**
   * High-level classification (e.g. scheduler, notification, safety).
   */
  category: string

  /**
   * Free-form tags used for filtering and search.
   */
  tags: string[]

  /**
   * Lifecycle status of the automation.
   */
  status: AutomationStatus
}
