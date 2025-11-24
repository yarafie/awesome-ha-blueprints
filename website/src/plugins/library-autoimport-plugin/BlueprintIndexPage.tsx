import React from 'react'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'

export default function BlueprintIndexPage({ blueprints }) {
  // Group blueprints by category
  const categories = {}

  blueprints.forEach((bp) => {
    if (!categories[bp.category]) {
      categories[bp.category] = []
    }
    categories[bp.category].push(bp)
  })

  return (
    <Layout
      title='Blueprint Library'
      description='Blueprints packaged inside the new Library System'
    >
      <div className='container margin-vert--lg'>
        <h1>Blueprint Library</h1>
        <p className='margin-bottom--lg'>
          All blueprints imported from the new <code>/library</code> directory.
        </p>

        {Object.keys(categories).length === 0 && (
          <p>No blueprints found in library.</p>
        )}

        {Object.entries(categories).map(([category, items]) => (
          <div key={category} className='margin-bottom--xl'>
            <h2 style={{ textTransform: 'capitalize' }}>{category}</h2>

            <div className='row'>
              {items.map((bp) => (
                <div key={bp.slug} className='col col--4 margin-bottom--lg'>
                  <Link
                    to={`/library/${bp.category}/${bp.slug}`}
                    className='card'
                  >
                    <div className='card__body'>
                      <h3>{bp.metadata.title || bp.slug}</h3>
                      <p>{bp.metadata.description || ''}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}
