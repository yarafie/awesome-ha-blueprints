import React from 'react'
import Layout from '@theme/Layout'
import MDXContent from '@theme/MDXContent'

export default function BlueprintPageWrapper({ modules: { metadata, mdx } }) {
  // Support both CJS and ESM JSON
  const data = require(metadata).default ?? require(metadata)
  const MDX = require(mdx).default

  return (
    <Layout title={data.title} description={data.description}>
      <div className='container margin-vert--lg'>
        <h1>{data.title}</h1>

        <MDXContent>
          <MDX />
        </MDXContent>
      </div>
    </Layout>
  )
}
