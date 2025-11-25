import React from 'react'
import Layout from '@theme/Layout'
import MDXContent from '@theme/MDXContent'

export default function BlueprintPage(props) {
  const { metadata, mdx } = props.modules

  const MdxComponent = mdx?.default ?? mdx

  return (
    <Layout title={metadata.title} description={metadata.description}>
      <div
        style={{
          padding: '2rem',
          maxWidth: '900px',
          margin: '0 auto',
        }}
      >
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
