import React from 'react'
import Layout from '@theme/Layout'
import MDXContent from '@theme/MDXContent'

interface BlueprintPageProps {
  modules: {
    metadata: {
      title: string
      description: string
    }
    mdx: any
  }
}

export default function BlueprintPage({ modules }: BlueprintPageProps) {
  const { metadata, mdx } = modules
  const MdxComponent = mdx.default ?? mdx

  return (
    <Layout title={metadata.title} description={metadata.description}>
      <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
        <h1>{metadata.title}</h1>
        <p>{metadata.description}</p>
        <hr style={{ margin: '2rem 0' }} />
        <MDXContent>
          <MdxComponent />
        </MDXContent>
      </div>
    </Layout>
  )
}
