/**
 * Component: Inputs
 * ────────────────────────────────────────────────────────────────
 *
 * Changelog:
 *   • Initial Version (@EPMatt)
 *   - Updated 2025.12.03 (@yarafie):
 *      1. Moved utils.ts → utils/contexts.ts
 *      2. Added variant + version resolution for controllers
 *      3. Added backward compatibility for blueprint YAMLs using "inputs:" instead of "input:"
 *   - Updated 2026.01.11 (@yarafie):
 *      4. Migrated to library / release / version–aware tree
 *      5. Aligned with libraryContexts (no filesystem scanning)
 *      6. Version resolution via URL + release changelog.json
 *      7. LOCKED: URL-version reactive component
 * ────────────────────────────────────────────────────────────────
 */
import React, { useEffect, useState } from 'react'
import {
  blueprintsContext,
  changelogsContext,
} from '../../utils/libraryContexts'
import yaml from 'yaml'
import Input, { BlueprintInput } from './Input'
import InputSection from './InputSection'

interface InputsProps {
  category: string
  id: string
  library: string
  release: string
}

interface InputSectionType {
  name: string
  description?: string
  collapsed?: boolean
  input: Record<string, BlueprintInput>
}

interface BlueprintMetadata {
  blueprint: {
    input?: Record<string, BlueprintInput | InputSectionType>
    inputs?: Record<string, BlueprintInput | InputSectionType> // legacy support
  }
}

interface ChangelogEntry {
  date: string
}

/**
 * Read version from URL (?version=YYYY.MM.DD), if present and well-formed.
 */
function getVersionFromUrl(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const url = new URL(window.location.href)
    const v = url.searchParams.get('version')
    if (!v) return null
    if (!/^\d{4}\.\d{2}\.\d{2}$/.test(v)) return null
    return v
  } catch {
    return null
  }
}

/**
 * Load versions from release-level changelog.json
 *   <category>/<id>/<library>/<release>/changelog.json
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

const Inputs: React.FC<InputsProps> = ({ category, id, library, release }) => {
  const [inputs, setInputs] = useState<
    Record<string, BlueprintInput | InputSectionType>
  >({})

  useEffect(() => {
    try {
      const availableVersions = loadReleaseVersions(
        category,
        id,
        library,
        release,
      )
      if (availableVersions.length === 0) {
        setInputs({})
        return
      }

      const urlVersion = getVersionFromUrl()
      const resolvedVersion =
        urlVersion && availableVersions.includes(urlVersion)
          ? urlVersion
          : availableVersions[0]

      // LOCK: URL-version reactive dependency
      void resolvedVersion

      const yamlPath = `./${category}/${id}/${library}/${release}/${resolvedVersion}/${id}.yaml`
      const fileContent = blueprintsContext(yamlPath)
      const parsed = yaml.parse(fileContent) as BlueprintMetadata

      const blueprintRoot = parsed.blueprint || {}
      const normalizedInputs =
        blueprintRoot.input ??
        blueprintRoot.inputs ?? // legacy fallback
        {}

      setInputs(normalizedInputs)
    } catch (error) {
      console.error('Error fetching blueprint inputs:', error)
      setInputs({})
    }
  }, [category, id, library, release, getVersionFromUrl()])

  return (
    <div className='blueprint-inputs'>
      {Object.entries(inputs).map(([key, input]) => {
        if ('input' in input) {
          return (
            <InputSection
              key={key}
              name={input.name}
              description={input.description}
              collapsed={input.collapsed}
              input={input.input}
            />
          )
        }
        return <Input key={key} inputData={input} />
      })}
    </div>
  )
}

export default Inputs
