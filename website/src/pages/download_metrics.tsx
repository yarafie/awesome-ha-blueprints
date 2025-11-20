import React, { useEffect, useState } from 'react'
import Layout from '@theme/Layout'
import {
  LineChart,
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
  RadialBarChart,
  RadialBar,
  Legend,
} from 'recharts'
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
type CategoryChartData = ChartPoint & {
  name: string
  value: number
  category: string
}
type RadialChartData = { name: string; value: number; fill: string }

interface MetricsState {
  loading: boolean
  error?: string
  totalDownloads: number
  byCategory: CategoryMetric[]
  topBlueprints: TopBlueprintMetric[]
  daily: ChartPoint[]
}

// Define a stable color palette for the Pie Chart
const colors = scaleOrdinal(schemeCategory10).range()

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

  // Empty dependency array ([]) is crucial here. It makes sure the fetch logic
  // runs only once on the client side, fixing the ReferenceError during Docusaurus SSR.
  useEffect(() => {
    // Access global environment variables
    const supabaseUrl = (window as any)?.env?.SUPABASE_URL
    const supabaseAnonKey = (window as any)?.env?.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      setMetrics((prev) => ({
        ...prev,
        loading: false,
        error:
          'Supabase environment variables are not available. Check SUPABASE_URL and SUPABASE_ANON_KEY.',
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

  // --- Render Helpers ---
  const formatBigNumber = (num: number) => {
    return num.toLocaleString()
  }

  // Transform category data for Pie Chart
  const categoryData: CategoryChartData[] = byCategory.map((item) => ({
    name: item.blueprint_category,
    category: item.blueprint_category,
    value: Number(item.total),
    total: Number(item.total),
    label: item.blueprint_category,
  }))

  // Transform top blueprints data for Radial Bar Chart (Top 10)
  const top10Blueprints = topBlueprints
    .slice(0, 10)
    .map((bp, index) => ({
      name: bp.blueprint_id,
      value: Number(bp.total),
      fill: colors[index % colors.length], // Assign a color from the palette
    }))
    .reverse() // Reverse for better stacking visualization

  const maxRadialValue = Math.max(...top10Blueprints.map((bp) => bp.value), 1)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className='p-3 bg-white border border-gray-300 shadow-xl rounded-lg text-sm text-gray-700'>
          <p className='font-bold text-indigo-600 mb-1'>{data.name || label}</p>
          <p>
            <span className='font-semibold'>Downloads:</span>{' '}
            {formatBigNumber(data.value || payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  const RadialLegend = (props: any) => {
    const { payload } = props
    if (!payload || payload.length === 0) return null

    return (
      <div className='p-4 bg-gray-50 border border-gray-200 rounded-lg max-h-48 overflow-y-auto'>
        <p className='font-semibold text-sm mb-2 text-gray-700'>
          Top Blueprints
        </p>
        <ul className='space-y-1'>
          {payload.map((entry: any, index: number) => (
            <li key={`item-${index}`} className='flex items-center text-xs'>
              <span
                className='w-3 h-3 rounded-full mr-2'
                style={{ backgroundColor: entry.color }}
              ></span>
              <span className='text-gray-600 truncate' title={entry.value}>
                {entry.value}
              </span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  // --- Render Components ---

  return (
    <Layout
      title='Blueprint Download Metrics'
      description='Download metrics for Awesome HA Blueprints'
    >
      <main className='container margin-vert--lg'>
        <h1 className='text--center margin-bottom--lg text-3xl font-bold text-gray-800'>
          Blueprint Download Metrics
        </h1>
        {loading && (
          <div className='text--center margin-vert--lg p-6 bg-indigo-50 border-2 border-indigo-200 rounded-xl shadow-lg'>
            <div className='margin-bottom--sm text-xl font-semibold text-indigo-700'>
              Loading metrics from Supabase...
            </div>
            <small className='text-indigo-500'>
              Fetching data from RPCs. Please ensure your Supabase config is
              correct.
            </small>
          </div>
        )}
        {!loading && error && (
          <div className='alert alert--danger shadow-lg' role='alert'>
            <h4 className='alert__heading'>Error loading metrics</h4>
            <p>{error}</p>
          </div>
        )}
        {!loading && !error && (
          <div className='space-y-12'>
            {/* Top metric cards */}
            <section className='row'>
              <div className='col col--4 mb-4'>
                <div className='card shadow-2xl hover:shadow-3xl transition-shadow duration-500'>
                  <div className='card__header bg-indigo-600 text-white rounded-t-lg p-4'>
                    <h3 className='font-extrabold text-xl'>Total Downloads</h3>
                  </div>
                  <div className='card__body p-6'>
                    <p className='text-6xl font-black text-indigo-700 m-0'>
                      {formatBigNumber(totalDownloads)}
                    </p>
                  </div>
                </div>
              </div>
              <div className='col col--4 mb-4'>
                <div className='card shadow-2xl hover:shadow-3xl transition-shadow duration-500'>
                  <div className='card__header bg-teal-600 text-white rounded-t-lg p-4'>
                    <h3 className='font-extrabold text-xl'>
                      Unique Categories
                    </h3>
                  </div>
                  <div className='card__body p-6'>
                    <p className='text-6xl font-black text-teal-700 m-0'>
                      {formatBigNumber(byCategory.length)}
                    </p>
                  </div>
                </div>
              </div>
              <div className='col col--4 mb-4'>
                <div className='card shadow-2xl hover:shadow-3xl transition-shadow duration-500'>
                  <div className='card__header bg-purple-600 text-white rounded-t-lg p-4'>
                    <h3 className='font-extrabold text-xl'>
                      Top Blueprints Tracked
                    </h3>
                  </div>
                  <div className='card__body p-6'>
                    <p className='text-6xl font-black text-purple-700 m-0'>
                      {formatBigNumber(topBlueprints.length)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Charts row: Daily line + Category pie */}
            <section className='row'>
              <div className='col col--6 mb-4'>
                <div className='card shadow-2xl'>
                  <div className='card__header p-4'>
                    <h3 className='font-bold text-xl text-gray-700'>
                      Daily Downloads (Last 30 Days)
                    </h3>
                  </div>
                  <div className='card__body' style={{ height: 350 }}>
                    {daily.length === 0 ? (
                      <div className='flex justify-center items-center h-full text-gray-500'>
                        No recent downloads to chart yet.
                      </div>
                    ) : (
                      <ResponsiveContainer width='100%' height='100%'>
                        <AreaChart
                          data={daily}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
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
                            strokeDasharray='5 5'
                            stroke='#e5e7eb'
                          />
                          <XAxis
                            dataKey='label'
                            stroke='#6b7280'
                            tick={{ fontSize: 10 }}
                            padding={{ left: 10, right: 10 }}
                          />
                          <YAxis allowDecimals={false} stroke='#6b7280' />
                          <Tooltip content={<CustomTooltip />} />
                          <Area
                            type='monotone'
                            dataKey='total'
                            stroke='#4f46e5'
                            strokeWidth={3}
                            fill='url(#colorTotal)'
                            dot={{ fill: '#4f46e5', r: 4 }}
                            activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>

              <div className='col col--6 mb-4'>
                <div className='card shadow-2xl'>
                  <div className='card__header p-4'>
                    <h3 className='font-bold text-xl text-gray-700'>
                      Downloads by Category (Proportion)
                    </h3>
                  </div>
                  <div className='card__body' style={{ height: 350 }}>
                    {categoryData.length === 0 ? (
                      <div className='flex justify-center items-center h-full text-gray-500'>
                        No data yet. Download some blueprints to see metrics
                        here.
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
                            outerRadius={100}
                            fill='#8884d8'
                            labelLine={false}
                            label={({ name, percent }) =>
                              `${name} (${(percent * 100).toFixed(0)}%)`
                            }
                          >
                            {categoryData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={colors[index % colors.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend
                            layout='vertical'
                            verticalAlign='middle'
                            align='right'
                            iconType='circle'
                            wrapperStyle={{ fontSize: '12px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Top Blueprints Radial Chart */}
            <section className='row'>
              <div className='col col--12'>
                <div className='card shadow-2xl'>
                  <div className='card__header p-4'>
                    <h3 className='font-bold text-xl text-gray-700'>
                      Top 10 Blueprints Ranking (Radial)
                    </h3>
                  </div>
                  <div className='card__body' style={{ height: 400 }}>
                    {top10Blueprints.length === 0 ? (
                      <p className='text-gray-500'>
                        No downloads recorded yet for individual blueprints.
                      </p>
                    ) : (
                      <ResponsiveContainer width='100%' height='100%'>
                        <RadialBarChart
                          innerRadius='10%'
                          outerRadius='100%'
                          data={top10Blueprints}
                          startAngle={90}
                          endAngle={-270}
                          barSize={15}
                        >
                          <RadialBar
                            minAngle={15}
                            label={{
                              position: 'insideStart',
                              fill: '#fff',
                              fontSize: 10,
                              offset: 5,
                            }}
                            background
                            clockWise
                            dataKey='value'
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend
                            iconSize={10}
                            layout='vertical'
                            verticalAlign='middle'
                            align='left'
                            formatter={(value, entry) => (
                              <span
                                className='text-xs text-gray-600'
                                title={entry.payload.name}
                              >
                                {`${entry.payload.name} (${formatBigNumber(entry.payload.value)})`}
                              </span>
                            )}
                          />
                          <text
                            x={'50%'}
                            y={20}
                            fill='#666'
                            textAnchor='middle'
                            dominantBaseline='hanging'
                          >
                            Top 10 Blueprint Rankings (Max:{' '}
                            {formatBigNumber(maxRadialValue)})
                          </text>
                        </RadialBarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </Layout>
  )
}
export default DownloadMetricsPage
