// -----------------------------------------------------------
//  DownloadMetricsPage – Lint-clean version
// -----------------------------------------------------------
import React, { useEffect, useMemo, useState } from 'react'
import Layout from '@theme/Layout'
import useThemeContext from '@theme/hooks/useThemeContext'

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

// -----------------------------------------------------------
// Types
// -----------------------------------------------------------
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
          ? `${bp.blueprint_id.slice(0, 37)}…`
          : bp.blueprint_id,
      value: Number(bp.total),
      id: bp.blueprint_id,
    }))
    .reverse()

// -----------------------------------------------------------
// Reusable Components
// -----------------------------------------------------------
interface CardProps {
  style?: React.CSSProperties
  children: React.ReactNode
}

const Card = ({ style, children }: CardProps) => (
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

interface CardHeaderProps {
  bg: string
  children: React.ReactNode
}

const CardHeader = ({ bg, children }: CardHeaderProps) => (
  <div
    style={{
      backgroundColor: bg,
      color: 'white',
      padding: 12,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontSize: 14,
    }}
  >
    {children}
  </div>
)

const CardBody = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 24, textAlign: 'center' }}>{children}</div>
)

interface ChartCardProps {
  title: string
  children: React.ReactNode
  borderColor: string
  backgroundColor: string
  textColor: string
}

