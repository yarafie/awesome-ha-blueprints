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

// Color for better dark mode readability
const CHART_TEXT_COLOR = '#6b7280'

const DownloadMetricsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricsState>({
    loading: true,
    error: undefined,
    totalDownloads: 0,
    byCategory: [],
    topBlueprints: [],
    daily: [],
  })

  const { loading, error, totalDownloads, byCategory, topBlueprints, daily } =
    metrics

  // Initialize D3 color scale and use it directly (d3ColorScale)
  const d3ColorScale = scaleOrdinal(schemeCategory10)

  // Empty dependency array ([]) is crucial here for Docusaurus SSR
  useEffect(() => {
    // Access global environment variables
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
        error:
          'Supabase environment variables are missing. Displaying mock data for layout purposes.',
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
      Authorization: `Bearer ${supabaseAnonKey}`,
    }

    // Exponential backoff retry logic
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
        // Fetch all required data points concurrently
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

        // --- Data Transformation and Parsing ---
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

        // Format daily data for Area Chart
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
                // Sort by date to ensure correct line progression
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

  // Prepare data for Pie Chart
  const categoryData: ChartData[] = byCategory.map((item) => ({
    name: item.blueprint_category,
    category: item.blueprint_category,
    value: Number(item.total),
    total: Number(item.total),
    label: item.blueprint_category,
  }))

  // Prepare data for Horizontal Bar Chart (Top 10)
  // Reversed for the bar chart so the #1 entry appears at the top
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

  // --- Custom Recharts Components ---

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        // Ensure tooltip is white and clear regardless of parent theme
        <div className='p-3 bg-white border border-gray-300 shadow-xl rounded-lg text-sm text-gray-700'>
          <p className='font-bold text-indigo-600 mb-1'>
            {data.name || data.id || label}
          </p>
          <p>
            <span className='font-semibold'>Downloads:</span>{' '}
            {formatBigNumber(data.value || payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  // Custom Tick formatter for the long Blueprint IDs on the Bar Chart
  const CustomYAxisTick = (props: any) => {
    const { x, y, payload } = props
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={5}
          textAnchor='end'
          // Use the consistent CHART_TEXT_COLOR
          fill={CHART_TEXT_COLOR}
          fontSize={10}
          title={payload.value}
        >
          {payload.value}
        </text>
      </g>
    )
  }

  // --- Main Render Component ---

  return (
    // Set a light background for the whole dashboard content to ensure readability
    <Layout
      title='Blueprint Download Metrics'
      description='Enhanced Metrics Dashboard'
    >
      <main className='container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen'>
        <h1 className='text-center mb-8 text-3xl font-extrabold text-gray-900'>
          Blueprint Metrics Dashboard
        </h1>
        {loading && (
          <div className='text-center my-6 p-6 bg-indigo-50 border-2 border-indigo-300 rounded-xl shadow-lg animate-pulse'>
            <div className='mb-2 text-xl font-semibold text-indigo-700'>
              Loading Data...
            </div>
            <small className='text-indigo-500'>
              Fetching all metrics. Please wait.
            </small>
          </div>
        )}
        {!loading && error && (
          <div
            className='bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-lg'
            role='alert'
          >
            <h4 className='font-bold'>Error loading metrics</h4>
            <p>{error}</p>
          </div>
        )}
        {!loading && !error && (
          <div className='space-y-8 md:space-y-12'>
            {/* 3-ITEM ROW: KPI Cards */}
            {/* FORCED LAYOUT: Use grid-cols-3 directly to ensure 3 columns on all devices. */}
            <section className='grid grid-cols-3 gap-4 md:gap-6'>
              <div className='card shadow-2xl bg-white border-b-4 border-indigo-600 transition-all hover:scale-[1.01] duration-300 rounded-xl p-4'>
                <h3 className='text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider truncate'>
                  Total Downloads
                </h3>
                <p className='mt-1 text-2xl md:text-4xl font-extrabold text-indigo-800 truncate'>
                  {formatBigNumber(totalDownloads)}
                </p>
              </div>

              <div className='card shadow-2xl bg-white border-b-4 border-teal-600 transition-all hover:scale-[1.01] duration-300 rounded-xl p-4'>
                <h3 className='text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider truncate'>
                  Unique Categories
                </h3>
                <p className='mt-1 text-2xl md:text-4xl font-extrabold text-teal-800 truncate'>
                  {formatBigNumber(byCategory.length)}
                </p>
              </div>

              <div className='card shadow-2xl bg-white border-b-4 border-purple-600 transition-all hover:scale-[1.01] duration-300 rounded-xl p-4'>
                <h3 className='text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider truncate'>
                  Tracked Blueprints
                </h3>
                <p className='mt-1 text-2xl md:text-4xl font-extrabold text-purple-800 truncate'>
                  {formatBigNumber(topBlueprints.length)}
                </p>
              </div>
            </section>

            {/* 2-ITEM ROW: Daily Area Chart and Category Pie Chart */}
            {/* FORCED LAYOUT: Use grid-cols-2 directly to ensure 2 columns on all devices. */}
            <section className='grid grid-cols-2 gap-6 md:gap-8'>
              {/* Daily Downloads Area Chart */}
              <div className='w-full shadow-2xl bg-white p-4 rounded-xl border border-gray-100'>
                <h3 className='font-bold text-base md:text-xl mb-4 text-gray-800 border-b pb-2 truncate'>
                  Daily Downloads (Last 30 Days)
                </h3>
                <div style={{ height: 350 }}>
                  {daily.length === 0 ? (
                    <div className='flex justify-center items-center h-full text-gray-500 text-sm md:text-base'>
                      No recent download data available.
                    </div>
                  ) : (
                    <ResponsiveContainer width='100%' height='100%'>
                      <AreaChart
                        data={daily}
                        margin={{ top: 10, right: 0, left: -10, bottom: 0 }}
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
                          stroke='#e5e7eb'
                          vertical={false}
                        />
                        <XAxis
                          dataKey='label'
                          // Use the consistent CHART_TEXT_COLOR
                          stroke={CHART_TEXT_COLOR}
                          tick={{ fontSize: 8, fill: CHART_TEXT_COLOR }}
                          padding={{ left: 10, right: 10 }}
                        />
                        <YAxis
                          allowDecimals={false}
                          // Use the consistent CHART_TEXT_COLOR
                          stroke={CHART_TEXT_COLOR}
                          tick={{ fontSize: 8, fill: CHART_TEXT_COLOR }}
                          tickFormatter={formatBigNumber}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type='monotone'
                          dataKey='total'
                          stroke='#4f46e5'
                          strokeWidth={3}
                          fill='url(#colorTotal)'
                          dot={false}
                          activeDot={{
                            r: 6,
                            fill: '#fff',
                            stroke: '#4f46e5',
                            strokeWidth: 2,
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Category Proportion Pie Chart */}
              <div className='w-full shadow-2xl bg-white p-4 rounded-xl border border-gray-100'>
                <h3 className='font-bold text-base md:text-xl mb-4 text-gray-800 border-b pb-2 truncate'>
                  Download Distribution by Category
                </h3>
                <div style={{ height: 350 }}>
                  {categoryData.length === 0 ? (
                    <div className='flex justify-center items-center h-full text-gray-500 text-sm md:text-base'>
                      No category data available.
                    </div>
                  ) : (
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
                          // Adjust label color for contrast
                          label={({ percent }) => ({
                            value: `${(percent * 100).toFixed(1)}%`, // Show percentage on slice
                            fill: CHART_TEXT_COLOR,
                            fontSize: 10,
                          })}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              // Use the D3 scale for consistent, high-contrast colors
                              fill={d3ColorScale(entry.category)}
                              stroke='#fff'
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          layout='vertical'
                          verticalAlign='middle'
                          align='right'
                          iconType='circle'
                          wrapperStyle={{
                            fontSize: '10px',
                            color: CHART_TEXT_COLOR,
                          }} // Ensure legend text is visible
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </section>

            {/* 1-ITEM ROW: Top 10 Blueprints (Horizontal Bar Chart) */}
            <section className='w-full shadow-2xl bg-white p-4 rounded-xl border border-gray-100'>
              <h3 className='font-bold text-xl mb-4 text-gray-800 border-b pb-2'>
                Top 10 Blueprint Downloads (Ranking)
              </h3>
              <div style={{ height: Math.max(400, top10BarData.length * 40) }}>
                {top10BarData.length === 0 ? (
                  <p className='text-gray-500 text-base p-4'>
                    No individual blueprint download data recorded yet.
                  </p>
                ) : (
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart
                      data={top10BarData}
                      layout='vertical'
                      margin={{ top: 20, right: 30, left: 100, bottom: 5 }} // Increased left margin for long labels
                    >
                      <CartesianGrid strokeDasharray='3 3' vertical={false} />
                      <XAxis
                        type='number'
                        // Use the consistent CHART_TEXT_COLOR
                        stroke={CHART_TEXT_COLOR}
                        tick={{ fontSize: 10, fill: CHART_TEXT_COLOR }}
                        tickFormatter={formatBigNumber}
                      />
                      <YAxis
                        dataKey='name'
                        type='category'
                        width={100} // Increased Y-Axis width for long labels
                        tickLine={false}
                        axisLine={false}
                        // Tick uses custom component, which already uses CHART_TEXT_COLOR
                        tick={<CustomYAxisTick />}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey='value'
                        fill={d3ColorScale('top10')} // Assign a consistent color for all bars
                        barSize={20}
                        radius={[10, 10, 0, 0]} // Rounded bars
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </Layout>
  )
}
export default DownloadMetricsPage
