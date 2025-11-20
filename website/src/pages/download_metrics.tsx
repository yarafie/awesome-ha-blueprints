import React, { useEffect, useState } from 'react'
import Layout from '@theme/Layout'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

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

type DailyChartPoint = {
  label: string // e.g. "Nov 18"
  total: number
}

interface MetricsState {
  loading: boolean
  error?: string
  totalDownloads: number
  byCategory: CategoryMetric[]
  topBlueprints: TopBlueprintMetric[]
  daily: DailyChartPoint[]
}

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

  // Empty dependency array ([]) ensures this runs only once on the client side,
  // fixing the ReferenceError during Docusaurus SSR.
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

        const dailyParsed: DailyChartPoint[] = Array.isArray(dailyJson)
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
              .sort((a: DailyChartPoint, b: DailyChartPoint) => {
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
  const maxTopDownload = Math.max(
    ...topBlueprints.map((bp) => Number(bp.total)),
    1,
  )

  // --- Render Components ---

  return (
    <Layout
      title='Blueprint Download Metrics'
      description='Download metrics for Awesome HA Blueprints'
    >
      <main className='container margin-vert--lg'>
        <h1 className='text--center margin-bottom--lg'>
          Blueprint Download Metrics
        </h1>
        {loading && (
          <div className='text--center margin-vert--lg p-4 bg-gray-100 rounded-lg'>
            <div className='margin-bottom--sm text-xl font-semibold text-gray-700'>
              Loading metrics from Supabase...
            </div>
            <small className='text-gray-500'>
              Please ensure your Supabase URL / Anon key are set and the RPC
              functions are public.
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
                <div className='card shadow-lg hover:shadow-xl transition-shadow duration-300'>
                  <div className='card__header bg-blue-500 text-white rounded-t-lg'>
                    <h3 className='font-bold text-lg'>Total Downloads</h3>
                  </div>
                  <div className='card__body'>
                    <p className='text-5xl font-extrabold text-blue-700 m-0'>
                      {formatBigNumber(totalDownloads)}
                    </p>
                  </div>
                </div>
              </div>
              <div className='col col--4 mb-4'>
                <div className='card shadow-lg hover:shadow-xl transition-shadow duration-300'>
                  <div className='card__header bg-green-500 text-white rounded-t-lg'>
                    <h3 className='font-bold text-lg'>Unique Categories</h3>
                  </div>
                  <div className='card__body'>
                    <p className='text-5xl font-extrabold text-green-700 m-0'>
                      {formatBigNumber(byCategory.length)}
                    </p>
                  </div>
                </div>
              </div>
              <div className='col col--4 mb-4'>
                <div className='card shadow-lg hover:shadow-xl transition-shadow duration-300'>
                  <div className='card__header bg-purple-500 text-white rounded-t-lg'>
                    <h3 className='font-bold text-lg'>
                      Top Blueprints Tracked
                    </h3>
                  </div>
                  <div className='card__body'>
                    <p className='text-5xl font-extrabold text-purple-700 m-0'>
                      {formatBigNumber(topBlueprints.length)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Charts row: Daily line + Category bar */}
            <section className='row'>
              <div className='col col--6 mb-4'>
                <div className='card shadow-lg'>
                  <div className='card__header'>
                    <h3 className='font-semibold text-xl'>
                      Downloads in Last 30 Days
                    </h3>
                  </div>
                  <div className='card__body' style={{ height: 350 }}>
                    {daily.length === 0 ? (
                      <div className='flex justify-center items-center h-full text-gray-500'>
                        No recent downloads to chart yet.
                      </div>
                    ) : (
                      <ResponsiveContainer width='100%' height='100%'>
                        <LineChart
                          data={daily}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray='3 3'
                            stroke='#f0f0f0'
                          />
                          <XAxis
                            dataKey='label'
                            stroke='#555'
                            tick={{ fontSize: 10 }}
                          />
                          <YAxis allowDecimals={false} stroke='#555' />
                          <Tooltip
                            formatter={(value) => [
                              `${formatBigNumber(value as number)} downloads`,
                              'Total',
                            ]}
                            labelFormatter={(label) => `Date: ${label}`}
                          />
                          <Line
                            type='monotone'
                            dataKey='total'
                            stroke='#3b82f6'
                            strokeWidth={3}
                            dot={{ fill: '#3b82f6', r: 3 }}
                            activeDot={{ r: 5 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>

              <div className='col col--6 mb-4'>
                <div className='card shadow-lg'>
                  <div className='card__header'>
                    <h3 className='font-semibold text-xl'>
                      Downloads by Category
                    </h3>
                  </div>
                  <div className='card__body' style={{ height: 350 }}>
                    {byCategory.length === 0 ? (
                      <div className='flex justify-center items-center h-full text-gray-500'>
                        No data yet. Download some blueprints to see metrics
                        here.
                      </div>
                    ) : (
                      <ResponsiveContainer width='100%' height='100%'>
                        <BarChart
                          data={byCategory.map((c) => ({
                            ...c,
                            total: Number(c.total),
                          }))}
                          layout='vertical'
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray='3 3'
                            stroke='#f0f0f0'
                          />
                          <XAxis
                            type='number'
                            allowDecimals={false}
                            stroke='#555'
                          />
                          <YAxis
                            dataKey='blueprint_category'
                            type='category'
                            stroke='#555'
                            tick={{ fontSize: 10 }}
                          />
                          <Tooltip
                            formatter={(value) => [
                              `${formatBigNumber(value as number)} downloads`,
                              'Total',
                            ]}
                            labelFormatter={(label) => `Category: ${label}`}
                          />
                          <Bar dataKey='total' fill='#10b981' />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Top Blueprints List/Visualization */}
            <section className='row'>
              <div className='col col--12'>
                <div className='card shadow-lg'>
                  <div className='card__header'>
                    <h3 className='font-semibold text-xl'>Top Blueprints</h3>
                  </div>
                  <div className='card__body'>
                    {topBlueprints.length === 0 ? (
                      <p className='text-gray-500'>
                        No downloads recorded yet for individual blueprints.
                      </p>
                    ) : (
                      <div className='space-y-2'>
                        {/* Only show the top 25 blueprints for performance/readability */}
                        {topBlueprints.slice(0, 25).map((bp, index) => (
                          <div
                            key={`${bp.blueprint_category}-${bp.blueprint_id}-${index}`}
                            className='flex items-center space-x-4 p-2 border-b last:border-b-0 border-gray-100'
                          >
                            <span className='font-mono text-xs w-6 text-center text-gray-500'>
                              {index + 1}.
                            </span>
                            <span className='flex-1 font-medium text-gray-800'>
                              <span className='font-semibold'>
                                {bp.blueprint_category}
                              </span>
                              <span className='text-gray-400'> / </span>
                              {bp.blueprint_id}
                            </span>
                            <div className='flex items-center space-x-2 w-32 justify-end'>
                              <span className='text-sm font-bold text-indigo-600 w-12 text-right'>
                                {formatBigNumber(Number(bp.total))}
                              </span>
                              {/* Simple Bar Visualization */}
                              <div className='relative w-20 h-2 bg-gray-200 rounded-full overflow-hidden'>
                                <div
                                  className='absolute inset-y-0 left-0 bg-indigo-400 rounded-full transition-all duration-500'
                                  style={{
                                    width: `${(Number(bp.total) / maxTopDownload) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
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
