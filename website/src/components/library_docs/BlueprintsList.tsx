import React, { useEffect, useState } from 'react'
import { jsonContext } from '../../utils/libraryContexts'
import BlueprintItem from './BlueprintItem'
import { Search } from 'react-bootstrap-icons'

/* -------------------------------------------------- */
/* Integration colors + normalization                 */
/* -------------------------------------------------- */
const INTEGRATION_COLORS: Record<string, string> = {
  zha: '#2563eb',
  zigbee2mqtt: '#16a34a',
  z2m: '#16a34a',
  deconz: '#ea580c',
  shelly: '#dc2626',
}

const normalizeIntegrationKey = (raw: string): string => {
  const k = raw.trim().toLowerCase()
  if (k === 'zigbee2mqtt') return 'zigbee2mqtt'
  if (k === 'z2m') return 'z2m'
  if (k === 'zha') return 'zha'
  if (k === 'deconz') return 'deconz'
  if (k === 'shelly') return 'shelly'
  return k
}

/* -------------------------------------------------- */
/* Types                                             */
/* -------------------------------------------------- */
interface BlueprintJson {
  blueprint_id: string
  name: string
  description: string
  category: string
  manufacturer?: string
  model?: string
  model_name?: string
  images: string[]
  tags?: string[]
  supported_integrations?: string[]
}

interface LibraryJson {
  supported_integrations?: string[]
}

interface BlueprintsListProps {
  category: string
}

