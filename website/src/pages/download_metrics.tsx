/**
 * Page: DownloadMetricsPage
 * ────────────────────────────────────────────────────────────────
 * Description:
 *   Comprehensive metrics dashboard for blueprint downloads:
 *     • Total downloads
 *     • Category distribution
 *     • Top blueprints (sortable table + bar chart)
 *     • Daily downloads (N-day range)
 *     • Theme-aware UI with light/dark support
 *
 * Changelog:
 *   - Initial Version 2025.12.03 (@yarafie)
 *   - Updated: 2025.12.09 (@yarafie)
 *       • Improved sorting, filtering, theming, and error handling
 *       • Unified chart styling + tooltip system
 * ────────────────────────────────────────────────────────────────
 */
import React, { useEffect, useState, useCallback, useMemo } from 'react'
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

type TotalMetric = { total: string }
type CategoryMetric = { blueprint_category: string; total: string }
type TopBlueprintMetric = {
  blueprint_category: string
  blueprint_id: string
  total: string
  last_downloaded?: string
}
type DailyMetric = { day: string; total: string }
type ChartPoint = { label: string; total: number }
type ChartData = ChartPoint & { name: string; value: number; category?: string }
interface MetricsData {
  totalDownloads: number
  byCategory: CategoryMetric[]
  topBlueprints: TopBlueprintMetric[]
  daily: ChartPoint[]
}
type TopBlueprintBarData = { id: string; name: string; Downloads: number }
type SortKey = 'id' | 'category' | 'total' | 'lastDownloaded'
type SortDirection = 'asc' | 'desc'

