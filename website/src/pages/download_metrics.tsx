import React, { useEffect, useMemo, useState } from 'react'
import Layout from '@theme/Layout'
import { useColorMode } from '@docusaurus/theme-common'

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

interface CategoryMetric {
  blueprint_category: string
  total: string
}

interface TopBlueprintMetric {
  blueprint_category: string
  blueprint_id: string
  total: string
}

interface DailyMetric {
  day: string
  total: string
}

interface ChartPoint {
  label: string
  total: number
}

interface MetricsState {
  loading: boolean
  error?: string
  totalDownloads: number
  byCategory: CategoryMetric[]
  topBlueprints: TopBlueprintMetric[]
  daily: ChartPoint[]
}

/* Helpers ------------------------------------------------------- */

const formatBigNumber = (n: number): string => n.toLocaleString()

const formatDateLabel = (iso: string): string =>
  new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })

const prepareDailyData = (rows: DailyMetric[]): ChartPoint[] =>
  rows
    .map((row) => ({
      label: formatDateLabel(row.day),
      total: Number(row.total),
      ts: new Date(row.day).getTime(),
    }))
    .sort((a, b) => a.ts - b.ts)

const prepareCategoryData = (rows: CategoryMetric[]) =>
  rows.map((r) => ({
    name: r.blueprint_category,
    category: r.blueprint_category,
    value: Number(r.total),
  }))

const prepareTopBlueprints = (rows: TopBlueprintMetric[]) =>
  rows
    .slice(0, 10)
    .map((bp) => ({
      name:
        bp.blueprint_id.length > 40
          ? `${bp.blueprint_id.slice(0, 37)}…`
          : bp.blueprint_id,
      value: Number(bp.total),
    }))
    .reverse()

/* Tooltip -------------------------------------------------------- */

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null
  const entry = payload[0].payload

  return (
    <div
      style={{
        padding: 10,
        backgroundColor: 'var(--chart-tooltip-bg)',
        border: '1px solid var(--chart-tooltip-border)',
        borderRadius: 6,
        color: 'var(--chart-tooltip-text)',
      }}
    >
      <strong>{entry.name || label}</strong>
      <p style={{ margin: 0 }}>Downloads: {formatBigNumber(entry.value)}</p>
    </div>
  )
}

/* Cards ---------------------------------------------------------- */

const Card = ({
  children,
  style,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
}): JSX.Element => (
  <div
    style={{
      borderRadius: 8,
      overflow: 'hidden',
      border: '1px solid var(--chart-border)',
      backgroundColor: 'var(--chart-card-bg)',
      transition: 'var(--chart-transition)',
      ...style,
    }}
  >
    {children}
  </div>
)

const CardHeader = ({
  color,
  children,
}: {
  color: string
  children: React.ReactNode
}) => (
  <div
    style={{
      backgroundColor: color,
      color: '#ffffff',
      padding: '12px 16px',
      textTransform: 'uppercase',
      fontWeight: 'bold',
      fontSize: 14,
      letterSpacing: '0.05em',
    }}
  >
    {children}
  </div>
)

const CardBody = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 24, textAlign: 'center' }}>{children}</div>
)

/* Main Component -------------------------------------------------- */

