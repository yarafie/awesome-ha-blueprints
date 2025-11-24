import React from 'react'
import Layout from '@theme/Layout'
import MDXContent from '@theme/MDXContent'

export default function BlueprintPage(props: any) {
  const modules = props?.route?.modules || {}

  const metadataModule = modules.metadata
  const metadata = (metadataModule?.default ?? metadataModule) || {
    title: 'Untitled Blueprint',
    description: '',
  }

  const mdxModule = modules.mdx
  const MdxComponent = mdxModule?.default ?? mdxModule

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

        {!MdxComponent ? (
          <p style={{ color: 'red' }}>
            ❌ MDX failed to load. Check <code>blueprint.mdx</code> and plugin
            paths.
          </p>
        ) : (
          <MDXContent>
            <MdxComponent />
          </MDXContent>
        )}
      </div>
    </Layout>
  )
}
