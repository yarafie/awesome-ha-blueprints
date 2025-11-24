import React from 'react'
import Layout from '@theme/Layout'

interface BlueprintInfo {
  category: string
  slug: string
  metadata: { title: string }
}

interface BlueprintIndexProps {
  modules: {
    blueprints: BlueprintInfo[]
  }
}

export default function BlueprintIndexPage({ modules }: BlueprintIndexProps) {
  const { blueprints } = modules

  return (
    <Layout title='Blueprint Library' description='All Blueprint Packages'>
      <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
        <h1>Blueprint Library</h1>

        <ul style={{ marginTop: '2rem' }}>
          {blueprints.map((bp) => (
            <li key={`${bp.category}-${bp.slug}`}>
              <a
                href={`/awesome-ha-blueprints/library/${bp.category}/${bp.slug}`}
              >
                {bp.metadata.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  )
}
