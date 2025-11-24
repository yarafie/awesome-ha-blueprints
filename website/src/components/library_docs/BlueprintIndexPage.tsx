import React from 'react'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'

type BlueprintMetadata = {
  title?: string
  name?: string
  description?: string
  [key: string]: any
}

type BlueprintListItem = {
  category: string
  slug: string
  metadata: BlueprintMetadata
}

type BlueprintIndexPageProps = {
  blueprints: BlueprintListItem[]
}

export default function BlueprintIndexPage({
  blueprints,
}: BlueprintIndexPageProps) {
  const entries = Array.isArray(blueprints) ? blueprints : []

  return (
    <Layout title='Blueprint Library'>
      <div className='container margin-vert--lg'>
        <h1>Blueprint Library</h1>

        {entries.length === 0 && (
          <p>No blueprints found in the library (blueprints-lib).</p>
        )}

        {entries.map((bp) => {
          const title = bp.metadata.title || bp.metadata.name || bp.slug
          const description = bp.metadata.description || ''

          return (
            <div
              key={`${bp.category}-${bp.slug}`}
              style={{
                borderBottom: '1px solid var(--ifm-toc-border-color)',
                padding: '12px 0',
                marginBottom: '12px',
              }}
            >
              <Link to={`/blueprints/${bp.category}/${bp.slug}`}>
                <h3 style={{ marginBottom: '4px' }}>{title}</h3>
              </Link>
              {description && <p style={{ marginTop: 0 }}>{description}</p>}
            </div>
          )
        })}
      </div>
    </Layout>
  )
}
