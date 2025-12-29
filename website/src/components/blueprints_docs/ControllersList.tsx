/**
 * Component: ControllersList
 * ────────────────────────────────────────────────────────────────
 * Purpose:
 *   Renders the list of supported controller devices with search and
 *   manufacturer filtering. Supports new variant-based architecture
 *   without breaking the existing website flow.
 *
 * Behavior:
 *   - Discovers all controller MDX files under ./controllers/
 *   - Aggregates integrations from all variants for each controller
 *     (variant-level MDX + device-level MDX).
 *   - Ensures unique controller listing (one entry per deviceId).
 *   - DOES NOT break routing:
 *        ControllersList → DevicePage (unique controller)
 *        DevicePage → Variant selection
 *        VariantPage → Full variant details
 *
 * Changelog:
 *   • Initial Version (@EPMatt)
 *   - Updated 2025.12.03 (@yarafie):
 *      1. Moved utils.ts to utils/contexts.ts
 *      2. Added controllersMap logic to aggregate variants while preserving
 *         original page flow.
 *      3. Added integrations merging from all variant MDX files.
 * ────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useState } from 'react'
import { docsContext } from '../../utils/contexts' // 1. Moved utils.ts to utils/contexts.ts
import ControllerItem from './ControllerItem'
import { Search } from 'react-bootstrap-icons'

interface Controller {
  id: string
  model: string
  manufacturer: string | string[]
  integrations: string[]
  model_name: string
}

const ControllersList: React.FC = () => {
  const [controllers, setControllers] = useState<Controller[]>([])
  const [filteredControllers, setFilteredControllers] = useState<Controller[]>(
    [],
  )
  const [error, setError] = useState<string | null>(null)
  const [uniqueManufacturers, setUniqueManufacturers] = useState<string[]>([])
  const [totalControllers, setTotalControllers] = useState<number>(0)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedManufacturer, setSelectedManufacturer] =
    useState<string>('All Manufacturers')

  useEffect(() => {
    try {
      const keys = (docsContext as any).keys()
      const categoryPath = `./controllers/`

      const controllerKeys = keys.filter((key: string) => {
        return (
          key.startsWith(categoryPath) &&
          !key.includes('/example.mdx') &&
          !key.endsWith(`/controllers.mdx`)
        )
      })

      // 2. Build a map of unique controllers by deviceId and aggregate integrations from all MDX files for that device (including variants).
      const controllersMap = new Map<
        string,
        {
          id: string
          title: string
          description: string
          model: string
          manufacturer: string | string[]
          integrations: string[]
          model_name: string
        }
      >()

      controllerKeys.forEach((key: string) => {
        // Strip "./controllers/" and split remaining path to find deviceId
        const relativePath = key.replace(categoryPath, '')
        const segments = relativePath.split('/')

        // deviceId is always the first segment without ".mdx"
        const deviceId = segments[0].replace('.mdx', '')
        const mdxModule = docsContext(key)
        const {
          title,
          description,
          model,
          manufacturer,
          integrations,
          model_name,
        } = mdxModule.frontMatter

        // Base-level MDX detection
        const isDeviceLevelMdx =
          segments.length === 1 || // ./controllers/<id>.mdx
          (segments.length === 2 && segments[1] === `${deviceId}.mdx`) // ./controllers/<id>/<id>.mdx

        // 2. Ensure we have a base controller entry for this deviceId,
        //    preferring the "device-level" MDX (flat file or ./<id>/<id>.mdx)
        let existing = controllersMap.get(deviceId)

        if (!existing || isDeviceLevelMdx) {
          existing = {
            id: deviceId,
            title: title || deviceId,
            description: description || '',
            model: Array.isArray(model) ? model.join(', ') : model || '',
            manufacturer: manufacturer || '',
            integrations: existing?.integrations || [],
            model_name: Array.isArray(model_name)
              ? model_name.join(', ')
              : model_name || '',
          }
          controllersMap.set(deviceId, existing)
        }

        // 3. Aggregate integrations from all MDX files for this device (variants + device-level), de-duplicated.
        if (Array.isArray(integrations)) {
          const currentIntegrations = new Set<string>(existing.integrations)
          integrations.forEach((integration: any) => {
            if (typeof integration === 'string' && integration.trim() !== '') {
              currentIntegrations.add(integration.trim())
            }
          })
          existing.integrations = Array.from(currentIntegrations)
        }
      })

      const controllersData = Array.from(controllersMap.values())
      controllersData.sort((a, b) => a.title.localeCompare(b.title))

      const manufacturerSet = new Set<string>()

      controllersData.forEach((controller) => {
        if (Array.isArray(controller.manufacturer)) {
          controller.manufacturer.forEach((mfr) => {
            if (mfr && typeof mfr === 'string' && mfr.trim() !== '') {
              manufacturerSet.add(mfr.trim())
            }
          })
        } else if (
          controller.manufacturer &&
          typeof controller.manufacturer === 'string'
        ) {
          manufacturerSet.add(controller.manufacturer.trim())
        }
      })

      setControllers(controllersData)
      setFilteredControllers(controllersData)
      setTotalControllers(controllersData.length)
      setUniqueManufacturers(Array.from(manufacturerSet))
      setError(null)
    } catch (e) {
      console.error('Error loading controllers:', e)
      setControllers([])
      setError(
        'Failed to load controllers. Please check the console for more details.',
      )
    }
  }, [])

  // Filter controllers when search query or manufacturer selection changes
  useEffect(() => {
    let results = controllers

    // Apply manufacturer filter if not "All Manufacturers"
    if (selectedManufacturer !== 'All Manufacturers') {
      results = results.filter((controller) => {
        if (Array.isArray(controller.manufacturer)) {
          return controller.manufacturer.some(
            (mfr) =>
              typeof mfr === 'string' &&
              mfr.toLowerCase().includes(selectedManufacturer.toLowerCase()),
          )
        }
        return (
          typeof controller.manufacturer === 'string' &&
          controller.manufacturer
            .toLowerCase()
            .includes(selectedManufacturer.toLowerCase())
        )
      })
    }

    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      results = results.filter((controller) => {
        // Check model_name (safely)
        const modelNameMatch =
          typeof controller.model_name === 'string' &&
          controller.model_name.toLowerCase().includes(query)

        // Check model (safely)
        const modelMatch =
          typeof controller.model === 'string' &&
          controller.model.toLowerCase().includes(query)

        // Check manufacturer (safely)
        let manufacturerMatch = false
        if (Array.isArray(controller.manufacturer)) {
          manufacturerMatch = controller.manufacturer.some(
            (mfr) =>
              typeof mfr === 'string' && mfr.toLowerCase().includes(query),
          )
        } else if (typeof controller.manufacturer === 'string') {
          manufacturerMatch = controller.manufacturer
            .toLowerCase()
            .includes(query)
        }

        // Check integrations (safely)
        const integrationsMatch =
          Array.isArray(controller.integrations) &&
          controller.integrations.some(
            (integration) =>
              typeof integration === 'string' &&
              integration.toLowerCase().includes(query),
          )

        return (
          modelNameMatch || modelMatch || manufacturerMatch || integrationsMatch
        )
      })
    }

    setFilteredControllers(results)
  }, [searchQuery, selectedManufacturer, controllers])

  if (error) {
    return (
      <div className='admonition admonition-danger alert alert--danger'>
        <div className='admonition-heading'>
          <h5>Error loading controllers</h5>
        </div>
        <div className='admonition-content'>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (controllers.length === 0) {
    return <div>No controllers found in this category.</div>
  }

  const listStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    margin: '20px 0',
  }

  const statsStyle: React.CSSProperties = {
    marginBottom: '20px',
    padding: '12px 16px',
    backgroundColor: 'var(--ifm-color-emphasis-100)',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  }

  const searchContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '16px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  }

  const searchInputContainerStyle: React.CSSProperties = {
    position: 'relative',
    flex: '2',
    minWidth: '200px',
  }

  const searchIconStyle: React.CSSProperties = {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--ifm-color-emphasis-500)',
  }

  const searchInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 8px 8px 36px',
    borderRadius: '4px',
    border: '1px solid var(--ifm-color-emphasis-300)',
    fontSize: '16px',
  }

  const selectStyle: React.CSSProperties = {
    flex: '1',
    minWidth: '150px',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid var(--ifm-color-emphasis-300)',
    fontSize: '16px',
  }

  return (
    <>
      <div style={statsStyle}>
        <div>
          {filteredControllers.length === controllers.length ? (
            <>
              Currently {totalControllers} devices from{' '}
              {uniqueManufacturers.length} different vendors are supported.
            </>
          ) : (
            <>
              Showing {filteredControllers.length} of {totalControllers}{' '}
              devices.
            </>
          )}
        </div>
      </div>

      <div style={searchContainerStyle}>
        <div style={searchInputContainerStyle}>
          <Search style={searchIconStyle} size={16} />
          <input
            type='text'
            placeholder='Search controllers...'
            style={searchInputStyle}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          style={selectStyle}
          value={selectedManufacturer}
          onChange={(e) => setSelectedManufacturer(e.target.value)}
        >
          <option>All Manufacturers</option>
          {uniqueManufacturers.sort().map((manufacturer) => (
            <option key={manufacturer} value={manufacturer}>
              {manufacturer}
            </option>
          ))}
        </select>
      </div>

      <div style={listStyle}>
        {filteredControllers.map((controller) => {
          const imagePath = `/awesome-ha-blueprints/img/controllers/${controller.id}.png`

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
