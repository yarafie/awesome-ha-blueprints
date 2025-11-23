/* eslint-disable react/prop-types */

import React from 'react'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'

export default function BlueprintIndexPage({ modules }) {
  const entries = modules.blueprints

  return (
    <Layout title='Blueprint Library'>
      <div className='container'>
        <h1>Blueprint Library</h1>
        {entries.map((bp) => (
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
        ))}
      </div>
    </Layout>
  )
}
