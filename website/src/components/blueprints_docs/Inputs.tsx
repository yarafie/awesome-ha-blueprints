/**
 * Component: Inputs
 * ────────────────────────────────────────────────────────────────
 *
 * Changelog:
 *   • Initial Version (@EPMatt)
 *   - Updated 2026.12.03 (@yarafie):
 *      1. Moved utils.ts to utils/contexts.ts
 * ────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useState } from 'react'
import { blueprintsContext } from '../../utils/contexts' // 1. Moved utils.ts to utils/contexts.ts
import yaml from 'yaml'
import Input, { BlueprintInput } from './Input'
import InputSection from './InputSection'

interface InputsProps {
  category: string
  id: string
  variant?: string
}

interface InputSection {
  name: string
  description?: string
  collapsed?: boolean
  input: Record<string, BlueprintInput>
}

interface BlueprintMetadata {
  blueprint: {
    input?: Record<string, BlueprintInput | InputSection>
  }
}

function loadControllerLatestVersion(
  id: string,
  variant?: string,
): string | null {
  if (!variant) return null

  const yamlPattern = new RegExp(
    `^\\.\\/controllers\\/${id}\\/${variant}\\/(\\d{4}\\.\\d{2}\\.\\d{2})\\/${id}\\.ya?ml$`,
  )

  const versionSet = new Set<string>()

  blueprintsContext.keys().forEach((key: string) => {
    const match = key.match(yamlPattern)
    if (match && match[1]) {
      versionSet.add(match[1])
    }
  })

  if (versionSet.size === 0) return null

  return Array.from(versionSet).sort((a, b) => b.localeCompare(a))[0]
}

const Inputs: React.FC<InputsProps> = ({ category, id }) => {
  const [inputs, setInputs] = useState<
    Record<string, BlueprintInput | InputSection>
  >({})

  useEffect(() => {
    try {
      let path: string

      if (category === 'controllers' && variant) {
        // 1. Find the latest physical version for this variant
        const latestVersion = loadControllerLatestVersion(id, variant)

        if (!latestVersion) {
          console.error(
            `No versions found for controller ${id} variant ${variant}`,
          )
          setInputs({})
          return
        }

        path = `./controllers/${id}/${variant}/${latestVersion}/${id}.yaml`
      } else {
        // Non-controllers OR controllers without variant fallback
        path = `./${category}/${id}/${id}.yaml`
      }

      const content = blueprintsContext(path)
      const parsed = yaml.parse(content) as BlueprintMetadata
      setInputs(parsed.blueprint.input || {})
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
