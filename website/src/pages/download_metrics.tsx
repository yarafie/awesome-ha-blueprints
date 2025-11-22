import React, { useState, useMemo } from 'react'
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

// D3 Imports for Professional Coloring
import { scaleOrdinal } from 'd3-scale'
import { schemeCategory10 } from 'd3-scale-chromatic'

// --- Type Definitions based on SQL RPC Functions ---
type CategoryMetric = { blueprint_category: string; total: string }
type TopBlueprintMetric = {
  blueprint_category: string
  blueprint_id: string
  total: string
}

type ChartPoint = {
  label: string // e.g. "Nov 18"
  total: number
}

// Define the shape of data for charts
type ChartData = ChartPoint & {
  name: string
  value: number
  category?: string
  percent?: number
}

interface MetricsData {
  totalDownloads: number
  byCategory: CategoryMetric[]
  topBlueprints: TopBlueprintMetric[]
  daily: ChartPoint[]
}

// Define data structure for the Bar Chart to explicitly use a display name
type TopBlueprintBarData = {
  id: string
  name: string
  Downloads: number // Use 'Downloads' as the data key for the Bar
}

// --- NEW THEME DEFINITION FOR INLINE STYLES ---
// Using a simple dark theme structure since this is JSX and not CSS/Tailwind file.
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
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
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
const CustomBarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
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
const TableHeader = ({ columnKey, title, currentSort, onSort, style }) => {
  const isSorted = currentSort.key === columnKey
  const isAscending = currentSort.direction === 'ascending'

  return (
    <th
      onClick={() => onSort(columnKey)}
      style={{
        ...style,
        cursor: 'pointer',
        padding: '12px 16px',
        textAlign: 'left',
        fontSize: '12px',
        fontWeight: '600',
        color: THEME.textSecondary,
        borderBottom: `2px solid ${THEME.border}`,
        textTransform: 'uppercase',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center' }}>
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

// --- NEW DATA TABLE COMPONENT ---
const DataTable = ({ data }: { data: TopBlueprintMetric[] }) => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof TopBlueprintMetric | 'total'
    direction: 'ascending' | 'descending'
  }>({
    key: 'total',
    direction: 'descending',
  })

  const sortedData = useMemo(() => {
    const sortableData = [...data]
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        // Coerce values to numbers if the key is 'total' (downloads)
        const aVal =
          sortConfig.key === 'total'
            ? parseInt(a[sortConfig.key], 10)
            : a[sortConfig.key]
        const bVal =
          sortConfig.key === 'total'
            ? parseInt(b[sortConfig.key], 10)
            : b[sortConfig.key]

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

  const handleSort = (key: keyof TopBlueprintMetric) => {
    let direction: 'ascending' | 'descending' = 'descending'
    if (sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = 'ascending'
    }
    setSortConfig({ key, direction })
  }

  return (
    <div
      style={{
        overflowX: 'auto',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
        backgroundColor: THEME.cardBackground,
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <TableHeader
              columnKey='blueprint_id'
              title='Blueprint ID'
              currentSort={sortConfig}
              onSort={handleSort}
              style={{ width: 'auto' }} // Blueprint ID takes remaining width
            />
            <TableHeader
              columnKey='blueprint_category'
              title='Category'
              currentSort={sortConfig}
              onSort={handleSort}
              style={{ width: '120px' }} // Fixed width
            />
            <TableHeader
              columnKey='total'
              title='Downloads'
              currentSort={sortConfig}
              onSort={handleSort}
              style={{ width: '100px' }} // Fixed width
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
                  borderBottom: `1px solid ${THEME.border}`,
                  fontSize: '14px',
                  color: THEME.link,
                  // FIX APPLIED HERE: Ensure long IDs wrap and break
                  wordBreak: 'break-all',
                  overflowWrap: 'break-word',
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// The rest of the component remains exactly as you provided it.
const DownloadMetricsPage = () => {
  // Mock data setup
  const mockData: MetricsData = {
    totalDownloads: 1247,
    byCategory: [
      { blueprint_category: 'controllers', total: '850' },
      { blueprint_category: 'automations', total: '210' },
      { blueprint_category: 'notifications', total: '187' },
    ],
    topBlueprints: [
      {
        blueprint_category: 'controllers',
        blueprint_id: 'ikea_e2001_c2002',
        total: '150',
      },
      {
        blueprint_category: 'controllers',
        blueprint_id: 'tuya_ZG-101Z-D',
        total: '120',
      },
      {
        blueprint_category: 'automations',
        blueprint_id: 'presence_simulator',
        total: '90',
      },
      {
        blueprint_category: 'notifications',
        blueprint_id: 'low_battery_alert',
        total: '80',
      },
      {
        blueprint_category: 'controllers',
        blueprint_id: 'aqara_dj11lm',
        total: '75',
      },
      {
        blueprint_category: 'controllers',
        blueprint_id:
          'long_id_test_zha_or_z2m_device_controller_with_multiple_entities',
        total: '70',
      },
    ],
    daily: [
      { day: '2078-11-18', total: '50' },
      { day: '2078-11-19', total: '65' },
      { day: '2078-11-20', total: '80' },
      { day: '2078-11-21', total: '100' },
      { day: '2078-11-22', total: '110' },
      { day: '2078-11-23', total: '105' },
      { day: '2078-11-24', total: '120' },
    ],
  }

  // State to hold the fetched and processed data
  const [metricsData] = useState<MetricsData>(mockData)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Memoized data processing for charts
  const categoryData: ChartData[] = useMemo(() => {
    const total = metricsData.totalDownloads
    return metricsData.byCategory.map((item) => {
      const value = parseInt(item.total, 10)
      return {
        name: item.blueprint_category,
        value: value,
        percent: (value / total) * 100,
        fill: THEME.primary, // Placeholder, colors assigned later
      }
    })
  }, [metricsData.byCategory, metricsData.totalDownloads])

  const dailyChartData: ChartPoint[] = useMemo(() => {
    return metricsData.daily.map((item) => ({
      label: new Date(item.day).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      total: parseInt(item.total, 10),
    }))
  }, [metricsData.daily])

  // Filter and process top blueprints for the Bar Chart
  const topBlueprintsBarData: TopBlueprintBarData[] = useMemo(() => {
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
  }, [metricsData.topBlueprints, selectedCategory])

  // Data for the raw data table
  const sortedBlueprints: TopBlueprintMetric[] = useMemo(() => {
    return [...metricsData.topBlueprints].sort(
      (a, b) => parseInt(b.total, 10) - parseInt(a.total, 10),
    )
  }, [metricsData.topBlueprints])

  // D3 Color Scale for Pie Chart and Bar Chart consistency
  const d3ColorScale = scaleOrdinal<string, string>(schemeCategory10)

  // Card style for consistency
  const cardStyle = {
    backgroundColor: THEME.cardBackground,
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
    marginBottom: '24px',
  }

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

        {/* Placeholder for loading state, removed original RPC call */}
        {metricsData.totalDownloads === 0 ? (
          <p
            style={{
              textAlign: 'center',
              padding: '100px',
              color: THEME.textSecondary,
            }}
          >
            Loading metrics...
          </p>
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
                        tickFormatter={(value) => formatNumber(value)}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: THEME.cardBackground,
                          border: `1px solid ${THEME.border}`,
                        }}
                        labelStyle={{ color: THEME.textPrimary }}
                        formatter={(value) => [
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
                        tickFormatter={(value) => formatNumber(value)}
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
                        dataKey='Downloads' // Updated dataKey to 'Downloads'
                        name='# of Downloads' // Set a descriptive name for the legend
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

            {/* 4. DATA TABLE SECTION (New full-width card for raw data) */}
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
