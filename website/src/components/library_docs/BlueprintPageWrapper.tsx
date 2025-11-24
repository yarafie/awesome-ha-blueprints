import React from 'react'
import Layout from '@theme/Layout'
import MDXContent from '@theme/MDXContent'

type BlueprintMetadata = {
  title?: string
  name?: string
  description?: string
  [key: string]: any
}

type BlueprintPageWrapperProps = {
  metadata: BlueprintMetadata
  // Docusaurus will pass the compiled MDX module as this prop
  mdx: any
}

export default function BlueprintPageWrapper({
  metadata,
  mdx,
}: BlueprintPageWrapperProps) {
  const title = metadata?.title || metadata?.name || 'Blueprint'
  const description = metadata?.description || ''

  // Docusaurus gives us a module; use default export if present
  const MDXComponent = (mdx && (mdx.default || mdx)) as React.ComponentType

  if (!MDXComponent) {
    return (
      <Layout title={title} description={description}>
        <div className='container margin-vert--lg'>
          <h1>{title}</h1>
          <p>Unable to load blueprint documentation (MDX component missing).</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title={title} description={description}>
      <div className='container margin-vert--lg'>
        <h1>{title}</h1>
        <MDXContent>
          <MDXComponent />
        </MDXContent>
      </div>
    </Layout>
  )
}
