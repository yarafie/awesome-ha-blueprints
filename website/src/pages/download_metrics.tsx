import React, { useEffect, useState, useCallback, useMemo } from 'react'
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

// D3 Imports for Professional Coloring
import { scaleOrdinal } from 'd3-scale'
import { schemeCategory10 } from 'd3-scale-chromatic'

// --- Supabase Client Placeholder & Configuration ---
// This assumes your environment provides an initialized Supabase client object named 'supabase'.
declare const supabase: any

// A simple wrapper to simulate the Docusaurus Layout for self-containment
const Layout = ({ children, title }) => (
  <div
    style={{
      fontFamily: 'Inter, sans-serif',
      backgroundColor: '#f3f4f6',
      minHeight: '100vh',
      padding: '1rem',
    }}
  >
    <header style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
        {title}
      </h1>
    </header>
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '1.5rem' }}>
      {children}
    </div>
  </div>
)

// --- THEME DEFINITION ---
const THEME = {
  primary: '#4f46e5', // Indigo-600
  secondary: '#10b981', // Emerald-500
  accent: '#f59e0b', // Amber-500
  background: '#f3f4f6', // Gray-100
  surface: '#ffffff', // White
  textPrimary: '#1f2937', // Gray-800
  textSecondary: '#6b7280', // Gray-500
  borderColor: '#e5e7eb', // Gray-200
  tableRowOdd: '#f9fafb', // Gray-50 for odd rows
  tableRowEven: '#ffffff', // White for even rows
  link: '#6366f1', // Indigo-500
}

// Inline styles for the card layout
const cardStyle = {
  backgroundColor: THEME.surface,
  borderRadius: '0.75rem',
  padding: '1.5rem',
  boxShadow:
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  border: `1px solid ${THEME.borderColor}`,
}

// D3 color scale setup
const d3ColorScale = scaleOrdinal(schemeCategory10)

// --- TYPE DEFINITIONS based on SQL RPC Functions ---
type TotalMetric = { total: string }
type CategoryMetric = { blueprint_category: string; total: string }
type TopBlueprintMetric = {
  blueprint_category: string
  blueprint_id: string
  total: string
  last_downloaded?: string // Date of the most recent download
}
type DailyMetric = {
  day: string // ISO date string from RPC
  total: string
}

type ChartPoint = {
  label: string // e.g. "Nov 18"
  total: number
}

interface MetricsData {
  totalDownloads: number
  byCategory: CategoryMetric[]
  topBlueprints: TopBlueprintMetric[]
  daily: ChartPoint[]
}

type TopBlueprintBarData = {
  id: string
  name: string
  Downloads: number // Use 'Downloads' as the data key for the Bar
  category: string
  last_downloaded: string | undefined
}

interface SortConfig {
  key: keyof TopBlueprintMetric | 'total'
  direction: 'ascending' | 'descending'
}

interface TableHeaderProps {
  columnKey: keyof TopBlueprintMetric | 'total'
  title: string
  currentSort: SortConfig
  onSort: (key: keyof TopBlueprintMetric | 'total') => void
  style: React.CSSProperties
}

// --- DATA FETCHING LOGIC ---

/**
 * Fetches and transforms all metrics data from Supabase RPCs.
 * Assumes 'supabase' object is initialized externally.
 * Returns null if Supabase is not available or if the fetch fails.
 */
