import React, { useState, useMemo, useEffect, useCallback } from 'react'
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
  TooltipProps,
} from 'recharts'

// D3 Imports for Professional Coloring
import { scaleOrdinal } from 'd3-scale' // <-- CORRECTED
import { schemeCategory10 } from 'd3-scale-chromatic' // <-- CORRECTED

// --- Type Definitions based on SQL RPC Functions ---
type CategoryMetric = { blueprint_category: string; total: string }
type TopBlueprintMetric = {
  blueprint_category: string
  blueprint_id: string
  total: string
  last_downloaded?: string // ISO Date string for the new column
}

type DailyMetric = { day: string; total: string } // Actual RPC return type

type ChartPoint = {
  label: string // e.g. "Nov 18"
  total: number
}

// Define the shape of data for charts
interface ChartData {
  name: string
  value: number
  percent: number
  fill?: string
  category?: string
}

interface MetricsData {
  totalDownloads: number
  byCategory: CategoryMetric[]
  topBlueprints: TopBlueprintMetric[]
  daily: DailyMetric[]
}

// Define data structure for the Bar Chart to explicitly use a display name
type TopBlueprintBarData = {
  id: string
  name: string
  Downloads: number // Use 'Downloads' as the data key for the Bar
}

// --- Custom Component Prop Types ---

// Type for Recharts' Tooltip payload item when using PieChart (with custom data)
type PieTooltipPayload = {
  payload: ChartData
  name: string
  value: number
  dataKey: string
  fill: string
  color: string
  stroke: string
}

// Type for Recharts' Tooltip payload item when using BarChart (with custom data)
type BarTooltipPayload = {
  payload: TopBlueprintBarData
  name: string
  value: number
  dataKey: string
  fill: string
  color: string
  stroke: string
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  payload?: PieTooltipPayload[] | BarTooltipPayload[]
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

// --- THEME DEFINITION FOR INLINE STYLES ---
const THEME = {
  primary: '#4f46e5', // Indigo-600
  secondary: '#10b981', // Emerald-500
  accent: '#f59e0b', // Amber-500
  background: '#111827', // Gray-900
  cardBackground: '#1f2937', // Gray-800
  textPrimary: '#f9fafb', // Gray-50
  textSecondary: '#9ca3af', // Gray-400
  border: '#374151', // Gray-700
  tableRowEven: '#1f2937', // Gray-800 for even rows
  tableRowOdd: '#111827', // Gray-900 for odd rows
  link: '#6366f1', // Indigo-500
}

const formatNumber = (num: number): string => {
  return num.toLocaleString()
}

// Custom Tooltip for Recharts PieChart (showing category and percentage)
const CustomPieTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
}) => {
  if (active && payload && payload.length) {
    const data = (payload[0] as PieTooltipPayload).payload

    return (
      <div
        style={{
          backgroundColor: THEME.cardBackground,
          padding: '8px',
          border: `1px solid ${THEME.border}`,
          borderRadius: '4px',
          color: THEME.textPrimary,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        }}
      >
        <p style={{ margin: 0, fontWeight: 'bold' }}>{data.name} Downloads</p>
        <p style={{ margin: 0 }}>
          Total: {formatNumber(data.value)} ({data.percent.toFixed(1)}%)
        </p>
      </div>
    )
  }
  return null
}

// Custom Tooltip for Recharts BarChart (showing downloads)
const CustomBarTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
}) => {
  if (active && payload && payload.length) {
    const data = (payload[0] as BarTooltipPayload).payload

    return (
      <div
        style={{
          backgroundColor: THEME.cardBackground,
          padding: '8px',
          border: `1px solid ${THEME.border}`,
          borderRadius: '4px',
          color: THEME.textPrimary,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        }}
      >
        <p style={{ margin: 0, fontWeight: 'bold' }}>{data.name}</p>
        <p style={{ margin: 0 }}>Downloads: {formatNumber(data.Downloads)}</p>
      </div>
    )
  }
  return null
}

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
        borderBottom: `2px solid ${THEME.border}`,
        textTransform: 'uppercase',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
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
        {isSorted && (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            height='1em'
            viewBox='0 0 320 512'
            style={{
              marginLeft: '4px',
              width: '10px',
              fill: isAscending ? THEME.secondary : THEME.primary,
              transform: isAscending ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s',
            }}
          >
            {/* Font Awesome Arrow Up Icon */}
            <path d='M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L128 205.3V448c0 17.7 14.3 32 32 32s32-14.3 32-32V205.3l73.4 73.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-128-128z' />
          </svg>
        )}
        {!isSorted && (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            height='1em'
            viewBox='0 0 320 512'
            style={{
              marginLeft: '4px',
              width: '10px',
              fill: THEME.textSecondary,
              opacity: 0.5,
            }}
          >
            {/* Font Awesome Double Arrow Icon (up/down) */}
            <path d='M41 288h238c21.4 0 32.1 25.8 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41zm255-105L177 64c-9.4-9.4-24.6-9.4-33.9 0L24 183c-15.1 15.1-4.4 41 17 41h238c21.4 0 32.1-25.8 17-41z' />
          </svg>
        )}
      </span>
    </th>
  )
}

