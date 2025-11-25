import React from 'react'
import Layout from '@theme/Layout'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

export default function BlueprintIndexPage(props) {
  const { siteConfig } = useDocusaurusContext()

  const raw = props?.route?.modules?.blueprints
  const blueprints = raw?.default ?? raw ?? []

  return (
    <Layout title='Library' description='Blueprint Library Overview'>
      <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
        <h1>Blueprint Library</h1>
        <p>This is the new unified blueprint package architecture.</p>

        {blueprints.length === 0 && <p>No library blueprints found.</p>}

        <ul>
          {blueprints.map((bp) => (
            <li key={`${bp.category}-${bp.slug}`}>
              <a href={`/library/${bp.category}/${bp.slug}`}>
                {bp.metadata?.title ?? bp.slug}
              </a>
              {' — '}
              <em>{bp.metadata?.description ?? ''}</em>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  )
}
