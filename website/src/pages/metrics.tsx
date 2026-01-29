/**
 * Page: DownloadsMetricsPage
 * ────────────────────────────────────────────────────────────────
 * Description:
 *   Comprehensive metrics dashboard for blueprint downloads:
 *     • Total downloads
 *     • Category distribution
 *     • Top blueprints (sortable table + bar chart)
 *     • Daily downloads (N-day range)
 *     • Library-aware analytics (all categories)
 *     • Theme-aware UI with light/dark support
 *
 * Changelog:
 *   - Initial Version 2025.12.03 (@yarafie)
 *   - Updated: 2025.12.09 (@yarafie)
 *       • Improved sorting, filtering, theming, and error handling
 *       • Unified chart styling + tooltip system
 *   - Updated: 2025.12.10 (@yarafie)
 *       • Switched to generic Supabase RPC helpers
 *       • Added variant-aware analytics & drill-down for controllers
 *       • Daily metrics now respect category + variant filters
 *   - Updated: 2026.01.16 (@yarafie)
 *       • Changed variant to library
 * ────────────────────────────────────────────────────────────────
 */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from 'react'
import Layout from '@theme/Layout'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { scaleOrdinal } from 'd3-scale'
import { schemeCategory10 } from 'd3-scale-chromatic'
import {
  getDownloadsAggregates,
  getDailyDownloadsSeries,
  type DownloadsAggregateRow,
  type DailyDownloadsRow,
} from '../services/metricsSupabase'

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

type SortKey =
  | 'id'
  | 'category'
  | 'library'
  | 'release'
  | 'total'
  | 'lastDownloaded'
type SortDirection = 'asc' | 'desc'
type CategoryFilter = 'ALL' | string

type ChartPoint = {
  label: string
  total: number
}

interface MetricsData {
  totalDownloads: number
  byCategory: { blueprint_category: string; total: number }[]
  // Raw rows from Supabase (per category + id + library + release)
  aggregates: DownloadsAggregateRow[]
  // Display-ready daily points
  daily: ChartPoint[]
}

// View row (after category/library/release aggregation/filtering)
interface ViewRow {
  blueprint_category: string
  blueprint_id: string
  blueprint_library: string | null
  blueprint_release: string | null
  total: number
  last_downloaded: string | null
}

type TopBlueprintBarData = {
  id: string
  label: string
  blueprint_library: string | null
  blueprint_release: string | null
  Downloads: number
}

// ────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────

const formatBigNumber = (num: number): string =>
  Number.isFinite(num) ? num.toLocaleString() : '0'

const formatDate = (isoString: string | null | undefined): string => {
  if (!isoString) return 'N/A'
  try {
    return new Date(isoString).toLocaleDateString(undefined, {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return 'Invalid Date'
  }
}

// Build a full N-day range and fill missing days with 0
const fillMissingDailyData = (
  dailyData: DailyDownloadsRow[],
  days: number,
): ChartPoint[] => {
  const map = new Map<string, number>()
  dailyData.forEach((row) => {
    map.set(row.day, Number(row.total ?? 0))
  })

  const result: ChartPoint[] = []
  const now = new Date()
  const todayUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  )

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(todayUTC)
    d.setUTCDate(todayUTC.getUTCDate() - i)
    const key = d.toISOString().substring(0, 10)
    const total = map.get(key) ?? 0
    result.push({
      label: d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      }),
      total,
    })
  }

  return result
}

// ────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────

