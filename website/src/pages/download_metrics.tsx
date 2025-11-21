import React, { useEffect, useState } from 'react'
import Layout from '@theme/Layout'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts'

// --- D3 Imports for Professional Coloring ---
import { scaleOrdinal } from 'd3-scale'
import { schemeCategory10 } from 'd3-scale-chromatic'

// --- Type Definitions based on SQL RPC Functions ---
type TotalMetric = { total: string }
type CategoryMetric = { blueprint_category: string; total: string }
type TopBlueprintMetric = {
  blueprint_category: string
  blueprint_id: string
  total: string
}
type DailyMetric = {
  day: string // ISO date string from RPC
  total: string
}

type ChartPoint = {
  label: string // e.g. "Nov 18"
  total: number
}

// Define the shape of data for charts
type ChartData = ChartPoint & { name: string; value: number; category?: string }

interface MetricsState {
  loading: boolean
  error?: string
  totalDownloads: number
  byCategory: CategoryMetric[]
  topBlueprints: TopBlueprintMetric[]
  daily: ChartPoint[]
}

const DownloadMetricsPage: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [metrics, setMetrics] = useState<MetricsState>({
    loading: true,
    error: undefined,
    totalDownloads: 0,
    byCategory: [],
    topBlueprints: [],
    daily: [],
  })

  // State to track current theme (dark/light)
  const [isDark, setIsDark] = useState(false)

  const { loading, error, totalDownloads, byCategory, topBlueprints, daily } =
    metrics

  // Initialize D3 color scale
  const d3ColorScale = scaleOrdinal(schemeCategory10)

  // --- THEME DETECTION LOGIC ---
  useEffect(() => {
    // Function to check if Docusaurus is in dark mode
    const checkDarkMode = () => {
      const theme = document.documentElement.getAttribute('data-theme')
      setIsDark(theme === 'dark')
    }

    // Check immediately on mount
    checkDarkMode()

    // Set up an observer to watch for theme changes (e.g. user clicks toggle)
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

    // Cleanup observer on unmount
    return () => observer.disconnect()
  }, [])

  // --- DATA FETCHING LOGIC ---
  useEffect(() => {
    const supabaseUrl = (window as any)?.env?.SUPABASE_URL
    const supabaseAnonKey = (window as any)?.env?.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      // Use mock data for immediate feedback if env vars are missing
      const mockTotalDownloads = 1234567
      const mockByCategory: CategoryMetric[] = [
        { blueprint_category: 'controllers', total: '900000' },
        { blueprint_category: 'hooks', total: '280000' },
        { blueprint_category: 'templates', total: '54000' },
      ]
      const mockTopBlueprints: TopBlueprintMetric[] = [
        {
          blueprint_category: 'hooks',
          blueprint_id: 'thertetsat_controlv2_30_days_ago',
          total: '50000',
        },
        {
          blueprint_category: 'hooks',
          blueprint_id: 'rgb_light_cycle',
          total: '45000',
        },
        {
          blueprint_category: 'controllers',
          blueprint_id: 'motion_automation',
          total: '40000',
        },
      ]
      const mockDaily: DailyMetric[] = [
        {
          day: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          total: '10',
        },
        {
          day: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          total: '12',
        },
        {
          day: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          total: '15',
        },
        {
          day: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          total: '20',
        },
        {
          day: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          total: '18',
        },
        { day: new Date().toISOString().split('T')[0], total: '22' },
      ]

      const dailyParsed: ChartPoint[] = mockDaily
        .map((row: DailyMetric) => {
          const d = new Date(row.day)
          const label = d.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          })
          return { label, total: Number(row.total) }
        })
        .sort(
          (a, b) => new Date(a.label).getTime() - new Date(b.label).getTime(),
        )

      setMetrics((prev) => ({
        ...prev,
        loading: false,
        error: 'Supabase variables missing. Showing mock data.',
        totalDownloads: mockTotalDownloads,
        byCategory: mockByCategory,
        topBlueprints: mockTopBlueprints,
        daily: dailyParsed,
      }))
      return
    }

    const headers = {
      'Content-Type': 'application/json',
      apikey: supabaseAnonKey,
      // Fixed: Use string concatenation to bypass potential Prettier/linter issue with template literals in object properties
      Authorization: 'Bearer ' + supabaseAnonKey,
    }

    const fetchWithRetry = async (
      url: string,
      options: RequestInit,
      retries = 3,
    ) => {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await fetch(url, options)
          if (response.ok) {
            return response
          } else if (response.status === 429 && i < retries - 1) {
            const delay = Math.pow(2, i) * 1000 + Math.random() * 1000
            await new Promise((resolve) => setTimeout(resolve, delay))
            continue
          } else {
            const text = await response.text()
            throw new Error(
              `HTTP error! Status: ${response.status}. Response: ${text.substring(0, 100)}...`,
            )
          }
        } catch (error: any) {
          if (i === retries - 1) throw error
        }
      }
    }

    async function fetchMetrics() {
      try {
        const [totalRes, catRes, topRes, dailyRes] = await Promise.all([
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
          fetchWithRetry(`${supabaseUrl}/rest/v1/rpc/get_daily_downloads`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ p_days: 30 }), // last 30 days
          }),
        ])

        const totalJson: TotalMetric[] | number = await totalRes.json()
        const catJson: CategoryMetric[] = await catRes.json()
        const topJson: TopBlueprintMetric[] = await topRes.json()
        const dailyJson: DailyMetric[] = await dailyRes.json()

        let totalDownloads = 0
        if (Array.isArray(totalJson) && totalJson.length > 0) {
          totalDownloads = Number(totalJson[0].total)
        } else if (typeof totalJson === 'number') {
          totalDownloads = totalJson
        }

        const byCategoryParsed: CategoryMetric[] = Array.isArray(catJson)
          ? catJson
          : []
        const topBlueprintsParsed: TopBlueprintMetric[] = Array.isArray(topJson)
          ? topJson
          : []

        const dailyParsed: ChartPoint[] = Array.isArray(dailyJson)
          ? dailyJson
              .map((row: DailyMetric) => {
                const d = new Date(row.day)
                const label = d.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })
                return {
                  label,
                  total: Number(row.total),
                }
              })
              .sort((a: ChartPoint, b: ChartPoint) => {
                const dateA = new Date(a.label)
                const dateB = new Date(b.label)
                return dateA.getTime() - dateB.getTime()
              })
          : []

        setMetrics({
          loading: false,
          error: undefined,
          totalDownloads,
          byCategory: byCategoryParsed,
          topBlueprints: topBlueprintsParsed,
          daily: dailyParsed,
        })
      } catch (err: any) {
        console.error('Error fetching download metrics', err)
        setMetrics((prev) => ({
          ...prev,
          loading: false,
          error: `Failed to load metrics from Supabase. Error: ${err.message || 'Unknown error.'}`,
        }))
      }
    }

    fetchMetrics()
  }, [])

  // --- Data Formatting Helpers ---
  const formatBigNumber = (num: number) => {
    return num.toLocaleString()
  }

  // Prepare Chart Data
  const categoryData: ChartData[] = byCategory.map((item) => ({
    name: item.blueprint_category,
    category: item.blueprint_category,
    value: Number(item.total),
    total: Number(item.total),
    label: item.blueprint_category,
  }))

  const top10BarData = topBlueprints
    .slice(0, 10)
    .map((bp) => ({
      id: bp.blueprint_id,
      name:
        bp.blueprint_id.length > 40
          ? bp.blueprint_id.substring(0, 37) + '...'
          : bp.blueprint_id,
      value: Number(bp.total),
    }))
    .reverse()

  // --- Dynamic Theme Colors ---
  // Define color sets for Light vs Dark mode
  const THEME = {
    bg: isDark ? '#1b1b1d' : '#f9fafb', // Main container BG
    cardBg: isDark ? '#242526' : '#ffffff', // Card BG
    textPrimary: isDark ? '#e5e7eb' : '#1f2937', // Main headings
    textSecondary: isDark ? '#9ca3af' : '#6b7280', // Axis labels
    gridLine: isDark ? '#444' : '#e5e7eb', // Chart grid lines
    tooltipBg: isDark ? '#242526' : '#ffffff', // Tooltip BG
    tooltipBorder: isDark ? '#444' : '#ccc', // Tooltip Border
    tooltipText: isDark ? '#e5e7eb' : '#333', // Tooltip Text
  }

  // --- Custom Recharts Components ---

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
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
          <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>
            {data.name || data.id || label}
          </p>
          <p>Downloads: {formatBigNumber(data.value || payload[0].value)}</p>
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

  // --- STYLES (Inline for guaranteed layout) ---

  const gridStyle3Col: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr', // Force 3 columns
    gap: '16px',
    marginBottom: '32px',
    width: '100%',
  }

  const gridStyle2Col: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr', // Force 2 columns
    gap: '24px',
    marginBottom: '32px',
    width: '100%',
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: THEME.cardBg,
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    color: THEME.textPrimary,
    minWidth: '0',
    border: isDark ? '1px solid #333' : 'none', // Subtle border in dark mode
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

  const cardBodyStyle: React.CSSProperties = {
    padding: '24px',
    textAlign: 'center',
  }

  const chartHeaderStyle: React.CSSProperties = {
    padding: '16px',
    borderBottom: `1px solid ${THEME.gridLine}`,
    margin: 0,
    fontSize: '1.25rem',
    color: THEME.textPrimary,
    fontWeight: 'bold',
  }

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

        {loading && (
          <div style={{ textAlign: 'center', color: THEME.textPrimary }}>
            Loading metrics...
          </div>
        )}

        {!loading && error && (
          <div className='alert alert--danger' role='alert'>
            <h4 className='alert__heading'>Error loading metrics</h4>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            {/* 1. TOP ROW: 3 KPI CARDS */}
            <section style={gridStyle3Col}>
              <div style={cardStyle}>
                <div style={cardHeaderStyle('#4f46e5')}>Total Downloads</div>
                <div style={cardBodyStyle}>
                  <p
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: '900',
                      color: '#4f46e5',
                      margin: 0,
                    }}
                  >
                    {formatBigNumber(totalDownloads)}
                  </p>
                </div>
              </div>
              <div style={cardStyle}>
                <div style={cardHeaderStyle('#0d9488')}>Unique Categories</div>
                <div style={cardBodyStyle}>
                  <p
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: '900',
                      color: '#0d9488',
                      margin: 0,
                    }}
                  >
                    {formatBigNumber(byCategory.length)}
                  </p>
                </div>
              </div>
              <div style={cardStyle}>
                <div style={cardHeaderStyle('#9333ea')}>Tracked Blueprints</div>
                <div style={cardBodyStyle}>
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

            {/* 2. MIDDLE ROW: 2 CHARTS */}
            <section style={gridStyle2Col}>
              {/* Daily Downloads */}
              <div style={cardStyle}>
                <h3 style={chartHeaderStyle}>Daily Downloads</h3>
                <div style={{ height: '350px', padding: '10px' }}>
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
                            stopColor='#4f46e5'
                            stopOpacity={0.8}
                          />
                          <stop
                            offset='95%'
                            stopColor='#4f46e5'
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
                        stroke='#4f46e5'
                        strokeWidth={3}
                        fill='url(#colorTotal)'
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart */}
              <div style={cardStyle}>
                <h3 style={chartHeaderStyle}>Category Distribution</h3>
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
                      >
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={d3ColorScale(entry.category)}
                            stroke={isDark ? '#242526' : '#fff'}
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

            {/* 3. BOTTOM ROW: 1 CHART */}
            <section style={{ ...cardStyle, paddingBottom: '20px' }}>
              <h3
                style={{
                  ...chartHeaderStyle,
                  marginBottom: '20px',
                  borderBottom: 'none',
                }}
              >
                Top 10 Blueprints
              </h3>
              <div style={{ height: Math.max(400, top10BarData.length * 40) }}>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart
                    data={top10BarData}
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
                    <Bar
                      dataKey='value'
                      fill={d3ColorScale('top10')}
                      barSize={20}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
        )}
      </main>
    </Layout>
  )
}
export default DownloadMetricsPage