// --- DATA TABLE COMPONENT ---
const DataTable: React.FC<{ data: TopBlueprintMetric[] }> = ({ data }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'total',
    direction: 'descending',
  })

  const sortedData: TopBlueprintMetric[] = useMemo(() => {
    const sortableData = [...data]
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        let aVal: string | number
        let bVal: string | number

        if (sortConfig.key === 'total') {
          // Sort by downloads (numeric)
          aVal = parseInt(a.total, 10)
          bVal = parseInt(b.total, 10)
        } else if (sortConfig.key === 'last_downloaded') {
          // Sort by date (convert to timestamp)
          aVal = a.last_downloaded ? Date.parse(a.last_downloaded) : 0
          bVal = b.last_downloaded ? Date.parse(b.last_downloaded) : 0
        } else {
          // Sort by strings (blueprint_id or blueprint_category)
          aVal = a[sortConfig.key] as string
          bVal = b[sortConfig.key] as string
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
  }, [data, sortConfig])

  const handleSort = (key: keyof TopBlueprintMetric | 'total') => {
    let direction: 'ascending' | 'descending' = 'descending'
    if (sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = 'ascending'
    }
    setSortConfig({ key, direction })
  }

  return (
    // Card styling removed from here in the previous step
    <div style={{ overflowX: 'auto', borderRadius: '12px' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          tableLayout: 'fixed',
          // Set table background for striped rows to work seamlessly
          backgroundColor: THEME.cardBackground,
        }}
      >
        <thead>
          <tr>
            <TableHeader
              columnKey='blueprint_id'
              title='Blueprint ID'
              currentSort={sortConfig}
              onSort={handleSort}
              style={{ width: '50%', paddingLeft: '24px' }}
            />
            <TableHeader
              columnKey='blueprint_category'
              title='Category'
              currentSort={sortConfig}
              onSort={handleSort}
              style={{ width: '20%', textAlign: 'center' }}
            />
            <TableHeader
              columnKey='total'
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
              style={{ width: '15%', textAlign: 'right', paddingRight: '24px' }}
            />
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, index) => (
            <tr
              key={item.blueprint_id}
              style={
                index % 2 === 0
                  ? { backgroundColor: THEME.tableRowEven }
                  : { backgroundColor: THEME.tableRowOdd }
              }
            >
              <td
                style={{
                  padding: '12px 16px',
                  paddingLeft: '24px',
                  borderBottom: `1px solid ${THEME.border}`,
                  fontSize: '14px',
                  color: THEME.link,
                  wordBreak: 'break-all',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal',
                }}
              >
                <a
                  href={`https://github.com/my-repo/blueprints/blob/main/${item.blueprint_category}/${item.blueprint_id}.yaml`}
                  target='_blank'
                  rel='noopener noreferrer'
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  {item.blueprint_id}
                </a>
              </td>
              <td
                style={{
                  padding: '12px 16px',
                  borderBottom: `1px solid ${THEME.border}`,
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
                    backgroundColor: 'rgba(79, 70, 229, 0.2)',
                    color: THEME.primary,
                  }}
                >
                  {item.blueprint_category}
                </span>
              </td>
              <td
                style={{
                  padding: '12px 16px',
                  borderBottom: `1px solid ${THEME.border}`,
                  fontSize: '14px',
                  color: THEME.textPrimary,
                  textAlign: 'right',
                  fontFamily: 'monospace',
                }}
              >
                {formatNumber(parseInt(item.total, 10))}
              </td>
              <td
                style={{
                  padding: '12px 16px',
                  paddingRight: '24px',
                  borderBottom: `1px solid ${THEME.border}`,
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

// --- DATA FETCHING LOGIC (Live Supabase Implementation) ---

// *** USER ACTION REQUIRED: You MUST replace this placeholder with your actual Supabase client instance. ***
// E.g., const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// If you are using Docusaurus or another framework, ensure the client is correctly imported/injected.
const supabase: any = {
  rpc: async (functionName: string) => {
    // Placeholder function to prevent immediate errors if the user hasn't injected the client yet.
    console.error(
      `Supabase client is a placeholder. Please replace 'supabase: any = {...}' with your actual Supabase client instance in the code.`,
    )
    // Returning dummy data structure to avoid breaking the app during initial setup.
    return {
      data: [],
      error: {
        message: `RPC call to ${functionName} failed (placeholder client).`,
      },
    }
  },
}

/**
 * Fetches and transforms all metrics data from Supabase RPCs.
 */
const fetchMetricsData = async (): Promise<MetricsData> => {
  // 1. Get all data concurrently using the assumed RPC function names
  const [
    categoryResult,
    topBlueprintsResult,
    dailyResult,
    totalDownloadsResult,
  ] = await Promise.all([
    supabase.rpc('get_total_downloads_by_category'),
    supabase.rpc('get_top_blueprints'), // <-- Uses the corrected RPC name
    supabase.rpc('get_daily_downloads'),
    // Assuming a simple RPC that returns [{ total: "1234" }]
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
    throw new Error('Failed to fetch metrics from Supabase.')
  }

  // 3. Data transformation
  // Extract total downloads (assuming the total RPC returns an array like [{ total: "1234" }])
  const totalDownloadsValue = parseInt(
    totalDownloadsResult.data[0]?.total || '0',
    10,
  )

  return {
    totalDownloads: totalDownloadsValue,
    byCategory: categoryResult.data as CategoryMetric[],
    topBlueprints: topBlueprintsResult.data as TopBlueprintMetric[],
    daily: dailyResult.data as DailyMetric[], // Keep as DailyMetric[] for processing in useMemo
  }
}

// --- MAIN COMPONENT ---
const DownloadMetricsPage: React.FC = () => {
  const [metricsData, setMetricsData] = useState<MetricsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await fetchMetricsData()
      setMetricsData(data)
    } catch (error) {
      console.error('Failed to fetch metrics data:', error)
      // You might want to display a user-friendly error message here
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Memoized data processing for charts (only runs once data is available)
  const totalDownloads = metricsData?.totalDownloads || 0

  const categoryData: ChartData[] = useMemo(() => {
    if (!metricsData) return []
    return metricsData.byCategory.map((item) => {
      const value = parseInt(item.total, 10)
      return {
        name: item.blueprint_category,
        value: value,
        percent: (value / totalDownloads) * 100,
      } as ChartData
    })
  }, [metricsData, totalDownloads])

  const dailyChartData: ChartPoint[] = useMemo(() => {
    if (!metricsData) return []
    return metricsData.daily.map((item) => ({
      label: new Date(item.day).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      total: parseInt(item.total, 10),
    }))
  }, [metricsData])

  // Filter and process top blueprints for the Bar Chart
  const topBlueprintsBarData: TopBlueprintBarData[] = useMemo(() => {
    if (!metricsData) return []
    return metricsData.topBlueprints
      .filter((bp) =>
        selectedCategory ? bp.blueprint_category === selectedCategory : true,
      )
      .slice(0, 10) // Limit to top 10
      .map((bp) => ({
        id: bp.blueprint_id,
        name: bp.blueprint_id.replace(/_/g, ' '), // Display name
        Downloads: parseInt(bp.total, 10),
      }))
      .sort((a, b) => b.Downloads - a.Downloads) // Ensure descending order
  }, [metricsData, selectedCategory])

  // Data for the raw data table
  const sortedBlueprints: TopBlueprintMetric[] = useMemo(() => {
    if (!metricsData) return []
    return [...metricsData.topBlueprints].sort(
      (a, b) => parseInt(b.total, 10) - parseInt(a.total, 10),
    )
  }, [metricsData])

  // D3 Color Scale for Pie Chart and Bar Chart consistency
  const d3ColorScale = useMemo(
    () => scaleOrdinal<string, string>(schemeCategory10),
    [],
  )

  // Card style for consistency
  const cardStyle: React.CSSProperties = useMemo(
    () => ({
      backgroundColor: THEME.cardBackground,
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
      marginBottom: '24px',
    }),
    [],
  )

  // Card style for the Table section (removing internal padding so table fills up)
  const tableCardStyle: React.CSSProperties = useMemo(
    () => ({
      ...cardStyle,
      padding: '0', // Important: Remove padding here so the table fills edge-to-edge
      overflow: 'hidden', // Ensure table corners are rounded
    }),
    [cardStyle],
  )

  return (
    <Layout
      title={`Metrics | Awesome HA Blueprints`}
      description='Download metrics for all blueprints'
    >
      <main
        style={{
          padding: '32px',
          maxWidth: '1200px',
          margin: '0 auto',
          color: THEME.textPrimary,
          backgroundColor: THEME.background,
        }}
      >
        <h1
          style={{
            fontSize: '32px',
            fontWeight: '800',
            marginBottom: '24px',
            color: THEME.textPrimary,
          }}
        >
          Blueprint Download Metrics
        </h1>

        {isLoading || !metricsData ? (
          <div
            style={{
              textAlign: 'center',
              padding: '100px',
              color: THEME.textSecondary,
              fontSize: '18px',
            }}
          >
            <p>Loading metrics data from the backend...</p>
            <div
              style={{
                display: 'inline-block',
                width: '20px',
                height: '20px',
                border: `3px solid ${THEME.primary}`,
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : (
          <div>
            {/* 1. METRICS CARDS */}
            <section
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '24px',
                marginBottom: '24px',
              }}
            >
              {[
                {
                  title: 'Total Downloads',
                  value: formatNumber(metricsData.totalDownloads),
                  color: 'linear-gradient(135deg, #4f46e5, #6366f1)', // Indigo
                },
                {
                  title: 'Tracked Blueprints',
                  value: formatNumber(metricsData.topBlueprints.length),
                  color: 'linear-gradient(135deg, #10b981, #34d399)', // Emerald
                },
                {
                  title: 'Total Categories',
                  value: formatNumber(metricsData.byCategory.length),
                  color: 'linear-gradient(135deg, #f59e0b, #fbbf24)', // Amber
                },
              ].map((metric) => (
                <div
                  key={metric.title}
                  style={{
                    ...cardStyle,
                    padding: '20px',
                    textAlign: 'center',
                    background: metric.color,
                    color: '#fff',
                  }}
                >
                  <p
                    style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      opacity: 0.9,
                      margin: '0 0 4px 0',
                    }}
                  >
                    {metric.title}
                  </p>
                  <p
                    style={{
                      fontSize: '32px',
                      fontWeight: 'bold',
                      margin: 0,
                    }}
                  >
                    {metric.value}
                  </p>
                </div>
              ))}
            </section>

            {/* 2. DAILY TREND AND CATEGORY DISTRIBUTION */}
            <section
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
                marginBottom: '24px',
              }}
            >
              <div style={cardStyle}>
                <h2
                  style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    borderBottom: `1px solid ${THEME.border}`,
                    paddingBottom: '16px',
                    marginBottom: '16px',
                  }}
                >
                  Daily Downloads Trend
                </h2>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width='100%' height='100%'>
                    <AreaChart data={dailyChartData}>
                      <CartesianGrid
                        strokeDasharray='3 3'
                        stroke={THEME.border}
                      />
                      <XAxis
                        dataKey='label'
                        stroke={THEME.textSecondary}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke={THEME.textSecondary}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value: number) => formatNumber(value)}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: THEME.cardBackground,
                          border: `1px solid ${THEME.border}`,
                        }}
                        labelStyle={{ color: THEME.textPrimary }}
                        formatter={(value: number) => [
                          formatNumber(value),
                          'Downloads',
                        ]}
                      />
                      <Area
                        type='monotone'
                        dataKey='total'
                        stroke={THEME.primary}
                        fill='url(#colorUv)'
                        name='Downloads'
                        strokeWidth={2}
                      />
                      <defs>
                        <linearGradient
                          id='colorUv'
                          x1='0'
                          y1='0'
                          x2='0'
                          y2='1'
                        >
                          <stop
                            offset='5%'
                            stopColor={THEME.primary}
                            stopOpacity={0.8}
                          />
                          <stop
                            offset='95%'
                            stopColor={THEME.primary}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={cardStyle}>
                <h2
                  style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    borderBottom: `1px solid ${THEME.border}`,
                    paddingBottom: '16px',
                    marginBottom: '16px',
                  }}
                >
                  Category Distribution
                </h2>
                <div
                  style={{
                    height: '300px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey='value'
                        nameKey='name'
                        cx='50%'
                        cy='50%'
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={d3ColorScale(entry.name)}
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
                      <Tooltip content={<CustomPieTooltip />} />
                      <Legend
                        wrapperStyle={{
                          fontSize: '12px',
                          color: THEME.textPrimary,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
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
                    : 'Click a category to filter Top 10 chart below.'}
                </p>
              </div>
            </section>

            {/* 3. TOP BLUEPRINTS BAR CHART */}
            <section style={cardStyle}>
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  borderBottom: `1px solid ${THEME.border}`,
                  paddingBottom: '16px',
                  marginBottom: '16px',
                }}
              >
                Top 10 Blueprints{' '}
                {selectedCategory ? `(Filtered by: ${selectedCategory})` : ''}
              </h2>
              <div style={{ height: '350px' }}>
                {topBlueprintsBarData.length > 0 ? (
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart
                      data={topBlueprintsBarData}
                      layout='vertical'
                      margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray='3 3'
                        stroke={THEME.border}
                      />
                      <XAxis
                        type='number'
                        stroke={THEME.textSecondary}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value: number) => formatNumber(value)}
                      />
                      <YAxis
                        dataKey='name'
                        type='category'
                        stroke={THEME.textSecondary}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip content={<CustomBarTooltip />} />
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

            {/* 4. DATA TABLE SECTION (Full-width table) */}
            <section style={tableCardStyle}>
              <DataTable data={sortedBlueprints} />
            </section>
          </div>
        )}
      </main>
    </Layout>
  )
}
export default DownloadMetricsPage
