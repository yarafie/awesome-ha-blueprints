// -----------------------------------------------------------
//  DownloadMetricsPage – Improved, Optimized, Shortened
// -----------------------------------------------------------
import React, { useEffect, useState, useMemo } from 'react'
import Layout from '@theme/Layout'
import useThemeContext from '@theme/hooks/useThemeContext'

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

import { scaleOrdinal } from 'd3-scale'
import { schemeCategory10 } from 'd3-scale-chromatic'

// -----------------------------------------------------------
// Types
// -----------------------------------------------------------
type TotalMetric = { total: string }
type CategoryMetric = { blueprint_category: string; total: string }
type TopBlueprintMetric = {
  blueprint_category: string
  blueprint_id: string
  total: string
}
type DailyMetric = { day: string; total: string }
type ChartPoint = { label: string; total: number }

interface MetricsState {
  loading: boolean
  error?: string
  totalDownloads: number
  byCategory: CategoryMetric[]
  topBlueprints: TopBlueprintMetric[]
  daily: ChartPoint[]
}

// -----------------------------------------------------------
// Helpers
// -----------------------------------------------------------
const formatBigNumber = (n: number) => n.toLocaleString()

const formatDateLabel = (isoDay: string) =>
  new Date(isoDay).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })

const prepareDailyData = (rows: DailyMetric[]): ChartPoint[] =>
  rows
    .map((r) => ({
      label: formatDateLabel(r.day),
      total: Number(r.total),
      _date: new Date(r.day).getTime(),
    }))
    .sort((a, b) => a._date - b._date)

const prepareCategoryData = (rows: CategoryMetric[]) =>
  rows.map((r) => ({
    name: r.blueprint_category,
    category: r.blueprint_category,
    value: Number(r.total),
    label: r.blueprint_category,
    total: Number(r.total),
  }))

const prepareTopBlueprints = (rows: TopBlueprintMetric[]) =>
  rows
    .slice(0, 10)
    .map((bp) => ({
      name:
        bp.blueprint_id.length > 40
          ? bp.blueprint_id.slice(0, 37) + '…'
          : bp.blueprint_id,
      value: Number(bp.total),
      id: bp.blueprint_id,
    }))
    .reverse()

// -----------------------------------------------------------
// Reusable Components
// -----------------------------------------------------------
const Card: React.FC<{ style?: React.CSSProperties }> = ({
  style,
  children,
}) => (
  <div
    style={{
      borderRadius: 8,
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      ...style,
    }}
  >
    {children}
  </div>
)

const CardHeader: React.FC<{ bg: string }> = ({ bg, children }) => (
  <div
    style={{
      backgroundColor: bg,
      color: 'white',
      padding: 12,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    }}
  >
    {children}
  </div>
)

const CardBody: React.FC = ({ children }) => (
  <div style={{ padding: 24, textAlign: 'center' }}>{children}</div>
)

const ChartCard: React.FC<{ title: string }> = ({ title, children }) => (
  <Card>
    <h3
      style={{
        padding: 16,
        margin: 0,
        borderBottom: '1px solid var(--ifm-color-emphasis-200)',
        fontSize: '1.2rem',
        fontWeight: 'bold',
      }}
    >
      {title}
    </h3>
    <div style={{ height: 350, padding: 10 }}>{children}</div>
  </Card>
)

// -----------------------------------------------------------
// Tooltip
// -----------------------------------------------------------
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  return (
    <div
      style={{
        padding: 10,
        background: 'var(--ifm-card-background)',
        border: '1px solid var(--ifm-color-emphasis-300)',
        borderRadius: 5,
      }}
    >
      <strong>{data.name || label}</strong>
      <p style={{ margin: 0 }}>Downloads: {formatBigNumber(data.value)}</p>
    </div>
  )
}

