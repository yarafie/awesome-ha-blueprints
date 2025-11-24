import React from 'react'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'

type BlueprintMetadata = {
  title?: string
  description?: string
}

type BlueprintEntry = {
  category: string
  slug: string
  metadata: BlueprintMetadata
}

type Props = {
  /** Injected by Docusaurus via addRoute({ modules: { blueprints: ... } }) */
  blueprints: BlueprintEntry[]
}

const BlueprintIndexPage: React.FC<Props> = ({ blueprints }) => {
  const hasBlueprints = Array.isArray(blueprints) && blueprints.length > 0

  return (
    <Layout title='Blueprint Library'>
      <div className='container margin-vert--lg'>
        <h1>Blueprint Library</h1>

        {!hasBlueprints && (
          <p>No blueprints found under the new library architecture yet.</p>
        )}

        {hasBlueprints &&
          blueprints.map((bp) => (
            <div
              key={`${bp.category}-${bp.slug}`}
              style={{
                borderBottom: '1px solid var(--ifm-toc-border-color)',
                padding: '12px 0',
                marginBottom: '12px',
              }}
            >
              <Link to={`/library/${bp.category}/${bp.slug}`}>
                <h3 style={{ marginBottom: '4px' }}>
                  {bp.metadata?.title ?? bp.slug}
                </h3>
              </Link>
              {bp.metadata?.description && (
                <p style={{ marginTop: 0 }}>{bp.metadata.description}</p>
              )}
            </div>
          ))}
      </div>
    </Layout>
  )
}

export default BlueprintIndexPage
