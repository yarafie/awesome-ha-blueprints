import React, { useState } from 'react'

// --- Placeholder Data & Utility Functions (Replace with actual Firebase logic) ---

// Mock data structure based on the screenshot
const initialBlueprintData = [
  {
    id: 'ikea_e2001_c2002',
    category: 'controllers',
    downloads: 3,
    lastDownloaded: 'Nov 21, 2078',
  },
  {
    id: 'tuya_ZG-101Z-D',
    category: 'controllers',
    downloads: 1,
    lastDownloaded: 'Nov 21, 2025',
  },
  {
    id: 'aqara_dj11lm',
    category: 'controllers',
    downloads: 1,
    lastDownloaded: 'Nov 20, 2078',
  },
  {
    id: 'light',
    category: 'hooks',
    downloads: 1,
    lastDownloaded: 'Nov 20, 2078',
  },
  {
    id: 'a_very_long_blueprint_id_example_to_test_expansion',
    category: 'controllers',
    downloads: 2,
    lastDownloaded: 'Nov 22, 2078',
  },
]

const mockCategoryData = [
  { name: 'controllers', value: 83 },
  { name: 'hooks', value: 17 },
]

const mockDailyDownloads = [
  { date: 'Nov 18', downloads: 0 },
  { date: 'Nov 19', downloads: 0.5 },
  { date: 'Nov 20', downloads: 3 },
  { date: 'Nov 21', downloads: 4.5 },
  { date: 'Nov 22', downloads: 3.8 },
]

const formatDownloads = (count) => {
  if (count >= 1000) return (count / 1000).toFixed(1) + 'k'
  return count
}

// --- Components ---

const Header = () => (
  <header className='flex items-center justify-between p-4 border-b shadow-md bg-gray-900 border-gray-700'>
    <div className='flex items-center text-xl font-bold text-white'>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        className='w-6 h-6 mr-2 text-indigo-400'
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M4 7v10l2 2h12l2-2V7m-2 2H6m12 0a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2h12zm-3 2v6m0 0H9m6 0h2m-6-6v6m0 0H7'
        />
      </svg>
      Awesome HA Blueprints
    </div>
    <div className='flex items-center space-x-4 text-sm text-gray-400'>
      <a href='#' className='transition duration-150 hover:text-white'>
        Help
      </a>
      <a href='#' className='transition duration-150 hover:text-white'>
        Donate
      </a>
      <a
        href='#'
        className='flex items-center transition duration-150 hover:text-white'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='w-4 h-4 mr-1'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M10 20l4-16m4 4l4 4-4 4M6 4l-4 4 4 4'
          />
        </svg>
        GitHub
      </a>
    </div>
  </header>
)

const Card = ({ title, children, className = '' }) => (
  <div className={`rounded-xl p-6 shadow-lg bg-gray-800 ${className}`}>
    <h2 className='pb-2 mb-4 text-xl font-semibold text-white border-b border-gray-700'>
      {title}
    </h2>
    {children}
  </div>
)

const MetricBox = ({ title, value, colorClass }) => (
  <div className={`rounded-xl p-6 text-white shadow-xl ${colorClass}`}>
    <p className='text-sm font-medium opacity-80'>{title}</p>
    <p className='mt-1 text-3xl font-bold'>{value}</p>
  </div>
)

const ChartPlaceholder = ({ title, data }) => (
  <div className='flex flex-col items-center justify-center h-56'>
    <p className='italic text-gray-500'>Chart Placeholder for: {title}</p>
    {/* Placeholder visualization based on data for context */}
    <div className='flex w-full h-24 mt-4 space-x-1'>
      {data.map((item, index) => (
        <div
          key={index}
          title={`${item.date}: ${item.downloads}`}
          className='flex-grow rounded-sm bg-indigo-500 transition-all duration-300'
          style={{
            height: `${(item.downloads / 5) * 100}%`,
            alignSelf: 'flex-end',
          }}
        ></div>
      ))}
    </div>
    <p className='mt-1 text-xs text-gray-600'>
      Daily Downloads Trend (Mock Data)
    </p>
  </div>
)