// -----------------------------------------------------------
// Main Component
// -----------------------------------------------------------
const DownloadMetricsPage: React.FC = () => {
  const { isDarkTheme } = useThemeContext()
  const isDark = isDarkTheme

  const [metrics, setMetrics] = useState<MetricsState>({
    loading: true,
    totalDownloads: 0,
    byCategory: [],
    topBlueprints: [],
    daily: [],
  })

  const d3ColorScale = useMemo(() => scaleOrdinal(schemeCategory10), [])

  // -----------------------------------------------------------
  // Data Fetching
  // -----------------------------------------------------------
  useEffect(() => {
    const supabaseUrl = (window as any)?.env?.SUPABASE_URL
    const supabaseAnonKey = (window as any)?.env?.SUPABASE_ANON_KEY

    // Mock mode
    if (!supabaseUrl || !supabaseAnonKey) {
      const mockDaily: DailyMetric[] = Array.from({ length: 6 }).map((_, i) => {
        const d = new Date(Date.now() - (5 - i) * 86400000)
          .toISOString()
          .split('T')[0]
        return { day: d, total: String(10 + i * 5) }
      })

      setMetrics({
        loading: false,
        error: 'Supabase missing – showing mock data.',
        totalDownloads: 1234567,
        byCategory: [
          { blueprint_category: 'controllers', total: '900000' },
          { blueprint_category: 'hooks', total: '280000' },
          { blueprint_category: 'templates', total: '54000' },
        ],
        topBlueprints: [
          { blueprint_category: 'hooks', blueprint_id: 'xyz', total: '40000' },
          { blueprint_category: 'hooks', blueprint_id: 'abc', total: '35000' },
        ],
        daily: prepareDailyData(mockDaily),
      })
      return
    }

    const headers = {
      'Content-Type': 'application/json',
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    }

    const fetchWithRetry = async (
      url: string,
      init: RequestInit,
      retries = 3,
    ) => {
      for (let i = 0; i < retries; i++) {
        try {
          const res = await fetch(url, init)
          if (res.ok) return res
          if (res.status === 429 && i < retries - 1) {
            await new Promise((r) => setTimeout(r, 500 * (i + 1)))
            continue
          }
          throw new Error(await res.text())
        } catch (e) {
          if (i === retries - 1) throw e
        }
      }
    }

    const rpc = (fn: string, args = {}) =>
      fetchWithRetry(`${supabaseUrl}/rest/v1/rpc/${fn}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(args),
      }).then((r) => r.json())

    async function load() {
      try {
        const [total, byCat, top, daily] = await Promise.all([
          rpc('get_total_downloads'),
          rpc('get_downloads_by_category'),
          rpc('get_top_blueprints'),
          rpc('get_daily_downloads', { p_days: 30 }),
        ])

        setMetrics({
          loading: false,
          totalDownloads: Array.isArray(total)
            ? Number(total[0]?.total)
            : Number(total),
          byCategory: byCat,
          topBlueprints: top,
          daily: prepareDailyData(daily),
        })
      } catch (err: any) {
        setMetrics((p) => ({
          ...p,
          loading: false,
          error: err.message || 'Unknown error',
        }))
      }
    }

    load()
  }, [])

  const { loading, error, totalDownloads, byCategory, topBlueprints, daily } =
    metrics

  const categoryData = useMemo(
    () => prepareCategoryData(byCategory),
    [byCategory],
  )
  const barData = useMemo(
    () => prepareTopBlueprints(topBlueprints),
    [topBlueprints],
  )

  // -----------------------------------------------------------
  // Render
  // -----------------------------------------------------------
  return (
    <Layout title='Blueprint Download Metrics'>
      <main
        className='container margin-vert--lg'
        style={{
          backgroundColor: 'var(--ifm-background-surface)',
          minHeight: '100vh',
          padding: '2rem',
        }}
      >
        <h1 style={{ textAlign: 'center', marginBottom: 32 }}>
          Blueprint Metrics Dashboard
        </h1>

        {loading && <p style={{ textAlign: 'center' }}>Loading metrics…</p>}

        {error && (
          <div className='alert alert--danger'>
            <strong>Error loading metrics:</strong> {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* KPIs */}
            <section
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 16,
              }}
            >
              <Card>
                <CardHeader bg='#4f46e5'>Total Downloads</CardHeader>
                <CardBody>
                  <p
                    style={{ fontSize: '2.5rem', margin: 0, color: '#4f46e5' }}
                  >
                    {formatBigNumber(totalDownloads)}
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardHeader bg='#0d9488'>Unique Categories</CardHeader>
                <CardBody>
                  <p
                    style={{ fontSize: '2.5rem', margin: 0, color: '#0d9488' }}
                  >
                    {byCategory.length}
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardHeader bg='#9333ea'>Tracked Blueprints</CardHeader>
                <CardBody>
                  <p
                    style={{ fontSize: '2.5rem', margin: 0, color: '#9333ea' }}
                  >
                    {topBlueprints.length}
                  </p>
                </CardBody>
              </Card>
            </section>

            {/* Charts row */}
            <section
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 24,
                marginTop: 32,
              }}
            >
              <ChartCard title='Daily Downloads'>
                <ResponsiveContainer>
                  <AreaChart data={daily}>
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

                    <CartesianGrid strokeDasharray='3 3' />

                    <XAxis dataKey='label' />
                    <YAxis tickFormatter={formatBigNumber} />

                    <Tooltip content={<CustomTooltip />} />

                    <Area
                      type='monotone'
                      dataKey='total'
                      stroke='#4f46e5'
                      strokeWidth={3}
                      fill='url(#colorTotal)'
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title='Category Distribution'>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey='value'
                      nameKey='name'
                      cx='50%'
                      cy='50%'
                      innerRadius={60}
                      outerRadius={90}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      isAnimationActive={false}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={index} fill={d3ColorScale(entry.category)} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </section>

            {/* Bar Chart */}
            <section style={{ marginTop: 32 }}>
              <ChartCard title='Top 10 Blueprints'>
                <div style={{ height: Math.max(400, barData.length * 40) }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={barData}
                      layout='vertical'
                      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray='3 3' horizontal={false} />
                      <XAxis type='number' tickFormatter={formatBigNumber} />
                      <YAxis dataKey='name' type='category' width={100} />

                      <Tooltip content={<CustomTooltip />} />

                      <Bar
                        dataKey='value'
                        fill={d3ColorScale('top10')}
                        barSize={20}
                        radius={[0, 4, 4, 0]}
                        isAnimationActive={false}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </section>
          </>
        )}
      </main>
    </Layout>
  )
}

export default DownloadMetricsPage
