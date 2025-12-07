/**
 * Component: Inputs
 * ────────────────────────────────────────────────────────────────
 *
 * Changelog:
 *   • Initial Version (@EPMatt)
 *   - Updated 2026.12.03 (@yarafie):
 *      1. Moved utils.ts → utils/contexts.ts
 *      2. Added variant + version resolution for controllers
 *      3. Added backward compatibility for blueprint YAMLs using "inputs:" instead of "input:"
 * ────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useState } from 'react'
import { blueprintsContext } from '../../utils/contexts'
import yaml from 'yaml'
import Input, { BlueprintInput } from './Input'
import InputSection from './InputSection'

interface InputsProps {
  category: string
  id: string
  variant?: string
}

interface BlueprintInputSection {
  name: string
  description?: string
  collapsed?: boolean
  input: Record<string, BlueprintInput>
}

interface BlueprintMetadata {
  blueprint: {
    input?: Record<string, BlueprintInput | BlueprintInputSection>
    inputs?: Record<string, BlueprintInput | BlueprintInputSection> // ← legacy support
  }
}

/**
 * Finds the newest YYYY.MM.DD version folder for a controller variant
 */
function loadControllerLatestVersion(
  id: string,
  variant?: string,
): string | null {
  if (!variant) return null

  const yamlPattern = new RegExp(
    `^\\.\\/controllers\\/${id}\\/${variant}\\/(\\d{4}\\.\\d{2}\\.\\d{2})\\/${id}\\.ya?ml$`,
  )

  const foundVersions = new Set<string>()

  blueprintsContext.keys().forEach((key: string) => {
    const match = key.match(yamlPattern)
    if (match && match[1]) {
      foundVersions.add(match[1])
    }
  })

  if (foundVersions.size === 0) return null

  // Sort YYYY.MM.DD descending
  return Array.from(foundVersions).sort((a, b) => b.localeCompare(a))[0]
}

const Inputs: React.FC<InputsProps> = ({ category, id, variant }) => {
  const [inputs, setInputs] = useState<
    Record<string, BlueprintInput | BlueprintInputSection>
  >({})

  useEffect(() => {
    try {
      let yamlPath: string

      if (category === 'controllers' && variant) {
        // 🔍 Resolve newest physical version folder
        const latestVersion = loadControllerLatestVersion(id, variant) // ← added logic
        if (!latestVersion) {
          console.error(
            `No versions found for controller ${id} variant ${variant}`,
          )
          setInputs({})
          return
        }

        yamlPath = `./controllers/${id}/${variant}/${latestVersion}/${id}.yaml`
      } else {
        yamlPath = `./${category}/${id}/${id}.yaml`
      }

      const fileContent = blueprintsContext(yamlPath)
      const parsed = yaml.parse(fileContent) as BlueprintMetadata

      // 🔄 Normalize: allow old "inputs:" or new "input:"
      const blueprintRoot = parsed.blueprint || {}
      const normalizedInputs =
        blueprintRoot.input ??
        blueprintRoot.inputs ?? // ← legacy fallback
        {}

      setInputs(normalizedInputs)
    } catch (error) {
      console.error('Error fetching blueprint:', error)
      setInputs({})
    }
  }, [category, id, variant])

  return (
    <div className='blueprint-inputs'>
      {Object.entries(inputs).map(([key, input]) => {
        // Check if this is a section
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

        // Handle regular input
        return <Input key={key} inputData={input} />
      })}
    </div>
  )
}

export default Inputs