const DonutChartPlaceholder = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const primary = data.find((d) => d.name === 'controllers')
  const secondary = data.find((d) => d.name === 'hooks')

  const primaryPercent = primary ? Math.round((primary.value / total) * 100) : 0
  const secondaryPercent = secondary
    ? Math.round((secondary.value / total) * 100)
    : 0

  return (
    <div className='relative flex items-center justify-center w-full h-56'>
      <svg viewBox='0 0 36 36' className='w-40 h-40 transform -rotate-90'>
        {/* Background circle */}
        <circle
          cx='18'
          cy='18'
          r='15.9155'
          fill='transparent'
          className='stroke-current text-gray-700'
          strokeWidth='3'
        ></circle>
        {/* Primary segment (controllers) - Indigo */}
        <circle
          cx='18'
          cy='18'
          r='15.9155'
          fill='transparent'
          className='stroke-current transition-all duration-700 ease-out text-indigo-500'
          strokeWidth='3'
          strokeDasharray={`${primaryPercent}, 100`}
        ></circle>
        {/* Secondary segment (hooks) - Orange, starting after primary */}
        <circle
          cx='18'
          cy='18'
          r='15.9155'
          fill='transparent'
          className='stroke-current transition-all duration-700 ease-out text-orange-500'
          strokeWidth='3'
          strokeDasharray={`${secondaryPercent}, 100`}
          strokeDashoffset={100 - primaryPercent}
        ></circle>
      </svg>
      <div className='absolute text-center text-white transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2'>
        <p className='text-2xl font-bold'>{primaryPercent}%</p>
      </div>
      <div className='absolute bottom-4 left-4 right-4 flex justify-center space-x-4 text-sm text-gray-400'>
        <span className='flex items-center'>
          <span className='w-3 h-3 mr-1 rounded-full bg-indigo-500'></span>{' '}
          controllers
        </span>
        <span className='flex items-center'>
          <span className='w-3 h-3 mr-1 rounded-full bg-orange-500'></span>{' '}
          hooks
        </span>
      </div>
    </div>
  )
}

