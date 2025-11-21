import React, { useEffect, useState, useCallback } from 'react'
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

interface MetricsData {
  totalDownloads: number
  byCategory: CategoryMetric[]
  topBlueprints: TopBlueprintMetric[]
  daily: ChartPoint[]
}

const DownloadMetricsPage: React.FC = () => {
  // --- STATE MANAGEMENT ---
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
  const [isDark, setIsDark] = useState(false)

  const { totalDownloads, byCategory, topBlueprints, daily } = metricsData

  // Initialize D3 color scale
  const d3ColorScale = scaleOrdinal(schemeCategory10)

  // --- HELPER FUNCTIONS ---

  const formatApiDate = (date: Date): string => date.toISOString().split('T')[0]
  const formatBigNumber = (num: number) => num.toLocaleString()

  // Function to create a full N-day range and fill missing days with 0 downloads
  const fillMissingDailyData = (
    dailyData: DailyMetric[],
    days: number,
  ): ChartPoint[] => {
    const dailyMap = new Map(
      dailyData.map((item) => [item.day, Number(item.total)]),
    )
    const fullDailyData: ChartPoint[] = []
    const today = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)

      const apiDate = formatApiDate(d)
      const total = dailyMap.get(apiDate) || 0

      fullDailyData.push({
        label: d.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        }),
        total: total,
      })
    }
    return fullDailyData
  }

  // Memoized fetch helper
  const fetchWithRetry = useCallback(
    async (url: string, options: RequestInit, retries = 3) => {
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
              `HTTP error! Status: ${
                response.status
              }. Response: ${text.substring(0, 100)}...`,
            )
          }
        } catch (error: any) {
          if (i === retries - 1) throw error
        }
      }
    },
    [],
  )

  // --- THEME DETECTION LOGIC ---
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

  // --- EFFECT 1: FETCH STATIC METRICS (Runs once on mount) ---
  useEffect(() => {
    const supabaseUrl = (window as any)?.env?.SUPABASE_URL
    const supabaseAnonKey = (window as any)?.env?.SUPABASE_ANON_KEY
    const headers = {
      'Content-Type': 'application/json',
      apikey: supabaseAnonKey,
      Authorization: 'Bearer ' + supabaseAnonKey,
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      // Mock data path for static metrics
      setMetricsData((prev) => ({
        ...prev,
        totalDownloads: 1234567,
        byCategory: [
          { blueprint_category: 'controllers', total: '900000' },
          { blueprint_category: 'hooks', total: '280000' },
        ],
        topBlueprints: [
          {
            blueprint_category: 'hooks',
            blueprint_id: 'thertetsat_controlv2_30_days_ago',
            total: '50000',
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
          totalDownloads: totalDownloads,
          byCategory: Array.isArray(catJson) ? catJson : [],
          topBlueprints: Array.isArray(topJson) ? topJson : [],
        }))
        setError(undefined)
      } catch (err: any) {
        console.error('Error fetching static metrics', err)
        setError(
          `Failed to load static metrics: ${err.message || 'Unknown error.'}`,
        )
      } finally {
        setIsInitialLoading(false)
      }
    }

    fetchStaticMetrics()
  }, [fetchWithRetry])

  // --- EFFECT 2: FETCH DYNAMIC DAILY METRICS (Runs on selectedDays change) ---
  useEffect(() => {
    // Only proceed if the initial load is done OR if we are handling mock data.
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
        // Mock data path for daily metrics
        const mockDaily: DailyMetric[] = [
          {
            day: formatApiDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)),
            total: '10',
          },
          {
            day: formatApiDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
            total: '20',
          },
          { day: formatApiDate(new Date()), total: '22' },
        ]
        const dailyParsed: ChartPoint[] = fillMissingDailyData(
          mockDaily,
          selectedDays,
        )

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
          const dailyParsed: ChartPoint[] = fillMissingDailyData(
            Array.isArray(dailyJson) ? dailyJson : [],
            selectedDays,
          )

          setMetricsData((prev) => ({ ...prev, daily: dailyParsed }))
        } catch (err: any) {
          console.error('Error fetching daily metrics', err)
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

  // --- UI Component for Time Range Selection ---
  const TimeRangeSelector: React.FC<{
    current: number
    onSelect: (days: number) => void
    isDailyLoading: boolean
  }> = ({ current, onSelect, isDailyLoading }) => {
    const ranges = [7, 15, 30, 90]
    const activeStyle = (days: number): React.CSSProperties => ({
      padding: '6px 12px',
      margin: '0 4px',
      borderRadius: '4px',
      cursor: isDailyLoading ? 'not-allowed' : 'pointer',
      fontWeight: 'bold',
      backgroundColor: current === days ? '#4f46e5' : THEME.cardBg,
      color: current === days ? 'white' : THEME.textPrimary,
      border: `1px solid ${current === days ? '#4f46e5' : THEME.gridLine}`,
      transition: 'all 0.2s',
      boxShadow: current === days ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
      fontSize: '14px',
      opacity: isDailyLoading && current !== days ? 0.6 : 1, // Dim non-active buttons while loading
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

  // --- Custom Recharts Components & Styles (using existing definitions) ---

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

  const THEME = {
    bg: isDark ? '#1b1b1d' : '#f9fafb',
    cardBg: isDark ? '#242526' : '#ffffff',
    textPrimary: isDark ? '#e5e7eb' : '#1f2937',
    textSecondary: isDark ? '#9ca3af' : '#6b7280',
    gridLine: isDark ? '#444' : '#e5e7eb',
    tooltipBg: isDark ? '#242526' : '#ffffff',
    tooltipBorder: isDark ? '#444' : '#ccc',
    tooltipText: isDark ? '#e5e7eb' : '#333',
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

  // Prepare Chart Data
  const categoryData: ChartData[] = byCategory.map((item) => ({
    name: item.blueprint_category,
    category: item.blueprint_category,
    value: Number(item.total),
    total: Number(item.total),
    label: item.blueprint_category,
  }))

  const top10BarData = topBlueprints.slice(0, 10).map((bp) => ({
    id: bp.blueprint_id,
    name:
      bp.blueprint_id.length > 40
        ? bp.blueprint_id.substring(0, 37) + '...'
        : bp.blueprint_id,
    value: Number(bp.total),
  }))

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

        {/* Global Loading or Error Indicator */}
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

        {/* Full Dashboard Content (Renders after static data is loaded) */}
        {!isInitialLoading && (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            {/* 1. TOP ROW: 2 KPI CARDS */}
            <section style={gridStyleKPIs}>
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

              {/* Pie Chart (Category Distribution) */}
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
                Top 10 Blueprints (Highest to Lowest)
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