const DownloadMetricsPage = (): JSX.Element => {
  const { colorMode } = useColorMode()

  const [metrics, setMetrics] = useState<MetricsState>({
    loading: true,
    totalDownloads: 0,
    byCategory: [],
    topBlueprints: [],
    daily: [],
  })

  const colorScale = useMemo(() => scaleOrdinal(schemeCategory10), [])

  /* Data Fetching ------------------------------------------------ */

  useEffect(() => {
    const env = window as any
    const supabaseUrl = env?.env?.SUPABASE_URL
    const supabaseKey = env?.env?.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      const mockDaily: DailyMetric[] = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(Date.now() - (6 - i) * 86400000)
        return { day: d.toISOString().split('T')[0], total: String(12 + i * 4) }
      })

      setMetrics({
        loading: false,
        error: 'Supabase variables missing — mock data enabled.',
        totalDownloads: 420000,
        byCategory: [
          { blueprint_category: 'controllers', total: '232000' },
          { blueprint_category: 'hooks', total: '140000' },
          { blueprint_category: 'templates', total: '48000' },
        ],
        topBlueprints: [
          {
            blueprint_category: 'controllers',
            blueprint_id: 'motion_automation',
            total: '40000',
          },
          {
            blueprint_category: 'hooks',
            blueprint_id: 'rgb_light_cycle',
            total: '35000',
          },
        ],
        daily: prepareDailyData(mockDaily),
      })
      return
    }

    const headers = {
      'Content-Type': 'application/json',
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    }

    const rpc = async (fn: string, body = {}) => {
      const res = await fetch(`${supabaseUrl}/rest/v1/rpc/${fn}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    }

    const load = async () => {
      try {
        const [total, categories, top, daily] = await Promise.all([
          rpc('get_total_downloads'),
          rpc('get_downloads_by_category'),
          rpc('get_top_blueprints'),
          rpc('get_daily_downloads', { p_days: 30 }),
        ])

        const totalDownloads =
          Array.isArray(total) && total.length > 0
            ? Number(total[0].total)
            : Number(total)

        setMetrics({
          loading: false,
          totalDownloads,
          byCategory: categories,
          topBlueprints: top,
          daily: prepareDailyData(daily),
        })
      } catch (err: any) {
        setMetrics((prev) => ({
          ...prev,
          loading: false,
          error: err.message || 'Error loading metrics.',
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

  /* Render -------------------------------------------------------- */

  return (
    <Layout
      title='Blueprint Download Metrics'
      description='Download metrics overview'
    >
      <main
        className='container margin-vert--lg'
        style={{
          backgroundColor: 'var(--chart-bg)',
          padding: '2rem',
          minHeight: '100vh',
          color: 'var(--chart-text-primary)',
          transition: 'var(--chart-transition)',
        }}
      >
        <h1
          style={{ textAlign: 'center', marginBottom: 32, fontWeight: 'bold' }}
        >
          Blueprint Metrics Dashboard
        </h1>

        {loading && <p style={{ textAlign: 'center' }}>Loading metrics...</p>}

        {!loading && error && (
          <div className='alert alert--danger'>
            <strong>Error loading metrics: </strong>
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* KPI ROW */}
            <section
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 16,
              }}
            >
              <Card>
                <CardHeader color='var(--chart-accent-1)'>
                  Total Downloads
                </CardHeader>
                <CardBody>
                  <p
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: 900,
                      color: 'var(--chart-accent-1)',
                      margin: 0,
                    }}
                  >
                    {formatBigNumber(totalDownloads)}
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardHeader color='var(--chart-accent-2)'>
                  Unique Categories
                </CardHeader>
                <CardBody>
                  <p
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: 900,
                      color: 'var(--chart-accent-2)',
                      margin: 0,
                    }}
                  >
                    {formatBigNumber(byCategory.length)}
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardHeader color='var(--chart-accent-3)'>
                  Tracked Blueprints
                </CardHeader>
                <CardBody>
                  <p
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: 900,
                      color: 'var(--chart-accent-3)',
                      margin: 0,
                    }}
                  >
                    {formatBigNumber(topBlueprints.length)}
                  </p>
                </CardBody>
              </Card>
            </section>

            {/* CHART ROW */}
            <section
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 24,
                marginTop: 32,
              }}
            >
              {/* Daily Downloads */}
              <Card>
                <div
                  style={{
                    padding: '16px 16px',
                    borderBottom: '1px solid var(--chart-border)',
                    fontWeight: 'bold',
                  }}
                >
                  Daily Downloads
                </div>

                <div style={{ height: 350, padding: 10 }}>
                  <ResponsiveContainer>
                    <AreaChart data={daily}>
                      <defs>
                        <linearGradient
                          id='areaGradient'
                          x1='0'
                          y1='0'
                          x2='0'
                          y2='1'
                        >
                          <stop
                            offset='5%'
                            stopColor='var(--chart-accent-1)'
                            stopOpacity={0.8}
                          />
                          <stop
                            offset='95%'
                            stopColor='var(--chart-accent-1)'
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        stroke='var(--chart-border)'
                        strokeDasharray='3 3'
                      />

                      <XAxis
                        dataKey='label'
                        stroke='var(--chart-text-secondary)'
                        tick={{
                          fill: 'var(--chart-text-secondary)',
                          fontSize: 10,
                        }}
                      />

                      <YAxis
                        stroke='var(--chart-text-secondary)'
                        tick={{
                          fill: 'var(--chart-text-secondary)',
                          fontSize: 10,
                        }}
                        tickFormatter={formatBigNumber}
                      />

                      <Tooltip content={<CustomTooltip />} />

                      <Area
                        type='monotone'
                        dataKey='total'
                        stroke='var(--chart-accent-1)'
                        strokeWidth={3}
                        fill='url(#areaGradient)'
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Pie */}
              <Card>
                <div
                  style={{
                    padding: '16px 16px',
                    borderBottom: '1px solid var(--chart-border)',
                    fontWeight: 'bold',
                  }}
                >
                  Category Distribution
                </div>

                <div style={{ height: 350, padding: 10 }}>
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
                        label={({ percent }) =>
                          `${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                        isAnimationActive={false}
                      >
                        {categoryData.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={colorScale(entry.category)}
                            stroke='var(--chart-pie-stroke)'
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </section>

            {/* Top 10 */}
            <section style={{ marginTop: 32 }}>
              <Card>
                <div
                  style={{
                    padding: '16px 16px',
                    borderBottom: '1px solid var(--chart-border)',
                    fontWeight: 'bold',
                  }}
                >
                  Top 10 Blueprints
                </div>

                <div
                  style={{
                    height: Math.max(barData.length * 40, 400),
                    padding: 10,
                  }}
                >
                  <ResponsiveContainer>
                    <BarChart
                      data={barData}
                      layout='vertical'
                      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid
                        stroke='var(--chart-border)'
                        strokeDasharray='3 3'
                      />

                      <XAxis
                        type='number'
                        tickFormatter={formatBigNumber}
                        stroke='var(--chart-text-secondary)'
                        tick={{
                          fill: 'var(--chart-text-secondary)',
                          fontSize: 10,
                        }}
                      />

                      <YAxis
                        dataKey='name'
                        type='category'
                        width={100}
                        tick={{
                          fill: 'var(--chart-text-secondary)',
                          fontSize: 12,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip content={<CustomTooltip />} />

                      <Bar
                        dataKey='value'
                        fill='var(--chart-accent-1)'
                        barSize={20}
                        radius={[0, 4, 4, 0]}
                        isAnimationActive={false}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </section>
          </>
        )}
      </main>
    </Layout>
  )
}

export default DownloadMetricsPage
