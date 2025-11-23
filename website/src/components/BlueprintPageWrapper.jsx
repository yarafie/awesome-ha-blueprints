import React from 'react'
import Layout from '@theme/Layout'
import MDXContent from '@theme/MDXContent'

// SSG-compatible wrapper for each blueprint
export default function BlueprintPageWrapper({ modules }) {
  // Directly receive metadata + MDX from plugin
  const data = modules.metadata
  const MDX = modules.mdx

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
