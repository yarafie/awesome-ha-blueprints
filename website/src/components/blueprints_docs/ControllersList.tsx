import React, { useEffect, useState } from 'react'
import {
  docsContext,
  libraryMetadataContext,
  loadLibraryMetadata,
} from '../../utils'
import ControllerItem from './ControllerItem'
import { Search } from 'react-bootstrap-icons'

interface Controller {
  id: string
  model: string
  manufacturer: string | string[]
  integrations: string[]
  model_name: string
  thumbnail?: string
}

const ControllersList: React.FC = () => {
  const [controllers, setControllers] = useState<Controller[]>([])
  const [filteredControllers, setFilteredControllers] = useState<Controller[]>(
    [],
  )
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const results: Controller[] = []

    // OLD SYSTEM CONTROLLERS FROM MDX FILES
    const oldFiles = docsContext
      .keys()
      .filter((key) => key.startsWith('./blueprints/controllers/'))

    for (const file of oldFiles) {
      const id = file.split('/')[3].replace('.mdx', '')
      if (!id) continue

      // If controller exists in the NEW library, skip old loader
      const exists = (() => {
        try {
          libraryMetadataContext(`./${category}/${slug}/metadata.json`)
          return true
        } catch {
          return false
        }
      })()

      try {
        const mod = docsContext(file)
        if (mod?.frontMatter) {
          const fm = mod.frontMatter

          results.push({
            id,
            model: fm.model ?? id,
            manufacturer: fm.manufacturer ?? 'Unknown',
            integrations: fm.integrations ?? [],
            model_name: fm.model_name ?? fm.model ?? id,
            thumbnail: fm.image ?? undefined,
          })
        }
      } catch (e) {
        console.warn(`⚠️ Failed loading old controller ${id}`, e)
      }
    }

    // NEW SYSTEM CONTROLLERS FROM LIBRARY
    const libraryControllers = loadLibraryMetadata('controllers')

    for (const meta of libraryControllers) {
      results.push({
        id: meta.slug,
        model: meta.metadata.model ?? meta.slug,
        manufacturer: meta.metadata.manufacturer ?? 'Unknown',
        integrations: meta.metadata.integrations ?? [],
        model_name:
          meta.metadata.model_name ?? meta.metadata.model ?? meta.slug,
        thumbnail: meta.metadata.thumbnail ?? undefined,
      })
    }

    // FINAL SORT (alphabetical by model)
    const sorted = results.sort((a, b) =>
      a.model.localeCompare(b.model, undefined, { sensitivity: 'base' }),
    )

    setControllers(sorted)
    setFilteredControllers(sorted)
  }, [])

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredControllers(controllers)
      return
    }

    const term = searchTerm.toLowerCase()

    setFilteredControllers(
      controllers.filter((c) =>
        [
          c.id,
          c.model,
          c.model_name,
          Array.isArray(c.manufacturer)
            ? c.manufacturer.join(' ')
            : c.manufacturer,
        ]
          .join(' ')
          .toLowerCase()
          .includes(term),
      ),
    )
  }, [searchTerm, controllers])

  return (
    <>
      <div className='search-wrapper'>
        <Search size={18} />
        <input
          type='text'
          placeholder='Search controllers...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className='controller-grid'>
        {filteredControllers.map((controller) => {
          const imagePath =
            controller.thumbnail ??
            `https://raw.githubusercontent.com/EPMatt/awesome-ha-blueprints/main/assets/controllers/${controller.id}.png`

          return (
            <ControllerItem
              key={controller.id}
              id={controller.id}
              model={controller.model}
              model_name={controller.model_name}
              manufacturer={controller.manufacturer}
              integrations={controller.integrations}
              image={imagePath}
            />
          )
        })}
      </div>
    </>
  )
}

export default ControllersList
