/**
 * Component: SupportedControllers
 * ────────────────────────────────────────────────────────────────
 *
 * Purpose:
 *   Renders the list of Controllers supported by a Hook.
 *
 * Data Source:
 *   - release.json → supported_controllers.controllers[]
 *   - controllers/<id>/blueprint.json → name
 *
 * Design (LOCKED):
 *   - No ReleaseContext
 *   - No inference
 *   - No filesystem scanning
 *   - URL (?version=YYYY.MM.DD) is authoritative
 *   - Same refresh / reload semantics as BlueprintImportCard.tsx
 *   - Pure render: deterministic from props + URL
 *
 * Scope:
 *   Hooks → Controllers
 *
 * ────────────────────────────────────────────────────────────────
 */
import React from 'react'
import Link from '@docusaurus/Link'
import { jsonContext, changelogsContext } from '../../utils/libraryContexts'

/* ────────────────────────────────────────────────────────────── */
/* Types                                                         */
/* ────────────────────────────────────────────────────────────── */
interface ReleaseJson {
  supported_controllers?: {
    controllers: string[]
  }
}

interface ControllerBlueprintJson {
  name: string
}

interface ChangelogEntry {
  date: string
}

interface SupportedControllersProps {
  category: 'hooks'
  id: string
  library: string
  release: string
}

/* ────────────────────────────────────────────────────────────── */
/* Helpers                                                       */
/* ────────────────────────────────────────────────────────────── */
/**
 * Load available versions from release-level changelog.json.
 */
function loadReleaseVersions(
  category: string,
  id: string,
  library: string,
  release: string,
): string[] {
  try {
    const path = `./${category}/${id}/${library}/${release}/changelog.json`
    const parsed = changelogsContext(path) as unknown as ChangelogEntry[]
    if (!parsed || parsed.length === 0) return []
    return parsed.map((entry) => entry.date).sort((a, b) => b.localeCompare(a))
  } catch {
    return []
  }
}

/* ────────────────────────────────────────────────────────────── */
/* Component                                                     */
/* ────────────────────────────────────────────────────────────── */
const SupportedControllers: React.FC<SupportedControllersProps> = ({
  category,
  id,
  library,
  release,
}) => {
  if (category !== 'hooks') return null

  /* Resolve version (URL-driven, fallback to latest) */
  const versions = loadReleaseVersions(category, id, library, release)
  if (versions.length === 0) return null

  /* Load release.json (release-level, version does not affect path) */
  let releaseJson: ReleaseJson
  try {
    releaseJson = jsonContext(
      `./${category}/${id}/${library}/${release}/release.json`,
    ) as ReleaseJson
  } catch {
    return null
  }

  const controllerIds = releaseJson.supported_controllers?.controllers ?? []

  if (controllerIds.length === 0) return null

  /* Resolve controller names + paths, then sort alphabetically by name */
  const controllers = controllerIds
    .map((controllerId) => {
      let name = controllerId

      try {
        const blueprint = jsonContext(
          `./controllers/${controllerId}/blueprint.json`,
        ) as ControllerBlueprintJson

        if (blueprint?.name) {
          name = blueprint.name.replace(/^Controller\s*-\s*/i, '')
        }
      } catch {
        /* silent fallback */
      }

      return {
        id: controllerId,
        name,
        path: `/docs/blueprints/controllers/${controllerId}`,
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <ul className='supported-controllers'>
      {controllers.map((ctrl) => (
        <li key={ctrl.id}>
          <Link to={ctrl.path}>{ctrl.name}</Link>
        </li>
      ))}
    </ul>
  )
}

export default SupportedControllers