const fetchMetricsData = async (): Promise<MetricsData | null> => {
  if (typeof supabase === 'undefined' || !supabase.rpc) {
    console.error('Supabase client is not available in the environment.')
    return null
  }

  try {
    // 1. Get all data concurrently using the assumed RPC function names
    const [
      categoryResult,
      topBlueprintsResult,
      dailyResult,
      totalDownloadsResult,
    ] = await Promise.all([
      supabase.rpc('get_total_downloads_by_category'),
      supabase.rpc('get_top_blueprints'),
      supabase.rpc('get_daily_downloads'),
      supabase.rpc('get_total_downloads'),
    ])

    // 2. Simple Error handling
    if (
      categoryResult.error ||
      topBlueprintsResult.error ||
      dailyResult.error ||
      totalDownloadsResult.error
    ) {
      console.error('Supabase RPC Error:', {
        category: categoryResult.error,
        topBlueprints: topBlueprintsResult.error,
        daily: dailyResult.error,
        total: totalDownloadsResult.error,
      })
      // Return null on failure to trigger the error state in the UI
      return null
    }

    // 3. Data transformation
    const totalDownloadsValue = parseInt(
      totalDownloadsResult.data[0]?.total || '0',
      10,
    )

    const dailyChartPoints: ChartPoint[] = dailyResult.data.map(
      (item: DailyMetric) => ({
        // Format the ISO date string to a shorter date label
        label: new Date(item.day).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        total: parseInt(item.total, 10),
      }),
    )

    return {
      totalDownloads: totalDownloadsValue,
      byCategory: categoryResult.data as CategoryMetric[],
      topBlueprints: topBlueprintsResult.data as TopBlueprintMetric[],
      daily: dailyChartPoints,
    }
  } catch (error) {
    console.error('Critical failure during Supabase fetch:', error)
    return null
  }
}

// --- HELPER COMPONENTS ---

const formatNumber = (num: number): string => {
  return num.toLocaleString()
}

// Custom Tooltip for Recharts
const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    if (data.name || data.category) {
      // Pie/Bar Chart Tooltip
      const value = data.value !== undefined ? data.value : data.Downloads
      return (
        <div
          style={{
            ...cardStyle,
            padding: '0.75rem',
            lineHeight: 1.5,
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          <p style={{ fontWeight: 'bold', color: THEME.textPrimary }}>
            {data.name || data.category}
          </p>
          <p style={{ color: THEME.textSecondary }}>
            Downloads:{' '}
            <span style={{ fontWeight: 'semibold', color: THEME.textPrimary }}>
              {value.toLocaleString()}
            </span>
          </p>
        </div>
      )
    } else if (payload[0].value) {
      // Area Chart Tooltip
      return (
        <div
          style={{
            ...cardStyle,
            padding: '0.75rem',
            lineHeight: 1.5,
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          <p style={{ color: THEME.textSecondary }}>
            {payload[0].name || 'Date'}: {payload[0].payload.label}
          </p>
          <p style={{ fontWeight: 'bold', color: THEME.textPrimary }}>
            {payload[0].value.toLocaleString()} Downloads
          </p>
        </div>
      )
    }
  }
  return null
}

const StatCard: React.FC<{
  title: string
  value: string
  subText?: string
  color: string
  icon: string
}> = ({ title, value, subText, color, icon }) => (
  <div
    style={{
      ...cardStyle,
      padding: '20px',
      textAlign: 'center',
      background: color,
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      minHeight: '120px',
    }}
  >
    {icon && (
      <div style={{ marginBottom: '8px', fontSize: '24px' }}>{icon}</div>
    )}
    <p
      style={{
        fontSize: '14px',
        fontWeight: '500',
        opacity: 0.9,
        margin: '0 0 4px 0',
      }}
    >
      {title}
    </p>
    <p
      style={{
        fontSize: '2.5rem', // Adjusted for better visual weight
        fontWeight: 'bold',
        margin: 0,
        lineHeight: 1,
      }}
    >
      {value}
    </p>
    {subText && (
      <p style={{ fontSize: '12px', opacity: 0.8, margin: '4px 0 0 0' }}>
        {subText}
      </p>
    )}
  </div>
)

// Custom TableHeader component to handle sorting
const TableHeader: React.FC<TableHeaderProps> = ({
  columnKey,
  title,
  currentSort,
  onSort,
  style,
}) => {
  const isSorted = currentSort.key === columnKey
  const isAscending = currentSort.direction === 'ascending'

  return (
    <th
      onClick={() => onSort(columnKey)}
      style={{
        ...style,
        cursor: 'pointer',
        padding: '12px 16px',
        textAlign: style.textAlign || 'left',
        fontSize: '12px',
        fontWeight: '600',
        color: THEME.textSecondary,
        borderBottom: `2px solid ${THEME.borderColor}`,
        textTransform: 'uppercase',
        transition: 'background-color 0.2s',
      }}
    >
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent:
            style.textAlign === 'right' ? 'flex-end' : 'flex-start',
        }}
      >
        {title}
        <svg
          xmlns='[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)'
          height='1em'
          viewBox='0 0 320 512'
          style={{
            marginLeft: '4px',
            width: '10px',
            fill: isSorted ? THEME.primary : THEME.textSecondary,
            opacity: isSorted ? 1 : 0.5,
            transform: isSorted && isAscending ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s, fill 0.2s',
          }}
        >
          {/* Font Awesome Arrow Down Icon for sorting indicator */}
          <path d='M137.4 372.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8H144V48c0-26.5-21.5-48-48-48s-48 21.5-48 48v144H41.4c-12.9 0-24.6 7.7-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z' />
        </svg>
      </span>
    </th>
  )
}