const ChartCard = ({
  title,
  children,
  borderColor,
  backgroundColor,
  textColor,
}: ChartCardProps) => (
  <Card
    style={{
      backgroundColor,
      color: textColor,
      border: `1px solid ${borderColor}`,
    }}
  >
    <h3
      style={{
        padding: 16,
        margin: 0,
        borderBottom: `1px solid ${borderColor}`,
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
  if (!active || !payload || !payload.length) return null

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

  const [metrics, setMetrics] = useState<MetricsState>({
    loading: true,
    totalDownloads: 0,
    byCategory: [],
    topBlueprints: [],
    daily: [],
  })

  const d3ColorScale = useMemo(() => scaleOrdinal(schemeCategory10), [])

  const THEME = useMemo(
    () => ({
      bg: isDarkTheme ? '#1b1b1d' : '#f9fafb',
      cardBg: isDarkTheme ? '#242526' : '#ffffff',
      textPrimary: isDarkTheme ? '#e5e7eb' : '#111827',
      textSecondary: isDarkTheme ? '#9ca3af' : '#6b7280',
      border: isDarkTheme ? '#374151' : '#e5e7eb',
    }),
    [isDarkTheme],
  )

  // ---------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------
  useEffect(() => {
    const supabaseUrl = (window as any)?.env?.SUPABASE_URL
    const supabaseAnonKey = (window as any)?.env?.SUPABASE_ANON_KEY

    // Fallback to mock data when env is missing
    if (!supabaseUrl || !supabaseAnonKey) {
      const mockDaily: DailyMetric[] = Array.from({ length: 6 }).map((_, i) => {
        const d = new Date(Date.now() - (5 - i) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]
        return { day: d, total: String(10 + i * 5) }
      })

      setMetrics({
        loading: false,
        error: 'Supabase variables missing. Showing mock data.',
        totalDownloads: 1234567,
        byCategory: [
          { blueprint_category: 'controllers', total: '900000' },
          { blueprint_category: 'hooks', total: '280000' },
          { blueprint_category: 'templates', total: '54000' },
        ],
        topBlueprints: [
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
      for (let i = 0; i < retries; i += 1) {
        try {
          const res = await fetch(url, init)
          if (res.ok) return res

          if (res.status === 429 && i < retries - 1) {
            const delay = 500 * (i + 1)
            await new Promise((resolve) => setTimeout(resolve, delay))
            continue
          }

          const text = await res.text()
          throw new Error(text || `Request failed with status ${res.status}`)
        } catch (e) {
          if (i === retries - 1) throw e
        }
      }

      throw new Error('Unreachable')
    }

    const rpc = (fn: string, args = {}) =>
      fetchWithRetry(`${supabaseUrl}/rest/v1/rpc/${fn}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(args),
      }).then((r) => r.json())

    const load = async () => {
      try {
        const [total, byCat, top, daily] = await Promise.all([
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
          error: undefined,
          totalDownloads,
          byCategory: Array.isArray(byCat) ? byCat : [],
          topBlueprints: Array.isArray(top) ? top : [],
          daily: Array.isArray(daily) ? prepareDailyData(daily) : [],
        })
      } catch (err: any) {
        setMetrics((prev) => ({
          ...prev,
          loading: false,
          error: err.message || 'Failed to load metrics from Supabase.',
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

  // ---------------------------------------------------------
  // Render
  // ---------------------------------------------------------
  return (
    <Layout
      title='Blueprint Download Metrics'
      description='Enhanced Metrics Dashboard'
    >
      <main
        className='container margin-vert--lg'
        style={{
          backgroundColor: THEME.bg,
          minHeight: '100vh',
          padding: '2rem',
          color: THEME.textPrimary,
          transition: 'background-color 0.2s ease',
        }}
      >
        <h1
          style={{
            textAlign: 'center',
            marginBottom: 32,
            fontSize: '2rem',
            fontWeight: 'bold',
          }}
        >
          Blueprint Metrics Dashboard
        </h1>

        {loading && <p style={{ textAlign: 'center' }}>Loading metrics...</p>}

        {!loading && error && (
          <div className='alert alert--danger' role='alert'>
            <h4 className='alert__heading'>Error loading metrics</h4>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* KPI Row */}
            <section
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 16,
                marginBottom: 32,
              }}
            >
              <Card
                style={{
                  backgroundColor: THEME.cardBg,
                  color: THEME.textPrimary,
                  border: `1px solid ${THEME.border}`,
                }}
              >
                <CardHeader bg='#4f46e5'>Total Downloads</CardHeader>
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
                  border: `1px solid ${THEME.border}`,
                }}
              >
                <CardHeader bg='#0d9488'>Unique Categories</CardHeader>
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
                  border: `1px solid ${THEME.border}`,
                }}
              >
                <CardHeader bg='#9333ea'>Tracked Blueprints</CardHeader>
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

            {/* Charts Row */}
            <section
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 24,
                marginBottom: 32,
              }}
            >
              <ChartCard
                title='Daily Downloads'
                borderColor={THEME.border}
                backgroundColor={THEME.cardBg}
                textColor={THEME.textPrimary}
              >
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
                    <CartesianGrid
                      strokeDasharray='3 3'
                      stroke={THEME.border}
                    />
                    <XAxis
                      dataKey='label'
                      tick={{ fontSize: 10, fill: THEME.textSecondary }}
                      stroke={THEME.textSecondary}
                    />
                    <YAxis
                      tickFormatter={formatBigNumber}
                      tick={{ fontSize: 10, fill: THEME.textSecondary }}
                      stroke={THEME.textSecondary}
                    />
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

              <ChartCard
                title='Category Distribution'
                borderColor={THEME.border}
                backgroundColor={THEME.cardBg}
                textColor={THEME.textPrimary}
              >
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
                      labelLine={false}
                      isAnimationActive={false}
                    >
                      {categoryData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={d3ColorScale(entry.category)}
                          stroke={THEME.cardBg}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      iconType='circle'
                      wrapperStyle={{ fontSize: 12, color: THEME.textPrimary }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </section>

            {/* Top 10 Bar Chart */}
            <section>
              <ChartCard
                title='Top 10 Blueprints'
                borderColor={THEME.border}
                backgroundColor={THEME.cardBg}
                textColor={THEME.textPrimary}
              >
                <div style={{ height: Math.max(400, barData.length * 40) }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={barData}
                      layout='vertical'
                      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray='3 3'
                        horizontal={false}
                        stroke={THEME.border}
                      />
                      <XAxis
                        type='number'
                        tickFormatter={formatBigNumber}
                        stroke={THEME.textSecondary}
                        tick={{ fontSize: 10, fill: THEME.textSecondary }}
                      />
                      <YAxis
                        dataKey='name'
                        type='category'
                        width={100}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 10, fill: THEME.textSecondary }}
                      />
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