const DownloadMetricsPage: React.FC = () => {
  const [metricsData, setMetricsData] = useState<MetricsData>({
    totalDownloads: 0,
    byCategory: [],
    topBlueprints: [],
    daily: [],
  })
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isDailyLoading, setIsDailyLoading] = useState(true)
  const [error, setError] = useState<string | undefined>(undefined)
  const [selectedDays, setSelectedDays] = useState(15)
  const [topLimit, setTopLimit] = useState<number>(10)
  const [isDark, setIsDark] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey
    direction: SortDirection
  }>({ key: 'total', direction: 'desc' })

  const { totalDownloads, byCategory, topBlueprints, daily } = metricsData
  const d3ColorScale = scaleOrdinal(schemeCategory10)

  const handleCategoryClick = (data: ChartData) => {
    const category = data.category
    setSelectedCategory((prev) => (prev === category ? null : category))
  }
  const handleClearFilter = () => setSelectedCategory(null)
  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'desc'
    if (sortConfig.key === key && sortConfig.direction === 'desc')
      direction = 'asc'
    setSortConfig({ key, direction })
  }

  const formatApiDateUTC = (date: Date): string =>
    date.toISOString().substring(0, 10)
  const formatBigNumber = (num: number): string => num.toLocaleString()
  const formatDate = (isoString: string | undefined): string => {
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

  const fillMissingDailyData = (
    dailyData: DailyMetric[],
    days: number,
  ): ChartPoint[] => {
    const dailyMap = new Map(
      dailyData.map((item) => [item.day, Number(item.total)]),
    )
    const result: ChartPoint[] = []
    const now = new Date()
    const todayUTC = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    )
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(todayUTC)
      d.setUTCDate(todayUTC.getUTCDate() - i)
      const apiDate = formatApiDateUTC(d)
      const total = dailyMap.get(apiDate) || 0
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

  const fetchWithRetry = useCallback(
    async (url: string, options: RequestInit, retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await fetch(url, options)
          if (response.ok) return response
          if (response.status === 429 && i < retries - 1) {
            const delay = Math.pow(2, i) * 1000 + Math.random() * 1000
            await new Promise((resolve) => setTimeout(resolve, delay))
            continue
          }
          const text = await response.text()
          throw new Error(
            `HTTP error! Status: ${response.status}. Response: ${text.substring(0, 100)}...`,
          )
        } catch (error: any) {
          if (i === retries - 1) throw error
        }
      }
    },
    [],
  )

  useEffect(() => {
    const checkDarkMode = () => {
      const theme = document.documentElement.getAttribute('data-theme')
      setIsDark(theme === 'dark')
    }
    checkDarkMode()
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'data-theme'
        ) {
          checkDarkMode()
        }
      })
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const supabaseUrl = (window as any)?.env?.SUPABASE_URL
    const supabaseAnonKey = (window as any)?.env?.SUPABASE_ANON_KEY
    const headers = {
      'Content-Type': 'application/json',
      apikey: supabaseAnonKey,
      Authorization: 'Bearer ' + supabaseAnonKey,
    }
    if (!supabaseUrl || !supabaseAnonKey) {
      setMetricsData((prev) => ({
        ...prev,
        totalDownloads: 1234567,
        byCategory: [
          { blueprint_category: 'mock-controllers-mock', total: '900000' },
          { blueprint_category: 'mock-hooks-mock', total: '280000' },
          { blueprint_category: 'mock-automation-mock', total: '50000' },
        ],
        topBlueprints: [
          {
            blueprint_category: 'mock-hooks-mock',
            blueprint_id: 'mock-light-mock',
            total: '5000',
            last_downloaded: '2025-11-21T10:30:00Z',
          },
          {
            blueprint_category: 'mock-hooks-mock',
            blueprint_id: 'mock-cover-mock',
            total: '500',
            last_downloaded: '2025-11-15T10:30:00Z',
          },
          {
            blueprint_category: 'mock-controllers-mock',
            blueprint_id: 'mock-ikea_e1743-mock',
            total: '10000',
            last_downloaded: '2025-11-19T10:30:00Z',
          },
          {
            blueprint_category: 'mock-controllers-mock',
            blueprint_id: 'mock-philips_929002398602-mock',
            total: '5000',
            last_downloaded: '2025-10-25T10:30:00Z',
          },
          {
            blueprint_category: 'mock-automation-mock',
            blueprint_id: 'mock-addon_update_notification-mock',
            total: '250',
            last_downloaded: '2025-11-22T10:30:00Z',
          },
          {
            blueprint_category: 'mock-automation-mock',
            blueprint_id: 'mock-persistent_notification_to_mobile-mock',
            total: '150',
            last_downloaded: '2025-11-18T10:30:00Z',
          },
        ],
      }))
      setError('Supabase variables missing. Showing mock data.')
      setIsInitialLoading(false)
      return
    }
    async function fetchStaticMetrics() {
      try {
        const [totalRes, catRes, topRes] = await Promise.all([
          fetchWithRetry(`${supabaseUrl}/rest/v1/rpc/get_total_downloads`, {
            method: 'POST',
            headers,
            body: JSON.stringify({}),
          }),
          fetchWithRetry(
            `${supabaseUrl}/rest/v1/rpc/get_downloads_by_category`,
            {
              method: 'POST',
              headers,
              body: JSON.stringify({}),
            },
          ),
          fetchWithRetry(`${supabaseUrl}/rest/v1/rpc/get_top_blueprints`, {
            method: 'POST',
            headers,
            body: JSON.stringify({}),
          }),
        ])
        const totalJson: TotalMetric[] | number = await totalRes.json()
        const catJson: CategoryMetric[] = await catRes.json()
        const topJson: TopBlueprintMetric[] = await topRes.json()
        let totalDownloads = 0
        if (Array.isArray(totalJson) && totalJson.length > 0) {
          totalDownloads = Number(totalJson[0].total)
        } else if (typeof totalJson === 'number') {
          totalDownloads = totalJson
        }
        setMetricsData((prev) => ({
          ...prev,
          totalDownloads,
          byCategory: Array.isArray(catJson) ? catJson : [],
          topBlueprints: Array.isArray(topJson) ? topJson : [],
        }))
        setError(undefined)
      } catch (err: any) {
        setError(
          `Failed to load static metrics: ${err.message || 'Unknown error.'}`,
        )
      } finally {
        setIsInitialLoading(false)
      }
    }
    fetchStaticMetrics()
  }, [fetchWithRetry])

  useEffect(() => {
    if (!isInitialLoading) {
      setIsDailyLoading(true)
      const supabaseUrl = (window as any)?.env?.SUPABASE_URL
      const supabaseAnonKey = (window as any)?.env?.SUPABASE_ANON_KEY
      const headers = {
        'Content-Type': 'application/json',
        apikey: supabaseAnonKey,
        Authorization: 'Bearer ' + supabaseAnonKey,
      }
      if (!supabaseUrl || !supabaseAnonKey) {
        const mockDaily: DailyMetric[] = [
          {
            day: formatApiDateUTC(
              new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            ),
            total: '10',
          },
          {
            day: formatApiDateUTC(
              new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            ),
            total: '20',
          },
          { day: formatApiDateUTC(new Date()), total: '22' },
        ]
        const dailyParsed = fillMissingDailyData(mockDaily, selectedDays)
        setMetricsData((prev) => ({ ...prev, daily: dailyParsed }))
        setIsDailyLoading(false)
        return
      }
      async function fetchDailyMetrics() {
        try {
          const dailyRes = await fetchWithRetry(
            `${supabaseUrl}/rest/v1/rpc/get_daily_downloads`,
            {
              method: 'POST',
              headers,
              body: JSON.stringify({ p_days: selectedDays }),
            },
          )
          const dailyJson: DailyMetric[] = await dailyRes.json()
          const dailyParsed = fillMissingDailyData(
            Array.isArray(dailyJson) ? dailyJson : [],
            selectedDays,
          )
          setMetricsData((prev) => ({ ...prev, daily: dailyParsed }))
        } catch (err: any) {
          setError(
            `Failed to load daily metrics: ${err.message || 'Unknown error.'}`,
          )
        } finally {
          setIsDailyLoading(false)
        }
      }
      fetchDailyMetrics()
    }
  }, [selectedDays, isInitialLoading, fetchWithRetry])

  const sortedBlueprints = useMemo(() => {
    const filtered = selectedCategory
      ? topBlueprints.filter((bp) => bp.blueprint_category === selectedCategory)
      : topBlueprints
    const sortableItems = [...filtered].map((item) => ({
      ...item,
      totalNum: Number(item.total),
    }))
    sortableItems.sort((a, b) => {
      const key = sortConfig.key === 'total' ? 'totalNum' : sortConfig.key
      let comparison = 0
      if (key === 'totalNum') {
        comparison = a.totalNum - b.totalNum
      } else if (key === 'id') {
        comparison = a.blueprint_id.localeCompare(b.blueprint_id)
      } else if (key === 'category') {
        comparison = a.blueprint_category.localeCompare(b.blueprint_category)
      } else if (key === 'lastDownloaded') {
        const dateA = new Date(a.last_downloaded || 0).getTime()
        const dateB = new Date(b.last_downloaded || 0).getTime()
        comparison = dateA - dateB
      }
      return sortConfig.direction === 'asc' ? comparison : -comparison
    })
    return sortableItems.map((item) => ({
      blueprint_category: item.blueprint_category,
      blueprint_id: item.blueprint_id,
      total: item.total,
      last_downloaded: item.last_downloaded,
    })) as TopBlueprintMetric[]
  }, [topBlueprints, selectedCategory, sortConfig])

  const categoryData: ChartData[] = byCategory.map((item) => ({
    name: item.blueprint_category,
    category: item.blueprint_category,
    value: Number(item.total),
    total: Number(item.total),
    label: item.blueprint_category,
  }))

  const topNBarData: TopBlueprintBarData[] = sortedBlueprints
    .slice(0, topLimit)
    .map((bp) => ({
      id: bp.blueprint_id,
      name:
        bp.blueprint_id.length > 40
          ? bp.blueprint_id.substring(0, 37) + '...'
          : bp.blueprint_id,
      Downloads: Number(bp.total),
    }))

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

  const gridStyleKPIs: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '32px',
    width: '100%',
  }
  const gridStyle2Col: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    marginBottom: '32px',
    width: '100%',
  }
  const mediaQueryMatch =
    typeof window !== 'undefined' &&
    window.matchMedia('(max-width: 768px)').matches
  if (mediaQueryMatch) {
    ;(gridStyleKPIs as any).gridTemplateColumns = '1fr'
    ;(gridStyle2Col as any).gridTemplateColumns = '1fr'
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: THEME.cardBg,
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    color: THEME.textPrimary,
    minWidth: '0',
    border: isDark ? '1px solid #333' : 'none',
  }
  const cardHeaderStyle = (bgColor: string): React.CSSProperties => ({
    backgroundColor: bgColor,
    color: 'white',
    padding: '12px',
    fontWeight: 'bold',
    fontSize: '14px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  })
  const chartHeaderStyle: React.CSSProperties = {
    padding: '16px',
    borderBottom: `1px solid ${THEME.gridLine}`,
    margin: 0,
    fontSize: '1.25rem',
    color: THEME.textPrimary,
    fontWeight: 'bold',
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const valueEntry = payload.find(
        (p: any) => p.dataKey === 'Downloads' || p.dataKey === 'total',
      )
      const value = valueEntry?.value || payload[0]?.value
      const name = payload[0].payload.name || payload[0].payload.id || label
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

  const TimeRangeSelector: React.FC<{
    current: number
    onSelect: (days: number) => void
    isDailyLoading: boolean
  }> = ({ current, onSelect, isDailyLoading }) => {
    const ranges = [1, 7, 15, 30, 90]
    const activeStyle = (days: number): React.CSSProperties => ({
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
            style={activeStyle(days)}
            disabled={isDailyLoading}
          >
            {days}D
          </button>
        ))}
      </div>
    )
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

  const DataTable: React.FC<{ data: TopBlueprintMetric[] }> = ({ data }) => (
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
        Table Data View (Top Results, limited by selection)
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
                key={`${item.blueprint_category}:${item.blueprint_id}`}
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
                    color: d3ColorScale(item.blueprint_category),
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.blueprint_category}
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
                  {formatBigNumber(Number(item.total))}
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

  return (
    <Layout
      title='Blueprint Download Metrics'
      description='Enhanced Metrics Dashboard'
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
          Blueprint Metrics Dashboard
        </h1>

        {isInitialLoading && (
          <div style={{ textAlign: 'center', color: THEME.textPrimary }}>
            Loading core metrics...
          </div>
        )}

        {!isInitialLoading && error && (
          <div className='alert alert--danger' role='alert'>
            <h4 className='alert__heading'>Error loading metrics</h4>
            <p>{error}</p>
          </div>
        )}

        {!isInitialLoading && (
          <div style={{ width: '100%' }}>
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
                <div style={cardHeaderStyle('#9333ea')}>Tracked Blueprints</div>
                <div style={{ padding: '24px', textAlign: 'center' }}>
                  <p
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: '900',
                      color: '#9333ea',
                      margin: 0,
                    }}
                  >
                    {formatBigNumber(topBlueprints.length)}
                  </p>
                </div>
              </div>
            </section>

            <section style={gridStyle2Col}>
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
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
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
                            fill={d3ColorScale(entry.category)}
                            stroke={isDark ? '#242526' : '#fff'}
                            opacity={
                              selectedCategory === null ||
                              selectedCategory === entry.category
                                ? 1
                                : 0.4
                            }
                            onMouseOver={(e) =>
                              (e.currentTarget.style.opacity = '1')
                            }
                            onMouseOut={(e) =>
                              (e.currentTarget.style.opacity =
                                selectedCategory === null ||
                                selectedCategory === entry.category
                                  ? '1'
                                  : '0.4')
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
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '4px',
                  }}
                >
                  <h3
                    style={{
                      ...chartHeaderStyle,
                      borderBottom: 'none',
                      paddingLeft: '0',
                      margin: 0,
                    }}
                  >
                    {selectedCategory
                      ? `Top ${topLimit} Blueprints in '${selectedCategory}' Category`
                      : `Top ${topLimit} Blueprints (Overall, Sorted by Downloads)`}
                  </h3>
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
                      {[5, 10, 15, 20, 25, 30, 40, 50, 75, 100].map((n) => (
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
                </div>
                {selectedCategory && (
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
                    }}
                    title={`Click to view all ${topBlueprints.length} blueprints`}
                  >
                    Clear Filter (View {topBlueprints.length} total)
                  </button>
                )}
              </div>

              <div style={{ height: Math.max(400, topNBarData.length * 40) }}>
                {topNBarData.length > 0 ? (
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart
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
                        dataKey='name'
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
                        fill={
                          selectedCategory
                            ? d3ColorScale(selectedCategory)
                            : d3ColorScale('top10')
                        }
                        barSize={20}
                        radius={[0, 4, 4, 0]}
                      />
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

            <section style={{ ...cardStyle, overflow: 'visible' }}>
              <DataTable data={sortedBlueprints} />
            </section>
          </div>
        )}
      </main>
    </Layout>
  )
}

export default DownloadMetricsPage