// --- DATA TABLE COMPONENT (Fixed for full width) ---
const DataTable: React.FC<{ data: TopBlueprintMetric[] }> = ({ data }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'total',
    direction: 'descending',
  })

  // Convert TopBlueprintMetric[] to TopBlueprintBarData[] for easier sorting on number
  const processedData: TopBlueprintBarData[] = useMemo(() => {
    return data.map((item) => ({
      id: item.blueprint_id,
      name: item.blueprint_id.replace(/_/g, ' '),
      Downloads: parseInt(item.total, 10),
      category: item.blueprint_category,
      last_downloaded: item.last_downloaded,
    }))
  }, [data])

  const sortedData: TopBlueprintBarData[] = useMemo(() => {
    const sortableData = [...processedData]
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        let aVal: string | number
        let bVal: string | number

        // Use 'total' key for sorting downloads (which is stored as Downloads: number)
        if (sortConfig.key === 'total') {
          aVal = a.Downloads
          bVal = b.Downloads
        } else if (sortConfig.key === 'last_downloaded') {
          // Sort by date (convert to timestamp)
          const aDate = a.last_downloaded ? Date.parse(a.last_downloaded) : 0
          const bDate = b.last_downloaded ? Date.parse(b.last_downloaded) : 0

          // Handle 'N/A' (0) pushing them to the bottom when descending
          if (aDate === 0 && bDate !== 0)
            return sortConfig.direction === 'ascending' ? 1 : -1
          if (aDate !== 0 && bDate === 0)
            return sortConfig.direction === 'ascending' ? -1 : 1
          if (aDate === 0 && bDate === 0) return 0

          aVal = aDate
          bVal = bDate
        } else {
          // Sort by strings (blueprint_id or blueprint_category)
          aVal = a[sortConfig.key as keyof TopBlueprintBarData] as string
          bVal = b[sortConfig.key as keyof TopBlueprintBarData] as string
        }

        if (aVal < bVal) {
          return sortConfig.direction === 'ascending' ? -1 : 1
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'ascending' ? 1 : -1
        }
        return 0
      })
    }
    return sortableData
  }, [processedData, sortConfig])

  const handleSort = (key: keyof TopBlueprintMetric | 'total') => {
    let direction: 'ascending' | 'descending' = 'descending'
    if (sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = 'ascending'
    }
    setSortConfig({ key, direction })
  }

  return (
    <div style={{ overflowX: 'auto', borderRadius: '0.75rem' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          tableLayout: 'fixed',
          backgroundColor: THEME.surface,
        }}
      >
        <thead>
          <tr>
            <TableHeader
              columnKey='blueprint_id'
              title='Blueprint ID'
              currentSort={sortConfig}
              onSort={handleSort}
              style={{
                width: '45%',
                paddingLeft: '24px',
                whiteSpace: 'nowrap',
              }}
            />
            <TableHeader
              columnKey='blueprint_category'
              title='Category'
              currentSort={sortConfig}
              onSort={handleSort}
              style={{ width: '20%', textAlign: 'center' }}
            />
            <TableHeader
              columnKey='total' // Maps to 'Downloads' property in TopBlueprintBarData
              title='Downloads'
              currentSort={sortConfig}
              onSort={handleSort}
              style={{ width: '15%', textAlign: 'right' }}
            />
            <TableHeader
              columnKey='last_downloaded'
              title='Last Downloaded'
              currentSort={sortConfig}
              onSort={handleSort}
              style={{
                width: '20%',
                textAlign: 'right',
                paddingRight: '24px',
                whiteSpace: 'nowrap',
              }}
            />
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, index) => (
            <tr
              key={item.id}
              style={{
                backgroundColor:
                  index % 2 === 0 ? THEME.tableRowEven : THEME.tableRowOdd,
                borderBottom:
                  index === sortedData.length - 1
                    ? 'none'
                    : `1px solid ${THEME.borderColor}`,
              }}
            >
              <td
                style={{
                  padding: '12px 16px',
                  paddingLeft: '24px',
                  fontSize: '14px',
                  color: THEME.link,
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal',
                }}
              >
                <a
                  href={`#${item.id}`} // Placeholder link
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  {item.id}
                </a>
              </td>
              <td
                style={{
                  padding: '12px 16px',
                  fontSize: '14px',
                  color: THEME.textPrimary,
                  textAlign: 'center',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: d3ColorScale(item.category),
                    color: 'white',
                  }}
                >
                  {item.category}
                </span>
              </td>
              <td
                style={{
                  padding: '12px 16px',
                  fontSize: '14px',
                  color: THEME.textPrimary,
                  textAlign: 'right',
                  fontFamily: 'monospace',
                }}
              >
                {item.Downloads.toLocaleString()}
              </td>
              <td
                style={{
                  padding: '12px 16px',
                  paddingRight: '24px',
                  fontSize: '14px',
                  color: THEME.textPrimary,
                  textAlign: 'right',
                }}
              >
                {item.last_downloaded
                  ? new Date(item.last_downloaded).toLocaleDateString()
                  : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// --- MAIN COMPONENT ---
const DownloadMetricsPage: React.FC = () => {
  const [metricsData, setMetricsData] = useState<MetricsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setFetchError(false)
    const data = await fetchMetricsData()
    if (data) {
      setMetricsData(data)
    } else {
      setFetchError(true)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // --- Data Transformations (Relies on metricsData) ---
  const totalDownloads = metricsData?.totalDownloads || 0

  const categoryData = useMemo(() => {
    if (!metricsData) return []
    return metricsData.byCategory.map((item) => {
      const value = parseInt(item.total, 10)
      return {
        name: item.blueprint_category,
        value: value,
        percent: (value / totalDownloads) * 100,
        category: item.blueprint_category,
      }
    })
  }, [metricsData, totalDownloads])

  const dailyChartData = useMemo(() => metricsData?.daily || [], [metricsData])

  const processedBlueprints: TopBlueprintBarData[] = useMemo(() => {
    if (!metricsData) return []
    return metricsData.topBlueprints.map((item) => ({
      id: item.blueprint_id,
      name: item.blueprint_id.replace(/_/g, ' '),
      Downloads: parseInt(item.total, 10),
      category: item.blueprint_category,
      last_downloaded: item.last_downloaded,
    }))
  }, [metricsData])

  const filteredBlueprints = useMemo(() => {
    return processedBlueprints.filter((bp) =>
      selectedCategory ? bp.category === selectedCategory : true,
    )
  }, [processedBlueprints, selectedCategory])

  const sortedBlueprints = useMemo(() => {
    // Return raw TopBlueprintMetric[] for the DataTable which handles its own sorting
    return metricsData?.topBlueprints || []
  }, [metricsData])

  const top10Blueprints = useMemo(() => {
    return [...filteredBlueprints]
      .sort((a, b) => b.Downloads - a.Downloads)
      .slice(0, 10)
  }, [filteredBlueprints])

  const allCategories = useMemo(() => {
    if (!metricsData) return []
    return metricsData.byCategory.map((c) => c.blueprint_category)
  }, [metricsData])

  // Custom Label for Pie Chart (shows percentage)
  const renderCustomizedLabel = useCallback(
    ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5
      const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180))
      const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180))

      return (
        <text
          x={x}
          y={y}
          fill='white'
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline='central'
          style={{ fontSize: '12px', fontWeight: 'bold' }}
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      )
    },
    [],
  )
  // --- Rendering ---

  if (fetchError) {
    return (
      <Layout title='Blueprint Download Metrics'>
        <div style={{ padding: '50px', textAlign: 'center', color: '#ef4444' }}>
          <p>🛑 Error loading metrics data.</p>
          <p>
            Please ensure the Supabase client is correctly initialized and the
            RPC functions exist.
          </p>
          <button
            onClick={loadData}
            style={{
              padding: '10px 20px',
              backgroundColor: THEME.primary,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px',
            }}
          >
            Retry Fetch
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title='Blueprint Download Metrics'>
      <main style={{ paddingBottom: '2rem' }}>
        {isLoading || !metricsData ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              height: '50vh',
              color: THEME.textSecondary,
              fontSize: '1.25rem',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                width: '30px',
                height: '30px',
                border: `4px solid ${THEME.primary}`,
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            <p style={{ marginTop: '15px' }}>
              Loading metrics data from Supabase...
            </p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gap: '1.5rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            }}
          >
            {/* 1. STAT CARDS */}
            <StatCard
              title='Total Downloads'
              value={formatNumber(metricsData.totalDownloads)}
              color={`linear-gradient(135deg, ${THEME.primary}, #6366f1)`}
              icon='📈'
            />
            <StatCard
              title='Tracked Blueprints'
              value={formatNumber(metricsData.topBlueprints.length)}
              color={`linear-gradient(135deg, ${THEME.secondary}, #34d399)`}
              icon='🛠️'
            />
            <StatCard
              title='Total Categories'
              value={formatNumber(metricsData.byCategory.length)}
              color={`linear-gradient(135deg, ${THEME.accent}, #fbbf24)`}
              icon='📁'
            />
            <StatCard
              title='Daily Average'
              value={formatNumber(
                Math.round(
                  metricsData.daily.reduce((sum, p) => sum + p.total, 0) /
                    (metricsData.daily.length || 1),
                ),
              )}
              color={`linear-gradient(135deg, #1f2937, #4b5563)`}
              icon='📅'
            />

            {/* 2. DAILY TREND AND CATEGORY DISTRIBUTION WRAPPER */}
            <div
              style={{
                gridColumn: '1 / -1',
                display: 'grid',
                gap: '1.5rem',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              }}
            >
              {/* Daily Trend Chart (Area Chart) */}
              <section
                style={{
                  ...cardStyle,
                  minHeight: '400px',
                  '@media (min-width: 768px)': {
                    gridColumn: 'span 2',
                  },
                }}
              >
                <h2
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 'semibold',
                    color: THEME.textPrimary,
                    marginBottom: '1rem',
                  }}
                >
                  Daily Download Trend
                </h2>
                <ResponsiveContainer width='100%' height={300}>
                  <AreaChart
                    data={dailyChartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray='3 3'
                      stroke={THEME.borderColor}
                    />
                    <XAxis
                      dataKey='label'
                      stroke={THEME.textSecondary}
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis
                      stroke={THEME.textSecondary}
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type='monotone'
                      dataKey='total'
                      stroke={THEME.primary}
                      fill={`url(#colorPv)`}
                      name='Downloads'
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id='colorPv' x1='0' y1='0' x2='0' y2='1'>
                        <stop
                          offset='5%'
                          stopColor={THEME.primary}
                          stopOpacity={0.5}
                        />
                        <stop
                          offset='95%'
                          stopColor={THEME.primary}
                          stopOpacity={0.0}
                        />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </section>

              {/* Category Distribution Chart (Pie Chart) */}
              <section
                style={{
                  ...cardStyle,
                  minHeight: '400px',
                  '@media (min-width: 768px)': {
                    gridColumn: 'span 1',
                  },
                }}
              >
                <h2
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 'semibold',
                    color: THEME.textPrimary,
                    marginBottom: '1rem',
                  }}
                >
                  Category Distribution
                </h2>
                <ResponsiveContainer width='100%' height={300}>
                  <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      iconType='circle'
                      layout='vertical'
                      verticalAlign='middle'
                      align='right'
                      wrapperStyle={{
                        fontSize: '12px',
                        color: THEME.textPrimary,
                      }}
                    />
                    <Pie
                      data={categoryData}
                      dataKey='value'
                      nameKey='name'
                      cx='50%'
                      cy='50%'
                      innerRadius={50}
                      outerRadius={100}
                      fill={THEME.primary}
                      labelLine={false}
                      label={renderCustomizedLabel}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={d3ColorScale(entry.category || 'Other')}
                          stroke={THEME.surface}
                          strokeWidth={2}
                          onClick={() =>
                            setSelectedCategory(
                              selectedCategory === entry.name
                                ? null
                                : entry.name,
                            )
                          }
                          style={{ cursor: 'pointer' }}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <p
                  style={{
                    textAlign: 'center',
                    marginTop: '16px',
                    color: THEME.textSecondary,
                    fontSize: '14px',
                  }}
                >
                  {selectedCategory
                    ? `Showing Top 10 for: ${selectedCategory}`
                    : 'Click a category slice to filter the Top 10 chart below.'}
                </p>
              </section>
            </div>

            {/* 3. TOP BLUEPRINTS CHART (Bar Chart) - Full width */}
            <section
              style={{
                ...cardStyle,
                minHeight: '400px',
                gridColumn: '1 / -1',
              }}
            >
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 'semibold',
                  color: THEME.textPrimary,
                  marginBottom: '1rem',
                }}
              >
                Top 10 Blueprints (by Downloads)
              </h2>

              <p
                style={{
                  color: THEME.textSecondary,
                  fontSize: '0.875rem',
                  marginBottom: '1rem',
                }}
              >
                {selectedCategory
                  ? `Currently showing the top 10 blueprints in the "${selectedCategory}" category.`
                  : 'Showing the overall top 10 blueprints.'}
              </p>

              {top10Blueprints.length > 0 ? (
                <ResponsiveContainer width='100%' height={300}>
                  <BarChart
                    data={top10Blueprints}
                    layout='vertical'
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray='3 3'
                      stroke={THEME.borderColor}
                    />
                    <XAxis
                      type='number'
                      stroke={THEME.textSecondary}
                      style={{ fontSize: '12px' }}
                      tickFormatter={(value) => formatNumber(value)}
                    />
                    <YAxis
                      dataKey='name'
                      type='category'
                      stroke={THEME.textSecondary}
                      style={{ fontSize: '12px' }}
                      interval={0}
                      width={120}
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
            </section>

            {/* 4. DATA TABLE SECTION (Fixed for full width with no internal padding) */}
            <section
              style={{
                ...cardStyle,
                padding: '0',
                gridColumn: '1 / -1',
                overflow: 'hidden',
              }}
            >
              <DataTable data={sortedBlueprints} />
            </section>
          </div>
        )}
      </main>
    </Layout>
  )
}
export default DownloadMetricsPage
