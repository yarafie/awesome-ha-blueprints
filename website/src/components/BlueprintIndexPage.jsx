import React, { useEffect, useState } from 'react'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import PropTypes from 'prop-types'

export default function BlueprintIndexPage({ modules }) {
  const [entries, setEntries] = useState([])

  // Load JSON only after hydration
  useEffect(() => {
    async function load() {
      if (!modules || !modules.blueprints) return
      const data = await import(/* @vite-ignore */ modules.blueprints)
      const list = data.default ?? data
      setEntries(list || [])
    }
    load()
  }, [modules])

  return (
    <Layout title='Blueprint Library'>
      <div className='container'>
        <h1>Blueprint Library</h1>

        {entries.length === 0 ? (
          <p>Loading blueprints…</p>
        ) : (
          entries.map((bp) => (
            <div
              key={`${bp.category}-${bp.slug}`}
              style={{
                borderBottom: '1px solid var(--ifm-toc-border-color)',
                padding: '12px 0',
                marginBottom: '12px',
              }}
            >
              <Link to={`/blueprints/${bp.category}/${bp.slug}`}>
                <h3 style={{ marginBottom: '4px' }}>{bp.metadata.title}</h3>
              </Link>
              <p style={{ marginTop: 0 }}>{bp.metadata.description}</p>
            </div>
          ))
        )}
      </div>
    </Layout>
  )
}

BlueprintIndexPage.propTypes = {
  modules: PropTypes.shape({
    blueprints: PropTypes.string,
  }),
}