/* -------------------------------------------------- */
/* Component                                         */
/* -------------------------------------------------- */
const BlueprintsList: React.FC<BlueprintsListProps> = ({ category }) => {
  const [blueprints, setBlueprints] = useState<BlueprintJson[]>([])
  const [filteredBlueprints, setFilteredBlueprints] = useState<BlueprintJson[]>(
    [],
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedManufacturer, setSelectedManufacturer] =
    useState('All Manufacturers')
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([])
  const [uniqueManufacturers, setUniqueManufacturers] = useState<string[]>([])
  const [availableIntegrations, setAvailableIntegrations] = useState<string[]>(
    [],
  )

  /* -------------------------------------------------- */
  /* Load & aggregate                                  */
  /* -------------------------------------------------- */
  useEffect(() => {
    const keys = (jsonContext as any).keys()
    const blueprintKeys = keys.filter((k: string) =>
      k.endsWith('/blueprint.json'),
    )

    const loaded: BlueprintJson[] = []
    const manufacturerSet = new Set<string>()
    const integrationSet = new Set<string>()

    blueprintKeys.forEach((bpKey: string) => {
      try {
        const bp = jsonContext(bpKey) as BlueprintJson
        if (!bp || bp.category !== category) return

        const integrations = new Set<string>()

        if (category === 'controllers') {
          const basePath = bpKey.replace('/blueprint.json', '')
          keys
            .filter(
              (k: string) =>
                k.startsWith(basePath + '/') && k.endsWith('/library.json'),
            )
            .forEach((libKey: string) => {
              try {
                const lib = jsonContext(libKey) as LibraryJson
                lib?.supported_integrations?.forEach((i) => {
                  integrations.add(i)
                  integrationSet.add(i)
                })
              } catch {
                /* ignore malformed library.json */
              }
            })
        }

        const enriched: BlueprintJson = {
          ...bp,
          supported_integrations:
            integrations.size > 0 ? Array.from(integrations).sort() : undefined,
        }

        if (enriched.manufacturer) {
          manufacturerSet.add(enriched.manufacturer)
        }

        loaded.push(enriched)
      } catch {
        /* ignore invalid blueprint.json */
      }
    })

    loaded.sort((a, b) => a.name.localeCompare(b.name))

    setBlueprints(loaded)
    setFilteredBlueprints(loaded)
    setUniqueManufacturers(Array.from(manufacturerSet).sort())
    setAvailableIntegrations(Array.from(integrationSet).sort())
    setSearchQuery('')
    setSelectedManufacturer('All Manufacturers')
    setSelectedIntegrations([])
  }, [category])

  /* -------------------------------------------------- */
  /* Filtering                                         */
  /* -------------------------------------------------- */
  useEffect(() => {
    let results = blueprints

    if (category === 'controllers') {
      if (selectedManufacturer !== 'All Manufacturers') {
        results = results.filter(
          (bp) => bp.manufacturer === selectedManufacturer,
        )
      }

      if (selectedIntegrations.length > 0) {
        results = results.filter((bp) =>
          bp.supported_integrations?.some((i) =>
            selectedIntegrations.includes(i),
          ),
        )
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        results = results.filter((bp) =>
          [
            bp.name,
            bp.description,
            bp.manufacturer,
            bp.model,
            bp.model_name,
            ...(bp.tags ?? []),
            ...(bp.supported_integrations ?? []),
          ]
            .filter(Boolean)
            .some((v) => v!.toLowerCase().includes(q)),
        )
      }
    }

    setFilteredBlueprints(results)
  }, [
    blueprints,
    searchQuery,
    selectedManufacturer,
    selectedIntegrations,
    category,
  ])

  const isFiltered =
    category === 'controllers' &&
    (searchQuery ||
      selectedManufacturer !== 'All Manufacturers' ||
      selectedIntegrations.length > 0)

  /* -------------------------------------------------- */
  /* Render                                            */
  /* -------------------------------------------------- */
  return (
    <>
      {category === 'controllers' && (
        <>
          {/* Summary */}
          <div
            style={{
              marginBottom: 20,
              padding: '12px 16px',
              backgroundColor: 'var(--ifm-color-emphasis-100)',
              borderRadius: 8,
            }}
          >
            {!isFiltered ? (
              <>
                Currently <strong>{blueprints.length}</strong> devices from{' '}
                <strong>{uniqueManufacturers.length}</strong> different vendors
                are supported.
              </>
            ) : (
              <>
                Showing <strong>{filteredBlueprints.length}</strong> of{' '}
                <strong>{blueprints.length}</strong> devices.
              </>
            )}
          </div>

          {/* Search + Manufacturer */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div style={{ position: 'relative', flex: 2 }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              />
              <input
                type='text'
                placeholder='Search name, tags, integrations…'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 8px 8px 36px',
                  borderRadius: 4,
                  border: '1px solid var(--ifm-color-emphasis-300)',
                }}
              />
            </div>

            <select
              value={selectedManufacturer}
              onChange={(e) => setSelectedManufacturer(e.target.value)}
              style={{ flex: 1, padding: 8 }}
            >
              <option>All Manufacturers</option>
              {uniqueManufacturers.map((mfr) => (
                <option key={mfr}>{mfr}</option>
              ))}
            </select>
          </div>

          {/* Integration pills filter */}
          {availableIntegrations.length > 0 && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {availableIntegrations.map((integration) => {
                const key = normalizeIntegrationKey(integration)
                const color = INTEGRATION_COLORS[key] ?? '#6b7280'
                const active = selectedIntegrations.includes(integration)

                return (
                  <button
                    key={integration}
                    type='button'
                    onClick={() =>
                      setSelectedIntegrations((prev) =>
                        active
                          ? prev.filter((x) => x !== integration)
                          : [...prev, integration],
                      )
                    }
                    style={{
                      padding: '6px 12px',
                      borderRadius: 999,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: active ? 'none' : `1px solid ${color}`,
                      backgroundColor: active ? color : 'transparent',
                      color: active ? '#fff' : color,
                    }}
                  >
                    {integration}
                  </button>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Results */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filteredBlueprints.map((bp) => (
          <BlueprintItem
            key={bp.blueprint_id}
            category={category}
            blueprint={bp}
            supportedIntegrations={bp.supported_integrations}
          />
        ))}
      </div>
    </>
  )
}

export default BlueprintsList
