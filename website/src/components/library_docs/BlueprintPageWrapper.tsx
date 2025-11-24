import React from 'react'
import Layout from '@theme/Layout'
import MDXContent from '@theme/MDXContent'

// Types for routes created by the plugin
interface BlueprintPageProps {
  modules: {
    metadata: any // the generated metadata JSON
    mdx: any // path to the MDX component
  }
}

export default function BlueprintPageWrapper({ modules }: BlueprintPageProps) {
  // Handle CJS / ESM JSON behavior
  const data = modules.metadata.default ?? modules.metadata

  const MDX = modules.mdx.default ?? modules.mdx

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