const DownloadsMetricsPage: React.FC = () => {
  // Core state
  const [metricsData, setMetricsData] = useState<MetricsData>({
    totalDownloads: 0,
    byCategory: [],
    aggregates: [],
    daily: [],
  })
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isDailyLoading, setIsDailyLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  // Filters
  const [selectedDays, setSelectedDays] = useState(15)
  const [topLimit, setTopLimit] = useState<number>(10)
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>('ALL')
  const [selectedLibrary, setSelectedLibrary] = useState<string>('ALL') // "ALL" == All Libraries
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>('ALL') // "ALL" == All Blueprints
  const [selectedRelease, setSelectedRelease] = useState<string>('ALL') // "ALL" == All Releases
  const [selectedLibraries, setSelectedLibraries] = useState<string[]>([]) // Compare: multi-select libraries
  const [showVersions, setShowVersions] = useState(false) // Optional (disabled unless backend supports)

  // Sorting
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey
    direction: SortDirection
  }>({
    key: 'total',
    direction: 'desc',
  })

  // Theme
  const [isDark, setIsDark] = useState(false)

  // D3 color scale
  const colorScale = scaleOrdinal(schemeCategory10)

  // D3 color scale (blueprint ids)
  const idColorScale = scaleOrdinal(schemeCategory10)

  const { totalDownloads, byCategory, aggregates, daily } = metricsData

  // ──────────────────────────────────────────────────────────────
  // Theme detection (data-theme on <html>)
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const checkDarkMode = () => {
      const theme = document.documentElement.getAttribute('data-theme')
      setIsDark(theme === 'dark')
    }

    checkDarkMode()

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'data-theme'
        ) {
          checkDarkMode()
        }
      }
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    return () => observer.disconnect()
  }, [])

  // ──────────────────────────────────────────────────────────────
  // URL: hydrate + persist filter/drill state (deep-linkable)
  // ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (typeof window === 'undefined') return

    const sp = new URLSearchParams(window.location.search)

    const urlDays = sp.get('days')
    const urlTop = sp.get('top')
    const urlCategory = sp.get('category')
    const urlBp = sp.get('blueprint')
    const urlLibrary = sp.get('library')
    const urlLibraries = sp.get('libraries')
    const urlRelease = sp.get('release')

    if (urlDays && /^\d+$/.test(urlDays)) setSelectedDays(Number(urlDays))
    if (urlTop && /^\d+$/.test(urlTop)) setTopLimit(Number(urlTop))

    if (urlCategory)
      setSelectedCategory(urlCategory === 'ALL' ? 'ALL' : urlCategory)
    if (urlBp) setSelectedBlueprintId(urlBp === 'ALL' ? 'ALL' : urlBp)
    if (urlRelease)
      setSelectedRelease(urlRelease === 'ALL' ? 'ALL' : urlRelease)

    // Libraries: prefer multi-select param when present
    if (urlLibraries) {
      const libs = urlLibraries
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)
      if (libs.length > 0) {
        setSelectedLibraries(libs)
        setSelectedLibrary('ALL')
      }
    } else if (urlLibrary) {
      setSelectedLibrary(urlLibrary)
      setSelectedLibraries([])
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const sp = new URLSearchParams(window.location.search)

    sp.set('days', String(selectedDays))
    sp.set('top', String(topLimit))

    sp.set('category', String(selectedCategory))
    sp.set('blueprint', String(selectedBlueprintId))
    sp.set('release', String(selectedRelease))

    if (selectedLibraries.length > 0) {
      sp.set('libraries', selectedLibraries.join(','))
      sp.delete('library')
    } else {
      sp.delete('libraries')
      sp.set('library', String(selectedLibrary))
    }

    const next = `${window.location.pathname}?${sp.toString()}`
    window.history.replaceState({}, '', next)
  }, [
    selectedDays,
    topLimit,
    selectedCategory,
    selectedBlueprintId,
    selectedLibrary,
    selectedLibraries,
    selectedRelease,
  ])

  // ──────────────────────────────────────────────────────────────
  // THEME TOKENS & SHARED STYLES
  // ──────────────────────────────────────────────────────────────

  const THEME = {
    bg: isDark ? '#1b1b1d' : '#f9fafb',
    cardBg: isDark ? '#242526' : '#ffffff',
    textPrimary: isDark ? '#e5e7eb' : '#1f2937',
    textSecondary: isDark ? '#9ca3af' : '#6b7280',
    gridLine: isDark ? '#444' : '#e5e7eb',
    tooltipBg: isDark ? '#242526' : '#ffffff',
    tooltipBorder: isDark ? '#444' : '#ccc',
    tooltipText: isDark ? '#e5e7eb' : '#333',
    accentColor: '#4f46e5',
  }

  const gridStyleKPIs: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '32px',
    width: '100%',
  }

  const gridStyle2Col: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    marginBottom: '32px',
    width: '100%',
  }

  if (typeof window !== 'undefined') {
    const isNarrow = window.matchMedia('(max-width: 768px)').matches
    if (isNarrow) {
      ;(gridStyleKPIs as any).gridTemplateColumns = '1fr'
      ;(gridStyle2Col as any).gridTemplateColumns = '1fr'
    }
  }

  const cardStyle: CSSProperties = {
    backgroundColor: THEME.cardBg,
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    color: THEME.textPrimary,
    minWidth: '0',
    border: isDark ? '1px solid #333' : 'none',
  }

  const cardHeaderStyle = (bgColor: string): CSSProperties => ({
    backgroundColor: bgColor,
    color: 'white',
    padding: '12px',
    fontWeight: 'bold',
    fontSize: '14px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  })

  const chartHeaderStyle: CSSProperties = {
    padding: '16px',
    borderBottom: `1px solid ${THEME.gridLine}`,
    margin: 0,
    fontSize: '1.25rem',
    color: THEME.textPrimary,
    fontWeight: 'bold',
  }

  // ──────────────────────────────────────────────────────────────
  // Custom Tooltip & Y Axis Tick
  // ──────────────────────────────────────────────────────────────

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const valueEntry = payload.find(
        (p: any) => p.dataKey === 'Downloads' || p.dataKey === 'total',
      )
      const value = valueEntry?.value ?? payload[0]?.value ?? 0
      const name =
        payload[0]?.payload?.name ?? payload[0]?.payload?.id ?? label ?? 'Value'

      return (
        <div
          style={{
            padding: '10px',
            backgroundColor: THEME.tooltipBg,
            border: `1px solid ${THEME.tooltipBorder}`,
            borderRadius: '5px',
            color: THEME.tooltipText,
          }}
        >
          <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>{name}</p>
          <p>Downloads: {formatBigNumber(value)}</p>
        </div>
      )
    }
    return null
  }

  const CustomYAxisTick = (props: any) => {
    const { x, y, payload } = props
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={5}
          textAnchor='end'
          fill={THEME.textSecondary}
          fontSize={10}
          title={payload.value}
        >
          {payload.value}
        </text>
      </g>
    )
  }

  // ──────────────────────────────────────────────────────────────
  // Time range selector
  // ──────────────────────────────────────────────────────────────

  const TimeRangeSelector: React.FC<{
    current: number
    onSelect: (days: number) => void
    isDailyLoading: boolean
  }> = ({ current, onSelect, isDailyLoading }) => {
    const ranges = [1, 7, 15, 30, 90]

    const buttonStyle = (days: number): CSSProperties => ({
      padding: '6px 12px',
      margin: '0 4px',
      borderRadius: '4px',
      cursor: isDailyLoading ? 'not-allowed' : 'pointer',
      fontWeight: 'bold',
      backgroundColor: current === days ? THEME.accentColor : THEME.cardBg,
      color: current === days ? 'white' : THEME.textPrimary,
      border: `1px solid ${
        current === days ? THEME.accentColor : THEME.gridLine
      }`,
      transition: 'all 0.2s',
      boxShadow: current === days ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
      fontSize: '14px',
      opacity: isDailyLoading && current !== days ? 0.6 : 1,
    })

    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '20px',
          paddingTop: '10px',
        }}
      >
        {ranges.map((days) => (
          <button
            key={days}
            onClick={() => onSelect(days)}
            style={buttonStyle(days)}
            disabled={isDailyLoading}
          >
            {days}D
          </button>
        ))}
      </div>
    )
  }

  // ──────────────────────────────────────────────────────────────
  // Sorting helpers
  // ──────────────────────────────────────────────────────────────

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'desc'
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc'
    }
    setSortConfig({ key, direction })
  }

  const SortIcon: React.FC<{ sortKey: SortKey }> = ({ sortKey }) => {
    if (sortConfig.key !== sortKey) {
      return (
        <span
          style={{ fontSize: '0.7em', marginLeft: '5px', opacity: 0.4 }}
          dangerouslySetInnerHTML={{ __html: '&#x25B2;&#x25BC;' }}
        />
      )
    }

    return (
      <span
        style={{
          fontSize: '0.7em',
          marginLeft: '5px',
          color: THEME.accentColor,
        }}
        dangerouslySetInnerHTML={{
          __html: sortConfig.direction === 'asc' ? '&#x25B2;' : '&#x25BC;',
        }}
      />
    )
  }

  // ──────────────────────────────────────────────────────────────
  // Data table (viewRows already filtered/aggregated)
  // ──────────────────────────────────────────────────────────────

  const DataTable: React.FC<{ data: ViewRow[] }> = ({ data }) => (
    <div style={{ padding: '24px 16px 16px 16px' }}>
      <h3
        style={{
          fontSize: '1.25rem',
          color: THEME.textPrimary,
          fontWeight: 'bold',
          marginBottom: '15px',
          textAlign: 'center',
        }}
      >
        {drillTitle}
      </h3>
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
            fontSize: '14px',
            margin: '0',
          }}
        >
          <colgroup>
            <col style={{ width: 'auto' }} />
            <col style={{ width: '1%', whiteSpace: 'nowrap' }} />
            <col style={{ width: '1%', whiteSpace: 'nowrap' }} />
            <col style={{ width: '1%', whiteSpace: 'nowrap' }} />
            <col style={{ width: '1%', whiteSpace: 'nowrap' }} />
            <col style={{ width: '1%', whiteSpace: 'nowrap' }} />
          </colgroup>
          <thead>
            <tr style={{ backgroundColor: isDark ? '#333' : '#f3f4f6' }}>
              <th
                onClick={() => requestSort('id')}
                style={{
                  padding: '12px 8px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: THEME.textPrimary,
                  borderBottom: `2px solid ${THEME.accentColor}`,
                }}
              >
                Blueprint ID <SortIcon sortKey='id' />
              </th>
              <th
                onClick={() => requestSort('category')}
                style={{
                  padding: '12px 8px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: THEME.textPrimary,
                  borderBottom: `2px solid ${THEME.accentColor}`,
                  whiteSpace: 'nowrap',
                }}
              >
                Category <SortIcon sortKey='category' />
              </th>
              <th
                onClick={() => requestSort('library')}
                style={{
                  padding: '12px 8px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: THEME.textPrimary,
                  borderBottom: `2px solid ${THEME.accentColor}`,
                  whiteSpace: 'nowrap',
                }}
              >
                Library <SortIcon sortKey='library' />
              </th>
              <th
                onClick={() => requestSort('release')}
                style={{
                  padding: '12px 8px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: THEME.textPrimary,
                  borderBottom: `2px solid ${THEME.accentColor}`,
                  whiteSpace: 'nowrap',
                }}
              >
                Release <SortIcon sortKey='release' />
              </th>
              <th
                onClick={() => requestSort('total')}
                style={{
                  padding: '12px 8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  color: THEME.textPrimary,
                  borderBottom: `2px solid ${THEME.accentColor}`,
                  whiteSpace: 'nowrap',
                }}
              >
                Downloads <SortIcon sortKey='total' />
              </th>
              <th
                onClick={() => requestSort('lastDownloaded')}
                style={{
                  padding: '12px 8px',
                  textAlign: 'right',
                  cursor: 'pointer',
                  color: THEME.textPrimary,
                  borderBottom: `2px solid ${THEME.accentColor}`,
                  whiteSpace: 'nowrap',
                }}
              >
                Last Downloaded <SortIcon sortKey='lastDownloaded' />
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={`${item.blueprint_category}:${item.blueprint_id}:${item.blueprint_library ?? 'ALL'}:${item.blueprint_release ?? 'ALL'}`}
                style={{
                  borderBottom: `1px solid ${THEME.gridLine}`,
                  backgroundColor:
                    index % 2 === 0
                      ? THEME.cardBg
                      : isDark
                        ? '#2d2d2f'
                        : '#fcfcfc',
                }}
              >
                <td
                  style={{
                    padding: '10px 8px',
                    wordBreak: 'break-word',
                    color: THEME.textPrimary,
                    textAlign: 'left',
                  }}
                >
                  {item.blueprint_id}
                </td>
                <td
                  style={{
                    padding: '10px 8px',
                    color: colorScale(item.blueprint_category),
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.blueprint_category}
                </td>
                <td
                  style={{
                    padding: '10px 8px',
                    textAlign: 'left',
                    color: THEME.textPrimary,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.blueprint_library ??
                    (selectedLibrary !== 'ALL' ? selectedLibrary : '-')}
                </td>
                <td
                  style={{
                    padding: '10px 8px',
                    textAlign: 'left',
                    color: THEME.textPrimary,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.blueprint_release ?? '-'}
                </td>
                <td
                  style={{
                    padding: '10px 8px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: THEME.textPrimary,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatBigNumber(item.total)}
                </td>
                <td
                  style={{
                    padding: '10px 8px',
                    textAlign: 'right',
                    color: THEME.textPrimary,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatDate(item.last_downloaded)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <p
          style={{
            textAlign: 'center',
            padding: '20px',
            color: THEME.textSecondary,
          }}
        >
          No detailed data found for the current selection.
        </p>
      )}
    </div>
  )

  // ──────────────────────────────────────────────────────────────
  // ──────────────────────────────────────────────────────────────
  // Derived data: drill hierarchy (category → blueprint → library → release)
  // ──────────────────────────────────────────────────────────────

  const drillLevel = useMemo(() => {
    if (selectedCategory === 'ALL') return 'category'
    if (selectedBlueprintId === 'ALL') return 'blueprint'
    if (selectedLibrary === 'ALL') return 'library'
    if (selectedRelease === 'ALL') return 'release'
    return 'detail'
  }, [selectedCategory, selectedBlueprintId, selectedLibrary, selectedRelease])

  const availableCategories = useMemo(() => {
    const set = new Set<string>()
    aggregates.forEach((r) => set.add(r.blueprint_category))
    return Array.from(set).sort()
  }, [aggregates])

  const availableBlueprintIds = useMemo(() => {
    const set = new Set<string>()
    aggregates.forEach((r) => {
      if (
        selectedCategory !== 'ALL' &&
        r.blueprint_category !== selectedCategory
      )
        return
      set.add(r.blueprint_id)
    })
    return Array.from(set).sort()
  }, [aggregates, selectedCategory])

  const availableLibraries = useMemo(() => {
    const set = new Set<string>()
    aggregates.forEach((r) => {
      if (
        selectedCategory !== 'ALL' &&
        r.blueprint_category !== selectedCategory
      )
        return
      if (
        selectedBlueprintId !== 'ALL' &&
        r.blueprint_id !== selectedBlueprintId
      )
        return
      if (r.blueprint_library) set.add(r.blueprint_library)
    })
    return Array.from(set).sort()
  }, [aggregates, selectedCategory, selectedBlueprintId])

  const availableReleases = useMemo(() => {
    const set = new Set<string>()
    aggregates.forEach((r) => {
      if (
        selectedCategory !== 'ALL' &&
        r.blueprint_category !== selectedCategory
      )
        return
      if (
        selectedBlueprintId !== 'ALL' &&
        r.blueprint_id !== selectedBlueprintId
      )
        return
      if (selectedLibraries.length > 0) {
        if (
          !r.blueprint_library ||
          !selectedLibraries.includes(r.blueprint_library)
        )
          return
      } else if (
        selectedLibrary !== 'ALL' &&
        r.blueprint_library !== selectedLibrary
      ) {
        return
      }
      if (r.blueprint_release) set.add(r.blueprint_release)
    })
    return Array.from(set).sort()
  }, [
    aggregates,
    selectedCategory,
    selectedBlueprintId,
    selectedLibrary,
    selectedLibraries,
  ])

  const categoryData = useMemo(
    () =>
      byCategory.map((item) => ({
        name: item.blueprint_category,
        category: item.blueprint_category,
        value: item.total,
        total: item.total,
        label: item.blueprint_category,
      })),
    [byCategory],
  )

  const aggregateRows = useCallback(
    (
      rows: DownloadsAggregateRow[],
      keyFn: (r: DownloadsAggregateRow) => string,
      build: (r: DownloadsAggregateRow) => ViewRow,
    ) => {
      const map = new Map<string, ViewRow>()
      rows.forEach((r) => {
        const k = keyFn(r)
        const existing = map.get(k)
        if (!existing) {
          map.set(k, build(r))
          return
        }
        existing.total += r.total
        if (
          r.last_downloaded &&
          (!existing.last_downloaded ||
            r.last_downloaded > existing.last_downloaded)
        ) {
          existing.last_downloaded = r.last_downloaded
        }
      })
      return Array.from(map.values())
    },
    [],
  )

  const filteredBase = useMemo(() => {
    return aggregates.filter((r) => {
      if (
        selectedCategory !== 'ALL' &&
        r.blueprint_category !== selectedCategory
      )
        return false
      if (
        selectedBlueprintId !== 'ALL' &&
        r.blueprint_id !== selectedBlueprintId
      )
        return false
      if (selectedLibraries.length > 0) {
        if (
          !r.blueprint_library ||
          !selectedLibraries.includes(r.blueprint_library)
        )
          return false
      } else if (
        selectedLibrary !== 'ALL' &&
        r.blueprint_library !== selectedLibrary
      ) {
        return false
      }
      if (selectedRelease !== 'ALL' && r.blueprint_release !== selectedRelease)
        return false
      return true
    })
  }, [
    aggregates,
    selectedCategory,
    selectedBlueprintId,
    selectedLibrary,
    selectedLibraries,
    selectedRelease,
  ])

  const viewRows: ViewRow[] = useMemo(() => {
    if (drillLevel === 'category') {
      // All categories: group by (category, blueprint)
      return aggregateRows(
        filteredBase,
        (r) => `${r.blueprint_category}::${r.blueprint_id}`,
        (r) => ({
          blueprint_category: r.blueprint_category,
          blueprint_id: r.blueprint_id,
          blueprint_library: null,
          blueprint_release: null,
          total: r.total,
          last_downloaded: r.last_downloaded,
        }),
      )
    }

    if (drillLevel === 'blueprint') {
      // One category selected: group by blueprint id
      return aggregateRows(
        filteredBase,
        (r) => `${r.blueprint_category}::${r.blueprint_id}`,
        (r) => ({
          blueprint_category: r.blueprint_category,
          blueprint_id: r.blueprint_id,
          blueprint_library: null,
          blueprint_release: null,
          total: r.total,
          last_downloaded: r.last_downloaded,
        }),
      )
    }

    if (drillLevel === 'library') {
      // One blueprint selected: group by library
      return aggregateRows(
        filteredBase,
        (r) =>
          `${r.blueprint_category}::${r.blueprint_id}::${r.blueprint_library ?? ''}`,
        (r) => ({
          blueprint_category: r.blueprint_category,
          blueprint_id: r.blueprint_id,
          blueprint_library: r.blueprint_library,
          blueprint_release: null,
          total: r.total,
          last_downloaded: r.last_downloaded,
        }),
      )
    }

    if (drillLevel === 'release') {
      // One library selected: group by release
      return aggregateRows(
        filteredBase,
        (r) =>
          `${r.blueprint_category}::${r.blueprint_id}::${r.blueprint_library ?? ''}::${r.blueprint_release ?? ''}`,
        (r) => ({
          blueprint_category: r.blueprint_category,
          blueprint_id: r.blueprint_id,
          blueprint_library: r.blueprint_library,
          blueprint_release: r.blueprint_release,
          total: r.total,
          last_downloaded: r.last_downloaded,
        }),
      )
    }

    // detail: already filtered to a specific release (and category/blueprint/library)
    return filteredBase.map((r) => ({
      blueprint_category: r.blueprint_category,
      blueprint_id: r.blueprint_id,
      blueprint_library: r.blueprint_library,
      blueprint_release: r.blueprint_release,
      total: r.total,
      last_downloaded: r.last_downloaded,
    }))
  }, [aggregateRows, filteredBase, drillLevel])

  // Sort the view rows according to sortConfig
  const sortedViewRows: ViewRow[] = useMemo(() => {
    const items = [...viewRows]

    items.sort((a, b) => {
      let comparison = 0
      const key = sortConfig.key

      if (key === 'total') {
        comparison = a.total - b.total
      } else if (key === 'id') {
        comparison = a.blueprint_id.localeCompare(b.blueprint_id)
      } else if (key === 'category') {
        comparison = a.blueprint_category.localeCompare(b.blueprint_category)
      } else if (key === 'library') {
        const va = a.blueprint_library ?? ''
        const vb = b.blueprint_library ?? ''
        comparison = va.localeCompare(vb)
      } else if (key === 'release') {
        const va = a.blueprint_release ?? ''
        const vb = b.blueprint_release ?? ''
        comparison = va.localeCompare(vb)
      } else if (key === 'lastDownloaded') {
        const da = a.last_downloaded ? new Date(a.last_downloaded).getTime() : 0
        const db = b.last_downloaded ? new Date(b.last_downloaded).getTime() : 0
        comparison = da - db
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison
    })

    return items
  }, [viewRows, sortConfig])

  // Top N bar data from sorted rows
  const topNBarData: TopBlueprintBarData[] = useMemo(
    () =>
      sortedViewRows.slice(0, topLimit).map((row) => {
        const parts: string[] = [row.blueprint_id]

        // When we are comparing multiple libraries, show which library each bar belongs to.
        if (
          drillLevel === 'library' ||
          drillLevel === 'release' ||
          drillLevel === 'detail'
        ) {
          if (row.blueprint_library) parts.push(row.blueprint_library)
        }

        // When we are at release scope, include release in the label too.
        if (drillLevel === 'release' || drillLevel === 'detail') {
          if (row.blueprint_release) parts.push(row.blueprint_release)
        }

        const labelRaw = parts.join(' • ')
        const label =
          labelRaw.length > 60 ? `${labelRaw.substring(0, 57)}...` : labelRaw

        return {
          id: row.blueprint_id,
          label,
          blueprint_library: row.blueprint_library ?? null,
          blueprint_release: row.blueprint_release ?? null,
          Downloads: row.total,
        }
      }),
    [sortedViewRows, topLimit, drillLevel],
  )

  // ──────────────────────────────────────────────────────────────
  // Handlers for chart interactions + drill navigation
  // ──────────────────────────────────────────────────────────────

  const resetToCategory = useCallback(() => {
    setSelectedCategory('ALL')
    setSelectedBlueprintId('ALL')
    setSelectedLibrary('ALL')
    setSelectedRelease('ALL')
  }, [])

  const resetToBlueprint = useCallback(() => {
    setSelectedBlueprintId('ALL')
    setSelectedLibrary('ALL')
    setSelectedRelease('ALL')
  }, [])

  const resetToLibrary = useCallback(() => {
    setSelectedLibrary('ALL')
    setSelectedRelease('ALL')
  }, [])

  const resetToRelease = useCallback(() => {
    setSelectedRelease('ALL')
  }, [])

  const handleCategoryClick = (data: any) => {
    const category = data?.category as string | undefined
    if (!category) return

    setSelectedCategory((prev) =>
      prev === category ? 'ALL' : (category as CategoryFilter),
    )
    setSelectedBlueprintId('ALL')
    setSelectedLibrary('ALL')
    setSelectedRelease('ALL')
  }

  const handleBarClick = (data: any) => {
    const blueprintId = data?.id as string | undefined
    if (!blueprintId) return

    // When bar is clicked, drill to blueprint within the current category if already selected,
    // otherwise infer category from the first matching row.
    if (selectedCategory === 'ALL') {
      const match = aggregates.find((r) => r.blueprint_id === blueprintId)
      if (match) setSelectedCategory(match.blueprint_category)
    }
    setSelectedBlueprintId(blueprintId)
    setSelectedLibrary('ALL')
    setSelectedRelease('ALL')
  }

  const handleClearFilter = () => {
    resetToCategory()
  }

  const drillTitle = useMemo(() => {
    if (drillLevel === 'category') return 'Top Blueprints (all categories)'
    if (drillLevel === 'blueprint')
      return `Top Blueprints (${selectedCategory})`
    if (drillLevel === 'library') return `Libraries for ${selectedBlueprintId}`
    if (drillLevel === 'release')
      return `Releases for ${selectedBlueprintId} → ${selectedLibrary}`
    return `Release details: ${selectedBlueprintId} → ${selectedLibrary} → ${selectedRelease}`
  }, [
    drillLevel,
    selectedCategory,
    selectedBlueprintId,
    selectedLibrary,
    selectedLibraries,
    selectedRelease,
  ])

  const breadcrumbs = useMemo(() => {
    const items: { label: string; onClick: () => void }[] = [
      {
        label: selectedCategory === 'ALL' ? 'Categories' : 'Categories',
        onClick: resetToCategory,
      },
    ]

    if (selectedCategory !== 'ALL') {
      items.push({ label: selectedCategory, onClick: resetToBlueprint })
    }
    if (selectedBlueprintId !== 'ALL') {
      items.push({ label: selectedBlueprintId, onClick: resetToLibrary })
    }
    if (selectedLibrary !== 'ALL') {
      items.push({ label: selectedLibrary, onClick: resetToRelease })
    }
    if (selectedRelease !== 'ALL') {
      items.push({ label: selectedRelease, onClick: () => {} })
    }

    return items
  }, [
    resetToBlueprint,
    resetToCategory,
    resetToLibrary,
    resetToRelease,
    selectedCategory,
    selectedBlueprintId,
    selectedLibrary,
    selectedLibraries,
    selectedRelease,
  ])

  // ──────────────────────────────────────────────────────────────
  // Fetch: aggregates (static, once per page load)
  // ──────────────────────────────────────────────────────────────

  const hasSupabaseEnv = useCallback(() => {
    if (typeof window === 'undefined') return false
    const env = (window as any)?.env || {}
    return Boolean(env.SUPABASE_URL && env.SUPABASE_ANON_KEY)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    // If Supabase env is missing → mock mode
    if (!hasSupabaseEnv()) {
      const mockAggregates: DownloadsAggregateRow[] = [
        {
          blueprint_category: 'controllers',
          blueprint_id: 'mock-ikea_e2001_e2002',
          blueprint_library: 'EPMatt',
          blueprint_release: 'awesome',
          total: 10000,
          last_downloaded: '2025-11-19T10:30:00Z',
        },
        {
          blueprint_category: 'controllers',
          blueprint_id: 'mock-ikea_e2001_e2002',
          blueprint_library: 'yarafie',
          blueprint_release: 'anything',
          total: 5000,
          last_downloaded: '2025-11-21T10:30:00Z',
        },
        {
          blueprint_category: 'hooks',
          blueprint_id: 'mock-light',
          blueprint_library: 'EPMatt',
          blueprint_release: 'awesome',
          total: 5000,
          last_downloaded: '2025-11-18T10:30:00Z',
        },
        {
          blueprint_category: 'automations',
          blueprint_id: 'mock-addon_update_notification',
          blueprint_library: 'EPMatt',
          blueprint_release: 'awesome',
          total: 250,
          last_downloaded: '2025-11-22T10:30:00Z',
        },
      ]

      const totalDownloads = mockAggregates.reduce(
        (sum, row) => sum + row.total,
        0,
      )

      const categoryMap = new Map<string, number>()
      mockAggregates.forEach((row) => {
        categoryMap.set(
          row.blueprint_category,
          (categoryMap.get(row.blueprint_category) ?? 0) + row.total,
        )
      })

      const byCategory = Array.from(categoryMap.entries()).map(
        ([blueprint_category, total]) => ({
          blueprint_category,
          total,
        }),
      )

      setMetricsData((prev) => ({
        ...prev,
        totalDownloads,
        byCategory,
        aggregates: mockAggregates,
      }))
      setError(
        'Supabase variables missing. Showing mock aggregate data instead.',
      )
      setIsInitialLoading(false)
      return
    }

    // Real Supabase path
    ;(async () => {
      try {
        const rows = await getDownloadsAggregates({})
        const totalDownloads = rows.reduce((sum, row) => sum + row.total, 0)

        const categoryMap = new Map<string, number>()
        rows.forEach((row) => {
          categoryMap.set(
            row.blueprint_category,
            (categoryMap.get(row.blueprint_category) ?? 0) + row.total,
          )
        })

        const byCategory = Array.from(categoryMap.entries()).map(
          ([blueprint_category, total]) => ({
            blueprint_category,
            total,
          }),
        )

        setMetricsData((prev) => ({
          ...prev,
          totalDownloads,
          byCategory,
          aggregates: rows,
        }))
        setError(undefined)
      } catch (err: any) {
        setError(
          `Failed to load aggregate metrics: ${
            err?.message || 'Unknown error.'
          }`,
        )
      } finally {
        setIsInitialLoading(false)
      }
    })()
  }, [hasSupabaseEnv])

  // ──────────────────────────────────────────────────────────────
  // Fetch: daily series (depends on filters + days)
  // ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (isInitialLoading) return
    if (typeof window === 'undefined') return

    // Mock mode if no env
    if (!hasSupabaseEnv()) {
      const mockDaily: DailyDownloadsRow[] = [
        {
          day: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
            .toISOString()
            .substring(0, 10),
          total: 10,
        },
        {
          day: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
            .toISOString()
            .substring(0, 10),
          total: 20,
        },
        {
          day: new Date().toISOString().substring(0, 10),
          total: 22,
        },
      ]

      const dailyParsed = fillMissingDailyData(mockDaily, selectedDays)
      setMetricsData((prev) => ({ ...prev, daily: dailyParsed }))
      setIsDailyLoading(false)
      return
    }

    setIsDailyLoading(true)

    const effectiveCategory =
      selectedCategory === 'ALL' ? null : (selectedCategory as string)
    const effectiveId =
      selectedBlueprintId === 'ALL' ? null : selectedBlueprintId
    const effectiveLibraries = selectedLibraries.length
      ? selectedLibraries
      : selectedLibrary === 'ALL'
        ? []
        : [selectedLibrary]
    ;(async () => {
      try {
        let rows: DailyDownloadsRow[] = []
        if (effectiveLibraries.length <= 1) {
          const effectiveLibraries = selectedLibraries.length
            ? selectedLibraries
            : selectedLibrary === 'ALL'
              ? []
              : [selectedLibrary]

          if (effectiveLibraries.length <= 1) {
            const lib =
              effectiveLibraries.length === 1 ? effectiveLibraries[0] : null
            rows = await getDailyDownloadsSeries({
              days: selectedDays,
              category: effectiveCategory,
              id: effectiveId,
              library: lib,
              release: selectedRelease !== 'ALL' ? selectedRelease : null,
            })
          } else {
            // Multi-library compare: fetch each library and sum by day
            const results = await Promise.all(
              effectiveLibraries.map((lib) =>
                getDailyDownloadsSeries({
                  days: selectedDays,
                  category: effectiveCategory,
                  id: effectiveId,
                  library: lib,
                  release: selectedRelease !== 'ALL' ? selectedRelease : null,
                }),
              ),
            )
            const map = new Map<string, number>()
            for (const arr of results) {
              for (const r of arr) {
                map.set(r.day, (map.get(r.day) ?? 0) + Number(r.total ?? 0))
              }
            }
            rows = Array.from(map.entries())
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([day, total]) => ({ day, total }))
          }
        } else {
          const all = await Promise.all(
            effectiveLibraries.map((lib) =>
              getDailyDownloadsSeries({
                days: selectedDays,
                category: effectiveCategory,
                id: effectiveId,
                library: lib,
                release: selectedRelease !== 'ALL' ? selectedRelease : null,
              }),
            ),
          )
          const merged = new Map<string, number>()
          for (const series of all) {
            for (const r of series) {
              merged.set(r.day, (merged.get(r.day) ?? 0) + Number(r.total ?? 0))
            }
          }
          rows = Array.from(merged.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([day, total]) => ({ day, total }))
        }

        const dailyParsed = fillMissingDailyData(rows, selectedDays)
        setMetricsData((prev) => ({ ...prev, daily: dailyParsed }))
      } catch (err: any) {
        setError(
          `Failed to load daily metrics: ${err?.message || 'Unknown error.'}`,
        )
      } finally {
        setIsDailyLoading(false)
      }
    })()
  }, [
    hasSupabaseEnv,
    isInitialLoading,
    selectedDays,
    selectedCategory,
    selectedBlueprintId,
    selectedLibrary,
    selectedLibraries,
    selectedRelease,
  ])

  // ──────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────

  return (
    <Layout
      title='Library Downloads Metrics'
      description='Enhanced metrics dashboard with library-aware analytics'
    >
      <main
        className='container margin-vert--lg'
        style={{
          backgroundColor: THEME.bg,
          transition: 'background-color 0.3s ease',
          minHeight: '100vh',
          padding: '2rem',
        }}
      >
        <h1
          style={{
            textAlign: 'center',
            marginBottom: '32px',
            fontSize: '2rem',
            fontWeight: 'bold',
            color: THEME.textPrimary,
          }}
        >
          Library Download Metrics Dashboard
        </h1>

        {isInitialLoading && (
          <div style={{ textAlign: 'center', color: THEME.textPrimary }}>
            Loading core metrics...
          </div>
        )}

        {!isInitialLoading && error && (
          <div className='alert alert--danger' role='alert'>
            <h4 className='alert__heading'>Metrics Notice</h4>
            <p>{error}</p>
          </div>
        )}

        {!isInitialLoading && (
          <div style={{ width: '100%' }}>
            {/* 1. KPI cards */}
            <section style={gridStyleKPIs}>
              <div style={cardStyle}>
                <div style={cardHeaderStyle(THEME.accentColor)}>
                  Total Downloads
                </div>
                <div style={{ padding: '24px', textAlign: 'center' }}>
                  <p
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: '900',
                      color: THEME.accentColor,
                      margin: 0,
                    }}
                  >
                    {formatBigNumber(totalDownloads)}
                  </p>
                </div>
              </div>

              <div style={cardStyle}>
                <div style={cardHeaderStyle('#9333ea')}>
                  Tracked Blueprints (rows)
                </div>
                <div style={{ padding: '24px', textAlign: 'center' }}>
                  <p
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: '900',
                      color: '#9333ea',
                      margin: 0,
                    }}
                  >
                    {formatBigNumber(aggregates.length)}
                  </p>
                </div>
              </div>
            </section>

            {/* Drill path + quick selectors */}
            <section style={{ ...cardStyle, marginBottom: '24px' }}>
              <div style={cardHeaderStyle('#0ea5e9')}>
                Library View - Selection
              </div>
              <div style={{ padding: '16px' }}>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    alignItems: 'center',
                  }}
                >
                  {breadcrumbs.map((b, idx) => (
                    <React.Fragment key={b.label}>
                      <button
                        type='button'
                        onClick={b.onClick}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: `1px solid ${THEME.gridLine}`,
                          background: THEME.cardBg,
                          color: THEME.textPrimary,
                          cursor:
                            idx === breadcrumbs.length - 1
                              ? 'default'
                              : 'pointer',
                          opacity: idx === breadcrumbs.length - 1 ? 0.9 : 1,
                          fontWeight:
                            idx === breadcrumbs.length - 1 ? 'bold' : 'normal',
                        }}
                        disabled={idx === breadcrumbs.length - 1}
                      >
                        {b.label}
                      </button>
                      {idx < breadcrumbs.length - 1 && (
                        <span style={{ color: THEME.textSecondary }}>›</span>
                      )}
                    </React.Fragment>
                  ))}

                  <div
                    style={{
                      marginLeft: 'auto',
                      display: 'flex',
                      gap: '8px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <button
                      type='button'
                      onClick={handleClearFilter}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: `1px solid ${THEME.gridLine}`,
                        background: isDark ? '#2d2d2f' : '#f3f4f6',
                        color: THEME.textPrimary,
                        cursor: 'pointer',
                        fontWeight: 'bold',
                      }}
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                    gap: '12px',
                    marginTop: '14px',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: THEME.textSecondary,
                        marginBottom: '6px',
                      }}
                    >
                      Category
                    </div>
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        const v = e.target.value
                        setSelectedCategory(v as any)
                        setSelectedBlueprintId('ALL')
                        setSelectedLibrary('ALL')
                        setSelectedRelease('ALL')
                      }}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '6px',
                      }}
                    >
                      <option value='ALL'>ALL</option>
                      {availableCategories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: THEME.textSecondary,
                        marginBottom: '6px',
                      }}
                    >
                      Blueprint
                    </div>
                    <select
                      value={selectedBlueprintId}
                      onChange={(e) => {
                        const v = e.target.value
                        setSelectedBlueprintId(v)
                        setSelectedLibrary('ALL')
                        setSelectedRelease('ALL')
                      }}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '6px',
                      }}
                      disabled={selectedCategory === 'ALL'}
                    >
                      <option value='ALL'>ALL</option>
                      {availableBlueprintIds.map((id) => (
                        <option key={id} value={id}>
                          {id}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: THEME.textSecondary,
                        marginBottom: '6px',
                      }}
                    >
                      Library
                    </div>
                    <select
                      value={selectedLibrary}
                      onChange={(e) => {
                        const v = e.target.value
                        setSelectedLibrary(v)
                        setSelectedRelease('ALL')
                      }}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '6px',
                      }}
                      disabled={
                        selectedCategory === 'ALL' ||
                        selectedBlueprintId === 'ALL'
                      }
                    >
                      <option value='ALL'>ALL</option>
                      {availableLibraries.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: THEME.textSecondary,
                        marginBottom: '6px',
                      }}
                    >
                      Release
                    </div>
                    <select
                      value={selectedRelease}
                      onChange={(e) => setSelectedRelease(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '6px',
                      }}
                      disabled={
                        selectedCategory === 'ALL' ||
                        selectedBlueprintId === 'ALL' ||
                        selectedLibrary === 'ALL' ||
                        selectedLibraries.length > 1
                      }
                    >
                      <option value='ALL'>ALL</option>
                      {availableReleases.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>

                    <div style={{ marginTop: '8px' }}>
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '12px',
                          color: THEME.textSecondary,
                        }}
                        title='Optional: enable only if you later add a version-aware analytics RPC'
                      >
                        <input
                          type='checkbox'
                          checked={showVersions}
                          onChange={(e) => setShowVersions(e.target.checked)}
                          disabled
                        />
                        Version (optional)
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Daily chart + category pie */}
            <section style={gridStyle2Col}>
              {/* 2a. Daily downloads */}
              <div style={cardStyle}>
                <h3 style={chartHeaderStyle}>
                  Daily Downloads (Last {selectedDays} Days)
                </h3>
                <TimeRangeSelector
                  current={selectedDays}
                  onSelect={setSelectedDays}
                  isDailyLoading={isDailyLoading}
                />
                <div
                  style={{
                    height: '350px',
                    padding: '10px',
                    position: 'relative',
                  }}
                >
                  {isDailyLoading && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isDark
                          ? 'rgba(36, 37, 38, 0.8)'
                          : 'rgba(255, 255, 255, 0.8)',
                        zIndex: 10,
                        borderRadius: '4px',
                        color: THEME.textPrimary,
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                      }}
                    >
                      Updating chart...
                    </div>
                  )}
                  <ResponsiveContainer width='100%' height='100%'>
                    <AreaChart
                      data={daily}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id='colorTotal'
                          x1='0'
                          y1='0'
                          x2='0'
                          y2='1'
                        >
                          <stop
                            offset='5%'
                            stopColor={THEME.accentColor}
                            stopOpacity={0.8}
                          />
                          <stop
                            offset='95%'
                            stopColor={THEME.accentColor}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray='3 3'
                        stroke={THEME.gridLine}
                        vertical={false}
                      />
                      <XAxis
                        dataKey='label'
                        stroke={THEME.textSecondary}
                        tick={{ fontSize: 10, fill: THEME.textSecondary }}
                      />
                      <YAxis
                        allowDecimals={false}
                        stroke={THEME.textSecondary}
                        tick={{ fontSize: 10, fill: THEME.textSecondary }}
                        tickFormatter={formatBigNumber}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type='monotone'
                        dataKey='total'
                        stroke={THEME.accentColor}
                        strokeWidth={3}
                        fill='url(#colorTotal)'
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 2b. Category distribution pie */}
              <div style={cardStyle}>
                <h3 style={chartHeaderStyle}>
                  Category Distribution (Click to filter)
                </h3>
                <div style={{ height: '350px', padding: '10px' }}>
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey='value'
                        nameKey='category'
                        cx='50%'
                        cy='50%'
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        fill='#8884d8'
                        labelLine={false}
                        label={({ percent }) =>
                          `${(percent * 100).toFixed(0)}%`
                        }
                        onClick={handleCategoryClick}
                        style={{ cursor: 'pointer' }}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={colorScale(entry.category)}
                            stroke={isDark ? '#242526' : '#fff'}
                            opacity={
                              selectedCategory === 'ALL' ||
                              selectedCategory === entry.category
                                ? 1
                                : 0.4
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        iconType='circle'
                        wrapperStyle={{
                          fontSize: '12px',
                          color: THEME.textPrimary,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            {/* 3. Bar chart for top blueprints + library selector */}
            <section
              style={{
                ...cardStyle,
                paddingBottom: '20px',
                marginBottom: '32px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 16px',
                  borderBottom: `1px solid ${THEME.gridLine}`,
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <h3
                    style={{
                      ...chartHeaderStyle,
                      borderBottom: 'none',
                      paddingLeft: 0,
                      margin: 0,
                    }}
                  >
                    {selectedCategory === 'ALL'
                      ? `Top ${topLimit} Blueprints`
                      : selectedLibraries.length > 0
                        ? `Top ${topLimit} Blueprints (Libraries: ${selectedLibraries.length})`
                        : selectedLibrary !== 'ALL'
                          ? `Top ${topLimit} Blueprints (${selectedLibrary})`
                          : `Top ${topLimit} ${
                              selectedCategory.charAt(0).toUpperCase() +
                              selectedCategory.slice(1)
                            } Blueprints`}
                  </h3>

                  {availableLibraries.length > 0 && (
                    <div style={{ margin: '8px 0 8px 0' }}>
                      <label
                        style={{
                          fontSize: '0.85rem',
                          marginRight: '8px',
                          color: THEME.textSecondary,
                        }}
                      >
                        Library:
                      </label>
                      <select
                        value={selectedLibrary}
                        onChange={(e) => {
                          const value = e.target.value
                          setSelectedLibrary(value)
                          setSelectedLibraries([]) // leave compare mode
                          if (value === 'ALL') setSelectedRelease('ALL')
                        }}
                        style={{
                          padding: '4px 8px',
                          fontSize: '0.85rem',
                          borderRadius: '4px',
                          border: `1px solid ${THEME.gridLine}`,
                          background: 'var(--ifm-navbar-background-color)',
                          color: 'var(--ifm-font-color-base)',
                        }}
                      >
                        <option value='ALL'>All Libraries</option>
                        {availableLibraries.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>

                      {/* Compare: multi-select libraries (stays on this view) */}
                      <div style={{ marginTop: '10px' }}>
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: THEME.textSecondary,
                            marginBottom: '6px',
                          }}
                        >
                          Compare libraries (multi-select):
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '8px',
                            maxHeight: '84px',
                            overflowY: 'auto',
                            padding: '6px',
                            border: `1px solid ${THEME.gridLine}`,
                            borderRadius: '6px',
                          }}
                        >
                          {availableLibraries.map((lib) => {
                            const checked = selectedLibraries.includes(lib)
                            return (
                              <label
                                key={lib}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  fontSize: '0.8rem',
                                  cursor: 'pointer',
                                  userSelect: 'none',
                                }}
                              >
                                <input
                                  type='checkbox'
                                  checked={checked}
                                  onChange={() => {
                                    setSelectedLibraries((prev) => {
                                      const next = checked
                                        ? prev.filter((x) => x !== lib)
                                        : [...prev, lib]

                                      // If exactly one selected, mirror into primary selection for release drill
                                      if (next.length === 1) {
                                        setSelectedLibrary(next[0])
                                      } else {
                                        setSelectedLibrary('ALL')
                                      }

                                      // Release-level drill only makes sense with a single library
                                      if (next.length !== 1)
                                        setSelectedRelease('ALL')

                                      return next
                                    })
                                  }}
                                />
                                <span style={{ color: THEME.textPrimary }}>
                                  {lib}
                                </span>
                              </label>
                            )
                          })}

                          {availableLibraries.length === 0 && (
                            <span style={{ color: THEME.textSecondary }}>
                              No libraries found for current selection.
                            </span>
                          )}
                        </div>

                        {selectedLibraries.length > 1 && (
                          <div
                            style={{
                              marginTop: '6px',
                              fontSize: '0.75rem',
                              color: THEME.textSecondary,
                            }}
                          >
                            Release drill-down is disabled while comparing
                            multiple libraries.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <select
                      value={topLimit}
                      onChange={(e) => setTopLimit(Number(e.target.value))}
                      style={{
                        appearance: 'none',
                        padding: '6px 32px 6px 10px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        backgroundColor: 'var(--ifm-navbar-background-color)',
                        color: 'var(--ifm-font-color-base)',
                        border: '1px solid var(--ifm-color-emphasis-300)',
                        borderRadius: '6px',
                      }}
                    >
                      {[5, 10, 15, 20, 25, 30, 40, 50].map((n) => (
                        <option key={n} value={n}>
                          Top {n}
                        </option>
                      ))}
                    </select>
                    <svg
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        width: '14px',
                        height: '14px',
                        transform: 'translateY(-50%)',
                        opacity: 0.7,
                        pointerEvents: 'none',
                      }}
                      viewBox='0 0 24 24'
                    >
                      <path fill='currentColor' d='M7 10l5 5 5-5z' />
                    </svg>
                  </div>

                  {(selectedCategory !== 'ALL' ||
                    selectedLibrary !== 'ALL') && (
                    <button
                      onClick={handleClearFilter}
                      style={{
                        fontSize: '12px',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'background-color 0.2s',
                        whiteSpace: 'nowrap',
                      }}
                      title='Clear category/library filters'
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>

              <div style={{ height: Math.max(400, topNBarData.length * 40) }}>
                {topNBarData.length > 0 ? (
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart
                      onClick={handleBarClick}
                      data={topNBarData}
                      layout='vertical'
                      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray='3 3'
                        horizontal={false}
                        stroke={THEME.gridLine}
                      />
                      <XAxis
                        type='number'
                        stroke={THEME.textSecondary}
                        tick={{ fontSize: 10, fill: THEME.textSecondary }}
                        tickFormatter={formatBigNumber}
                        domain={[0, 'auto']}
                        allowDecimals={false}
                      />
                      <YAxis
                        dataKey='label'
                        type='category'
                        width={100}
                        tickLine={false}
                        axisLine={false}
                        tick={<CustomYAxisTick />}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        iconType='circle'
                        wrapperStyle={{
                          fontSize: '12px',
                          color: THEME.textPrimary,
                        }}
                      />
                      <Bar
                        dataKey='Downloads'
                        name='# of Downloads'
                        barSize={20}
                        radius={[0, 4, 4, 0]}
                      >
                        {topNBarData.map((entry, idx) => (
                          <Cell
                            key={`cell-${entry.id}-${entry.blueprint_library ?? 'ALL'}-${entry.blueprint_release ?? 'ALL'}-${idx}`}
                            fill={idColorScale(entry.id) as any}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p
                    style={{
                      textAlign: 'center',
                      padding: '50px',
                      color: THEME.textSecondary,
                    }}
                  >
                    No top blueprints found for the current selection.
                  </p>
                )}
              </div>
            </section>

            {/* 4. Table data view */}
            <section style={{ ...cardStyle, overflow: 'visible' }}>
              <DataTable data={sortedViewRows} />
            </section>
          </div>
        )}
      </main>
    </Layout>
  )
}

export default DownloadsMetricsPage