const BarChartPlaceholder = ({ data }) => {
  // Sort by downloads descending
  const sortedData = [...data]
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 5)
  const maxDownloads = Math.max(...sortedData.map((d) => d.downloads), 1)

  return (
    <div className='p-4'>
      <p className='mb-2 text-xs text-center text-gray-600'># of Downloads</p>
      <div className='space-y-3'>
        {sortedData.map((item, index) => (
          <div key={index} className='flex items-center'>
            <span className='w-1/4 text-sm truncate text-gray-400'>
              {item.id.replace(/_/g, ' ')}
            </span>
            <div className='flex-grow h-6 ml-4 overflow-hidden rounded-full bg-gray-700'>
              <div
                className='flex items-center justify-end h-full pr-2 transition-all duration-700 ease-out bg-green-500'
                style={{
                  width: `${(item.downloads / maxDownloads) * 100}%`,
                }}
              >
                <span className='text-xs font-bold leading-none text-white'>
                  {item.downloads}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const DataTable = ({ data }) => {
  const [sortKey, setSortKey] = useState('downloads')
  const [sortDirection, setSortDirection] = useState('desc')

  const sortedData = [...data].sort((a, b) => {
    const aVal = a[sortKey]
    const bVal = b[sortKey]

    let comparison = 0
    if (typeof aVal === 'number') {
      comparison = aVal - bVal
    } else {
      comparison = aVal.localeCompare(bVal)
    }

    return sortDirection === 'asc' ? comparison : -comparison
  })

  const handleSort = (key) => {
    if (key === sortKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('desc') // Default to descending for new sort
    }
  }

  const SortIcon = ({ columnKey }) => {
    if (columnKey !== sortKey) {
      return (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='w-3 h-3 ml-1 text-gray-500'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M8 9l4-4 4 4m0 6l-4 4-4-4'
          />
        </svg>
      )
    }
    return (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        className={`w-3 h-3 ml-1 transition-transform duration-200 ${
          sortDirection === 'asc' ? 'rotate-180 transform' : ''
        }`}
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M5 15l7-7 7 7'
        />
      </svg>
    )
  }

  return (
    <Card title={`Raw Data View (${data.length} Results)`}>
      <div className='overflow-x-auto border rounded-lg shadow-xl border-gray-700'>
        <table className='min-w-full divide-y table-fixed divide-gray-700'>
          <thead className='bg-gray-700'>
            <tr>
              {/* Blueprint ID: Remains w-auto to take all remaining space */}
              <th
                className='w-auto px-4 py-3 text-xs font-medium tracking-wider text-left uppercase cursor-pointer text-gray-300'
                onClick={() => handleSort('id')}
              >
                <span className='flex items-center'>
                  Blueprint ID <SortIcon columnKey='id' />
                </span>
              </th>
              {/* Category: Reduced width to w-24/w-28 to maximize Blueprint ID space */}
              <th
                className='w-24 px-4 py-3 text-xs font-medium tracking-wider text-left uppercase cursor-pointer md:w-28 text-gray-300'
                onClick={() => handleSort('category')}
              >
                <span className='flex items-center'>
                  Category <SortIcon columnKey='category' />
                </span>
              </th>
              {/* Downloads: Retained width */}
              <th
                className='w-24 px-4 py-3 text-xs font-medium tracking-wider text-left uppercase cursor-pointer md:w-28 text-gray-300'
                onClick={() => handleSort('downloads')}
              >
                <span className='flex items-center'>
                  Downloads <SortIcon columnKey='downloads' />
                </span>
              </th>
              {/* Last Downloaded: Retained width */}
              <th
                className='w-32 px-4 py-3 text-xs font-medium tracking-wider text-left uppercase cursor-pointer md:w-40 text-gray-300'
                onClick={() => handleSort('lastDownloaded')}
              >
                <span className='flex items-center'>
                  Last Downloaded <SortIcon columnKey='lastDownloaded' />
                </span>
              </th>
            </tr>
          </thead>
          <tbody className='divide-y bg-gray-800 divide-gray-700'>
            {sortedData.map((item) => (
              <tr
                key={item.id}
                className='transition duration-150 hover:bg-gray-700'
              >
                <td className='px-4 py-3 text-sm font-medium cursor-pointer whitespace-normal break-all text-indigo-400 hover:text-indigo-300'>
                  {item.id}
                </td>
                <td className='px-4 py-3 text-sm whitespace-nowrap'>
                  <span
                    className='inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full'
                    style={{
                      backgroundColor:
                        item.category === 'controllers'
                          ? 'rgba(79, 70, 229, 0.2)'
                          : 'rgba(249, 115, 22, 0.2)',
                      color:
                        item.category === 'controllers' ? '#818CF8' : '#FDBA74',
                    }}
                  >
                    {item.category}
                  </span>
                </td>
                <td className='px-4 py-3 text-sm font-mono whitespace-nowrap text-gray-300'>
                  {item.downloads}
                </td>
                <td className='px-4 py-3 text-sm whitespace-nowrap text-gray-400'>
                  {item.lastDownloaded}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

// Main App Component
const DownloadMetricsPage = () => {
  // State to hold the main data
  const [blueprintData] = useState(initialBlueprintData)
  const [isLoading] = useState(false)
  // const [userId, setUserId] = useState(null);
  // const [isAuthReady, setIsAuthReady] = useState(false);

  // Mock total metrics calculation
  const totalDownloads = blueprintData.reduce(
    (sum, item) => sum + item.downloads,
    0,
  )
  const uniqueCategories = new Set(blueprintData.map((item) => item.category))
    .size
  const trackedBlueprints = blueprintData.length

  return (
    <div className='flex flex-col min-h-screen font-sans text-gray-100 bg-gray-900'>
      <style>
        {/* Custom scrollbar styling for better dark mode look */}
        {`
                ::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                ::-webkit-scrollbar-track {
                    background: #1f2937; /* gray-800 */
                }
                ::-webkit-scrollbar-thumb {
                    background: #4b5563; /* gray-600 */
                    border-radius: 4px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #6b7280; /* gray-500 */
                }
                `}
      </style>
      <Header />

      <main className='container flex-grow p-4 mx-auto md:p-8'>
        <h1 className='mb-6 text-3xl font-extrabold text-white'>
          Blueprint Metrics Dashboard
        </h1>
        {/* Metrics Boxes */}
        <div className='grid grid-cols-1 gap-6 mb-8 md:grid-cols-3'>
          <MetricBox
            title='TOTAL DOWNLOADS'
            value={formatDownloads(totalDownloads)}
            colorClass='bg-indigo-600'
          />
          <MetricBox
            title='UNIQUE CATEGORIES'
            value={uniqueCategories}
            colorClass='bg-teal-600'
          />
          <MetricBox
            title='TRACKED BLUEPRINTS'
            value={trackedBlueprints}
            colorClass='bg-purple-600'
          />
        </div>

        {/* Charts Section */}
        <div className='grid grid-cols-1 gap-6 mb-8 md:grid-cols-2'>
          <Card title='Daily Downloads (Last 7 Days)'>
            <ChartPlaceholder
              title='Daily Downloads'
              data={mockDailyDownloads}
            />
          </Card>
          <Card title='Category Distribution'>
            <DonutChartPlaceholder data={mockCategoryData} />
          </Card>
        </div>

        {/* Top Blueprints and Raw Data */}
        <div className='space-y-6'>
          <Card title='Top 10 Blueprints (Overall, Sorted by Downloads)'>
            <BarChartPlaceholder data={blueprintData} />
          </Card>

          {/* The DataTable component contains the fix */}
          <DataTable data={blueprintData} />
        </div>
      </main>

      {/* Footer */}
      <footer className='p-4 mt-8 text-xs text-center text-gray-500 border-t border-gray-800'>
        <p>
          Awesome HA Blueprints is maintained by{' '}
          <a href='#' className='text-indigo-400 hover:text-indigo-300'>
            Matteo Agnoletto
          </a>
          .
        </p>
        <p>
          This Fork is maintained by{' '}
          <a href='#' className='text-indigo-400 hover:text-indigo-300'>
            yarafie
          </a>
          .
        </p>
        <p>
          Licensed under the{' '}
          <a href='#' className='text-indigo-400 hover:text-indigo-300'>
            GPL-3.0 License
          </a>
          .
        </p>
      </footer>
    </div>
  )
}

export default DownloadMetricsPage
