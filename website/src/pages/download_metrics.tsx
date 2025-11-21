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
import type { TooltipProps } from 'recharts'
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

interface WindowWithEnv extends Window {
  env?: {
    SUPABASE_URL?: string
    SUPABASE_ANON_KEY?: string
  }
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

/* Layout bits ---------------------------------------------------- */

const Card = ({
  children,
  style,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
}): JSX.Element => <div style={style}>{children}</div>

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

const DownloadMetricsPageOptionB: React.FC = () => {
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'

  const [metrics, setMetrics] = useState<MetricsState>({
    loading: true,
    totalDownloads: 0,
    byCategory: [],
    topBlueprints: [],
    daily: [],
  })

  const colorScale = useMemo(() => scaleOrdinal(schemeCategory10), [])

  const THEME = useMemo(
    () => ({
      bg: isDark ? '#1b1b1d' : '#f9fafb',
      cardBg: isDark ? '#242526' : '#ffffff',
      textPrimary: isDark ? '#e5e7eb' : '#1f2937',
      textSecondary: isDark ? '#9ca3af' : '#6b7280',
      gridLine: isDark ? '#444444' : '#e5e7eb',
      tooltipBg: isDark ? '#242526' : '#ffffff',
      tooltipBorder: isDark ? '#444444' : '#cccccc',
      tooltipText: isDark ? '#e5e7eb' : '#333333',
      cardBorder: isDark ? '1px solid #333333' : 'none',
      boxShadow: isDark
        ? '0 4px 6px rgba(0,0,0,0.4)'
        : '0 4px 6px rgba(0,0,0,0.1)',
    }),
    [isDark],
  )

  /* Tooltip with theme-aware colors ------------------------------ */
  const ThemedTooltip = (
    props: TooltipProps<number, string>,
  ): JSX.Element | null => {
    const { active, payload, label } = props
    if (!active || !payload || payload.length === 0) return null

    const entry = payload[0].payload as {
      name?: string
      id?: string
      value?: number
    }

    return (
      <div
        style={{
          padding: 10,
          backgroundColor: THEME.tooltipBg,
          border: `1px solid ${THEME.tooltipBorder}`,
          borderRadius: 6,
          color: THEME.tooltipText,
        }}
      >
        <strong>{entry.name || label}</strong>
        <p style={{ margin: 0 }}>
          Downloads: {formatBigNumber(entry.value ?? payload[0].value ?? 0)}
        </p>
      </div>
    )
  }

  /* Data Fetching ------------------------------------------------ */

  useEffect(() => {
    const w = window as WindowWithEnv
    const supabaseUrl = w.env?.SUPABASE_URL
    const supabaseKey = w.env?.SUPABASE_ANON_KEY

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

    const rpc = async <T,>(fn: string, body: unknown = {}): Promise<T> => {
      const res = await fetch(`${supabaseUrl}/rest/v1/rpc/${fn}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        throw new Error(await res.text())
      }
      return (await res.json()) as T
    }

    const load = async (): Promise<void> => {
      try {
        const [total, categories, top, daily] = await Promise.all([
          rpc<number | { total: string }[]>('get_total_downloads'),
          rpc<CategoryMetric[]>('get_downloads_by_category'),
          rpc<TopBlueprintMetric[]>('get_top_blueprints'),
          rpc<DailyMetric[]>('get_daily_downloads', { p_days: 30 }),
        ])

        let totalDownloads = 0
        if (Array.isArray(total) && total.length > 0 && 'total' in total[0]) {
          totalDownloads = Number(total[0].total)
        } else if (typeof total === 'number') {
          totalDownloads = total
        }

        setMetrics({
          loading: false,
          totalDownloads,
          byCategory: categories,
          topBlueprints: top,
          daily: prepareDailyData(daily),
        })
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error loading metrics.'
        setMetrics((prev) => ({
          ...prev,
          loading: false,
          error: message,
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
          backgroundColor: THEME.bg,
          padding: '2rem',
          minHeight: '100vh',
          color: THEME.textPrimary,
          transition: 'background-color 0.3s ease, color 0.3s ease',
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
              <Card
                style={{
                  backgroundColor: THEME.cardBg,
                  color: THEME.textPrimary,
                  border: THEME.cardBorder,
                  borderRadius: 8,
                  boxShadow: THEME.boxShadow,
                  overflow: 'hidden',
                }}
              >
                <CardHeader color='#4f46e5'>Total Downloads</CardHeader>
                <CardBody>
                  <p
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: 900,
                      color: '#4f46e5',
                      margin: 0,
                    }}
                  >
                    {formatBigNumber(totalDownloads)}
                  </p>
                </CardBody>
              </Card>

              <Card
                style={{
                  backgroundColor: THEME.cardBg,
                  color: THEME.textPrimary,
                  border: THEME.cardBorder,
                  borderRadius: 8,
                  boxShadow: THEME.boxShadow,
                  overflow: 'hidden',
                }}
              >
                <CardHeader color='#0d9488'>Unique Categories</CardHeader>
                <CardBody>
                  <p
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: 900,
                      color: '#0d9488',
                      margin: 0,
                    }}
                  >
                    {formatBigNumber(byCategory.length)}
                  </p>
                </CardBody>
              </Card>

              <Card
                style={{
                  backgroundColor: THEME.cardBg,
                  color: THEME.textPrimary,
                  border: THEME.cardBorder,
                  borderRadius: 8,
                  boxShadow: THEME.boxShadow,
                  overflow: 'hidden',
                }}
              >
                <CardHeader color='#9333ea'>Tracked Blueprints</CardHeader>
                <CardBody>
                  <p
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: 900,
                      color: '#9333ea',
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
              <Card
                style={{
                  backgroundColor: THEME.cardBg,
                  color: THEME.textPrimary,
                  border: THEME.cardBorder,
                  borderRadius: 8,
                  boxShadow: THEME.boxShadow,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '16px 16px',
                    borderBottom: `1px solid ${THEME.gridLine}`,
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
                        stroke={THEME.gridLine}
                        strokeDasharray='3 3'
                      />

                      <XAxis
                        dataKey='label'
                        stroke={THEME.textSecondary}
                        tick={{ fill: THEME.textSecondary, fontSize: 10 }}
                      />

                      <YAxis
                        stroke={THEME.textSecondary}
                        tick={{ fill: THEME.textSecondary, fontSize: 10 }}
                        tickFormatter={formatBigNumber}
                      />

                      <Tooltip content={<ThemedTooltip />} />

                      <Area
                        type='monotone'
                        dataKey='total'
                        stroke='#4f46e5'
                        strokeWidth={3}
                        fill='url(#areaGradient)'
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Category Distribution */}
              <Card
                style={{
                  backgroundColor: THEME.cardBg,
                  color: THEME.textPrimary,
                  border: THEME.cardBorder,
                  borderRadius: 8,
                  boxShadow: THEME.boxShadow,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '16px 16px',
                    borderBottom: `1px solid ${THEME.gridLine}`,
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
                        label={({ percent }): string =>
                          `${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                        isAnimationActive={false}
                      >
                        {categoryData.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={colorScale(entry.category)}
                            stroke={isDark ? '#242526' : '#ffffff'}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<ThemedTooltip />} />
                      <Legend
                        wrapperStyle={{
                          fontSize: 12,
                          color: THEME.textPrimary,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </section>

            {/* TOP 10 */}
            <section style={{ marginTop: 32 }}>
              <Card
                style={{
                  backgroundColor: THEME.cardBg,
                  color: THEME.textPrimary,
                  border: THEME.cardBorder,
                  borderRadius: 8,
                  boxShadow: THEME.boxShadow,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '16px 16px',
                    borderBottom: `1px solid ${THEME.gridLine}`,
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
                        stroke={THEME.gridLine}
                        strokeDasharray='3 3'
                      />

                      <XAxis
                        type='number'
                        tickFormatter={formatBigNumber}
                        stroke={THEME.textSecondary}
                        tick={{ fill: THEME.textSecondary, fontSize: 10 }}
                      />

                      <YAxis
                        dataKey='name'
                        type='category'
                        width={100}
                        tick={{ fill: THEME.textSecondary, fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip content={<ThemedTooltip />} />

                      <Bar
                        dataKey='value'
                        fill={colorScale('top10')}
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

export default DownloadMetricsPageOptionB
